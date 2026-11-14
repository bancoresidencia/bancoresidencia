import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAllUerj() {
  const { data: allUerj } = await supabase
    .from('questions')
    .select('id, code, year, institution, correct_answer')
    .or('institution.ilike.%Pedro Ernesto%,code.ilike.%UERJ%');

  console.log(`Total geral UERJ/HUPE no banco: ${allUerj.length}`);
  const semGabarito = allUerj.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  const comGabarito = allUerj.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
  console.log(`Com gabarito: ${comGabarito.length}`);
  console.log(`Sem gabarito: ${semGabarito.length}`);

  const byYear = {};
  for (const q of semGabarito) {
    byYear[q.year || 'sem ano'] = (byYear[q.year || 'sem ano'] || 0) + 1;
  }
  console.log('Sem gabarito por ano:', byYear);
  if (semGabarito.length > 0) {
    console.log('Amostra de 5 pendentes:', semGabarito.slice(0, 5).map(q => ({ code: q.code, year: q.year })));
  }
}

checkAllUerj().catch(console.error);
