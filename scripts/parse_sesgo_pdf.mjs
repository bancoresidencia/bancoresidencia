import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function parseSesGo() {
  const files = [
    'data/official_exams/SES_GO/SES_GO_2024_GABARITO_DEFINITIVO.pdf',
    'data/official_exams/SES_GO/SES_GO_2026_GABARITO_DEFINITIVO.pdf',
    'data/official_exams/SES_GO/SES_GO_2023_GABARITO_DEFINITIVO.pdf'
  ];

  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    console.log(`\n================== ${f} ==================`);
    const buf = fs.readFileSync(f);
    const parser = new PDFParse({ data: buf });
    await parser.load();
    const text = await parser.getText();
    const str = text.text || text;
    console.log(str.slice(0, 1000));
  }
}

parseSesGo().catch(console.error);
