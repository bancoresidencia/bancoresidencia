import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function readGb() {
  const gbPath = 'data/official_exams/AMP_PARANA/GB_AMP_2024_OFICIAL.pdf';
  const buf = new Uint8Array(fs.readFileSync(gbPath));
  const parser = new PDFParse(buf);
  await parser.load();
  const res = await parser.getText();
  console.log('--- TEXTO GABARITO AMP 2024 ---');
  console.log(typeof res === 'string' ? res : res.text);
}
readGb();

