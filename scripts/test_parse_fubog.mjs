import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testParseFubog() {
  console.log('--- Testando Gabarito FUBOG V1A ---');
  const gbP = new PDFParse({ data: fs.readFileSync('data/official_exams/FUBOG/GB_FUBOG_V1A.pdf') });
  await gbP.load();
  const gbText = (await gbP.getText()).text || await gbP.getText();
  console.log('GB Length:', gbText.length);
  console.log('GB Sample:\n', gbText.slice(0, 800));

  console.log('\n--- Testando Caderno FUBOG V1A ---');
  const pvP = new PDFParse({ data: fs.readFileSync('data/official_exams/FUBOG/PV_FUBOG_V1A.pdf') });
  await pvP.load();
  const pvText = (await pvP.getText()).text || await pvP.getText();
  console.log('PV Length:', pvText.length);
  console.log('PV Sample:\n', pvText.slice(0, 800));
}

testParseFubog();

