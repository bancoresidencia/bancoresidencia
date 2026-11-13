import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function checkQuestions() {
  const pvBuf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));
  const p2 = new PDFParse(pvBuf);
  await p2.load();
  const raw2 = await p2.getText();
  const pvText = typeof raw2 === 'string' ? raw2 : (raw2.text || JSON.stringify(raw2));
  
  // Find lines with numbers like 01 or 1.
  const lines = pvText.split('\n');
  console.log('Total lines:', lines.length);
  for (let i = 0; i < Math.min(lines.length, 120); i++) {
    console.log(`${i}: ${lines[i]}`);
  }
}

checkQuestions().catch(console.error);
