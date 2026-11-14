import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testExam() {
  for (const yr of ['2023', '2024']) {
    const pvPath = `data/official_exams/UERJ/UERJ_${yr}_PROVA_ACESSO_DIRETO.pdf`;
    const buf = new Uint8Array(fs.readFileSync(pvPath));
    const p = new PDFParse({ data: buf });
    await p.load();
    const text = (await p.getText()).text || await p.getText();
    console.log(`\n=== UERJ ${yr} (texto total: ${text.length} chars) ===`);
    console.log('Primeiros 800 caracteres:');
    console.log(text.slice(0, 800));
  }
}

testExam().catch(console.error);
