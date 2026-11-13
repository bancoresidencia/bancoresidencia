import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const DIR = path.resolve('data/official_exams/SES_GO_2026');

async function inspectVerbenaGabarito() {
  const p = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'SES_GO_2026_GB_PEDIATRIA_A.pdf')) });
  const text = (await p.getText()).text;
  console.log('Full Gabarito Text:\n', text);
}
inspectVerbenaGabarito();

