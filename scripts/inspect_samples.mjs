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

async function check() {
  const codes = [
    'HMMSJP-2026-PED-22801',
    'UEM-2026-PED-23273',
    'FUBOG-2024-CLM-2213',
    'IOG-2024-CLM-3606',
    'HMG-2022-CLM-2996',
    'HSC-2024-CLM-0502'
  ];
  const { data } = await supabase.from('questions').select('code, year, institution, statement, options').in('code', codes);
  for (const q of (data || [])) {
    console.log('===', q.code, '|', q.institution, '|', q.year, '===');
    console.log('Stmt:', (q.statement || '').slice(0, 250).replace(/\n/g, ' '));
    console.log('Options count:', (q.options || []).length);
    if (q.options?.length) console.log('Opt A:', JSON.stringify(q.options[0]));
    console.log('');
  }
}
check();

