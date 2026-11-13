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

async function check() {
  const { data: pending, error } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, statement, options')
    .ilike('institution', '%SES-GO%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) {
    console.error(error);
    return;
  }

  console.log('Total pending SES-GO 2026:', pending.length);
  const byEsp = {};
  pending.forEach(q => byEsp[q.especialidade] = (byEsp[q.especialidade] || 0) + 1);
  console.log('By Especialidade:', byEsp);
  console.log('\nSample statements:');
  pending.slice(0, 10).forEach(q => {
    console.log(`[${q.code}] (${q.especialidade}): ${q.statement.slice(0, 90)}...`);
  });
}
check();
