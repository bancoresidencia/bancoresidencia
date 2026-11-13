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

async function inspectProvenance() {
  const { data } = await supabase
    .from('questions')
    .select('*')
    .eq('code', 'SESGO-2026-PED-21644')
    .single();

  console.log('Question details for SESGO-2026-PED-21644:');
  console.log('ID:', data.id);
  console.log('Institution:', data.institution);
  console.log('Year:', data.year);
  console.log('Banca:', data.banca);
  console.log('Caderno:', data.caderno);
  console.log('Metadata:', data.metadata);
  console.log('Statement:', data.statement);
  console.log('Options:', data.options);
}

inspectProvenance();
