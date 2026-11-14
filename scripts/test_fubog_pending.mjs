import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectFubogPending() {
  const { data, count, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, correct_answer, statement', { count: 'exact' })
    .or('institution.ilike.%FUBOG%,institution.ilike.%Banco de Olhos%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log('Total FUBOG sem gabarito:', count);
  const byYear = {};
  data.forEach(q => byYear[q.year] = (byYear[q.year] || 0) + 1);
  console.log('FUBOG sem gabarito por ano:', byYear);
  console.log('Amostra de 3 pendentes:');
  data.slice(0, 3).forEach(q => {
    console.log(`[${q.code}] (${q.year})`);
    console.log(`  ${q.statement.slice(0, 150)}...`);
  });
}

inspectFubogPending().catch(console.error);
