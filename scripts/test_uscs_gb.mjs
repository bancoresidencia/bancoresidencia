import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testUscs() {
  for (const yr of ['2025', '2026']) {
    const gbPath = `data/official_exams/USCS/USCS_${yr}_GB_DEF.pdf`;
    const buf = new Uint8Array(fs.readFileSync(gbPath));
    const p = new PDFParse({ data: buf });
    await p.load();
    const text = (await p.getText()).text || await p.getText();
    console.log(`\n=== USCS ${yr} GB DEF (${text.length} chars) ===`);
    console.log(text.slice(0, 600));
  }
}

testUscs().catch(console.error);
