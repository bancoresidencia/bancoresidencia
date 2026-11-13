import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function check() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_PARTE2.pdf'));
  const parser = new PDFParse(buf);
  await parser.load();
  const res = await parser.getText();
  const txt = typeof res === 'string' ? res : res.text;

  console.log(`PARTE 2 len: ${txt.length}`);
  console.log(txt.slice(0, 1000));
}
check();

