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

async function inspectResolved() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, especialidade, statement, correct_answer')
    .ilike('code', 'HMG%')
    .eq('year', 2026)
    .not('correct_answer', 'is', null)
    .neq('correct_answer', '')
    .limit(10);

  console.log('Resolved HMG 2026 samples:');
  for (const q of data || []) {
    console.log(`[${q.code} | Resp: ${q.correct_answer}] ${q.statement.slice(0, 100).replace(/\n/g, ' ')}`);
  }
}
inspectResolved();

