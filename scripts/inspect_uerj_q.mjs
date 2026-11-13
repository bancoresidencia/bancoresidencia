import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function inspectUerjQuestions() {
  const pvBuf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));
  const pvParser = new PDFParse(pvBuf);
  await pvParser.load();
  const pvRes = await pvParser.getText();
  const pvTxt = typeof pvRes === 'string' ? pvRes : pvRes.text;

  const idx = pvTxt.indexOf('1\n');
  console.log(pvTxt.slice(idx, idx + 1500));
}

inspectUerjQuestions();

