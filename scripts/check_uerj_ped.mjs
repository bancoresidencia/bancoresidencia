import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function check() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));
  const parser = new PDFParse(buf);
  await parser.load();
  const res = await parser.getText();
  const txt = typeof res === 'string' ? res : res.text;

  const kw1 = "exantemas";
  const kw2 = "1.800";
  console.log(`kw1 in txt? ${txt.includes(kw1)}`);
  console.log(`kw2 in txt? ${txt.includes(kw2)}`);

  if (txt.includes(kw1)) {
    const idx = txt.indexOf(kw1);
    console.log(txt.slice(idx - 100, idx + 300));
  }
}
check();

