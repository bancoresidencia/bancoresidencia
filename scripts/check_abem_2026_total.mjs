import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function main() {
  const { data: all2026 } = await supabase
    .from('questions')
    .select('id, code, year, correct_answer')
    .or('institution.ilike.%ABEM%,institution.ilike.%Progresso%,code.ilike.%TPN%,code.ilike.%ABEM%')
    .eq('year', 2026);

  console.log(`Total 2026 ABEM no Supabase: ${all2026 ? all2026.length : 0}`);
  if (all2026) {
    const withAns = all2026.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
    const withoutAns = all2026.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
    console.log(`Com gabarito: ${withAns.length}`);
    console.log(`Sem gabarito: ${withoutAns.length}`);
  }
}

main().catch(console.error);
