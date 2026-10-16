import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function printKeys() {
  for (const y of [2025, 2024, 2023, 2022]) {
    const gbPath = `data/official_exams/UERJ/UERJ_${y}_GABARITO_DEFINITIVO.pdf`;
    const gbBuf = new Uint8Array(fs.readFileSync(gbPath));
    const gbP = new PDFParse(gbBuf);
    await gbP.load();
    const gbTxt = (await gbP.getText()).text || await gbP.getText();
    console.log(`\n=== GABARITO UERJ ${y} ===`);
    console.log(gbTxt.trim());
  }
}

printKeys().catch(console.error);
