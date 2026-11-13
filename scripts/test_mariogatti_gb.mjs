import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function checkMarioGattiGb() {
  const p = new PDFParse({ data: fs.readFileSync('data/official_exams/MARIO_GATTI/GB_MARIO_GATTI_2026_DEFINITIVO.pdf') });
  await p.load();
  const text = (await p.getText()).text || await p.getText();
  console.log('Text length:', text.length);
  console.log(text.slice(0, 1500));
}
checkMarioGattiGb();

