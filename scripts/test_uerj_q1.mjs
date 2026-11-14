import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testQ1Details() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2023_PROVA_ACESSO_DIRETO.pdf'));
  const p = new PDFParse({ data: buf });
  await p.load();
  const text = (await p.getText()).text || await p.getText();
  
  const idx = text.indexOf('1) Mulher de 57 anos');
  console.log(text.slice(idx, idx + 1200));
}

testQ1Details().catch(console.error);
