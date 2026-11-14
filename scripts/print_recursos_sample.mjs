import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function inspectRec() {
  const pth = 'data/official_exams/USCS/USCS_2026_RECURSOS.pdf';
  const buf = new Uint8Array(fs.readFileSync(pth));
  const p = new PDFParse({ data: buf });
  await p.load();
  const txt = (await p.getText()).text || await p.getText();

  const lines = txt.split('\n');
  console.log('Total lines:', lines.length);
  for (let i = 0; i < Math.min(lines.length, 60); i++) {
    console.log(`L${i+1}: ${lines[i]}`);
  }
}

inspectRec().catch(console.error);
