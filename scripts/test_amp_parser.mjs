import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testAmp() {
  const dir = 'data/official_exams/AMP_PARANA';
  const files = [
    'AMP_2024_PROVA_GERAL.pdf',
    'GB_AMP_2024_OFICIAL.pdf',
    'AMP_2025_PROVA_GERAL.pdf',
    'AMP_2025_GABARITO_RETIFICADO.pdf',
    'AMP_2026_PROVA_GERAL.pdf',
    'AMP_2026_GABARITOS_OFICIAIS.pdf'
  ];

  for (const f of files) {
    const pPath = `${dir}/${f}`;
    if (!fs.existsSync(pPath)) {
      console.log(`[Missing] ${f}`);
      continue;
    }
    const buf = new Uint8Array(fs.readFileSync(pPath));
    const p = new PDFParse({ data: buf });
    await p.load();
    const txt = (await p.getText()).text || await p.getText();
    console.log(`\n=== ${f} (${txt.length} chars) ===`);
    console.log(txt.slice(0, 350));
  }
}

testAmp().catch(console.error);
