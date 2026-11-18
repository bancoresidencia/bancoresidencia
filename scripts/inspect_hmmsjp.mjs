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
    .select('id, code, year, institution, statement, options')
    .ilike('institution', '%São José dos Pinhais%')
    .range(10, 16);

  for (const q of data) {
    console.log('----------------------------------------');
    console.log(`${q.code} (${q.year}) - ${q.institution}`);
    console.log(`ENUNCIADO: ${q.statement.slice(0, 140)}`);
  }
}

inspectHMMSJP();
