import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspect() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement, correct_answer')
    .ilike('code', 'SESGO-2026%')
    .or('correct_answer.is.null,correct_answer.eq.');
  
  console.log('Total SES-GO 2026 pending:', data?.length);
  if (data) {
    for (const q of data.slice(0, 10)) {
      console.log(`\nCode: ${q.code} | Stmt: ${q.statement?.slice(0, 120)}...`);
    }
  }
}

inspect().catch(console.error);
