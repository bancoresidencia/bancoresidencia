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

async function inspectPsuMg() {
  const { data: p2021 } = await supabase.from('questions')
    .select('id, code, banca, institution, year, statement, correct_answer')
    .or('banca.ilike.%PSU-MG%,banca.ilike.%AREMG%')
    .eq('year', 2021)
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`PSU-MG 2021 pendentes: ${p2021?.length}`);
  p2021?.slice(0, 5).forEach(q => console.log(`[${q.code}] -> ${q.statement.slice(0, 80)}...`));

  const { data: p2025 } = await supabase.from('questions')
    .select('id, code, banca, institution, year, statement, correct_answer')
    .or('banca.ilike.%PSU-MG%,banca.ilike.%AREMG%')
    .eq('year', 2025)
    .or('correct_answer.is.null,correct_answer.eq.');

  console.log(`\nPSU-MG 2025 pendentes: ${p2025?.length}`);
  p2025?.slice(0, 5).forEach(q => console.log(`[${q.code}] -> ${q.statement.slice(0, 80)}...`));
}

inspectPsuMg();

