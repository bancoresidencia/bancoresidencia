import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function checkUnicamp2026() {
  const pvBuf = new Uint8Array(fs.readFileSync('data/official_exams/UNICAMP/UNICAMP_2026_PROVA_ACESSO_DIRETO.pdf'));
  const pvParser = new PDFParse(pvBuf);
  await pvParser.load();
  const pvRes = await pvParser.getText();
  const pvTxt = typeof pvRes === 'string' ? pvRes : pvRes.text;

  const gbBuf = new Uint8Array(fs.readFileSync('data/official_exams/UNICAMP/UNICAMP_2026_GABARITO_DEFINITIVO.pdf'));
  const gbParser = new PDFParse(gbBuf);
  await gbParser.load();
  const gbRes = await gbParser.getText();
  const gbTxt = typeof gbRes === 'string' ? gbRes : gbRes.text;

  console.log(`PV len: ${pvTxt.length} | GB len: ${gbTxt.length}`);
  console.log('--- GB SAMPLE ---');
  console.log(gbTxt.slice(0, 500));
  
  const kw = "contraceptivo oral combinado";
  console.log(`Contains '${kw}'? ${pvTxt.toLowerCase().includes(kw)}`);
  if (pvTxt.toLowerCase().includes(kw)) {
    const idx = pvTxt.toLowerCase().indexOf(kw);
    console.log(pvTxt.slice(idx - 100, idx + 300));
  }
}

checkUnicamp2026();

