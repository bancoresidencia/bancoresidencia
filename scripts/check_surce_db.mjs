import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSurcePending() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, correct_answer')
    .ilike('code', 'SURCE%');

  if (error) { console.error(error); return; }
  console.log(`Total questões SURCE no banco: ${data.length}`);
  const pend = data.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Pendentes SURCE sem gabarito: ${pend.length}`);
  const byYear = {};
  pend.forEach(q => byYear[q.year] = (byYear[q.year] || 0) + 1);
  console.log('Pendentes por ano:', JSON.stringify(byYear, null, 2));
}

checkSurcePending();

