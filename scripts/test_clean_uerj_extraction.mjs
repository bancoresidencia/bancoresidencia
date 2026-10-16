import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function testExtraction() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2026_PROVA_ACESSO_DIRETO.pdf'));
  const p = new PDFParse(buf);
  await p.load();
  let txt = (await p.getText()).text || await p.getText();
  
  // Cut after cover page instructions: usually after "NO CADERNO DE QUESTÕES:" or "PROIBIDO FOLHEAR" or "CLÍNICA MÉDICA"
  const startIdx = txt.indexOf('CLÍNICA MÉDICA');
  const bodyTxt = startIdx !== -1 ? txt.slice(startIdx) : txt;
  
  const regex = /(?:^|\n)\s*(\d{1,3})\s*[\)\.]\s+/g;
  const matches = [];
  let m;
  while ((m = regex.exec(bodyTxt)) !== null) {
    const qNum = parseInt(m[1], 10);
    if (qNum >= 1 && qNum <= 100) {
      matches.push({ qNum, index: m.index });
    }
  }
  
  // Keep only strictly increasing or expected sequence
  const valid = [];
  let expected = 1;
  for (const item of matches) {
    if (item.qNum === expected) {
      valid.push(item);
      expected++;
    }
  }
  
  console.log(`Matched sequential questions 1 to ${valid.length}`);
  
  const questions = {};
  for (let i = 0; i < valid.length; i++) {
    const s = valid[i].index;
    const e = i + 1 < valid.length ? valid[i+1].index : bodyTxt.length;
    questions[valid[i].qNum] = bodyTxt.slice(s, e).trim();
  }
  
  for (const num of [1, 2, 49, 100]) {
    if (questions[num]) {
      console.log(`\n--- Q${num} ---`);
      console.log(questions[num].slice(0, 180).replace(/\n/g, ' '));
    }
  }
}

testExtraction().catch(console.error);
