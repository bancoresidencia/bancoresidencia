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

async function inspectCirurgia() {
  const { data } = await supabase.from('questions')
    .select('id, code, year, statement, options, correct_answer')
    .ilike('institution', '%Macaé%')
    .eq('year', 2026)
    .eq('especialidade', 'Cirurgia');
  console.log(`Cirurgia Macaé 2026 total: ${data.length}`);
  data.forEach((q, i) => {
    console.log(`[${i+1}] ${q.code} | GAB: ${q.correct_answer || 'MISSING'} | ${q.statement.slice(0, 70)}`);
  });
}
inspectCirurgia();
