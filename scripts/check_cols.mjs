import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const [k, ...v] = l.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkCols() {
  const { data } = await supabase.from('questions').select('*').limit(1);
  if (data && data[0]) {
    console.log('Colunas de questions:', Object.keys(data[0]));
  }
}
checkCols().catch(console.error);
