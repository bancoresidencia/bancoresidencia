import fs from 'fs';
import { PDFParse } from 'pdf-parse';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

function cleanLexical(text) {
  if (!text) return '';
  return text.toLowerCase().normalize('NFKD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

async function testFubog() {
  const { data: dbFubog, error } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('code', 'FUBOG%');

  if (error) { console.error(error); return; }
  const pending = dbFubog.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Total FUBOG no banco: ${dbFubog.length} | Pendentes sem gabarito: ${pending.length}`);

  const pvBuf = new Uint8Array(fs.readFileSync('data/official_exams/FUBOG/PV_FUBOG_V1A.pdf'));
  const parser = new PDFParse(pvBuf);
  await parser.load();
  const res = await parser.getText();
  const pvTxt = typeof res === 'string' ? res : res.text;

  let matches = 0;
  for (const q of pending) {
    const cleanStmt = cleanLexical(q.statement);
    if (cleanStmt.length < 30) continue;
    const snippet = cleanStmt.slice(0, 50);
    if (cleanLexical(pvTxt).includes(snippet)) {
      matches++;
      console.log(`  [MATCH POTENCIAL] ${q.code} (Ano: ${q.year}): ${q.statement.slice(0, 80)}...`);
    }
  }
  console.log(`\nTotal matches potenciais imediatos em FUBOG V1A: ${matches}`);
}

testFubog();

