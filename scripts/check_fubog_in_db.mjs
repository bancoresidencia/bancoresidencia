import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, institution, banca, year, correct_answer')
    .or('institution.ilike.%FUBOG%,institution.ilike.%Selecting%,institution.ilike.%HBO%,banca.ilike.%Selecting%,code.ilike.%FUBOG%');

  if (error) {
    console.error(error);
    return;
  }

  console.log(`Total encontradas: ${data.length}`);
  const semGabarito = data.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  const comGabarito = data.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
  console.log(`Com gabarito: ${comGabarito.length}`);
  console.log(`Sem gabarito (pendentes): ${semGabarito.length}`);

  const byInst = {};
  for (const q of semGabarito) {
    const k = `${q.institution || 'sem inst'} | ${q.banca || 'sem banca'} | ${q.year || 'sem ano'}`;
    byInst[k] = (byInst[k] || 0) + 1;
  }
  console.log('\nPendentes por instituição/banca/ano:', byInst);
  if (semGabarito.length > 0) {
    console.log('\nAmostra de 3 pendentes:', semGabarito.slice(0, 3));
  }
}

main().catch(console.error);
