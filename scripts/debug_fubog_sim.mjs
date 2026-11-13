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

async function debugSim() {
  const pv1 = await parseFubogExamPdf('data/official_exams/FUBOG/PV_FUBOG_V1A.pdf');
  const { data: fubogDb } = await supabase
    .from('questions')
    .select('id, code, institution, year, statement')
    .or('correct_answer.is.null,correct_answer.eq.')
    .ilike('code', 'FUBOG%');

  const sims = [];
  for (const q of fubogDb) {
    const qStmt = cleanHtml(q.statement);
    for (const [qNumStr, bq] of Object.entries(pv1)) {
      const sim = calculateSimilarity(qStmt, bq.statement);
      sims.push({ code: q.code, year: q.year, qNum: qNumStr, sim, qStmt: qStmt.slice(0, 70), bStmt: bq.statement.slice(0, 70) });
    }
  }

  sims.sort((a, b) => b.sim - a.sim);
  console.log('Top 10 similarities:');
  for (const s of sims.slice(0, 10)) {
    console.log(`[${(s.sim * 100).toFixed(1)}%] ${s.code} (${s.year}) <=> Q${s.qNum}`);
    console.log(`   DB:  ${s.qStmt}`);
    console.log(`   PDF: ${s.bStmt}`);
  }
}

debugSim();

