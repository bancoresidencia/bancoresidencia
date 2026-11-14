import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function searchTwin() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .ilike('statement', '%anemia de longa data%epistaxe%')
    .not('correct_answer', 'is', null)
    .neq('correct_answer', '');

  console.log('Gêmeas com gabarito encontradas:', data ? data.length : 0);
  if (data) {
    for (const q of data) {
      console.log(`- ${q.code} (${q.institution} - ${q.year}) -> Gabarito: ${q.correct_answer}`);
    }
  }
}

searchTwin().catch(console.error);
