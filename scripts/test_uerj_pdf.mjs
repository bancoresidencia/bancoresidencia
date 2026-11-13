import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function testUerj() {
  const gbBuf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_GABARITO_DEFINITIVO.pdf'));
  const p1 = new PDFParse(gbBuf);
  await p1.load();
  const raw1 = await p1.getText();
  const gbText = typeof raw1 === 'string' ? raw1 : (raw1.text || JSON.stringify(raw1));
  console.log('=== UERJ 2024 GABARITO DEFINITIVO ===');
  console.log(gbText.slice(0, 1000));

  const pvBuf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));
  const p2 = new PDFParse(pvBuf);
  await p2.load();
  const raw2 = await p2.getText();
  const pvText = typeof raw2 === 'string' ? raw2 : (raw2.text || JSON.stringify(raw2));
  console.log('\n=== UERJ 2024 PROVA SAMPLE ===');
  console.log(pvText.slice(0, 1500));
}

testUerj().catch(console.error);
