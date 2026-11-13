import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testAmp2024Text() {
  const p = new PDFParse({ data: fs.readFileSync('data/official_exams/AMP_PARANA/AMP_2024_PROVA_GERAL.pdf') });
  await p.load();
  const text = (await p.getText()).text || await p.getText();
  console.log('AMP 2024 Prova Geral text length:', text.length);
  if (text.length > 500) {
    console.log('Sample text:\n', text.slice(0, 800));
  } else {
    console.log('Scanned PDF detected! Length < 500.');
  }
}
testAmp2024Text();
