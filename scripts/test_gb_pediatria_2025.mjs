import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testGabarito2025() {
  const pGb = new PDFParse({ data: fs.readFileSync('data/official_exams/SES_GO_2025/GB_PEDIATRIA_2025.pdf') });
  await pGb.load();
  const text = (await pGb.getText()).text || await pGb.getText();
  console.log('=== GABARITO PEDIATRIA 2025 ===\n', text);
}

testGabarito2025();
