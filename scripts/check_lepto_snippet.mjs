import fs from 'fs';
import { extractPdfText, norm } from './pdf_crossref_utils.mjs';

async function checkLepto() {
  const txt = await extractPdfText('data/official_exams/AMP_PARANA/AMP_2026_PROVA_GERAL.pdf');
  const idx = norm(txt).indexOf('leptospirose');
  if (idx !== -1) {
    console.log('Snippet de leptospirose em AMP 2026:');
    console.log(txt.slice(Math.max(0, idx - 200), idx + 500));
  }
}

checkLepto();

