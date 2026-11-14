import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectHsl() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, institution, banca, statement, correct_answer')
    .ilike('institution', '%Sírio-Libanês%')
    .limit(5);

  for (const q of data) {
    console.log(`\nCODE: ${q.code} | ANO: ${q.year} | GABARITO: ${q.correct_answer || 'PENDENTE'}`);
    console.log(`STMT: ${q.statement ? q.statement.slice(0, 150) : ''}`);
  }

  const { data: allHsl } = await supabase
    .from('questions')
    .select('id, code, year, institution, correct_answer')
    .ilike('institution', '%Sírio-Libanês%');

  console.log(`\nTotal Sírio-Libanês no banco: ${allHsl.length}`);
  const pend = allHsl.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  const com = allHsl.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
  console.log(`Com gabarito: ${com.length}`);
  console.log(`Sem gabarito: ${pend.length}`);
}

inspectHsl().catch(console.error);
