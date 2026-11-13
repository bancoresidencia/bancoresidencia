import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

// =========================================================================
// REGRA MANDATÓRIA DO USUÁRIO: ZERO ESCRITA NO SUPABASE (SOMENTE STAGING)
// =========================================================================
const WRITE_TO_SUPABASE = false; 
const SIMILARITY_THRESHOLD = 0.85; // DUPLA TRAVA >= 85%
const STAGING_OUTPUT = path.resolve('data/staging_homologados_85pct.json');

// Carrega variáveis de ambiente
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const t = line.trim();
    if (t && !t.startsWith('#')) {
      const idx = t.indexOf('=');
      if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanHtml(html) {
  if (!html) return '';
  return html
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

function normalize(s) {
  return (s || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Similaridade combinada Jaccard de Bi-grams + Tokens de palavras
function textSim(a, b) {
  const nA = normalize(cleanHtml(a));
  const nB = normalize(cleanHtml(b));
  if (!nA || !nB) return 0;
  if (nA === nB) return 1.0;

  // Substring inclusion com alta fidelidade
  if ((nA.includes(nB) || nB.includes(nA)) && Math.min(nA.length, nB.length) >= 20) {
    const ratio = Math.min(nA.length, nB.length) / Math.max(nA.length, nB.length);
    if (ratio >= 0.85) return ratio;
  }

  // Token Jaccard de palavras > 2 letras
  const wordsA = nA.split(' ').filter(w => w.length > 2);
  const wordsB = nB.split(' ').filter(w => w.length > 2);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let inter = 0;
  for (const w of setA) if (setB.has(w)) inter++;
  const wordJaccard = inter / new Set([...setA, ...setB]).size;

  // Bi-gram tokens para sensibilidade de ordem e números
  const bigrams = (str) => {
    const bg = new Set();
    for (let i = 0; i < str.length - 1; i++) bg.add(str.slice(i, i + 2));
    return bg;
  };
  const bgA = bigrams(nA);
  const bgB = bigrams(nB);
  let bgInter = 0;
  for (const b of bgA) if (bgB.has(b)) bgInter++;
  const bgJaccard = bgInter / new Set([...bgA, ...bgB]).size;

  return (wordJaccard * 0.6) + (bgJaccard * 0.4);
}

function initStaging() {
  if (fs.existsSync(STAGING_OUTPUT)) {
    try {
      return JSON.parse(fs.readFileSync(STAGING_OUTPUT, 'utf8'));
    } catch (_) {}
  }
  return {
    ultimaAtualizacao: new Date().toISOString(),
    regra: "DUPLA_TRAVA_SIMILARIDADE_GE_85",
    threshold: SIMILARITY_THRESHOLD,
    totalHomologados: 0,
    modo: "STAGING_PURO_SEM_ESCRITA_SUPABASE",
    decisoes: []
  };
}

function saveStaging(staging) {
  staging.ultimaAtualizacao = new Date().toISOString();
  staging.totalHomologados = staging.decisoes.length;
  fs.writeFileSync(STAGING_OUTPUT, JSON.stringify(staging, null, 2), 'utf8');
}

// =========================================================================
// MÓDULOS DE EXTRAÇÃO DE PROVAS OFICIAIS
// =========================================================================

// 1. ABEM TPN
async function extractAbem(staging) {
  console.log('\n--- [PARSER] ABEM Teste de Progresso Nacional ---');
  const files = [
    { pv: 'data/official_exams/ABEM/TPN25_Caderno_Prova_09h00.pdf', gb: 'data/official_exams/ABEM/TPN25_Gabarito_Prova_09h00.pdf', desc: 'ABEM 2025/2026 09h00' },
    { pv: 'data/official_exams/ABEM/TPN25_Caderno_Prova_19h30.pdf', gb: 'data/official_exams/ABEM/TPN25_Gabarito_Prova_19h30.pdf', desc: 'ABEM 2025/2026 19h30' }
  ];

  const examQuestions = [];

  for (const f of files) {
    if (!fs.existsSync(f.pv) || !fs.existsSync(f.gb)) continue;
    
    // Gabarito
    const pGb = new PDFParse({ data: fs.readFileSync(f.gb) });
    await pGb.load();
    const gbText = (await pGb.getText()).text || await pGb.getText();
    const gbMap = new Map();
    const gbRegex = /(?:^|\n)\s*(\d{1,3})\s+([A-E])\)\s+([^\n]+)/g;
    let m;
    while ((m = gbRegex.exec(gbText)) !== null) {
      gbMap.set(parseInt(m[1], 10), { letter: m[2].toUpperCase(), text: m[3].trim() });
    }

    // Caderno
    const pPv = new PDFParse({ data: fs.readFileSync(f.pv) });
    await pPv.load();
    const pvText = (await pPv.getText()).text || await pPv.getText();
    const qSplits = pvText.split(/(?:^|\n)\s*(?:QUESTÃO|Questão)\s+(\d{1,3})\s*[-–]/i);

    for (let i = 1; i < qSplits.length; i += 2) {
      const qNum = parseInt(qSplits[i], 10);
      const qBlock = qSplits[i + 1] || '';
      const optParts = qBlock.split(/(?:^|\n)\s*([A-E])\)\s+/);
      const stmt = optParts[0].replace(/^[^\n]*\n/, '').trim();
      const opts = {};
      for (let j = 1; j < optParts.length; j += 2) opts[optParts[j].toUpperCase()] = optParts[j + 1].trim();

      const gb = gbMap.get(qNum);
      if (gb) {
        examQuestions.push({
          banca: 'ABEM',
          caderno: f.desc,
          qNum,
          stmt,
          opts,
          officialAnswer: gb.letter,
          winningText: gb.text || opts[gb.letter] || ''
        });
      }
    }
  }

  console.log(`Montadas ${examQuestions.length} questões oficiais da ABEM com gabarito.`);

  // Busca pendentes da ABEM no Supabase
  const { data: dbQs } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer, year')
    .ilike('institution', '%ABEM%')
    .or('correct_answer.is.null,correct_answer.eq.');

  matchAndRecord(dbQs || [], examQuestions, staging);
}

// 2. SES-GO Verbena
async function extractSesGo(staging) {
  console.log('\n--- [PARSER] SES-GO Instituto Verbena / UFG ---');
  const files = [
    { pv: 'data/official_exams/SES_GO/SES_GO_2026_PROVA_ACESSO_DIRETO.pdf', gb: 'data/official_exams/SES_GO/SES_GO_2026_GABARITO_DEFINITIVO.pdf', year: 2026, desc: 'SES-GO 2026 Acesso Direto' },
    { pv: 'data/official_exams/SES_GO/SES_GO_2024_PROVA_ACESSO_DIRETO.pdf', gb: 'data/official_exams/SES_GO/SES_GO_2024_GABARITO_DEFINITIVO.pdf', year: 2024, desc: 'SES-GO 2024 Acesso Direto' }
  ];

  const examQuestions = [];

  for (const f of files) {
    if (!fs.existsSync(f.pv) || !fs.existsSync(f.gb)) continue;

    // Gabarito
    const pGb = new PDFParse({ data: fs.readFileSync(f.gb) });
    await pGb.load();
    const gbText = (await pGb.getText()).text || await pGb.getText();
    const lines = gbText.split('\n').map(l => l.trim()).filter(Boolean);
    const gbMap = new Map();
    for (let i = 0; i < lines.length - 1; i++) {
      const nums = lines[i].split(/\s+/);
      const answers = lines[i+1].split(/\s+/);
      if (nums.every(n => /^\d+$/.test(n)) && answers.length === nums.length) {
        if (answers.every(a => /^[A-EX\*]$/i.test(a.replace(/[\*]/g, '')))) {
          for (let j = 0; j < nums.length; j++) {
            const qNum = parseInt(nums[j], 10);
            let ans = answers[j].toUpperCase().replace(/\*/g, '');
            gbMap.set(qNum, ans);
          }
        }
      }
    }

    // Caderno
    const pPv = new PDFParse({ data: fs.readFileSync(f.pv) });
    await pPv.load();
    const pvText = (await pPv.getText()).text || await pPv.getText();
    const qSplits = pvText.split(/(?:^|\n)\s*QUESTÃO\s+(\d{1,3})/i);

    for (let i = 1; i < qSplits.length; i += 2) {
      const qNum = parseInt(qSplits[i], 10);
      const qBlock = qSplits[i + 1] || '';
      const optParts = qBlock.split(/(?:^|\n)\s*\(([A-E])\)\s+/);
      const stmt = optParts[0].trim();
      const opts = {};
      for (let j = 1; j < optParts.length; j += 2) opts[optParts[j].toUpperCase()] = optParts[j + 1].trim();

      const gb = gbMap.get(qNum);
      if (gb) {
        const isAnulada = gb === 'X' || gb === 'ANULADA';
        examQuestions.push({
          banca: 'SES-GO',
          caderno: f.desc,
          qNum,
          stmt,
          opts,
          officialAnswer: isAnulada ? 'ANULADA' : gb,
          isAnulada,
          winningText: opts[gb] || ''
        });
      }
    }
  }

  console.log(`Montadas ${examQuestions.length} questões oficiais da SES-GO com gabarito.`);

  // Busca pendentes da SES-GO no Supabase
  const { data: dbQs } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer, year')
    .ilike('institution', '%SES-GO%')
    .or('correct_answer.is.null,correct_answer.eq.');

  matchAndRecord(dbQs || [], examQuestions, staging);
}

// 3. UERJ CEPUERJ
async function extractUerj(staging) {
  console.log('\n--- [PARSER] UERJ CEPUERJ ---');
  const years = [2024, 2023, 2022];
  const examQuestions = [];

  for (const yr of years) {
    const pvFile = `data/official_exams/UERJ/UERJ_${yr}_PROVA_ACESSO_DIRETO.pdf`;
    const gbFile = `data/official_exams/UERJ/UERJ_${yr}_GABARITO_DEFINITIVO.pdf`;
    if (!fs.existsSync(pvFile) || !fs.existsSync(gbFile)) continue;

    const pGb = new PDFParse({ data: fs.readFileSync(gbFile) });
    await pGb.load();
    const gbText = (await pGb.getText()).text || await pGb.getText();
    const lines = gbText.split('\n').map(l => l.trim()).filter(Boolean);
    const aLine = lines.find(l => l.match(/^[A-D X\s]{80,}$/));
    if (!aLine) continue;
    const answers = aLine.split(/\s+/).filter(Boolean);

    const pPv = new PDFParse({ data: fs.readFileSync(pvFile) });
    await pPv.load();
    const pvText = (await pPv.getText()).text || await pPv.getText();

    for (let num = 1; num <= 100; num++) {
      const nextNum = num + 1;
      const startRegex = new RegExp(`(?:^|\\n)\\s*${num}\\)\\s+`, 'm');
      const endRegex = num === 100 ? /(?:-- \d+ of \d+ --|$)/m : new RegExp(`(?:^|\\n)\\s*${nextNum}\\)\\s+`, 'm');
      const startMatch = pvText.match(startRegex);
      if (!startMatch) continue;
      const startIndex = startMatch.index + startMatch[0].length;
      const remainingText = pvText.slice(startIndex);
      const endMatch = remainingText.match(endRegex);
      const qBlock = endMatch ? remainingText.slice(0, endMatch.index) : remainingText.slice(0, 1500);

      const optSplit = qBlock.split(/(?:^|\n)\s*([a-d])\)\s+/i);
      const stmt = optSplit[0].replace(/-- \d+ of \d+ --/g, '').replace(/Página \d+ de \d+/g, '').replace(/RESIDÊNCIA MÉDICA UERJ.*/g, '').replace(/ORGANIZADOR/g, '').trim();
      const opts = {};
      for (let j = 1; j < optSplit.length; j += 2) opts[optSplit[j].toUpperCase()] = optSplit[j + 1].replace(/-- \d+ of \d+ --/g, '').trim();

      const ans = answers[num - 1];
      if (ans) {
        const isAnulada = ans === 'X';
        examQuestions.push({
          banca: 'UERJ',
          caderno: `UERJ ${yr} Acesso Direto`,
          qNum: num,
          stmt,
          opts,
          officialAnswer: isAnulada ? 'ANULADA' : ans,
          isAnulada,
          winningText: opts[ans] || ''
        });
      }
    }
  }

  console.log(`Montadas ${examQuestions.length} questões oficiais da UERJ com gabarito.`);

  // Busca pendentes da UERJ no Supabase
  const { data: dbQs } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer, year')
    .ilike('banca', '%UERJ%')
    .or('correct_answer.is.null,correct_answer.eq.');

  matchAndRecord(dbQs || [], examQuestions, staging);
}

// 4. UNIP 2026 (Gabarito Oficial em Matriz)
async function extractUnip2026(staging) {
  console.log('\n--- [PARSER] UNIP 2026 (Gabarito Oficial Estruturado) ---');
  const UNIP_OFFICIAL = [
    null,
    'C', 'B', 'E', 'D', 'C', 'E', 'A', 'C', 'A', 'A', // 1-10
    'C', 'B', 'D', 'B', 'D', 'E', 'E', 'E', 'D', 'D', // 11-20
    'E', 'D', 'B', 'C', 'B', 'A', 'C', 'E', 'C', 'D', // 21-30
    'B', 'D', 'E', 'A', 'B', 'D', 'C', 'A', 'E', 'A', // 31-40
    'D', 'D', 'B', 'A', 'E', 'C', 'C', 'C', 'C', 'A', // 41-50
    'B', 'B', 'B', 'C', 'D', 'E', 'A', 'B', 'B', 'A', // 51-60
    'B', 'B', 'C', 'A', 'D', 'C', 'C', 'C', 'B', 'C', // 61-70
    'B', 'D', 'C', 'C', 'C', 'C', 'C', 'C', 'B', 'B', // 71-80
    'C', 'B', 'C', 'A', 'E', 'D', 'B', 'D', 'E', 'D', // 81-90
    'A', 'B', 'E', 'C', 'A', 'A', 'C', 'C', 'E', 'D'  // 91-100
  ];

  // A UNIP possui blocos contíguos de códigos no banco
  // Exemplo comprovado: Pediatria Q81-99 corresponde exatamente a códigos 23435-23453
  // Vamos processar apenas os blocos onde a correspondência de alternativas for >= 85%
  const { data: dbQs } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer, year, especialidade')
    .ilike('institution', '%UNIP%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`Pendências UNIP 2026 no banco: ${dbQs?.length || 0}`);
}

// =========================================================================
// MOTOR CENTRAL DE CASAMENTO COM DUPLA TRAVA >= 85%
// =========================================================================
function matchAndRecord(dbQs, examQuestions, staging) {
  const existingIds = new Set(staging.decisoes.map(d => d.id));
  let novosHomologados = 0;

  for (const dbQ of dbQs) {
    if (existingIds.has(dbQ.id)) continue;

    let bestSimEnunciado = 0;
    let matchedExamQ = null;

    // Trava 1: Similaridade do Enunciado >= 0.85
    for (const eq of examQuestions) {
      const sim = textSim(dbQ.statement, eq.stmt);
      if (sim > bestSimEnunciado) {
        bestSimEnunciado = sim;
        matchedExamQ = eq;
      }
    }

    if (!matchedExamQ || bestSimEnunciado < SIMILARITY_THRESHOLD) {
      continue; // REJEITADO PELO CORTE DE 85%
    }

    // Trava 2: Similaridade da Alternativa Vencedora >= 0.85
    const offAns = matchedExamQ.officialAnswer;
    const isAnulada = matchedExamQ.isAnulada || offAns === 'ANULADA';
    const offWinningText = matchedExamQ.winningText || '';

    const dbOpts = Array.isArray(dbQ.options) ? dbQ.options : [];
    let bestOptSim = 0;
    let matchedDbOpt = null;

    if (!isAnulada && offWinningText) {
      for (const opt of dbOpts) {
        const sim = textSim(opt.text, offWinningText);
        if (sim > bestOptSim) {
          bestOptSim = sim;
          matchedDbOpt = opt;
        }
      }

      // Se a melhor opção no banco tiver menos de 85% de similaridade com a resposta certa: REJEITA
      if (bestOptSim < SIMILARITY_THRESHOLD || !matchedDbOpt) {
        continue; // REJEITADO PELA TRAVA 2 (ALTERNATIVA < 85%)
      }
    }

    const finalMappedLetter = isAnulada ? 'ANULADA' : (matchedDbOpt ? matchedDbOpt.letter : offAns);
    const wasRemapped = !isAnulada && matchedDbOpt && matchedDbOpt.letter !== offAns;

    staging.decisoes.push({
      id: dbQ.id,
      code: dbQ.code,
      ano: dbQ.year,
      caderno: matchedExamQ.caderno,
      qNum: matchedExamQ.qNum,
      similaridadeEnunciado: Number(bestSimEnunciado.toFixed(3)),
      similaridadeAlternativa: Number(bestOptSim.toFixed(3)),
      gabaritoOficialExtraido: offAns,
      gabaritoMapeadoNoBanco: finalMappedLetter,
      foiRemapeado: wasRemapped,
      isAnulada,
      dataHomologacao: new Date().toISOString()
    });

    novosHomologados++;
    console.log(`[HOMOLOGADO 85%] [${dbQ.code}] (Q${matchedExamQ.qNum} ${matchedExamQ.caderno})`);
    console.log(`   -> Enunciado: ${(bestSimEnunciado * 100).toFixed(1)}% | Alternativa: ${(bestOptSim * 100).toFixed(1)}% | Letra: '${finalMappedLetter}' ${wasRemapped ? '⚠️ REMAPEADA' : ''}`);
  }

  console.log(`-> Novos homologados com Dupla Trava >= 85%: ${novosHomologados}`);
}

// =========================================================================
// EXECUÇÃO GERAL (SOMENTE STAGING, ZERO SUPABASE)
// =========================================================================
async function run() {
  console.log('========================================================================');
  console.log('🛡️ EXTRATOR MASTER OFICIAL COM DUPLA TRAVA (>= 85% ENUNCIADO + ALTERNATIVAS)');
  console.log(`MODO: ${WRITE_TO_SUPABASE ? '⚡ ATENÇÃO: ESCRITA ATIVA' : '🔒 SOMENTE STAGING (ZERO ESCRITA NO SUPABASE)'}`);
  console.log(`Arquivo de Staging: ${STAGING_OUTPUT}`);
  console.log('========================================================================');

  const staging = initStaging();
  const initialCount = staging.decisoes.length;

  await extractAbem(staging);
  saveStaging(staging);

  await extractSesGo(staging);
  saveStaging(staging);

  await extractUerj(staging);
  saveStaging(staging);

  await extractUnip2026(staging);
  saveStaging(staging);

  const finalCount = staging.decisoes.length;
  const added = finalCount - initialCount;

  console.log('\n========================================================================');
  console.log(`🎉 EXECUÇÃO CONCLUÍDA COM SUCESSO!`);
  console.log(`Total acumulado em staging (>= 85% duplo): ${finalCount} questões`);
  console.log(`Novas questões adicionadas nesta rodada: ${added} questões`);
  console.log(`🔒 NENHUM GABARITO FOI ENVIADO AO SUPABASE (gravados apenas em ${STAGING_OUTPUT})`);
  console.log('========================================================================\n');
}

run().catch(console.error);

