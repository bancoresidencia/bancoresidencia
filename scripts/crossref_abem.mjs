import fs from 'fs';
import { supabase, norm, calculateSimilarity, extractPdfText } from './pdf_crossref_utils.mjs';

async function checkAbem() {
  console.log('=== VERIFICANDO ABEM / TPN NO SUPABASE ===');
  const { data } = await supabase
    .from('questions')
    .select('id, code, year, especialidade, statement, options, correct_answer')
    .or('code.ilike.ABEM%,code.ilike.TPN%');

  console.log(`Total ABEM/TPN no banco: ${data.length}`);
  const pending = data.filter(q => !q.correct_answer || q.correct_answer.trim() === '');
  console.log(`Pendentes sem gabarito: ${pending.length}`);
  const byYear = {};
  for (const q of pending) {
    byYear[q.year] = byYear[q.year] || 0;
    byYear[q.year]++;
  }
  console.log('Pendentes por ano:', byYear);

  if (pending.length > 0) {
    console.log('Amostras pendentes:');
    for (const q of pending.slice(0, 3)) {
      console.log(`[${q.code}] (${q.year}): ${q.statement.slice(0, 100)}...`);
    }
  }

  // Extrair texto dos TPN 2024 e 2025
  const tpn24Txt = await extractPdfText('data/official_exams/ABEM/TPN2024_Caderno_Prova_v1.pdf');
  const tpn25_9h = await extractPdfText('data/official_exams/ABEM/TPN25_Caderno_Prova_09h00.pdf');
  const tpn25_19h = await extractPdfText('data/official_exams/ABEM/TPN25_Caderno_Prova_19h30.pdf');
  console.log(`Tamanho textos: TPN24=${tpn24Txt.length}, TPN25(9h)=${tpn25_9h.length}, TPN25(19h)=${tpn25_19h.length}`);

  let matches24 = 0;
  let matches25 = 0;

  for (const q of pending) {
    const sNorm = norm(q.statement).slice(0, 60);
    if (sNorm && norm(tpn24Txt).includes(sNorm)) matches24++;
    if (sNorm && (norm(tpn25_9h).includes(sNorm) || norm(tpn25_19h).includes(sNorm))) matches25++;
  }

  console.log(`Matches com TPN 2024: ${matches24}`);
  console.log(`Matches com TPN 2025: ${matches25}`);
}

checkAbem();
