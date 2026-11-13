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

async function inspectMarioGatti2026() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, institution, especialidade, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .ilike('code', 'HMG%')
    .eq('year', 2026);

  console.log(`Found ${data?.length || 0} questions for HMG 2026:`);
  for (const q of (data || []).slice(0, 10)) {
    console.log(`[${q.code} | ${q.especialidade}] ${q.statement.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 140)}`);
  }
}
inspectMarioGatti2026();
