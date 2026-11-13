import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testAmpPed() {
  const pPv = new PDFParse({ data: fs.readFileSync('data/official_exams/AMP_PARANA/AMP_2026_PROVA_PEDIATRIA.pdf') });
  await pPv.load();
  const text = (await pPv.getText()).text || await pPv.getText();
  console.log('Contains Laura:', text.includes('Laura'));
  console.log('Contains urina avermelhada:', text.includes('urina avermelhada'));
  console.log('Contains Rinite Alérgica:', text.includes('Rinite Alérgica'));
  console.log('Text preview:\n', text.slice(0, 1000));
}

testAmpPed();
