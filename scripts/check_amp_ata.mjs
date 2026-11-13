import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function checkAta() {
  const p = new PDFParse({ data: fs.readFileSync('data/official_exams/AMP_PARANA/GB_AMP_2024_ATA_RECURSOS.pdf') });
  await p.load();
  const text = (await p.getText()).text || await p.getText();
  console.log('ATA length:', text.length);
  console.log(text.slice(0, 1500));
}
checkAta();

