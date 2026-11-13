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

async function inspectHMMSJP() {
  const { data } = await supabase
    .from('questions')
    .select('*')
    .eq('code', 'HMMSJP-2026-PED-22795')
    .single();

  console.log('ID:', data.id);
  console.log('Code:', data.code);
  console.log('Institution:', data.institution);
  console.log('Banca:', data.banca);
  console.log('Caderno:', data.caderno);
  console.log('Statement:', data.statement);
  console.log('Options:', data.options);
}

inspectHMMSJP();
