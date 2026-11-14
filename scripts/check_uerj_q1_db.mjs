import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkQ1() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, correct_answer, statement')
    .ilike('statement', '%Mulher de 42 anos, sem comorbidades, comparece à unidade básica%');

  console.log('Result for Q1 statement:', data);
}

checkQ1().catch(console.error);
