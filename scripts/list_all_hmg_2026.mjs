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

async function listAll() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, statement, options')
    .or('correct_answer.is.null,correct_answer.eq.')
    .ilike('code', 'HMG%')
    .eq('year', 2026);

  console.log(`Total HMG 2026: ${data.length}`);
  for (let i = 0; i < data.length; i++) {
    const q = data[i];
    console.log(`[${i+1}] ${q.code} (${q.especialidade}): ${q.statement.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').slice(0, 100)}`);
  }
}
listAll();

