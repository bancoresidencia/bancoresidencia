import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkQ() {
  const { data } = await supabase.from('questions').select('*').eq('code', 'ABEMTESTEDEP-2026-MPS-19635').single();
  console.log('DB statement:\n', data.statement);
  console.log('DB options:\n', JSON.stringify(data.options, null, 2));
}
checkQ().catch(console.error);
