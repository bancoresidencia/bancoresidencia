import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function dumpAta() {
  const p = new PDFParse({ data: fs.readFileSync('data/official_exams/AMP_PARANA/GB_AMP_2024_ATA_RECURSOS.pdf') });
  await p.load();
  const text = (await p.getText()).text || await p.getText();
  console.log(text);
}
dumpAta();
