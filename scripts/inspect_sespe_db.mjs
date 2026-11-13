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

async function inspectSesPe() {
  const { data: dbQs, error } = await supabase.from('questions')
    .select('id, code, banca, institution, year, statement, correct_answer')
    .or('banca.ilike.%SES-PE%,institution.ilike.%SES-PE%,institution.ilike.%Pernambuco%')
    .or('correct_answer.is.null,correct_answer.eq.');

  if (error) { console.error(error); return; }
  console.log(`Total de pendências SES-PE no Supabase: ${dbQs.length}`);
  const byYear = {};
  for (const q of dbQs) byYear[q.year] = (byYear[q.year] || 0) + 1;
  console.log('Distribuição por ano:', byYear);
  dbQs.slice(0, 5).forEach(q => console.log(`[${q.code}] (${q.year}) -> ${q.statement.slice(0, 80)}...`));
}

inspectSesPe();

