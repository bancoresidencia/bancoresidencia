import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkFubogYears() {
  const { data: dbFubog } = await supabase
    .from('questions')
    .select('id, code, year, correct_answer')
    .ilike('code', 'FUBOG%');

  const pending = dbFubog.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  const byYear = {};
  pending.forEach(q => byYear[q.year] = (byYear[q.year] || 0) + 1);
  console.log('FUBOG Pendentes por ano:', JSON.stringify(byYear, null, 2));

  // Amostra de 3 codigos e enunciados
  const { data: samples } = await supabase
    .from('questions')
    .select('code, year, statement')
    .ilike('code', 'FUBOG%')
    .is('correct_answer', null)
    .limit(3);
  console.log('\nAmostras FUBOG pendentes:');
  samples.forEach(s => console.log(`  [${s.code}] Ano: ${s.year} -> ${s.statement.slice(0, 100)}...`));
}

checkFubogYears();

