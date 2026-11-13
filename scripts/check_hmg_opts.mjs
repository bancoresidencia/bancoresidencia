import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkOptions() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement, options')
    .eq('code', 'HMG-2026-PED-22843')
    .single();

  console.log(data.code, data.statement);
  console.log('Options:', data.options);
}
checkOptions();

