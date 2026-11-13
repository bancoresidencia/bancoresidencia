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

async function inspectDbQs() {
  const { data: dbQs } = await supabase.from('questions')
    .select('id, code, banca, institution, year, especialidade, statement')
    .ilike('banca', '%UERJ%')
    .eq('year', 2024)
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(5);

  console.log('Sample UERJ 2024 DB questions:');
  for (const q of dbQs || []) {
    console.log('---', q.code, '---', q.especialidade);
    console.log(q.statement.slice(0, 200));
  }
}
inspectDbQs();
