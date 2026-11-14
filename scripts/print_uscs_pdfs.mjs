import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function printUscsPdfs() {
  for (const f of ['USCS_2025_GB_DEF.pdf', 'USCS_2026_GB_DEF.pdf']) {
    const pth = 'data/official_exams/USCS/' + f;
    const buf = new Uint8Array(fs.readFileSync(pth));
    const p = new PDFParse({ data: buf });
    await p.load();
    const txt = (await p.getText()).text || await p.getText();
    console.log(`\n================== ${f} ==================`);
    console.log(txt);
  }
}

printUscsPdfs().catch(console.error);
