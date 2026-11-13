import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkParana() {
  const { data: qList, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, correct_answer')
    .or('code.ilike.HMMSJP%,code.ilike.PMFI%,code.ilike.SMSFOZ%,code.ilike.SMSCURITIBA%,code.ilike.UEM%');

  if (error) { console.error(error); return; }
  console.log(`Total Paraná parceiros no banco: ${qList.length}`);
  const pend = qList.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Pendentes sem gabarito: ${pend.length}`);
  const byCode = {};
  pend.forEach(q => {
    const pfx = q.code.split('-')[0];
    byCode[pfx] = (byCode[pfx] || 0) + 1;
  });
  console.log('Pendentes por prefixo:', JSON.stringify(byCode, null, 2));
}

checkParana();

