import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const idx = l.indexOf('=');
  if (idx > 0) env[l.slice(0, idx).trim()] = l.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
});

const sb = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function testQ1andQ2() {
  const { data: q1 } = await sb.from('questions')
    .select('statement, options')
    .eq('code', 'UNIVERSIDADE-2026-PED-23435')
    .single();
  console.log('Q81 (23435):', q1.statement);
  console.log('Options:', q1.options.map(o => `${o.letter}: ${o.text}`));

  const { data: q2 } = await sb.from('questions')
    .select('statement, options')
    .eq('code', 'UNIVERSIDADE-2026-PED-23436')
    .single();
  console.log('\nQ82 (23436):', q2.statement);
  console.log('Options:', q2.options.map(o => `${o.letter}: ${o.text}`));
}
testQ1andQ2();
