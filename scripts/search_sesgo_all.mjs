import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function searchAllSesgo2026() {
  const dir = 'data/official_exams/SES_GO_2026/';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.pdf'));

  console.log(`Buscando em ${files.length} arquivos de SES_GO_2026...`);
  for (const f of files) {
    const buf = new Uint8Array(fs.readFileSync(path.join(dir, f)));
    const p = new PDFParse({ data: buf });
    await p.load();
    const txt = (await p.getText()).text || await p.getText();
    if (txt.toLowerCase().includes('coqueluche')) {
      console.log(`\n>>> ENCONTRADO em ${f}!`);
      const idx = txt.toLowerCase().indexOf('coqueluche');
      console.log(txt.slice(idx - 100, idx + 300).replace(/\n/g, ' '));
    }
  }
}

searchAllSesgo2026().catch(console.error);
