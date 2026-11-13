import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function searchAllUnicamp() {
  const files = fs.readdirSync('data/official_exams/UNICAMP').filter(f => f.endsWith('.pdf'));
  for (const f of files) {
    try {
      const buf = fs.readFileSync('data/official_exams/UNICAMP/' + f);
      const p = new PDFParse({ data: buf });
      await p.load();
      const text = (await p.getText()).text || await p.getText();
      const found = text.toLowerCase().includes('moto x caminhão') || text.toLowerCase().includes('contraceptivo oral') || text.toLowerCase().includes('angina');
      console.log(`UNICAMP/${f}: match? ${found}`);
    } catch (_) {}
  }
}

searchAllUnicamp();

