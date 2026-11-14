import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        env[trimmed.slice(0, idx).trim()] = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
      }
    }
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function inspectHmmsjp() {
  console.log('=== WORKER 1A: DIAGNÓSTICO DETALHADO HMMSJP (FAFIPA) ===\n');

  const instName = 'HMMSJP - Hospital e Maternidade Municipal São José dos Pinhais (PR)';
  const { data, count, error } = await supabase
    .from('questions')
    .select('id, code, year, institution, correct_answer, statement, options', { count: 'exact' })
    .eq('institution', instName);

  if (error) {
    console.error('Erro na consulta Supabase:', error);
    return;
  }

  console.log(`Total HMMSJP no banco: ${count}`);
  const withAns = data.filter(q => q.correct_answer && q.correct_answer.trim() !== '');
  const missing = data.filter(q => !q.correct_answer || q.correct_answer.trim() === '');

  console.log(`Com gabarito: ${withAns.length}`);
  console.log(`Sem gabarito: ${missing.length}`);

  const byYear = {};
  missing.forEach(q => {
    const yr = q.year || 'Sem Ano';
    byYear[yr] = (byYear[yr] || 0) + 1;
  });
  console.log('\nPendências por ano:', byYear);

  console.log('\nAmostra de 5 pendências:');
  missing.slice(0, 5).forEach((q, i) => {
    console.log(`\n[${i+1}] Código: ${q.code} | Ano: ${q.year}`);
    console.log(`    Enunciado: ${q.statement.slice(0, 140)}...`);
    const optTexts = Array.isArray(q.options) ? q.options.map(o => `${o.letter}) ${(o.text || '').slice(0, 40)}`).join(' | ') : 'Sem opções';
    console.log(`    Opções: ${optTexts}`);
  });
}

inspectHmmsjp().catch(console.error);
