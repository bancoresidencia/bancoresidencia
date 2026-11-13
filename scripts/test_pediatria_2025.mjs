import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testPediatria2025() {
  const pPv = new PDFParse({ data: fs.readFileSync('data/official_exams/SES_GO_2025/PV_PEDIATRIA_2025.pdf') });
  await pPv.load();
  const text = (await pPv.getText()).text || await pPv.getText();
  console.log('Contains coqueluche:', text.includes('coqueluche'));
  console.log('Contains SBP:', text.includes('SBP'));
  console.log('Text preview (first 1000 chars):\n', text.slice(0, 1000));
}

testPediatria2025();
