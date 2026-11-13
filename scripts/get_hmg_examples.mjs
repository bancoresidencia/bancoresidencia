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

async function checkHmg2026Status() {
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, tema, foco, subfoco, statement, options, correct_answer')
    .ilike('code', 'HMG%')
    .eq('year', 2026);

  if (error) {
    console.error('Error:', error.message);
    return;
  }

  const withGb = data.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
  const pending = data.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Total HMG 2026 no banco: ${data.length}`);
  console.log(`Com gabarito preenchido: ${withGb.length}`);
  console.log(`Pendentes (sem gabarito): ${pending.length}`);

  console.log('\n--- 5 EXEMPLOS COMPLETOS DAS PENDENTES ---');
  for (let i = 0; i < Math.min(5, pending.length); i++) {
    const q = pending[i];
    console.log(`\nExemplo ${i + 1}:`);
    console.log(`Código: ${q.code}`);
    console.log(`Área/Especialidade: ${q.especialidade}`);
    console.log(`Tema: ${q.tema} -> Foco: ${q.foco}`);
    console.log(`Enunciado:\n${q.statement}`);
    console.log('Alternativas:');
    for (const opt of q.options || []) {
      console.log(`  (${opt.letter}) ${opt.text}`);
    }
  }
}

checkHmg2026Status();
