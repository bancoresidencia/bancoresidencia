import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { parseVerbenaGabarito, parseVerbenaCaderno } from './parse_verbena_booklet.mjs';

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
  let intersection = 0;
  for (const w of words1) if (words2.has(w)) intersection++;
  return intersection / new Set([...words1, ...words2]).size;
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

async function diagnose() {
  const dir = path.resolve('data/official_exams/SES_GO_2026');
  const bookletPath = path.join(dir, 'PV_ACESSO_DIRETO_A.pdf');
  const gbPath = path.join(dir, 'GB_ACESSO_DIRETO_A.pdf');
  const bQuestions = await parseVerbenaCaderno(bookletPath);

  // Fetch pending 2026 SES-GO questions
  const { data: pending } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, options')
    .ilike('institution', '%SES-GO%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`Analyzing ${pending.length} pending SES-GO 2026 questions against Acesso Direto (100 Qs)...`);
  
  // Let's print the top 5 matches
  const topMatches = [];
  for (const q of pending) {
    const cleanStmt = cleanHtml(q.statement);
    for (const [qNum, bq] of Object.entries(bQuestions)) {
      const sim = calculateSimilarity(cleanStmt, bq.statement);
      topMatches.push({
        code: q.code,
        qNum,
        sim,
        dbStmt: cleanStmt.slice(0, 80),
        bqStmt: bq.statement.slice(0, 80)
      });
    }
  }

  topMatches.sort((a, b) => b.sim - a.sim);
  console.log('\nTop 10 highest similarity pairs:');
  topMatches.slice(0, 10).forEach(m => {
    console.log(`[${(m.sim*100).toFixed(1)}%] DB: ${m.code} -> Booklet Q${m.qNum}`);
    console.log(`   DB:      ${m.dbStmt}`);
    console.log(`   Booklet: ${m.bqStmt}`);
  });
}

diagnose();
