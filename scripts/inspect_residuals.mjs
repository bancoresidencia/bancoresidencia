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

async function inspectResiduals() {
  const { data: uerj } = await supabase.from('questions')
    .select('id, code, year, statement, correct_answer')
    .ilike('banca', '%UERJ%')
    .eq('year', 2024)
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(5);

  console.log('Sample UERJ 2024 pending:');
  for (const q of uerj || []) {
    console.log(`  [${q.code}] ${q.statement.slice(0, 80)}...`);
  }

  const { data: surce } = await supabase.from('questions')
    .select('id, code, year, statement, correct_answer')
    .ilike('banca', '%SURCE%')
    .eq('year', 2024)
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(5);

  console.log('\nSample SURCE 2024 pending:');
  for (const q of surce || []) {
    console.log(`  [${q.code}] ${q.statement.slice(0, 80)}...`);
  }
}

inspectResiduals();
