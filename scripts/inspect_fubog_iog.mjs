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

async function inspectFubogIog() {
  const { data: fubogIog } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, statement, options, banca')
    .or('institution.ilike.%FUBOG%,institution.ilike.%IOG%')
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log('Total pending FUBOG & IOG:', fubogIog?.length);
  const byYearInst = {};
  (fubogIog || []).forEach(q => {
    const k = `${q.institution} (${q.year}) [Banca: ${q.banca}]`;
    byYearInst[k] = (byYearInst[k] || 0) + 1;
  });
  console.log('Breakdown:', byYearInst);

  console.log('\nSample statements:');
  (fubogIog || []).slice(0, 5).forEach(q => {
    console.log(`[${q.code}] (${q.institution} ${q.year}): ${q.statement?.slice(0, 80)}...`);
  });
}

inspectFubogIog();
