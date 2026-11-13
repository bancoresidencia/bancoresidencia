import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function checkFubog() {
  const pvBuf = new Uint8Array(fs.readFileSync('data/official_exams/FUBOG/PV_FUBOG_V1A.pdf'));
  const gbBuf = new Uint8Array(fs.readFileSync('data/official_exams/FUBOG/GB_FUBOG_V1A.pdf'));
  
  const pvParser = new PDFParse(pvBuf);
  await pvParser.load();
  const pvRes = await pvParser.getText();
  const pvTxt = typeof pvRes === 'string' ? pvRes : pvRes.text;

  const gbParser = new PDFParse(gbBuf);
  await gbParser.load();
  const gbRes = await gbParser.getText();
  const gbTxt = typeof gbRes === 'string' ? gbRes : gbRes.text;

  console.log(`PV_FUBOG_V1A len: ${pvTxt.length}`);
  console.log(`GB_FUBOG_V1A len: ${gbTxt.length}`);
  console.log('\n--- GB SAMPLE ---');
  console.log(gbTxt.slice(0, 500));
  console.log('\n--- PV SAMPLE ---');
  console.log(pvTxt.slice(0, 800));
}

checkFubog();

