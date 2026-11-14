import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkQ1InDb() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, institution, statement, correct_answer')
    .ilike('statement', '%Mulher de 42 anos, sem comorbidades, comparece à unidade básica de saúde%');

  console.log('Q1 UERJ no banco:', data);
}

checkQ1InDb().catch(console.error);
