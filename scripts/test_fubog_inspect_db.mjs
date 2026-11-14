import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectFubogDb() {
  const { data, count, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, correct_answer, statement', { count: 'exact' })
    .or('institution.ilike.%FUBOG%,institution.ilike.%Banco de Olhos%')
    .limit(10);

  console.log('Total FUBOG no Supabase:', count);
  console.log('Amostra de 3 questões:');
  data.slice(0, 3).forEach(q => {
    console.log(`[${q.code}] (${q.year}) Gab: "${q.correct_answer}"`);
    console.log(`  Enunciado: ${q.statement.slice(0, 150)}...`);
  });
}

inspectFubogDb().catch(console.error);
