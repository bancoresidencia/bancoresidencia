import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function printStmts() {
  const { data: fubog } = await supabase
    .from('questions')
    .select('code, year, statement')
    .or('correct_answer.is.null,correct_answer.eq.')
    .ilike('code', 'FUBOG%')
    .limit(10);

  const { data: iog } = await supabase
    .from('questions')
    .select('code, year, statement')
    .or('correct_answer.is.null,correct_answer.eq.')
    .ilike('code', 'IOG%')
    .limit(10);

  console.log('--- FUBOG SAMPLES ---');
  for (const q of (fubog || [])) {
    console.log(`[${q.code} | ${q.year}] ${q.statement.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 140)}`);
  }

  console.log('\n--- IOG SAMPLES ---');
  for (const q of (iog || [])) {
    console.log(`[${q.code} | ${q.year}] ${q.statement.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 140)}`);
  }
}
printStmts();
