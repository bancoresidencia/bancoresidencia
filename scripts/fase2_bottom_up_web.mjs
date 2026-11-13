import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';

const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
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

// Argumentos CLI
const args = process.argv.slice(2);
const getArg = (flag, def = null) => {
  const f = args.find(a => a.startsWith(`${flag}=`));
  return f ? f.split('=')[1].trim() : def;
};
const hasFlag = flag => args.includes(flag);

const BATCH_LIMIT = parseInt(getArg('--limit', '25'), 10);
const TARGET_BANCA = getArg('--banca', null);

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
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
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

// Extrai e valida se a página na web contém o ENUNCIADO COMPLETO e as ALTERNATIVAS
function verifyPageAndExtractAnswer(html, statement, options) {
  const normHtml = normalizeText(html);
  const normStmt = normalizeText(statement);

  // 1. Validação de fidelidade do enunciado completo
  const stmtSim = textSimilarity(statement, html);
  // Também checa se as palavras-chave principais do enunciado estão contidas
  const stmtWords = normStmt.split(' ').filter(w => w.length > 4);
  let wordsFound = 0;
  for (const w of stmtWords) {
    if (normHtml.includes(w)) wordsFound++;
  }
  const wordRatio = stmtWords.length > 0 ? wordsFound / stmtWords.length : 0;

  if (wordRatio < 0.65 && stmtSim < 0.35) {
    return null; // Não é a mesma questão
  }

  // 2. Validação das alternativas completas
  let optionsMatchedCount = 0;
  for (const opt of options) {
    const normOpt = normalizeText(opt.text);
    if (normOpt && normOpt.length > 10) {
      if (normHtml.includes(normOpt.slice(0, 35))) {
        optionsMatchedCount++;
      }
    }
  }

  if (optionsMatchedCount < Math.min(2, options.length)) {
    return null; // As alternativas não batem
  }

  // 3. Procura indicação do gabarito oficial na página
  const answerRegexes = [
    /(?:gabarito|resposta\s+correta|alternativa\s+correta)[\:\s\-]+([A-E])\b/i,
    /(?:letra\s+correta|gabarito\s+definitivo|gabarito\s+oficial)[\:\s\-]+([A-E])\b/i,
    /(?:item\s+correto|opção\s+correta)[\:\s\-]+([A-E])\b/i,
    /alternativa\s+([A-E])\s+(?:é\s+a\s+correta|está\s+correta|é\s+o\s+gabarito)/i,
    /class="[^"]*(?:correct|gabarito|certa|is-correct)[^"]*"[^>]*>[\s\n]*([A-E])[\s\n]*</i,
    /(?:anulada|questão\s+anulada|gabarito\s*\:\s*anulada)/i
  ];

  let detectedLetter = null;
  let isAnulada = false;

  for (const r of answerRegexes) {
    const m = html.match(r);
    if (m) {
      if (m[0].toLowerCase().includes('anulada')) {
        isAnulada = true;
        detectedLetter = 'ANULADA';
        break;
      } else if (m[1]) {
        detectedLetter = m[1].toUpperCase();
        break;
      }
    }
  }

  // Se não achou regex direta, procura se uma das alternativas completas aparece como certa
  let matchedOptionText = null;
  if (!detectedLetter && Array.isArray(options)) {
    for (const opt of options) {
      const normOpt = normalizeText(opt.text);
      if (normOpt && normOpt.length > 15) {
        const idx = normHtml.indexOf(normOpt.slice(0, 45));
        if (idx !== -1) {
          const surrounding = normHtml.slice(Math.max(0, idx - 120), idx + 200);
          if (surrounding.includes('corret') || surrounding.includes('gabarito') || surrounding.includes('resposta')) {
            detectedLetter = opt.letter;
            matchedOptionText = opt.text;
            break;
          }
        }
      }
    }
  }

  if (detectedLetter) {
    return {
      letter: detectedLetter,
      isAnulada,
      matchedOptionText,
      fidelityScore: (wordRatio + (optionsMatchedCount / options.length)) / 2
    };
  }

  return null;
}

// Anti-permutação semântica
function matchAlternativeSemantic(dbQuestion, officialAnsLetter, officialOptionText = null) {
  const opts = Array.isArray(dbQuestion.options) ? dbQuestion.options : [];
  if (opts.length === 0) {
    return { isValid: false, mappedLetter: null, reason: 'QUESTAO_SEM_OPCOES_NO_BANCO' };
  }

  if (officialAnsLetter === 'ANULADA') {
    return {
      isValid: true,
      mappedLetter: 'ANULADA',
      isAnulada: true,
      wasRemapped: false,
      confidence: 1.0,
      detail: 'Questão Oficialmente Anulada'
    };
  }

  if (officialOptionText) {
    let bestMatchLetter = null;
    let maxSim = 0;
    for (const opt of opts) {
      const sim = textSimilarity(officialOptionText, opt.text || '');
      if (sim > maxSim) {
        maxSim = sim;
        bestMatchLetter = opt.letter;
      }
    }
    if (maxSim >= 0.70) {
      const wasRemapped = bestMatchLetter !== officialAnsLetter;
      return {
        isValid: true,
        mappedLetter: bestMatchLetter,
        isAnulada: false,
        wasRemapped,
        confidence: maxSim,
        detail: wasRemapped
          ? `⚠️ Remapeamento de segurança: Publicado '${officialAnsLetter}' -> No banco é '${bestMatchLetter}'`
          : `Texto coincide com a letra '${bestMatchLetter}'`
      };
    }
  }

  const availableLetters = opts.map(o => (o.letter || '').toUpperCase().trim()).filter(Boolean);
  if (availableLetters.includes(officialAnsLetter)) {
    return {
      isValid: true,
      mappedLetter: officialAnsLetter,
      isAnulada: false,
      wasRemapped: false,
      confidence: 0.95,
      detail: `Letra publicada '${officialAnsLetter}' confere com as opções disponíveis`
    };
  } else {
    return {
      isValid: false,
      mappedLetter: null,
      reason: `LETRA_FORA_DAS_OPCOES (publicado: ${officialAnsLetter}, disponiveis: ${availableLetters.join(',')})`
    };
  }
}

const STAGING_PATH = path.resolve('data/coleta_gabaritos_staging.json');
function loadStaging() {
  if (fs.existsSync(STAGING_PATH)) {
    try {
      const st = JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8'));
      st.meta = st.meta || {};
      st.decisoes = st.decisoes || [];
      return st;
    } catch (e) {}
  }
  return { meta: { totalHomologados: 0, totalRemapeados: 0, totalRejeitados: 0 }, decisoes: [] };
}
function saveStaging(st) {
  fs.writeFileSync(STAGING_PATH, JSON.stringify(st, null, 2), 'utf8');
}

async function runPhase2BottomUp() {
  console.log('========================================================================');
  console.log('🌐 INICIANDO FASE 2: BOTTOM-UP (BUSCA WEB QUESTÃO A QUESTÃO COM ENUNCIADO COMPLETO)');
  console.log(`   Limite de Questões: ${BATCH_LIMIT} | Filtro Banca: ${TARGET_BANCA || 'Todas as pendentes'}`);
  console.log('========================================================================\n');

  const staging = loadStaging();
  const processedIds = new Set(staging.decisoes.map(d => d.id));

  // 1. Busca questões pendentes com alternativas preenchidas no Supabase
  let qBuilder = supabase
    .from('questions')
    .select('id, code, banca, institution, year, statement, options, correct_answer')
    .eq('is_anulada', false)
    .or('correct_answer.is.null,correct_answer.eq.');

  if (TARGET_BANCA) {
    qBuilder = qBuilder.ilike('banca', `%${TARGET_BANCA}%`);
  }

  const { data: dbQuestions, error } = await qBuilder.limit(200);

  if (error || !dbQuestions || dbQuestions.length === 0) {
    console.log('❌ Nenhuma questão encontrada para processamento.');
    return;
  }

  const pendingQuestions = dbQuestions
    .filter(q => !processedIds.has(q.id))
    .filter(q => Array.isArray(q.options) && q.options.length >= 2);

  console.log(`📦 Questões pendentes selecionadas: ${pendingQuestions.length} (Processando até ${BATCH_LIMIT})\n`);

  let homologadasCount = 0;
  let remapeadasCount = 0;
  let rejeitadasCount = 0;

  for (const q of pendingQuestions.slice(0, BATCH_LIMIT)) {
    console.log(`------------------------------------------------------------------------`);
    console.log(`🎯 Questão: ${q.code} | Banca: ${q.banca} (${q.year})`);
    
    // Seleciona o texto COMPLETO do enunciado e alternativas
    const fullStatement = q.statement.replace(/[\r\n\t]+/g, ' ').trim();
    const fullOptionsText = q.options.map(o => `${o.letter}) ${o.text}`).join(' ');

    console.log(`   📝 Enunciado Completo (${fullStatement.length} caracteres): "${fullStatement.slice(0, 100)}..."`);
    console.log(`   📋 Alternativas (${q.options.length} opções): ${q.options.map(o => o.letter).join(', ')}`);

    // Cria query inteligente: trecho central único + banca/ano + residência médica
    const coreKeywords = fullStatement.slice(0, 85).replace(/[^a-zA-Z0-9À-ÿ\s]/g, ' ').trim();
    const cleanBanca = (q.banca || '').split(' ')[0].replace(/[^a-zA-Z0-9]/g, '');
    const query = `"${coreKeywords.slice(0, 75)}" ${cleanBanca} residência médica`;
    console.log(`   🔎 Query Web: ${query}`);

    const links = await searchWeb(query);
    const candidateLinks = links.filter(l => 
      !l.includes('youtube.com') && 
      !l.includes('instagram.com') &&
      !l.includes('facebook.com')
    );

    console.log(`   🌐 Links candidatos retornados: ${candidateLinks.length}`);

    let matchFound = null;
    let successfulUrl = null;

    for (const link of candidateLinks.slice(0, 4)) {
      try {
        console.log(`      Acessando: ${link.slice(0, 75)}...`);
        const res = await fetch(link, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'text/html,application/xhtml+xml',
            'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
          },
          signal: AbortSignal.timeout(9000)
        });

        if (!res.ok) continue;
        const html = await res.text();

        // Verificação estrita com ENUNCIADO COMPLETO e ALTERNATIVAS
        const result = verifyPageAndExtractAnswer(html, fullStatement, q.options);
        if (result && result.letter) {
          matchFound = result;
          successfulUrl = link;
          console.log(`      💎 GABARITO ENCONTRADO NA PÁGINA: '${result.letter}' (Fidelidade: ${(result.fidelityScore * 100).toFixed(1)}%)`);
          break;
        }
      } catch (e) {
        // segue
      }
    }

    if (matchFound) {
      const semanticMatch = matchAlternativeSemantic(q, matchFound.letter, matchFound.matchedOptionText);
      if (semanticMatch.isValid) {
        homologadasCount++;
        if (semanticMatch.wasRemapped) {
          remapeadasCount++;
          console.log(`   ⚠️ REMAPEAMENTO: Publicado '${matchFound.letter}' -> No Banco '${semanticMatch.mappedLetter}' (${semanticMatch.detail})`);
        } else {
          console.log(`   ✅ HOMOLOGADO: Gabarito '${semanticMatch.mappedLetter}'`);
        }
        console.log(`   🔗 Fonte Web: ${successfulUrl}`);

        staging.decisoes.push({
          id: q.id,
          code: q.code,
          table: 'questions',
          caderno: `${q.banca} — ${q.year}`,
          fase: 'Fase 2: Bottom-Up Busca Web Questão a Questão',
          gabaritoOficialExtraido: matchFound.letter,
          gabaritoMapeadoNoBanco: semanticMatch.mappedLetter,
          foiRemapeado: semanticMatch.wasRemapped,
          isAnulada: matchFound.isAnulada,
          confianca: matchFound.fidelityScore,
          fonte: successfulUrl,
          data: new Date().toISOString()
        });
        processedIds.add(q.id);
      } else {
        rejeitadasCount++;
        console.log(`   ⛔ REJEITADO: ${semanticMatch.reason}`);
      }
    } else {
      console.log(`   ⏳ Sem correspondência estrita encontrada na web nesta varredura.`);
    }

    // Delay de segurança entre requisições
    await new Promise(r => setTimeout(r, 1800));
  }

  staging.meta.totalHomologados = staging.decisoes.length;
  staging.meta.totalRemapeados = staging.decisoes.filter(d => d.foiRemapeado).length;
  saveStaging(staging);

  console.log('\n========================================================================');
  console.log('📊 BALANÇO DA FASE 2:');
  console.log(`• Total Homologadas na Rodada: ${homologadasCount}`);
  console.log(`• Total Remapeadas por permutação: ${remapeadasCount}`);
  console.log(`• Total Rejeitadas por Inconsistência: ${rejeitadasCount}`);
  console.log(`• Total Consolidado em Staging: ${staging.decisoes.length}`);
  console.log(`📁 Auditoria salva em: data/coleta_gabaritos_staging.json`);
  console.log('========================================================================\n');
}

runPhase2BottomUp().catch(console.error);

