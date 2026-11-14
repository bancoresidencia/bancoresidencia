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
    .select('id, code, year, institution, correct_answer')
    .or('institution.ilike.%ABEM%,institution.ilike.%Progresso%,code.ilike.%TPN%,code.ilike.%ABEM%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error(error);
    return;
  }

  const byYear = {};
  for (const q of data) {
    const y = q.year || 'Sem Ano';
    byYear[y] = (byYear[y] || 0) + 1;
  }
  console.log('Total pendentes sem gabarito:', data.length);
  console.log('Distribuição por ano:', byYear);
}

main().catch(console.error);
