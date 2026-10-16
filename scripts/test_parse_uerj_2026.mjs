import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function testUerj() {
  console.log('=== GABARITO DEFINITIVO UERJ 2026 ===');
  const bufGb = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2026_GABARITO_DEFINITIVO.pdf'));
  const pGb = new PDFParse(bufGb);
  await pGb.load();
  const gbText = await pGb.getText();
  const txtGb = typeof gbText === 'string' ? gbText : (gbText.text || JSON.stringify(gbText));
  console.log(txtGb.slice(0, 1500));

  console.log('\n=== PROVA ACESSO DIRETO UERJ 2026 ===');
  const bufPv = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2026_PROVA_ACESSO_DIRETO.pdf'));
  const pPv = new PDFParse(bufPv);
  await pPv.load();
  const pvText = await pPv.getText();
  const txtPv = typeof pvText === 'string' ? pvText : (pvText.text || JSON.stringify(pvText));
  console.log('Tamanho texto prova:', txtPv.length);
  console.log(txtPv.slice(0, 1500));
}

testUerj().catch(console.error);
