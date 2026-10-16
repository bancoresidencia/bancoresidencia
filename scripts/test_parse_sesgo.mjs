import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function testSesGo() {
  for (const year of [2026, 2024, 2023]) {
    console.log(`\n=================== SES-GO ${year} ===================`);
    const gbBuf = new Uint8Array(fs.readFileSync(`data/official_exams/SES_GO/SES_GO_${year}_GABARITO_DEFINITIVO.pdf`));
    const pGb = new PDFParse(gbBuf);
    await pGb.load();
    const gbTxt = (await pGb.getText()).text || await pGb.getText();
    console.log(`[${year} GABARITO] Tamanho texto: ${gbTxt.length}`);
    console.log(gbTxt.slice(0, 400).replace(/\n/g, ' '));

    const pvBuf = new Uint8Array(fs.readFileSync(`data/official_exams/SES_GO/SES_GO_${year}_PROVA_ACESSO_DIRETO.pdf`));
    const pPv = new PDFParse(pvBuf);
    await pPv.load();
    const pvTxt = (await pPv.getText()).text || await pPv.getText();
    console.log(`[${year} PROVA] Tamanho texto: ${pvTxt.length}`);
    console.log(pvTxt.slice(0, 400).replace(/\n/g, ' '));
  }
}

testSesGo().catch(console.error);
