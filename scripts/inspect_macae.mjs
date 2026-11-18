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

async function inspectMacae() {
  const { data } = await supabase.from('questions')
    .select('id, code, year, institution, statement, options, correct_answer')
    .ilike('institution', '%Macaé%')
    .or('correct_answer.is.null,correct_answer.eq.');
  console.log(`Macaé pendentes: ${data.length}`);
  const byYear = {};
  for (const q of data) {
    byYear[q.year] = (byYear[q.year] || 0) + 1;
  }
  console.log('Por ano:', byYear);
  for (const q of data.slice(0, 5)) {
    console.log(`[${q.code}] (${q.year}): ${q.statement.slice(0, 80)}`);
  }
}
inspectMacae();
