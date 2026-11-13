import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function searchUerjFiles() {
  const files = fs.readdirSync('data/official_exams/UERJ').filter(f => f.endsWith('.pdf'));
  for (const f of files) {
    const buf = fs.readFileSync('data/official_exams/UERJ/' + f);
    const p = new PDFParse({ data: buf });
    await p.load();
    const text = (await p.getText()).text || await p.getText();
    const found1 = text.includes('emagrecimento importante') || text.includes('1.800 indivíduos');
    console.log(`UERJ/${f}: match? ${found1}`);
  }
}

searchUerjFiles().catch(console.error);

