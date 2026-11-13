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

async function checkSpecific() {
  const dir = path.resolve('data/official_exams/SES_GO_2026');
  const gbPath = path.join(dir, 'GB_ACESSO_DIRETO_A.pdf');
  const pvPath = path.join(dir, 'PV_ACESSO_DIRETO_A.pdf');
  const answers = await parseVerbenaGabarito(gbPath);
  const questions = await parseVerbenaCaderno(pvPath);

  const { data: dbQ } = await supabase
    .from('questions')
    .select('id, code, statement, options, correct_answer')
    .in('code', ['SESGO-2026-CLM-37311', 'SESGO-2026-MPS-21601']);

  for (const q of dbQ) {
    console.log(`\n=== DB Question: ${q.code} ===`);
    console.log('DB Statement:', cleanHtml(q.statement));
    console.log('DB Options:', q.options);
    console.log('DB Correct Answer:', q.correct_answer);

    const bqNum = q.code === 'SESGO-2026-CLM-37311' ? 40 : 47;
    const bq = questions[bqNum];
    const bAns = answers[bqNum];
    console.log(`Booklet Q${bqNum} Official Answer:`, bAns);
    console.log(`Booklet Q${bqNum} Statement:`, bq?.statement);
    console.log(`Booklet Q${bqNum} Options:`, bq?.options);
    console.log(`Booklet Winning Option Text:`, bq?.options[bAns]);
  }
}

checkSpecific();
