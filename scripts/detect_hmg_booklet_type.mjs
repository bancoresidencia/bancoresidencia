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

async function checkHmgBooklet() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, especialidade, statement, options, correct_answer')
    .ilike('code', 'HMG%')
    .eq('year', 2026)
    .order('code');

  console.log('Total HMG 2026:', data.length);
  // Group by specialty
  const byEsp = {};
  for (const q of data) {
    byEsp[q.especialidade] = (byEsp[q.especialidade] || 0) + 1;
  }
  console.log('Por especialidade:', byEsp);

  // Print all 37 pending questions
  const pending = data.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`\nLista dos 37 pendentes:`);
  for (let i = 0; i < pending.length; i++) {
    const p = pending[i];
    console.log(`[${i+1}] ${p.code} (${p.especialidade}): ${p.statement.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 90)}`);
  }
}
checkHmgBooklet();

