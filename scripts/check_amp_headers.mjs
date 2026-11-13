import fs from 'fs';
import { extractPdfText } from './pdf_crossref_utils.mjs';

async function checkHeaders() {
  const f24 = await extractPdfText('data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf');
  const f25 = await extractPdfText('data/official_exams/AMP_PARANA/AMP_2025_PROVA_GERAL.pdf');
  const f26 = await extractPdfText('data/official_exams/AMP_PARANA/AMP_2026_PROVA_GERAL.pdf');

  console.log('--- HEADER AMP 2024 ---');
  console.log(f24.slice(0, 300));

  console.log('\n--- HEADER AMP 2025 ---');
  console.log(f25.slice(0, 400));

  console.log('\n--- HEADER AMP 2026 ---');
  console.log(f26.slice(0, 400));
}

checkHeaders();

