import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const dir = path.resolve('data/official_exams/SES_GO_2026');

async function testExtraction() {
  const gbPath = path.join(dir, 'GB_CLINICA_MEDICA_A.pdf');
  const pvPath = path.join(dir, 'PV_CLINICA_MEDICA_A.pdf');

  // Gabarito
  const pGb = new PDFParse({ data: fs.readFileSync(gbPath) });
  await pGb.load();
  const gbText = (await pGb.getText()).text || await pGb.getText();
  console.log('Gabarito text preview:\n', gbText.slice(0, 500));

  // Caderno
  const pPv = new PDFParse({ data: fs.readFileSync(pvPath) });
  await pPv.load();
  const pvText = (await pPv.getText()).text || await pPv.getText();
  console.log('\nCaderno text preview:\n', pvText.slice(0, 1000));
}

testExtraction();
