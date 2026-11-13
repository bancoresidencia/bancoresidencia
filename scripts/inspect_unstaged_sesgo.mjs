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

const staging = JSON.parse(fs.readFileSync('data/staging_homologados_85pct.json', 'utf8'));
const stagedIds = new Set(staging.decisoes.map(d => d.id));

async function inspectRemaining() {
  const { data: pending } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, statement, options')
    .ilike('institution', '%SES-GO%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.');

  const unstaged = pending.filter(q => !stagedIds.has(q.id));
  console.log(`Pending SES-GO 2026 total: ${pending.length}, Unstaged: ${unstaged.length}`);

  console.log('\nFirst 20 unstaged SES-GO 2026 questions:');
  unstaged.slice(0, 20).forEach((q, i) => {
    console.log(`${i+1}. [${q.code}] (${q.especialidade}): ${q.statement.slice(0, 80)}...`);
  });
}

inspectRemaining();
