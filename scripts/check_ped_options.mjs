import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkOptions() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, statement, options')
    .eq('code', 'UERJHUPE-2024-PED-15574')
    .single();

  console.log(`Code: ${data.code}`);
  console.log(`Statement: ${data.statement}`);
  console.log('Options:', JSON.stringify(data.options, null, 2));
}

checkOptions();

