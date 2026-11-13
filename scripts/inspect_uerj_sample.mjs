import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function inspectUerj() {
  const gbBuf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_GABARITO_DEFINITIVO.pdf'));
  const pvBuf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));

  const gbParser = new PDFParse(gbBuf);
  await gbParser.load();
  const gbRes = await gbParser.getText();
  const gbTxt = typeof gbRes === 'string' ? gbRes : gbRes.text;

  const pvParser = new PDFParse(pvBuf);
  await pvParser.load();
  const pvRes = await pvParser.getText();
  const pvTxt = typeof pvRes === 'string' ? pvRes : pvRes.text;

  console.log(`UERJ 2024 GB len: ${gbTxt.length} | PV len: ${pvTxt.length}`);
  console.log('\n--- UERJ 2024 GB SAMPLE ---');
  console.log(gbTxt.slice(0, 500));
  console.log('\n--- UERJ 2024 PV SAMPLE ---');
  console.log(pvTxt.slice(0, 600));
}

inspectUerj();

