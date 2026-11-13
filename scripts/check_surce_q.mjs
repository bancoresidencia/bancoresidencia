import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkQ() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .eq('code', 'SURCE-2024-CLM-34739')
    .single();

  console.log(JSON.stringify(data, null, 2));
}

checkQ().catch(console.error);
