import fs from 'fs';
import path from 'path';
import vm from 'vm';
import { createClient } from '@supabase/supabase-js';

const STAGING_PATH = path.resolve('data/coleta_gabaritos_staging.json');

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        env[k] = v;
      }
    }
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

// CLI args
const args = process.argv.slice(2);
const getArg = (flag, def = null) => {
  const f = args.find(a => a.startsWith(`${flag}=`));
  return f ? f.split('=')[1].trim() : def;
};

const BATCH_LIMIT = parseInt(getArg('--limit', '20'), 10);
const TARGET_BANCA = getArg('--banca', null);
const TARGET_TABLE = getArg('--table', 'questions');

function loadStaging() {
  if (fs.existsSync(STAGING_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
    } catch (e) {}
  }
  return {
    meta: {
      descricao: "Staging de homologação estrita de gabaritos (Fases 1 e 2)",
      ultimaAtualizacao: new Date().toISOString(),
      totalHomologados: 0,
      totalRemapeados: 0
    },
    decisoes: []
  };
}

function saveStaging(data) {
  data.meta.ultimaAtualizacao = new Date().toISOString();
  data.meta.totalHomologados = data.decisoes.length;
  data.meta.totalRemapeados = data.decisoes.filter(d => d.foiRemapeado).length;
  fs.writeFileSync(STAGING_PATH, JSON.stringify(data, null, 2), 'utf8');
}

function normalizeText(str) {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function textSimilarity(a, b) {
  const normA = normalizeText(a);
  const normB = normalizeText(b);
  if (!normA || !normB) return 0;
  if (normA === normB) return 1.0;
  const wordsA = new Set(normA.split(' ').filter(w => w.length > 2));
  const wordsB = new Set(normB.split(' ').filter(w => w.length > 2));
  if (wordsA.size === 0 || wordsB.size === 0) return 0;
  let intersection = 0;
  for (const w of wordsA) if (wordsB.has(w)) intersection++;
  return intersection / new Set([...wordsA, ...wordsB]).size;
}

async function searchWeb(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
      },
      signal: AbortSignal.timeout(9000)
    });
    if (!res.ok) return [];
    const html = await res.text();
    const links = [];
    const linkRegex = /<a[^>]+class="result__url"[^>]+href="([^"]+)"/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      let rawUrl = match[1];
      if (rawUrl.includes('uddg=')) {
        links.push(decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]));
      } else if (rawUrl.startsWith('http')) {
        links.push(rawUrl);
      }
    }
    return links;
  } catch (e) {
    return [];
  }
}

// Extrai dados estruturados de qualquer uma das plataformas líderes de questões
function extractFromProvider(html, url, dbStatement, dbOptions) {
  const normStmt = normalizeText(dbStatement);

  // 1. SanarMed (Schema.org QAPage)
  if (url.includes('sanarmed.com')) {
    const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = ldRegex.exec(html)) !== null) {
      try {
        const data = JSON.parse(m[1]);
        if (data['@type'] === 'QAPage' || data.mainEntity?.['@type'] === 'Question') {
          const pageStmt = data.mainEntity?.text || data.mainEntity?.name || '';
          if (textSimilarity(dbStatement, pageStmt) < 0.40) continue;

          const accepted = data.mainEntity?.acceptedAnswer;
          if (accepted && accepted.text) {
            let answerLetter = null;
            const comment = accepted.comment?.text || '';
            const letMatch = comment.match(/(?:resposta\s+correta|gabarito)[^\w]*letra\s*([A-E])\b/i) ||
                             comment.match(/(?:alternativa|letra)\s*([A-E])\s*(?:é\s+a\s+correta|correta)/i);
            if (letMatch) answerLetter = letMatch[1].toUpperCase();

            return {
              provider: 'SanarMed',
              winningOptionText: accepted.text,
              publishedLetter: answerLetter,
              commentary: comment,
              confidence: 0.98
            };
          }
        }
      } catch (e) {}
    }
  }

  // 2. Estratégia MED (__NUXT__)
  if (url.includes('estrategia.com')) {
    const nuxtMatch = html.match(/window\.__NUXT__\s*=\s*([\s\S]*?)<\/script>/);
    if (nuxtMatch) {
      try {
        const fnStr = nuxtMatch[1].trim().replace(/;$/, '');
        const res = vm.runInNewContext(fnStr);
        const fetchObj = res.fetch ? Object.values(res.fetch)[0] : null;
        const qData = fetchObj?.question;
        if (qData) {
          const pageStmt = qData.statement_text || qData.statement || '';
          if (textSimilarity(dbStatement, pageStmt) >= 0.40 && Array.isArray(qData.alternatives)) {
            const correctAlt = qData.alternatives.find(a => a.correct);
            if (correctAlt) {
              const pos = parseInt(correctAlt.position, 10);
              const letters = ['A', 'B', 'C', 'D', 'E'];
              const letter = !isNaN(pos) && letters[pos] ? letters[pos] : null;
              // Limpa tags html do body
              const cleanBody = (correctAlt.body || '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();

              return {
                provider: 'Estratégia MED',
                winningOptionText: cleanBody,
                publishedLetter: letter,
                commentary: correctAlt.solution?.complete || '',
                confidence: 0.99
              };
            }
          }
        }
      } catch (e) {}
    }
  }

  // 3. QConcursos / GranCursos / Outros via Schema.org ou HTML
  const ldRegex = /<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi;
  let m;
  while ((m = ldRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(m[1]);
      if (data.mainEntity?.acceptedAnswer?.text) {
        return {
          provider: 'Schema.org Genérico',
          winningOptionText: data.mainEntity.acceptedAnswer.text,
          publishedLetter: null,
          confidence: 0.95
        };
      }
    } catch (e) {}
  }

  // 4. Verificação estrita por Regex no HTML (se enunciado bater com alta fidelidade)
  const normHtml = normalizeText(html);
  const stmtWords = normStmt.split(' ').filter(w => w.length > 4);
  let wordsFound = 0;
  for (const w of stmtWords) {
    if (normHtml.includes(w)) wordsFound++;
  }
  const wordRatio = stmtWords.length > 0 ? wordsFound / stmtWords.length : 0;
  if (wordRatio >= 0.65) {
    const anuladaMatch = html.match(/(?:questão\s+anulada|gabarito\s*:\s*anulada|anulada\s+pela\s+banca)/i);
    if (anuladaMatch) {
      return {
        provider: 'HTML Regex',
        isAnulada: true,
        publishedLetter: 'ANULADA',
        winningOptionText: 'Questão Anulada',
        confidence: 0.95
      };
    }

    const ansMatch = html.match(/(?:gabarito|resposta\s+correta|alternativa\s+correta)[\:\s\-]+([A-E])\b/i);
    if (ansMatch) {
      return {
        provider: 'HTML Regex',
        publishedLetter: ansMatch[1].toUpperCase(),
        confidence: 0.88
      };
    }
  }

  return null;
}

// Anti-permutação semântica: garante que a alternativa vencedora bate no banco
function matchAlternativeSemantic(dbQuestion, extracted) {
  const opts = Array.isArray(dbQuestion.options) ? dbQuestion.options : [];
  if (opts.length === 0) {
    return { isValid: false, mappedLetter: null, reason: 'QUESTAO_SEM_OPCOES_NO_BANCO' };
  }

  if (extracted.isAnulada || extracted.publishedLetter === 'ANULADA') {
    return {
      isValid: true,
      mappedLetter: 'ANULADA',
      isAnulada: true,
      wasRemapped: false,
      confidence: 1.0,
      detail: 'Questão Oficialmente Anulada'
    };
  }

  // Se temos o texto da alternativa vencedora da fonte oficial
  if (extracted.winningOptionText) {
    let bestMatchOpt = null;
    let maxSim = 0;
    for (const opt of opts) {
      const sim = textSimilarity(extracted.winningOptionText, opt.text || '');
      if (sim > maxSim) {
        maxSim = sim;
        bestMatchOpt = opt;
      }
    }

    if (bestMatchOpt && maxSim >= 0.65) {
      const wasRemapped = extracted.publishedLetter && bestMatchOpt.letter !== extracted.publishedLetter;
      return {
        isValid: true,
        mappedLetter: bestMatchOpt.letter,
        isAnulada: false,
        wasRemapped: Boolean(wasRemapped),
        confidence: Math.max(maxSim, extracted.confidence),
        winningText: bestMatchOpt.text,
        detail: wasRemapped
          ? `⚠️ Anti-Permutação: Publicado '${extracted.publishedLetter}' -> No Banco é '${bestMatchOpt.letter}'`
          : `Texto coincide com a letra '${bestMatchOpt.letter}' (sim: ${(maxSim * 100).toFixed(1)}%)`
      };
    }
  }

  // Se temos apenas a letra publicada
  if (extracted.publishedLetter) {
    const availableLetters = opts.map(o => (o.letter || '').toUpperCase().trim()).filter(Boolean);
    if (availableLetters.includes(extracted.publishedLetter)) {
      return {
        isValid: true,
        mappedLetter: extracted.publishedLetter,
        isAnulada: false,
        wasRemapped: false,
        confidence: extracted.confidence,
        detail: `Letra '${extracted.publishedLetter}' confere com opções disponíveis`
      };
    }
  }

  return {
    isValid: false,
    mappedLetter: null,
    reason: `INCONSISTENCIA_DE_TEXTO_OU_OPCAO`
  };
}

async function runMasterBottomUp() {
  console.log('========================================================================');
  console.log('🌐 COLETOR BOTTOM-UP MASTER (FASE 2)');
  console.log(`   Tabela: ${TARGET_TABLE} | Limite: ${BATCH_LIMIT} | Banca: ${TARGET_BANCA || 'Todas'}`);
  console.log('========================================================================\n');

  const staging = loadStaging();
  const processedIds = new Set(staging.decisoes.map(d => d.id));
  console.log(`📋 Staging atual carregado: ${staging.decisoes.length} homologadas.`);

  // Busca lote de pendentes
  let query = supabase.from(TARGET_TABLE)
    .select('id, code, banca, institution, year, especialidade, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(BATCH_LIMIT * 4);

  if (TARGET_BANCA) {
    query = query.ilike('banca', `%${TARGET_BANCA}%`);
  }

  const { data: rawList, error } = await query;
  if (error) {
    console.error('Erro ao buscar questões:', error);
    return;
  }

  const pendingQuestions = rawList.filter(q => !processedIds.has(q.id)).slice(0, BATCH_LIMIT);
  console.log(`📦 Pendentes a processar nesta rodada: ${pendingQuestions.length} questões.\n`);

  let countHomologadas = 0;
  let countRemapeadas = 0;
  let countRejeitadas = 0;

  for (let i = 0; i < pendingQuestions.length; i++) {
    const q = pendingQuestions[i];
    console.log(`------------------------------------------------------------------------`);
    console.log(`[${i + 1}/${pendingQuestions.length}] 🎯 Questão: ${q.code}`);
    console.log(`   🏛️ Banca/Inst: ${q.institution || q.banca} (${q.year}) | Área: ${q.especialidade}`);
    console.log(`   📝 Enunciado: "${q.statement.slice(0, 90)}..."`);

    // Constrói queries em 2 variantes
    const stmtClean = normalizeText(q.statement).split(' ').filter(w => w.length > 3);
    const instClean = normalizeText(q.institution || q.banca || '').split(' ').slice(0, 3).join(' ');
    
    const queryPrimary = `${stmtClean.slice(0, 10).join(' ')} ${instClean} residencia medica`;
    const querySecondary = `${stmtClean.slice(0, 12).join(' ')}`;

    let matchFound = null;
    let successUrl = null;

    for (const qStr of [queryPrimary, querySecondary]) {
      const links = await searchWeb(qStr);
      // Filtra links relevantes (prioriza sanar, estrategia, qconcursos, grancursos, etc)
      const targetLinks = links.filter(l => 
        l.includes('sanarmed.com') ||
        l.includes('estrategia.com') ||
        l.includes('qconcursos.com') ||
        l.includes('grancursosonline.com.br') ||
        l.includes('tecconcursos.com.br') ||
        l.includes('medway.com.br')
      );

      // Se não achou links prioritários, olha os 3 primeiros gerais
      const candidateLinks = targetLinks.length > 0 ? targetLinks : links.slice(0, 3);

      for (const link of candidateLinks) {
        try {
          const res = await fetch(link, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
              'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
              'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
            },
            signal: AbortSignal.timeout(7000)
          });
          if (!res.ok) continue;
          const html = await res.text();
          const extracted = extractFromProvider(html, link, q.statement, q.options);
          if (extracted) {
            matchFound = extracted;
            successUrl = link;
            break;
          }
        } catch (e) {}
      }

      if (matchFound) break;
      await new Promise(r => setTimeout(r, 600));
    }

    if (matchFound) {
      const match = matchAlternativeSemantic(q, matchFound);
      if (match.isValid) {
        countHomologadas++;
        if (match.wasRemapped) countRemapeadas++;
        console.log(`   💎 ENCONTRADO via [${matchFound.provider}]: Gabarito '${match.mappedLetter}'`);
        console.log(`      🔗 Fonte: ${successUrl}`);
        console.log(`      🛡️ ${match.detail}`);

        staging.decisoes.push({
          id: q.id,
          code: q.code,
          table: TARGET_TABLE,
          caderno: `${q.banca || q.institution} — ${q.year}`,
          fase: 'Fase 2: Bottom-Up Busca Web Multiprovedor',
          gabaritoOficialExtraido: matchFound.publishedLetter || match.mappedLetter,
          gabaritoMapeadoNoBanco: match.mappedLetter,
          foiRemapeado: match.wasRemapped,
          isAnulada: Boolean(match.isAnulada),
          confianca: match.confidence,
          fonte: successUrl,
          provedor: matchFound.provider,
          data: new Date().toISOString()
        });
        processedIds.add(q.id);
      } else {
        countRejeitadas++;
        console.log(`   ⛔ REJEITADO: ${match.reason}`);
      }
    } else {
      console.log(`   ⏳ Sem correspondência estrita nos portais oficiais.`);
    }

    // Grava progresso a cada 5 questões
    if ((i + 1) % 5 === 0) {
      saveStaging(staging);
    }

    await new Promise(r => setTimeout(r, 1200));
  }

  saveStaging(staging);

  console.log('\n========================================================================');
  console.log('📊 BALANÇO DA EXECUÇÃO:');
  console.log(`• Homologadas nesta rodada: ${countHomologadas}`);
  console.log(`• Remapeadas por anti-permutação: ${countRemapeadas}`);
  console.log(`• Rejeitadas por inconsistência: ${countRejeitadas}`);
  console.log(`• Total acumulado em staging: ${staging.decisoes.length}`);
  console.log(`📁 Auditoria salva em: data/coleta_gabaritos_staging.json`);
  console.log('========================================================================\n');
}

runMasterBottomUp().catch(console.error);

