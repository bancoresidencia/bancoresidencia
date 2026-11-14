import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

function parseFubogGabarito(text) {
  const map = new Map();
  const regex = /(\d{1,2})\s+([A-D]|ANULADA|X)/gi;
  let m;
  while ((m = regex.exec(text)) !== null) {
    const num = parseInt(m[1], 10);
    const ans = m[2].toUpperCase();
    map.set(num, (ans === 'X' || ans === 'ANULADA') ? 'ANULADA' : ans);
  }
  return map;
}

function parseFubogExam(text) {
  const regex = /(?:^|\n)\s*(\d{2})\.\s+([\s\S]*?)(?=(?:\n\s*\d{2}\.)|$)/g;
  const questions = [];
  let m;
  while ((m = regex.exec(text)) !== null) {
    const num = parseInt(m[1], 10);
    const body = m[2].trim();
    if (num >= 1 && num <= 100 && body.length > 30) {
      const optRegex = /\(([A-D])\)\s*([\s\S]*?)(?=(?:\([A-D]\))|$)/g;
      let optM;
      const options = [];
      let firstOptIdx = body.length;
      while ((optM = optRegex.exec(body)) !== null) {
        if (optM.index < firstOptIdx) firstOptIdx = optM.index;
        options.push({
          letter: optM[1].toUpperCase(),
          text: optM[2].replace(/\s+/g, ' ').trim()
        });
      }
      const stmt = body.slice(0, firstOptIdx).replace(/\s+/g, ' ').trim();
      questions.push({ num, statement: stmt, options });
    }
  }
  return questions;
}

async function test() {
  const pv1 = await parsePdf('data/official_exams/FUBOG/PV_FUBOG_V1A.pdf');
  const gb1 = await parsePdf('data/official_exams/FUBOG/GB_FUBOG_V1A.pdf');
  const qList = parseFubogExam(pv1);
  const gbMap = parseFubogGabarito(gb1);
  console.log(`FUBOG V1A: ${qList.length} questões extraídas | ${gbMap.size} gabaritos`);
  console.log('Q1:', qList[0].statement.slice(0, 100));
  console.log('Q1 Gabarito:', gbMap.get(1));
  console.log('Q1 Options count:', qList[0].options.length);
}

async function parsePdf(pdfPath) {
  const buf = new Uint8Array(fs.readFileSync(pdfPath));
  const p = new PDFParse({ data: buf });
  await p.load();
  return (await p.getText()).text || await p.getText();
}

test().catch(console.error);
