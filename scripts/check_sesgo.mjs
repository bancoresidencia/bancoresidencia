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

async function check() {
  const { data, error } = await supabase.from('questions')
    .select('id, code, year, institution, especialidade, statement')
    .ilike('institution', '%Secretaria de Estado de Sa%de de Goi%s%')
    .or('correct_answer.is.null,correct_answer.eq.');
  if (error) { console.error(error); return; }
  console.log('SES-GO pendencias count:', data.length);
  const byYear = {};
  for (const q of data) {
    byYear[q.year] = (byYear[q.year] || 0) + 1;
  }
  console.log('Por ano:', byYear);
  console.log('Primeiras 5:', data.slice(0, 5).map(q => ({ code: q.code, year: q.year, esp: q.especialidade, st: q.statement?.slice(0, 80) })));
}
check();
