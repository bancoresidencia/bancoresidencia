import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function testPdf() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/PSU_MG/PSU_MG_2025_GABARITO_PRELIMINAR_TIPO1.pdf'));
  const parser = new PDFParse(buf);
  await parser.load();
  const text = await parser.getText();
  console.log('=== GABARITO PRELIMINAR 2025 TIPO 1 ===');
  const t1 = typeof text === 'string' ? text : (text.text || JSON.stringify(text));
  console.log(t1.slice(0, 1500));

  const buf2 = new Uint8Array(fs.readFileSync('data/official_exams/PSU_MG/PSU_MG_2025_ALTERACAO_GABARITO_DEFINITIVO.pdf'));
  const parser2 = new PDFParse(buf2);
  await parser2.load();
  const text2 = await parser2.getText();
  console.log('\n=== ALTERACAO GABARITO DEFINITIVO 2025 ===');
  const t2 = typeof text2 === 'string' ? text2 : (text2.text || JSON.stringify(text2));
  console.log(t2.slice(0, 2000));
}

testPdf().catch(console.error);
