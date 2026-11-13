import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testAbemGb() {
  const buf = fs.readFileSync('data/official_exams/ABEM/TPN25_Gabarito_Prova_09h00.pdf');
  const p = new PDFParse({ data: buf });
  await p.load();
  const textObj = await p.getText();
  const text = typeof textObj === 'string' ? textObj : (textObj.text || JSON.stringify(textObj));

  console.log('=== TPN25_Gabarito_Prova_09h00.pdf ===');
  console.log(text.slice(0, 1500));
}

testAbemGb();

