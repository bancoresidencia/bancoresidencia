import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkUnicamp() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement')
    .or('code.ilike.UNICAMP%,institution.ilike.%UNICAMP%')
    .is('correct_answer', null);

  console.log(`Total UNICAMP pendentes: ${data.length}`);
  const byYr = {};
  data.forEach(q => byYr[q.year] = (byYr[q.year] || 0) + 1);
  console.log('Por ano:', JSON.stringify(byYr, null, 2));
  data.slice(0, 3).forEach(q => console.log(`  [${q.code}] (${q.year}): ${q.statement.slice(0, 90)}...`));
}

checkUnicamp();

