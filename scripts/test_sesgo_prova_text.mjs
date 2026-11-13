import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function printPage2() {
  const buf = fs.readFileSync('data/official_exams/SES_GO/SES_GO_2026_PROVA_ACESSO_DIRETO.pdf');
  const p = new PDFParse({ data: buf });
  await p.load();
  const textObj = await p.getText();
  const text = typeof textObj === 'string' ? textObj : (textObj.text || JSON.stringify(textObj));

  const p2Idx = text.indexOf('-- 2 of 17 --');
  if (p2Idx !== -1) {
    console.log('=== PAGE 2 & 3 OF SES_GO_2026_PROVA_ACESSO_DIRETO.pdf ===');
    console.log(text.slice(p2Idx, p2Idx + 3000));
  }
}

printPage2();
