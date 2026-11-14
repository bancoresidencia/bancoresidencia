import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function test2024All() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));
  const p = new PDFParse({ data: buf });
  await p.load();
  const text = (await p.getText()).text || await p.getText();
  
  // Find all matches of `\n(\d{1,3})\)`
  const matches = [...text.matchAll(/\n(\d{1,3})\)\s+([^\n]+)/g)];
  console.log(`Encontradas ${matches.length} ocorrências de N)`);
  matches.slice(0, 15).forEach(m => console.log(`${m[1]}: ${m[2].slice(0, 70)}`));
}

test2024All().catch(console.error);
