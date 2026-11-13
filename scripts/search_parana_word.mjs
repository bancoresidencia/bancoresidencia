import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';

async function searchWord(word) {
  const base = 'data/official_exams';
  const folders = fs.readdirSync(base, { withFileTypes: true });
  for (const f of folders) {
    if (!f.isDirectory()) continue;
    const dir = path.join(base, f.name);
    const pdfs = fs.readdirSync(dir).filter(x => x.endsWith('.pdf'));
    for (const pdf of pdfs) {
      const p = path.join(dir, pdf);
      try {
        const buf = new Uint8Array(fs.readFileSync(p));
        if (buf.length === 0) continue;
        const parser = new PDFParse(buf);
        await parser.load();
        const res = await parser.getText();
        const txt = typeof res === 'string' ? res : (res.text || '');
        if (txt.toLowerCase().includes(word.toLowerCase())) {
          console.log(`[FOUND "${word}"] ${p}`);
        }
      } catch (e) {}
    }
  }
}

searchWord('laura').then(() => searchWord('urina avermelhada')).catch(console.error);
