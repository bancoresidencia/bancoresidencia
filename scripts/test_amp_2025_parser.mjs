import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testAmp2025() {
  const gbPath = 'data/official_exams/AMP_PARANA/AMP_2025_GABARITO_RETIFICADO.pdf';
  const pvPath = 'data/official_exams/AMP_PARANA/AMP_2025_PROVA_GERAL.pdf';

  const pGb = new PDFParse({ data: fs.readFileSync(gbPath) });
  await pGb.load();
  const gbText = (await pGb.getText()).text || await pGb.getText();
  console.log('=== GABARITO AMP 2025 PREVIEW ===\n', gbText.slice(0, 800));

  const pPv = new PDFParse({ data: fs.readFileSync(pvPath) });
  await pPv.load();
  const pvText = (await pPv.getText()).text || await pPv.getText();
  console.log('\n=== PROVA AMP 2025 PREVIEW ===\n', pvText.slice(0, 1000));
}

testAmp2025();
