import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectParana() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement, correct_answer')
    .or('code.ilike.HMMSJP%,code.ilike.SMSFOZ%,code.ilike.PMFI%')
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(10);

  console.log('Sample Paraná pending:');
  for (const q of (data || [])) {
    console.log(`\nCode: ${q.code} (Year: ${q.year})`);
    console.log(`Stmt: ${q.statement?.slice(0, 150)}...`);
  }
}

inspectParana().catch(console.error);
