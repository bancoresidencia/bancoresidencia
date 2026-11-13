import fs from 'fs';
import { supabase } from './pdf_crossref_utils.mjs';

async function checkOtherHubs() {
  console.log('Verificando pendências no banco para SURCE e PSU-MG...');
  
  const { data: surce } = await supabase
    .from('questions')
    .select('id, code, year, correct_answer')
    .ilike('code', 'SURCE%');
  const surcePending = (surce || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`SURCE: total=${(surce||[]).length}, pendentes=${surcePending.length}`);

  const { data: psu } = await supabase
    .from('questions')
    .select('id, code, year, correct_answer')
    .or('code.ilike.PSU%,code.ilike.AREMG%');
  const psuPending = (psu || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`PSU-MG / AREMG: total=${(psu||[]).length}, pendentes=${psuPending.length}`);

  const { data: sus } = await supabase
    .from('questions')
    .select('id, code, year, correct_answer')
    .ilike('code', 'SUSSP%');
  const susPending = (sus || []).filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`SUS-SP: total=${(sus||[]).length}, pendentes=${susPending.length}`);
}

checkOtherHubs();
