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
  const { data } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer')
    .ilike('institution', '%UNIP%')
    .eq('year', 2026)
    .order('code', { ascending: true });

  console.log(`Total UNIP 2026: ${data.length}`);
  const pending = data.filter(q => !q.correct_answer || !q.correct_answer.trim());
  const withGab = data.filter(q => q.correct_answer && q.correct_answer.trim());
  console.log(`Pending: ${pending.length} | With Gabarito: ${withGab.length}`);

  // Sample with gabarito
  console.log('\nSample with Gabarito:');
  for (const q of withGab.slice(0, 5)) {
    console.log(`  [${q.code}] -> Gabarito '${q.correct_answer}' | ${q.statement.slice(0, 60)}...`);
  }

  // Sample pending
  console.log('\nSample Pending:');
  for (const q of pending.slice(0, 5)) {
    console.log(`  [${q.code}] -> PENDENTE | ${q.statement.slice(0, 60)}...`);
  }
}

check();
