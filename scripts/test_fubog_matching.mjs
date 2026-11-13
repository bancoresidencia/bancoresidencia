import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { parseFubogGabarito, parseFubogExamPdf } from './parse_fubog_booklet.mjs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanHtml(str) {
  if (!str) return '';
  return str.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').trim();
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

function calculateJaccard(s1, s2) {
  const words1 = new Set(normalizeText(s1).split(' ').filter(w => w.length > 2));
  const words2 = new Set(normalizeText(s2).split(' ').filter(w => w.length > 2));
  if (words1.size === 0 || words2.size === 0) return 0;
  let inter = 0;
  for (const w of words1) if (words2.has(w)) inter++;
  return inter / (words1.size + words2.size - inter);
}

function getBiGrams(str) {
  const s = normalizeText(str).replace(/\s+/g, '');
  const bigrams = new Set();
  for (let i = 0; i < s.length - 1; i++) {
    bigrams.add(s.slice(i, i + 2));
  }
  return bigrams;
}

function calculateSimilarity(s1, s2) {
  const jaccard = calculateJaccard(s1, s2);
  const bg1 = getBiGrams(s1);
  const bg2 = getBiGrams(s2);
  if (bg1.size === 0 || bg2.size === 0) return jaccard;
  let inter = 0;
  for (const bg of bg1) if (bg2.has(bg)) inter++;
  const bgSim = (2.0 * inter) / (bg1.size + bg2.size);
  return (jaccard * 0.4) + (bgSim * 0.6);
}

async function matchFubog() {
  console.log('Loading FUBOG V1A and V2B...');
  const gb1 = await parseFubogGabarito('data/official_exams/FUBOG/GB_FUBOG_V1A.pdf');
  const pv1 = await parseFubogExamPdf('data/official_exams/FUBOG/PV_FUBOG_V1A.pdf');
  console.log(`V1A: ${Object.keys(pv1).length} questions, ${Object.keys(gb1).length} answers.`);

  // Load all pending FUBOG questions
  const { data: fubogDb, error } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .ilike('code', 'FUBOG%');

  if (error) {
    console.error('Error fetching FUBOG questions:', error.message);
    return;
  }
  console.log(`Fetched ${fubogDb.length} pending FUBOG questions from DB.`);

  const matches = [];

  for (const q of fubogDb) {
    const qStmt = cleanHtml(q.statement);
    let bestMatch = null;
    let maxSim = 0;

    for (const [qNumStr, bq] of Object.entries(pv1)) {
      const qNum = parseInt(qNumStr, 10);
      const bStmt = bq.statement;
      const sim = calculateSimilarity(qStmt, bStmt);
      if (sim > maxSim) {
        maxSim = sim;
        bestMatch = { qNum, bq, sim };
      }
    }

    if (maxSim >= 0.85 && bestMatch) {
      const officialAns = gb1[bestMatch.qNum];
      const officialWinningText = bestMatch.bq.options[officialAns] || '';

      // Check options in DB
      let winningOptSim = 0;
      let matchedDbLetter = null;
      let isPermuted = false;

      if (q.options && Array.isArray(q.options)) {
        for (const opt of q.options) {
          const optText = cleanHtml(opt.text || '');
          const optSim = calculateSimilarity(optText, officialWinningText);
          if (optSim >= 0.85) {
            winningOptSim = optSim;
            matchedDbLetter = opt.letter;
            if (opt.letter !== officialAns) isPermuted = true;
            break;
          }
        }
      }

      if (winningOptSim >= 0.85 || officialAns === 'X') {
        const finalAnswer = officialAns === 'X' ? 'ANULADA' : (matchedDbLetter || officialAns);
        matches.push({
          id: q.id,
          code: q.code,
          ano: q.year,
          caderno: 'FUBOG Edital 43 Versão 1A',
          qNum: bestMatch.qNum,
          similaridadeEnunciado: maxSim,
          similaridadeAlternativa: winningOptSim,
          gabaritoOficialExtraido: officialAns,
          gabaritoMapeadoNoBanco: finalAnswer,
          foiRemapeado: isPermuted,
          isAnulada: officialAns === 'X',
          dataHomologacao: new Date().toISOString()
        });
        console.log(`[HOMOLOGADA >= 85%] ${q.code} (Ano ${q.year}) <=> Q${bestMatch.qNum} (Sim: ${(maxSim*100).toFixed(1)}% / Opt: ${(winningOptSim*100).toFixed(1)}%) -> Gabarito: ${finalAnswer} ${isPermuted ? '(REMAPEADA)' : ''}`);
      } else {
        console.log(`[GATE 2 REJEITADA] ${q.code} <=> Q${bestMatch.qNum} (Stmt: ${(maxSim*100).toFixed(1)}% MAS Opt: ${(winningOptSim*100).toFixed(1)}%)`);
      }
    }
  }

  console.log(`\nTotal de questoes FUBOG homologadas nesta prova: ${matches.length}`);
}

matchFubog();
