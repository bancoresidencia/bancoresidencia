import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { createClient } from '@supabase/supabase-js';

const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

// 1. Carrega variáveis de ambiente
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Erro: Supabase URL ou Service Key não definidos.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Argumentos CLI
const args = process.argv.slice(2);
const getArg = (flag, def = null) => {
  const f = args.find(a => a.startsWith(`${flag}=`));
  return f ? f.split('=')[1].trim() : def;
};
const hasFlag = flag => args.includes(flag);

const LIMIT_EXAMS = parseInt(getArg('--limit-exams', '10'), 10);
const TARGET_EXAM = getArg('--exam', null);
const IS_APPLY_DB = hasFlag('--apply');

// Utilitários de normalização de texto
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
  for (const w of wordsA) {
    if (wordsB.has(w)) intersection++;
  }
  const union = new Set([...wordsA, ...wordsB]).size;
  return intersection / union;
}

// Busca pública no DuckDuckGo
async function searchWeb(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const res = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8'
      },
      signal: AbortSignal.timeout(8000)
    });
    if (!res.ok) return [];
    const html = await res.text();
    const links = [];
    const linkRegex = /<a[^>]+class="result__url"[^>]+href="([^"]+)"/g;
    let match;
    while ((match = linkRegex.exec(html)) !== null) {
      let rawUrl = match[1];
      if (rawUrl.includes('uddg=')) {
        const decoded = decodeURIComponent(rawUrl.split('uddg=')[1].split('&')[0]);
        links.push(decoded);
      } else if (rawUrl.startsWith('http')) {
        links.push(rawUrl);
      }
    }
    return links;
  } catch (e) {
    return [];
  }
}

// Parser universal de gabaritos em texto HTML/PDF
function parseAnswerKeyFromText(rawText) {
  const answerMap = {};
  const lines = rawText.split(/\r?\n/);
  
  const regexPatterns = [
    /(?:quest[aã]o|item)?\s*(\d{1,3})\s*[\.\:\-\s\)]+\s*([A-E]|ANULADA|NULA|\*|X|CANCELADA)\b/gi,
    /\b(\d{1,3})\s*[\.\:\-\)]\s*([A-E]|ANULADA|NULA|\*|X)\b/gi,
    /\b(\d{1,3})\s*([A-E])\b/g
  ];

  for (const line of lines) {
    const cleanLine = line.trim();
    if (!cleanLine || cleanLine.length > 200) continue;

    for (const pat of regexPatterns) {
      pat.lastIndex = 0;
      let m;
      while ((m = pat.exec(cleanLine)) !== null) {
        const num = parseInt(m[1], 10);
        let ans = m[2].toUpperCase().trim();
        if (['ANULADA', 'NULA', '*', 'X', 'CANCELADA'].includes(ans)) {
          ans = 'ANULADA';
        }
        if (num >= 1 && num <= 150) {
          if (!answerMap[num]) answerMap[num] = ans;
        }
      }
    }
  }

  return answerMap;
}

// Validação Semântica de Conteúdo (Blindagem contra troca de alternativas)
function matchAlternativeSemantic(dbQuestion, officialAnsLetter, officialOptionText = null) {
  const opts = Array.isArray(dbQuestion.options) ? dbQuestion.options : [];
  if (opts.length === 0) {
    return {
      isValid: false,
      mappedLetter: null,
      reason: 'QUESTAO_SEM_OPCOES_NO_BANCO'
    };
  }

  if (officialAnsLetter === 'ANULADA') {
    return {
      isValid: true,
      mappedLetter: 'ANULADA',
      isAnulada: true,
      wasRemapped: false,
      confidence: 1.0,
      detail: 'Questão Oficialmente Anulada pela Banca'
    };
  }

  // Se temos o texto da alternativa correta da fonte oficial, casamos pelo texto!
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

    if (maxSim >= 0.85) {
      const wasRemapped = bestMatchLetter !== officialAnsLetter;
      return {
        isValid: true,
        mappedLetter: bestMatchLetter,
        isAnulada: false,
        wasRemapped,
        confidence: maxSim,
        detail: wasRemapped
          ? `⚠️ Remapeamento de segurança: Oficial '${officialAnsLetter}' -> No banco é '${bestMatchLetter}' (similaridade: ${(maxSim * 100).toFixed(1)}%)`
          : `Texto coincide com a letra '${bestMatchLetter}'`
      };
    }
  }

  // Validação por letra disponível no nosso banco
  const availableLetters = opts.map(o => (o.letter || '').toUpperCase().trim()).filter(Boolean);
  if (availableLetters.includes(officialAnsLetter)) {
    return {
      isValid: true,
      mappedLetter: officialAnsLetter,
      isAnulada: false,
      wasRemapped: false,
      confidence: 0.95,
      detail: `Letra oficial '${officialAnsLetter}' existe entre as alternativas disponíveis (${availableLetters.join(',')})`
    };
  } else {
    return {
      isValid: false,
      mappedLetter: null,
      reason: `LETRA_FORA_DAS_OPCOES (oficial: ${officialAnsLetter}, disponiveis: ${availableLetters.join(',')})`
    };
  }
}

// Arquivo de Staging Auditado
const STAGING_PATH = path.resolve('data/coleta_gabaritos_staging.json');
function loadStaging() {
  if (fs.existsSync(STAGING_PATH)) {
    try { return JSON.parse(fs.readFileSync(STAGING_PATH, 'utf8')); } catch (e) {}
  }
  return {
    meta: { criadoEm: new Date().toISOString(), totalHomologados: 0, totalRemapeados: 0, totalRejeitados: 0, provasConcluidas: [] },
    decisoes: []
  };
}

function saveStaging(staging) {
  fs.writeFileSync(STAGING_PATH, JSON.stringify(staging, null, 2), 'utf8');
}

async function runMasterCollector() {
  console.log('========================================================================');
  console.log('🚀 MOTOR MESTRE DE COLETA INTELIGENTE & CASAMENTO SEMÂNTICO (FASE 1 + 2)');
  console.log(`   Modo: ${IS_APPLY_DB ? '🟢 GRAVAÇÃO DIRETA NO SUPABASE (--apply)' : '🟡 AUDITORIA EM STAGING (Simulação Protegida)'}`);
  console.log(`   Limite de Cadernos: ${LIMIT_EXAMS} | Prova Específica: ${TARGET_EXAM || 'Ordem de Prioridade'}`);
  console.log('========================================================================\n');

  const manifestPath = path.resolve('data/relatorio_detalhado_gabaritos_faltantes.json');
  if (!fs.existsSync(manifestPath)) {
    console.error('❌ Arquivo relatorio_detalhado_gabaritos_faltantes.json não encontrado.');
    return;
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  let cadernos = manifest.rankingCadernosDeProva;

  if (TARGET_EXAM) {
    cadernos = cadernos.filter(([c]) => c.toLowerCase().includes(TARGET_EXAM.toLowerCase()));
  }

  const cadernosToProcess = cadernos.slice(0, LIMIT_EXAMS);
  console.log(`📋 Cadernos na fila prioritária para processamento: ${cadernosToProcess.length}\n`);

  const staging = loadStaging();
  const jaProcessadas = new Set(staging.meta.provasConcluidas || []);

  for (const [cadernoNome, qtdFaltante] of cadernosToProcess) {
    if (jaProcessadas.has(cadernoNome)) {
      console.log(`⏩ [${cadernoNome}] já concluído em rodada anterior.`);
      continue;
    }

    console.log(`------------------------------------------------------------------------`);
    console.log(`🎯 PROCESSANDO CADERNO: [${cadernoNome}] (Pendências estimadas: ${qtdFaltante})`);

    const parts = cadernoNome.split(' — ');
    const bancaRaw = parts[0]?.trim();
    const ano = parts[1]?.trim();

    // 1. Busca questões pendentes dessa prova no Supabase
    const { data: dbQuestions, error: qErr } = await supabase
      .from('questions')
      .select('id, code, banca, institution, year, statement, options, correct_answer')
      .eq('is_anulada', false)
      .or('correct_answer.is.null,correct_answer.eq.')
      .ilike('banca', `%${bancaRaw.split(' ')[0]}%`)
      .limit(150);

    if (qErr || !dbQuestions || dbQuestions.length === 0) {
      console.log(`  ℹ️ Nenhuma questão pendente encontrada no Supabase com esses filtros.`);
      continue;
    }

    console.log(`  📦 ${dbQuestions.length} questões identificadas no banco.`);

    // 2. Busca na web por cadernos / gabaritos
    const cleanBancaName = bancaRaw.replace(/—.*$/, '').replace(/\(.*\)/, '').trim();
    const queries = [
      `"${cleanBancaName}" "${ano}" ("Gabarito Definitivo" OR "Gabarito Oficial") filetype:pdf`,
      `"Gabarito" "${cleanBancaName}" "${ano}" residência médica`,
      `gabarito prova residência médica "${cleanBancaName}" ${ano}`
    ];

    let answerMap = null;
    let sourceUrl = null;

    for (const q of queries) {
      console.log(`  🔎 Query: ${q}`);
      const links = await searchWeb(q);
      const candidates = links.filter(l => !l.includes('youtube.com') && !l.includes('instagram.com'));

      for (const link of candidates.slice(0, 4)) {
        try {
          const isPdf = link.toLowerCase().endsWith('.pdf') || link.includes('/pdf/');
          console.log(`    🌐 Inspecionando: ${link.substring(0, 75)}...`);
          
          const res = await fetch(link, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
            signal: AbortSignal.timeout(10000)
          });

          if (res.ok) {
            let parsedText = '';
            if (isPdf) {
              const buf = Buffer.from(await res.arrayBuffer());
              const p = await pdf(buf);
              parsedText = p.text;
            } else {
              parsedText = await res.text();
            }

            const candidateMap = parseAnswerKeyFromText(parsedText);
            const foundCount = Object.keys(candidateMap).length;
            if (foundCount >= 15) {
              console.log(`    ✅ Matriz de gabarito extraída com sucesso! ${foundCount} respostas encontradas.`);
              answerMap = candidateMap;
              sourceUrl = link;
              break;
            }
          }
        } catch (e) {
          // segue para o próximo link
        }
      }

      if (answerMap) break;
    }

    // 3. Casamento com as questões do banco e validação de alternativas
    if (answerMap) {
      let matchedCount = 0;
      let remappedCount = 0;
      let rejectedCount = 0;

      for (const q of dbQuestions) {
        const m = (q.code || '').match(/-(\d{1,3})$/);
        const qNum = m ? parseInt(m[1], 10) : null;

        if (qNum && answerMap[qNum]) {
          const officialLetter = answerMap[qNum];
          const matchResult = matchAlternativeSemantic(q, officialLetter);

          if (matchResult.isValid) {
            matchedCount++;
            if (matchResult.wasRemapped) {
              remappedCount++;
              console.log(`    ⚠️ REMAPEAMENTO: Questão ${q.code}: Oficial '${officialLetter}' -> No Banco '${matchResult.mappedLetter}'`);
            }

            staging.decisoes.push({
              id: q.id,
              code: q.code,
              caderno: cadernoNome,
              numeroQuestao: qNum,
              gabaritoOficialExtraido: officialLetter,
              gabaritoMapeadoNoBanco: matchResult.mappedLetter,
              foiRemapeado: matchResult.wasRemapped,
              isAnulada: matchResult.isAnulada,
              confianca: matchResult.confidence,
              fonte: sourceUrl,
              data: new Date().toISOString()
            });

            if (IS_APPLY_DB) {
              await supabase
                .from('questions')
                .update({
                  correct_answer: matchResult.mappedLetter,
                  is_anulada: matchResult.isAnulada,
                  has_gabarito: true
                })
                .eq('id', q.id);
            }
          } else {
            rejectedCount++;
            console.log(`    ⛔ Rejeitada questão ${q.code}: ${matchResult.reason}`);
          }
        }
      }

      console.log(`  🎉 Caderno Concluído: ${matchedCount} homologadas | ${remappedCount} remapeadas | ${rejectedCount} rejeitadas`);
      staging.meta.totalHomologados += matchedCount;
      staging.meta.totalRemapeados += remappedCount;
      staging.meta.totalRejeitados += rejectedCount;
      staging.meta.provasConcluidas.push(cadernoNome);
      saveStaging(staging);
    } else {
      console.log(`  ⏳ Caderno em quarentena: links oficiais exigirão busca na Fase 2.`);
    }
  }

  saveStaging(staging);
  console.log('\n========================================================================');
  console.log(`📊 BALANÇO DA OPERAÇÃO:`);
  console.log(`• Total Homologado em Staging: ${staging.meta.totalHomologados}`);
  console.log(`• Total Remapeado por troca de alternativa: ${staging.meta.totalRemapeados}`);
  console.log(`• Total Rejeitado por Inconsistência: ${staging.meta.totalRejeitados}`);
  console.log(`📁 Auditoria salva em: data/coleta_gabaritos_staging.json`);
  console.log('========================================================================\n');
}

runMasterCollector().catch(console.error);
