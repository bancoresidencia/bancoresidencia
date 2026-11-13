import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testUnicampP2() {
  const bufGb = fs.readFileSync('data/official_exams/UNICAMP/AD-prova-2-gabarito-1.pdf');
  const pGb = new PDFParse({ data: bufGb });
  await pGb.load();
  const gbText = (await pGb.getText()).text || await pGb.getText();
  console.log('=== AD-prova-2-gabarito-1.pdf ===');
  console.log(gbText.slice(0, 1500));
}

testUnicampP2();

