import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function check() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/SURCE/SURCE_2024_GABARITO_PRELIMINAR.pdf'));
  const parser = new PDFParse(buf);
  await parser.load();
  const res = await parser.getText();
  console.log('--- SURCE 2024 GB TEXT ---');
  console.log(typeof res === 'string' ? res : res.text);
}
check();

