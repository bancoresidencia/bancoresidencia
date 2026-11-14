import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testRecursos() {
  for (const yr of ['2025', '2026']) {
    const rcPath = `data/official_exams/USCS/USCS_${yr}_RECURSOS.pdf`;
    const buf = new Uint8Array(fs.readFileSync(rcPath));
    const p = new PDFParse({ data: buf });
    await p.load();
    const text = (await p.getText()).text || await p.getText();
    console.log(`\n=== USCS ${yr} RECURSOS (${text.length} chars) ===`);
    console.log(text.slice(0, 800));
  }
}

testRecursos().catch(console.error);
