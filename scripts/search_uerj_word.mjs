import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function searchWord(word) {
  const dir = 'data/official_exams/UERJ';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));
  console.log(`Searching for "${word}" across ${files.length} UERJ PDFs...`);

  for (const f of files) {
    const pPath = path.join(dir, f);
    const buf = new Uint8Array(fs.readFileSync(pPath));
    const p = new PDFParse({ data: buf });
    await p.load();
    const text = (await p.getText()).text || await p.getText();
    if (text.toLowerCase().includes(word.toLowerCase())) {
      const idx = text.toLowerCase().indexOf(word.toLowerCase());
      console.log(`-> MATCH in ${f}:`);
      console.log(text.slice(Math.max(0, idx - 100), idx + 250));
    }
  }
}

searchWord('exantemas').catch(console.error);
