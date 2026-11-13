import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testUnicampP2Prova() {
  const bufPv = fs.readFileSync('data/official_exams/UNICAMP/AD-P2-para-publicar-1.pdf');
  const pPv = new PDFParse({ data: bufPv });
  await pPv.load();
  const pvText = (await pPv.getText()).text || await pPv.getText();
  console.log('=== AD-P2-para-publicar-1.pdf ===');
  console.log(pvText.slice(0, 1500));
}

testUnicampP2Prova();

