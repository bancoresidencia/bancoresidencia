import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function matchTest() {
  const { data: addison } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, correct_answer')
    .ilike('statement', '%Addison%')
    .ilike('institution', '%FUBOG%');

  console.log('Addison no FUBOG:', addison);

  const { data: queimado } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, correct_answer')
    .ilike('statement', '%queimado%')
    .ilike('institution', '%FUBOG%');

  console.log('Queimado no FUBOG:', queimado);
}

matchTest().catch(console.error);
