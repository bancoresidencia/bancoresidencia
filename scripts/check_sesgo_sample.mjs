import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkSample() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, correct_answer')
    .eq('id', '2a876b65-0830-49aa-abb2-5e67eaaac073')
    .single();

  console.log('SESGO-2024-PED-3398 no Supabase:', data);
}

checkSample().catch(console.error);
