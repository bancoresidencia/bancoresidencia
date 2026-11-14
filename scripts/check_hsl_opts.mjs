import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkOptions() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, statement, options')
    .eq('code', 'HSLBRASLIA-2024-PED-20356')
    .single();

  console.log('Statement:\n', data.statement);
  console.log('Options:\n', JSON.stringify(data.options, null, 2));
}

checkOptions().catch(console.error);
