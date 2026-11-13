import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function inspectAmp() {
  const buf = fs.readFileSync('data/official_exams/AMP_PARANA/AMP_GABARITOS_OFICIAL_2026.pdf');
  const p = new PDFParse({ data: buf });
  await p.load();
  const textObj = await p.getText();
  const text = typeof textObj === 'string' ? textObj : (textObj.text || JSON.stringify(textObj));

  console.log('Tamanho do texto extraído do Gabarito AMP 2026:', text.length);
  console.log('=== PRIMEIRAS LINHAS ===');
  console.log(text.slice(0, 2000));
}

inspectAmp().catch(console.error);
