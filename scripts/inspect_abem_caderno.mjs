import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const DIR = path.resolve('data/official_exams/ABEM');

async function inspectAbemCaderno() {
  const p = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'TPN25_Caderno_Prova_19h30.pdf')) });
  const text = (await p.getText()).text;
  
  console.log('Sample text from Caderno 19h30:\n');
  console.log(text.slice(0, 1500));
}

inspectAbemCaderno().catch(console.error);

