import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const DIR = path.resolve('data/official_exams/ABEM');

async function inspectAbemGabarito() {
  const p = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'TPN25_Gabarito_Prova_19h30.pdf')) });
  const text = (await p.getText()).text;
  
  // Split into lines or analyze structure
  console.log('Sample text from Gabarito 19h30:\n');
  console.log(text.slice(0, 1500));
}

inspectAbemGabarito().catch(console.error);

