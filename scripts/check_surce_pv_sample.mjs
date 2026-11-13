import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function check() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/SURCE/SURCE_2024_PROVA_ACESSO_DIRETO.pdf'));
  const parser = new PDFParse(buf);
  await parser.load();
  const res = await parser.getText();
  const txt = typeof res === 'string' ? res : res.text;
  console.log('--- SURCE 2024 PV SAMPLE ---');
  console.log(txt.slice(0, 3000));
}
check();

