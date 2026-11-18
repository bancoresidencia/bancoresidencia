import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const t = l.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectMatches() {
  const codes = [
    'UFPAHUJBB-2024-PED-0560',
    'IOG-2024-CIR-7774',
    'HPEV-2023-CIR-9598',
    'HMMSJP-2020-OBS-12631',
    'IPSEMG-2018-CLM-32385'
  ];
  const { data: qs } = await supabase.from('questions').select('code, statement, options, correct_answer').in('code', codes);
  for (const q of qs) {
    console.log(`\n======================================================`);
    console.log(`CODE: ${q.code} -> [${q.correct_answer}]`);
    console.log('Statement length:', q.statement.length);
    console.log('Statement:', q.statement);
    console.log('Alt A:', q.options?.[0]?.text);
  }
}

inspectMatches();
