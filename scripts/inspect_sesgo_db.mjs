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

async function inspectSesGo() {
  const { data } = await supabase.from('questions')
    .select('id, code, banca, institution, year, statement, options')
    .ilike('institution', '%SES-GO%')
    .eq('year', 2026)
    .or('correct_answer.is.null,correct_answer.eq.')
    .limit(10);

  console.log(`Encontradas ${data?.length} questões amostra de SES-GO 2026:`);
  for (const q of data || []) {
    console.log(`[${q.code}] (id: ${q.id}) -> ${q.statement.slice(0, 100)}...`);
  }
}

inspectSesGo();

