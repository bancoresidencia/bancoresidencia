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

async function parseExamPdf(pdfPath) {
  const p = new PDFParse({ data: fs.readFileSync(pdfPath) });
  await p.load();
  const rawText = (await p.getText()).text || await p.getText();
  
  const lines = rawText.split('\n').map(l => l.trim()).filter(l => l.length > 0);
  const questions = [];
  let currentQ = null;
  let currentOpt = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (line.startsWith('--') && line.endsWith('--')) continue;
    if (line.includes('ASSOCIAÇÃO MÉDICA DO PARANÁ')) continue;
    if (line.includes('EXAME AMP')) continue;

    const qMatch = line.match(/^(\d{1,3})\)\s+(.*)/);
    if (qMatch) {
      if (currentQ) {
        if (currentOpt) currentQ.options.push(currentOpt);
        questions.push(currentQ);
      }
      currentQ = {
        num: parseInt(qMatch[1], 10),
        statement: qMatch[2],
        options: []
      };
      currentOpt = null;
      continue;
    }

    const optMatch = line.match(/^([A-E])\)\s+(.*)/);
    if (optMatch && currentQ) {
      if (currentOpt) currentQ.options.push(currentOpt);
      currentOpt = {
        letter: optMatch[1],
        text: optMatch[2]
      };
      continue;
    }

    if (currentOpt) {
      currentOpt.text += ' ' + line;
    } else if (currentQ) {
      currentQ.statement += ' ' + line;
    }
  }

  if (currentQ) {
    if (currentOpt) currentQ.options.push(currentOpt);
    questions.push(currentQ);
  }
  return questions;
}

async function parseGabaritoRetificado(gbPath) {
  const p = new PDFParse({ data: fs.readFileSync(gbPath) });
  await p.load();
  const rawText = (await p.getText()).text || await p.getText();

  const secIdx = rawText.indexOf('PROVA GERAL');
  if (secIdx === -1) return new Map();
  const nextSec = rawText.indexOf('PROVA ESPECÍFICA', secIdx + 15);
  const chunk = rawText.slice(secIdx, nextSec !== -1 ? nextSec : undefined);

  const gbMap = new Map();
  const matches = [...chunk.matchAll(/(\d{1,3})\s+([A-E]|X)/g)];
  for (const m of matches) {
    const num = parseInt(m[1], 10);
    const ans = m[2] === 'X' ? 'ANULADA' : m[2].toUpperCase();
    gbMap.set(num, ans);
  }
  return gbMap;
}

async function run() {
  console.log('=== PROCESSAMENTO AMP PARANÁ 2025/2026 COM DUPLA TRAVA >= 85% ===');
  console.log('MODO: STAGING PURO (ZERO ESCRITA NO SUPABASE)');
  console.log(`Critério: Dupla Trava >= ${SIMILARITY_THRESHOLD * 100}%\n`);

  // 1. Carrega staging
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

  // 2. Extrai prova e gabarito
  const questions = await parseExamPdf('data/official_exams/AMP_PARANA/AMP_2025_PROVA_GERAL.pdf');
  const gabarito = await parseGabaritoRetificado('data/official_exams/AMP_PARANA/AMP_2025_GABARITO_RETIFICADO.pdf');

  console.log(`Questões extraídas do caderno: ${questions.length}`);
  console.log(`Respostas no gabarito retificado: ${gabarito.size}`);

  // 3. Busca todas as questões pendentes das instituições do Paraná
  const instFilters = ['%AMP%', '%HMMSJP%', '%Foz do Iguaçu%', '%Angelina Caron%', '%UEM%'];
  let allPending = [];

  for (const f of instFilters) {
    const { data: dbQs, error } = await supabase
      .from('questions')
      .select('id, code, institution, year, statement, options, correct_answer')
      .ilike('institution', f)
      .or('correct_answer.is.null,correct_answer.eq.');

    if (dbQs) allPending.push(...dbQs);
  }

  // Deduplica por id
  const dbPendingMap = new Map();
  allPending.forEach(q => dbPendingMap.set(q.id, q));
  const uniqueDbPending = Array.from(dbPendingMap.values());

  console.log(`Total de pendências do Paraná no banco para teste: ${uniqueDbPending.length}`);

  // 4. Casamento com Dupla Trava >= 85%
  let novosHomologados = 0;

  for (const q of questions) {
    const offAns = gabarito.get(q.num);
    if (!offAns) continue;

    const isAnulada = offAns === 'ANULADA';
    const winningOpt = q.options.find(o => o.letter === offAns);
    const winningText = winningOpt ? winningOpt.text : '';

    for (const dbQ of uniqueDbPending) {
      if (existingIds.has(dbQ.id)) continue;

      // Trava 1: Enunciado >= 0.85
      const stmtSim = textSim(q.statement, dbQ.statement);
      if (stmtSim < SIMILARITY_THRESHOLD) continue;

      // Trava 2 & Anti-Permutação: Alternativa >= 0.85
      const dbOpts = Array.isArray(dbQ.options) ? dbQ.options : [];
      let bestOptSim = 0;
      let matchedDbOpt = null;

      if (!isAnulada && winningText) {
        for (const opt of dbOpts) {
          const sim = textSim(opt.text, winningText);
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
        instituicao: dbQ.institution,
        caderno: 'AMP 2025/2026 Prova Geral',
        qNum: q.num,
        similaridadeEnunciado: Number(stmtSim.toFixed(3)),
        similaridadeAlternativa: Number(bestOptSim.toFixed(3)),
        gabaritoOficialExtraido: offAns,
        gabaritoMapeadoNoBanco: finalMappedLetter,
        foiRemapeado: wasRemapped,
        isAnulada,
        dataHomologacao: new Date().toISOString()
      });

      existingIds.add(dbQ.id);
      novosHomologados++;
      console.log(`[HOMOLOGADO 85%] [${dbQ.code}] (Q${q.num} AMP 2025/2026) -> ${dbQ.institution}`);
      console.log(`   -> Enunciado: ${(stmtSim * 100).toFixed(1)}% | Alternativa: ${(bestOptSim * 100).toFixed(1)}% | Letra: '${finalMappedLetter}' ${wasRemapped ? '⚠️ REMAPEADA' : ''}`);
    }
  }

  // 5. Salva no Staging
  staging.ultimaAtualizacao = new Date().toISOString();
  staging.totalHomologados = staging.decisoes.length;
  fs.writeFileSync(STAGING_OUTPUT, JSON.stringify(staging, null, 2), 'utf8');

  console.log(`\n======================================================`);
  console.log(`RESULTADO DA HOMOLOGAÇÃO AMP PARANÁ:`);
  console.log(`  - Novos gabaritos homologados nesta rodada: ${novosHomologados}`);
  console.log(`  - Total acumulado em STAGING: ${staging.totalHomologados}`);
  console.log(`  - Gravação no Supabase executada: ${WRITE_TO_SUPABASE} (RIGOROSAMENTE ZERO)`);
  console.log(`  - Arquivo salvo: ${STAGING_OUTPUT}`);
  console.log(`======================================================`);
}

run().catch(console.error);
