import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function searchUnicampPhrases() {
  const bufPv = fs.readFileSync('data/official_exams/UNICAMP/AD-P2-para-publicar-1.pdf');
  const pPv = new PDFParse({ data: bufPv });
  await pPv.load();
  const pvText = (await pPv.getText()).text || await pPv.getText();
  
  const words = ['moto x caminhão', 'contraceptivo oral combinado', 'angina persistente', 'confusão mental'];
  for (const w of words) {
    console.log(`Buscando '${w}': encontrada? ${pvText.toLowerCase().includes(w)}`);
  }
}

searchUnicampPhrases();

