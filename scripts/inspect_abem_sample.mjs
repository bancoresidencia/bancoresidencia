import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function inspectAbem() {
  const gbBuf = new Uint8Array(fs.readFileSync('data/official_exams/ABEM/TPN25_Gabarito_Prova_09h00.pdf'));
  const pvBuf = new Uint8Array(fs.readFileSync('data/official_exams/ABEM/TPN25_Caderno_Prova_09h00.pdf'));

  const gbParser = new PDFParse(gbBuf);
  await gbParser.load();
  const gbRes = await gbParser.getText();
  const gbTxt = typeof gbRes === 'string' ? gbRes : gbRes.text;

  const pvParser = new PDFParse(pvBuf);
  await pvParser.load();
  const pvRes = await pvParser.getText();
  const pvTxt = typeof pvRes === 'string' ? pvRes : pvRes.text;

  console.log(`ABEM 2025 GB len: ${gbTxt.length} | PV len: ${pvTxt.length}`);
  console.log('\n--- ABEM 2025 GB SAMPLE ---');
  console.log(gbTxt.slice(0, 700));
}

inspectAbem();

