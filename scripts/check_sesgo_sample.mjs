import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function check() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .in('code', ['SESGO-2026-CLM-37311', 'SESGO-2026-MPS-21601', 'SESGO-2025-MPS-0565', 'SESGO-2025-CLM-16280', 'SESGO-2025-CIR-7870']);

  console.log(JSON.stringify(data, null, 2));
}

check().catch(console.error);
