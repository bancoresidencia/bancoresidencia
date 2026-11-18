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

async function inspectMacae2026() {
  const { data } = await supabase.from('questions')
    .select('id, code, year, institution, especialidade, statement, options, correct_answer')
    .ilike('institution', '%Macaé%')
    .eq('year', 2026);
  console.log(`Macaé 2026 total: ${data.length}`);
  for (const q of data) {
    console.log(`[${q.code}] [${q.especialidade}] GAB: ${q.correct_answer || 'MISSING'} | ${q.statement.slice(0, 90)}`);
  }
}
inspectMacae2026();
