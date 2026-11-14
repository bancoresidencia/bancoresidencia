import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectUscsCodes() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement, correct_answer')
    .ilike('institution', '%São Caetano do Sul%')
    .in('year', [2025, 2026])
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(10);

  for (const q of data) {
    console.log(`CODE: ${q.code} | ANO: ${q.year}`);
    console.log(`STMT: ${q.statement ? q.statement.slice(0, 100) : ''}`);
  }
}

inspectUscsCodes().catch(console.error);
