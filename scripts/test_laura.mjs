import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testLaura() {
  for (const fn of ['AMP_2025_PROVA_GERAL.pdf', 'AMP_2026_PROVA_GERAL.pdf']) {
    const p = new PDFParse({ data: fs.readFileSync(`data/official_exams/AMP_PARANA/${fn}`) });
    await p.load();
    const text = (await p.getText()).text || await p.getText();
    console.log(`${fn} contains Laura:`, text.includes('Laura'));
    console.log(`${fn} contains urina avermelhada:`, text.includes('urina avermelhada'));
  }
}

testLaura();
