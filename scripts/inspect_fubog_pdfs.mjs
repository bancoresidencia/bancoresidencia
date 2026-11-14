import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function inspectFubogPdfs() {
  const dir = 'data/official_exams/FUBOG/';
  for (const f of fs.readdirSync(dir)) {
    if (!f.endsWith('.pdf')) continue;
    const buf = new Uint8Array(fs.readFileSync(dir + f));
    const p = new PDFParse({ data: buf });
    await p.load();
    const txt = (await p.getText()).text || await p.getText();
    console.log(`\n=== FUBOG FILE: ${f} (len: ${txt.length}) ===`);
    console.log(txt.slice(0, 400).replace(/\n/g, ' '));
  }
}

inspectFubogPdfs().catch(console.error);
