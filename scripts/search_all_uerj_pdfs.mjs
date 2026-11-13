import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function searchAllUerj() {
  const dir = path.resolve('data/official_exams/UERJ');
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf') && f.includes('PROVA'));
  console.log('Testing files:', files);

  for (const f of files) {
    const p = new PDFParse({ data: fs.readFileSync(path.join(dir, f)) });
    await p.load();
    const text = (await p.getText()).text || await p.getText();
    if (text.includes('exantemas') || text.includes('padrões morfológicos')) {
      console.log(`[FOUND in ${f}] exantemas`);
    }
    if (text.includes('COVID-19') || text.includes('1.800')) {
      console.log(`[FOUND in ${f}] COVID-19`);
    }
    if (text.includes('emagrecimento importante') || text.includes('2.500mg')) {
      console.log(`[FOUND in ${f}] emagrecimento`);
    }
  }
}

searchAllUerj();

