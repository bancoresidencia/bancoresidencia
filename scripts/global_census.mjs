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

async function globalCensus() {
  const tables = [
    'questions',
    'questions_expansion_a',
    'questions_expansion_b',
    'questions_expansion_c',
    'questions_expansion_d',
    'questions_expansion_e'
  ];

  console.log('========================================================================');
  console.log('🌐 CENSO GLOBAL DA PLATAFORMA BANCO RESIDÊNCIA (TODAS AS 6 TABELAS)');
  console.log('========================================================================\n');

  let grandTotal = 0;
  let grandPending = 0;

  for (const t of tables) {
    const { count: cTot } = await supabase.from(t).select('id', { count: 'exact', head: true });
    const { count: cPen } = await supabase.from(t).select('id', { count: 'exact', head: true }).or('correct_answer.is.null,correct_answer.eq.');
    const withGab = (cTot || 0) - (cPen || 0);
    const pct = cTot ? ((withGab / cTot) * 100).toFixed(2) : '0.00';
    console.log(`${t.padEnd(25)} | Total: ${String(cTot).padStart(7)} | Com Gabarito: ${String(withGab).padStart(7)} (${pct}%) | Pendentes: ${String(cPen).padStart(6)}`);
    grandTotal += (cTot || 0);
    grandPending += (cPen || 0);
  }

  const grandWithGab = grandTotal - grandPending;
  const grandPct = ((grandWithGab / grandTotal) * 100).toFixed(2);
  console.log('\n------------------------------------------------------------------------');
  console.log(`TOTAL GERAL PLATAFORMA   | Total: ${String(grandTotal).padStart(7)} | Com Gabarito: ${String(grandWithGab).padStart(7)} (${grandPct}%) | Pendentes: ${String(grandPending).padStart(6)}`);
  console.log('========================================================================\n');
}

globalCensus();
