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

async function missingMacae2026() {
  const { data } = await supabase.from('questions')
    .select('id, code, year, institution, especialidade, statement, options')
    .ilike('institution', '%Macaé%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.');
  console.log(`Macaé 2026 faltantes: ${data.length}`);
  data.forEach((q, i) => {
    console.log(`[${i+1}] ${q.code} | ${q.especialidade} | ${q.statement.slice(0, 80)}`);
  });
}
missingMacae2026();
