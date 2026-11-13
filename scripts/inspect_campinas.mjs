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

async function inspectCampinas() {
  const { data: pending } = await supabase
    .from('questions')
    .select('id, code, institution, year, especialidade, statement, options, banca')
    .or('correct_answer.is.null,correct_answer.eq.')
    .or('institution.ilike.%Mário Gatti%,institution.ilike.%Samaritano%')
    .limit(100);

  console.log(`Campinas sample: ${pending.length} questions`);
  const byInstYear = {};
  pending.forEach(q => {
    const k = `${q.institution?.slice(0, 25)} (${q.year}) [Banca: ${q.banca}]`;
    byInstYear[k] = (byInstYear[k] || 0) + 1;
  });
  console.log('Breakdown:', byInstYear);

  console.log('\nSamples:');
  pending.slice(0, 5).forEach(q => {
    console.log(`[${q.code}] (${q.institution} ${q.year}) [Banca: ${q.banca}]: ${q.statement?.slice(0, 90)}...`);
  });
}

inspectCampinas();
