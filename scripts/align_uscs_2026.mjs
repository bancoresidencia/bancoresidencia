import fs from 'fs';
import { createClient } from '@supabase/supabase-js';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

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

async function parseGabarito() {
  const p = new PDFParse({ data: fs.readFileSync('data/official_exams/USCS/USCS_2026_GB_DEF.pdf') });
  await p.load();
  const t = (await p.getText()).text || await p.getText();
  
  const regex = /(\d{1,3})\s+([A-E]|X)/g;
  const matches = [...t.matchAll(regex)];
  const gb = {};
  matches.forEach(m => {
    const num = parseInt(m[1], 10);
    if (num >= 1 && num <= 100) {
      gb[num] = m[2] === 'X' ? 'ANULADA' : m[2];
    }
  });
  return gb;
}

async function main() {
  const gb = await parseGabarito();
  console.log(`Parsed ${Object.keys(gb).length} answers from USCS 2026 Gabarito.`);

  const { data: allQuestions } = await supabase
    .from('questions')
    .select('id, code, especialidade, correct_answer, statement, options')
    .ilike('institution', '%São Caetano%')
    .eq('year', 2026);

  console.log(`Loaded ${allQuestions.length} USCS 2026 questions from DB.`);

  const known = allQuestions.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
  console.log(`\nKnown questions in DB (${known.length}):`);
  known.forEach(q => {
    console.log(`[${q.code}] (${q.especialidade}) -> ${q.correct_answer} | ${q.statement.slice(0, 70)}...`);
  });

  // Sort all questions by numeric suffix in code
  const sorted = [...allQuestions].sort((a, b) => {
    const numA = parseInt(a.code.split('-').pop(), 10);
    const numB = parseInt(b.code.split('-').pop(), 10);
    return numA - numB;
  });

  console.log('\nOrder of questions by code:');
  sorted.forEach((q, idx) => {
    const codeNum = q.code.split('-').pop();
    console.log(`Idx ${idx + 1} (Code: ${codeNum}): [${q.code}] (ans: ${q.correct_answer || 'PENDING'})`);
  });
}

main();
