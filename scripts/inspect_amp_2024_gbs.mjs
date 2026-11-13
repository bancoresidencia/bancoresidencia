import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function inspectAmp2024Gbs() {
  const p1 = new PDFParse({ data: fs.readFileSync('data/official_exams/AMP_PARANA/GB_AMP_2024_PRELIMINAR.pdf') });
  await p1.load();
  const text1 = (await p1.getText()).text || await p1.getText();
  console.log('--- PRELIMINAR (Length:', text1.length, ') ---');
  console.log(text1.slice(0, 800));

  const p2 = new PDFParse({ data: fs.readFileSync('data/official_exams/AMP_PARANA/GB_AMP_2024_OFICIAL.pdf') });
  await p2.load();
  const text2 = (await p2.getText()).text || await p2.getText();
  console.log('\n--- OFICIAL (Length:', text2.length, ') ---');
  console.log(text2.slice(0, 800));
}
inspectAmp2024Gbs();

