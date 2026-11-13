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

async function inspectAbemDb() {
  const { data: dbQs, error } = await supabase.from('questions')
    .select('id, code, banca, institution, year, statement, options, correct_answer')
    .ilike('institution', '%ABEM%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) { console.error(error); return; }
  console.log(`Total de pendentes ABEM: ${dbQs.length}`);
  dbQs.slice(0, 10).forEach(q => {
    console.log(`[${q.code}] (ano: ${q.year}) -> ${q.statement.slice(0, 80)}...`);
  });
}

inspectAbemDb();

