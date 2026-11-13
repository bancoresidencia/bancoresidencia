import fs from 'fs';
import { supabase } from './pdf_crossref_utils.mjs';

async function checkUerjPending() {
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, modalidade, tipo_prova, especialidade, tema, statement')
    .ilike('code', 'UERJ%')
    .or('correct_answer.is.null,correct_answer.eq.""');

  console.log(`Total pendentes UERJ: ${data.length}`);
  const byYear = {};
  for (const q of data) {
    byYear[q.year] = byYear[q.year] || [];
    byYear[q.year].push(q);
  }
  for (const [y, qs] of Object.entries(byYear)) {
    console.log(`\nAno ${y}: ${qs.length} pendentes`);
    console.log('Modalidades:', [...new Set(qs.map(q => q.modalidade))]);
    console.log('Tipos prova:', [...new Set(qs.map(q => q.tipo_prova))]);
    console.log('Especialidades:', [...new Set(qs.map(q => q.especialidade))]);
    console.log('Sample statements:');
    for (const q of qs.slice(0, 3)) {
      console.log(`  [${q.code}] ${q.especialidade}: ${q.statement.slice(0, 70)}...`);
    }
  }
}

checkUerjPending();
