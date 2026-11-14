import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function checkParte2() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_PARTE2.pdf'));
  const p = new PDFParse({ data: buf });
  await p.load();
  const text = (await p.getText()).text || await p.getText();
  console.log('UERJ 2024 Parte 2 total length:', text.length);
  console.log('Sample text:');
  console.log(text.slice(0, 1000));
}

checkParte2().catch(console.error);
