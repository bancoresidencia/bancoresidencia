import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkAddison() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, correct_answer, statement, options')
    .ilike('statement', '%Doença de Addison, é admitido no pronto-socorro%');

  console.log('FUBOG Q1 match in Supabase:', data);
}

checkAddison().catch(console.error);
