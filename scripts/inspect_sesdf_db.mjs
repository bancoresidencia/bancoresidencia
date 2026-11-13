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

async function inspectSesDf() {
  const { data: dbQs } = await supabase.from('questions')
    .select('id, code, statement, options, correct_answer, year')
    .or('banca.ilike.%SES-DF%,institution.ilike.%SES-DF%,institution.ilike.%Distrito Federal%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`SES-DF pendentes no Supabase: ${dbQs?.length}`);
  const byYear = {};
  for (const q of dbQs || []) byYear[q.year] = (byYear[q.year] || 0) + 1;
  console.log('Por ano:', byYear);
}

inspectSesDf();
