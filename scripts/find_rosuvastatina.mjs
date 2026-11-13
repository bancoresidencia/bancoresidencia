import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function findRosuvastatina() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement, correct_answer')
    .ilike('statement', '%rosuvastatina%');

  console.log('Found questions with rosuvastatina:', data?.length);
  for (const q of (data || [])) {
    console.log(`Code: ${q.code} | Year: ${q.year} | Ans: ${q.correct_answer || 'MISSING'}`);
  }
}

findRosuvastatina().catch(console.error);
