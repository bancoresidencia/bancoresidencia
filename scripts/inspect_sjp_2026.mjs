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

async function inspectSjp2026() {
  const { data: dbQs } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer, year, especialidade')
    .ilike('institution', '%Pinhais%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`HMMSJP (São José dos Pinhais) 2026 pendentes: ${dbQs?.length}`);
  dbQs?.slice(0, 10).forEach(q => {
    console.log(`[${q.code}] (${q.especialidade}) -> ${q.statement.slice(0, 100)}...`);
  });
}

inspectSjp2026();
