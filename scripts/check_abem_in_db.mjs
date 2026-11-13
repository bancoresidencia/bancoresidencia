import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: abem, count: countAbem } = await supabase
    .from('questions')
    .select('id, code, institution, year, correct_answer', { count: 'exact' })
    .or('institution.ilike.%ABEM%,institution.ilike.%Progresso%,code.ilike.%TPN%,code.ilike.%ABEM%');

  console.log(`Total de questões ABEM / TPN no Supabase: ${countAbem || 0}`);
  if (abem && abem.length > 0) {
    console.log('Amostra de 5 questões:', abem.slice(0, 5));
    const missing = abem.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
    console.log(`Dessas, pendentes sem gabarito: ${missing.length}`);
  }
}

main().catch(console.error);
