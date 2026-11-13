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

async function inspectAmp() {
  const { data: pending } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .or('institution.ilike.%Associação Médica do Paraná%,institution.ilike.%São José dos Pinhais%,code.ilike.%AMP%');

  console.log(`Total pending AMP / HMMSJP questions: ${pending.length}`);
  const byInstYear = {};
  pending.forEach(q => {
    const k = `${q.institution?.slice(0, 30)} (${q.year})`;
    byInstYear[k] = (byInstYear[k] || 0) + 1;
  });
  console.log('Breakdown:', byInstYear);

  console.log('\nSample 10 pending:');
  pending.slice(0, 10).forEach(q => {
    console.log(`[${q.code}] (${q.institution?.slice(0, 20)} ${q.year}): ${q.statement?.slice(0, 80)}...`);
  });
}

inspectAmp();
