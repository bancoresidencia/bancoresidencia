import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data, count, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, correct_answer', { count: 'exact' })
    .or('institution.ilike.%UERJ%,institution.ilike.%Pedro Ernesto%,code.ilike.%UERJ%');

  if (error) {
    console.error('Error querying Supabase:', error);
    return;
  }

  console.log('Total UERJ encontradas no banco:', count);
  const withAnswer = data.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
  const missing = data.filter(q => !q.correct_answer || q.correct_answer.trim() === '');

  console.log(`Com gabarito: ${withAnswer.length} (${((withAnswer.length / count) * 100).toFixed(1)}%)`);
  console.log(`Sem gabarito: ${missing.length}`);

  const byYear = {};
  missing.forEach(q => {
    const yr = q.year || 'Sem Ano';
    byYear[yr] = (byYear[yr] || 0) + 1;
  });
  console.log('Faltando gabarito por ano:', byYear);
  console.log('Amostra de 5 pendentes:', missing.slice(0, 5).map(q => ({ id: q.id, code: q.code, year: q.year, inst: q.institution })));
}

check().catch(console.error);
