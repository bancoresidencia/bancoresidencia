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

async function checkCir23() {
  const { data: q } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer')
    .eq('code', 'UNIVERSIDADE-2026-CIR-20723')
    .single();

  console.log('Cirurgia 20723:');
  console.log('Statement:', q.statement);
  console.log('Options:', q.options);
  console.log('Correct Answer:', q.correct_answer);
}

checkCir23();
