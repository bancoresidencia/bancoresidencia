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

async function checkAllSesGo2026() {
  const { data, error } = await supabase.from('questions')
    .select('id, code, banca, institution, year, correct_answer, statement, options')
    .ilike('institution', '%SES-GO%')
    .eq('year', 2026);

  if (error) { console.error(error); return; }
  console.log(`Total de questões SES-GO 2026 no banco: ${data.length}`);
  const pending = data.filter(q => !q.correct_answer);
  const resolved = data.filter(q => !!q.correct_answer);
  console.log(`- Já resolvidas: ${resolved.length}`);
  console.log(`- Pendentes: ${pending.length}`);

  // Mostrar códigos das pendentes
  console.log('\nExemplos de pendentes SES-GO 2026:');
  pending.slice(0, 10).forEach(q => {
    console.log(`[${q.code}] -> ${q.statement.slice(0, 80)}...`);
  });
}

checkAllSesGo2026();

