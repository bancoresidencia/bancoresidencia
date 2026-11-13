import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');
import { createClient } from '@supabase/supabase-js';

// =========================================================================
// REGRA MANDATÓRIA: ZERO ESCRITA NO SUPABASE (SOMENTE STAGING LOCAL)
// =========================================================================
const WRITE_TO_SUPABASE = false;
const SIMILARITY_THRESHOLD = 0.85; // DUPLA TRAVA >= 85%
const STAGING_OUTPUT = path.resolve('data/staging_homologados_85pct.json');

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

function cleanHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
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

function textSim(a, b) {
  const nA = normalize(cleanHtml(a));
  const nB = normalize(cleanHtml(b));
  if (!nA || !nB) return 0;
  if (nA === nB) return 1.0;

  if ((nA.includes(nB) || nB.includes(nA)) && Math.min(nA.length, nB.length) >= 20) {
    const ratio = Math.min(nA.length, nB.length) / Math.max(nA.length, nB.length);
    if (ratio >= 0.85) return ratio;
  }

  const wordsA = nA.split(' ').filter(w => w.length > 2);
  const wordsB = nB.split(' ').filter(w => w.length > 2);
  if (wordsA.length === 0 || wordsB.length === 0) return 0;

  const setA = new Set(wordsA);
  const setB = new Set(wordsB);
  let inter = 0;
  for (const w of setA) if (setB.has(w)) inter++;
  const wordJaccard = inter / new Set([...setA, ...setB]).size;

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

function parseVerbenaGabarito(text) {
  const gbMap = new Map();
  // Formato: 
  // 01 02 03 04 05
  // D C D C A
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
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
  return gbMap;
}

async function parseVerbenaExam(pvPath, gbPath, desc) {
  const examQuestions = [];
  if (!fs.existsSync(pvPath) || !fs.existsSync(gbPath)) {
    console.warn(`Arquivos não encontrados para ${desc}`);
    return examQuestions;
  }

  // Gabarito
  const pGb = new PDFParse({ data: fs.readFileSync(gbPath) });
  await pGb.load();
  const gbText = (await pGb.getText()).text || await pGb.getText();
  const gbMap = parseVerbenaGabarito(gbText);

  // Prova
  const pPv = new PDFParse({ data: fs.readFileSync(pvPath) });
  await pPv.load();
  const pvText = (await pPv.getText()).text || await pPv.getText();

  // Split por QUESTÃO XX
  const qSplits = pvText.split(/(?:^|\n)\s*QUEST[ÃA]O\s+(\d{1,3})/i);
  for (let i = 1; i < qSplits.length; i += 2) {
    const qNum = parseInt(qSplits[i], 10);
    const qBlock = qSplits[i + 1] || '';
    const optParts = qBlock.split(/(?:^|\n)\s*\(([A-E])\)\s+/);
    const stmt = optParts[0].trim();
    const opts = {};
    for (let j = 1; j < optParts.length; j += 2) {
      opts[optParts[j].toUpperCase()] = optParts[j + 1].trim();
    }

    const gb = gbMap.get(qNum);
    if (gb) {
      const isAnulada = gb === 'X' || gb === 'ANULADA';
      examQuestions.push({
        caderno: desc,
        qNum,
        stmt,
        opts,
        officialAnswer: isAnulada ? 'ANULADA' : gb,
        isAnulada,
        winningText: opts[gb] || ''
      });
    }
  }
  return examQuestions;
}

async function run() {
  console.log('=== PROCESSAMENTO INTEGRAL SES-GO / INSTITUTO VERBENA ===');
  console.log('MODO: STAGING PURO (ZERO ESCRITA NO SUPABASE)');
  console.log(`Critério de Homologação: Dupla Trava >= ${SIMILARITY_THRESHOLD * 100}%\n`);

  // 1. Carrega staging existente
  let staging = {
    ultimaAtualizacao: new Date().toISOString(),
    regra: "DUPLA_TRAVA_SIMILARIDADE_GE_85",
    threshold: SIMILARITY_THRESHOLD,
    totalHomologados: 0,
    modo: "STAGING_PURO_SEM_ESCRITA_SUPABASE",
    decisoes: []
  };

  if (fs.existsSync(STAGING_OUTPUT)) {
    staging = JSON.parse(fs.readFileSync(STAGING_OUTPUT, 'utf8'));
    console.log(`Staging existente carregado com ${staging.decisoes.length} homologações.`);
  }
  const existingIds = new Set(staging.decisoes.map(d => d.id));

  // 2. Monta todos os cadernos disponíveis da SES-GO
  const dir2026 = path.resolve('data/official_exams/SES_GO_2026');
  const dirGeral = path.resolve('data/official_exams/SES_GO');

  const examPairs = [
    { pv: path.join(dir2026, 'PV_CLINICA_MEDICA_A.pdf'), gb: path.join(dir2026, 'GB_CLINICA_MEDICA_A.pdf'), desc: 'SES-GO 2026 R3 Clínica Médica' },
    { pv: path.join(dir2026, 'PV_CIRURGIA_GERAL_A.pdf'), gb: path.join(dir2026, 'GB_CIRURGIA_GERAL_A.pdf'), desc: 'SES-GO 2026 R3 Cirurgia Geral' },
    { pv: path.join(dir2026, 'PV_PEDIATRIA_A.pdf'), gb: path.join(dir2026, 'GB_PEDIATRIA_A.pdf'), desc: 'SES-GO 2026 R3 Pediatria' },
    { pv: path.join(dir2026, 'PV_GIN_OBS_A.pdf'), gb: path.join(dir2026, 'GB_GIN_OBS_A.pdf'), desc: 'SES-GO 2026 R3 Ginecologia e Obstetrícia' },
    { pv: path.join(dir2026, 'PV_GASTRO_A.pdf'), gb: path.join(dir2026, 'GB_GASTRO_A.pdf'), desc: 'SES-GO 2026 R3 Gastroenterologia' },
    { pv: path.join(dir2026, 'PV_NEURO_A.pdf'), gb: path.join(dir2026, 'GB_NEURO_A.pdf'), desc: 'SES-GO 2026 R3 Neurologia' },
    { pv: path.join(dirGeral, 'SES_GO_2026_PROVA_ACESSO_DIRETO.pdf'), gb: path.join(dirGeral, 'SES_GO_2026_GABARITO_DEFINITIVO.pdf'), desc: 'SES-GO 2026 Acesso Direto' },
    { pv: path.join(dirGeral, 'SES_GO_2024_PROVA_ACESSO_DIRETO.pdf'), gb: path.join(dirGeral, 'SES_GO_2024_GABARITO_DEFINITIVO.pdf'), desc: 'SES-GO 2024 Acesso Direto' }
  ];

  const allExamQuestions = [];
  for (const pair of examPairs) {
    console.log(`Carregando ${pair.desc}...`);
    const qs = await parseVerbenaExam(pair.pv, pair.gb, pair.desc);
    console.log(`  -> Extraídas ${qs.length} questões com gabarito.`);
    allExamQuestions.push(...qs);
  }

  console.log(`\nTotal de questões oficiais montadas: ${allExamQuestions.length}`);

  // 3. Busca pendentes da SES-GO no banco
  const { data: dbQs, error } = await supabase
    .from('questions')
    .select('id, code, statement, options, correct_answer, year, especialidade')
    .ilike('institution', '%SES-GO%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error('Erro ao buscar questões pendentes:', error);
    return;
  }
  console.log(`Total de pendências da SES-GO no banco: ${dbQs.length}`);

  // 4. Casamento com Dupla Trava >= 85%
  let novosHomologados = 0;

  for (const dbQ of dbQs) {
    if (existingIds.has(dbQ.id)) continue;

    let bestSimEnunciado = 0;
    let matchedExamQ = null;

    // Trava 1: Enunciado >= 0.85
    for (const eq of allExamQuestions) {
      const sim = textSim(dbQ.statement, eq.stmt);
      if (sim > bestSimEnunciado) {
        bestSimEnunciado = sim;
        matchedExamQ = eq;
      }
    }

    if (!matchedExamQ || bestSimEnunciado < SIMILARITY_THRESHOLD) continue;

    // Trava 2 & Anti-Permutação: Alternativa >= 0.85
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

      if (bestOptSim < SIMILARITY_THRESHOLD || !matchedDbOpt) {
        continue; // REJEITADO PELA TRAVA 2
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

    existingIds.add(dbQ.id);
    novosHomologados++;
    console.log(`[HOMOLOGADO 85%] [${dbQ.code}] (Q${matchedExamQ.qNum} ${matchedExamQ.caderno})`);
    console.log(`   -> Enunciado: ${(bestSimEnunciado * 100).toFixed(1)}% | Alternativa: ${(bestOptSim * 100).toFixed(1)}% | Letra: '${finalMappedLetter}' ${wasRemapped ? '⚠️ REMAPEADA' : ''}`);
  }

  // 5. Salva no Staging
  staging.ultimaAtualizacao = new Date().toISOString();
  staging.totalHomologados = staging.decisoes.length;
  fs.writeFileSync(STAGING_OUTPUT, JSON.stringify(staging, null, 2), 'utf8');

  console.log(`\n======================================================`);
  console.log(`RESULTADO DA HOMOLOGAÇÃO SES-GO:`);
  console.log(`  - Novos gabaritos homologados nesta rodada: ${novosHomologados}`);
  console.log(`  - Total acumulado em STAGING: ${staging.totalHomologados}`);
  console.log(`  - Gravação no Supabase executada: ${WRITE_TO_SUPABASE} (RIGOROSAMENTE ZERO)`);
  console.log(`  - Arquivo salvo: ${STAGING_OUTPUT}`);
  console.log(`======================================================`);
}

run().catch(console.error);
