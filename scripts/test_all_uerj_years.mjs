import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function parseAllUerj() {
  const years = [2026, 2025, 2024, 2023, 2022];
  
  for (const y of years) {
    console.log(`\n=================== UERJ ${y} ===================`);
    // Answer key
    const gbPath = `data/official_exams/UERJ/UERJ_${y}_GABARITO_DEFINITIVO.pdf`;
    const gbBuf = new Uint8Array(fs.readFileSync(gbPath));
    const gbP = new PDFParse(gbBuf);
    await gbP.load();
    const gbTxt = (await gbP.getText()).text || await gbP.getText();
    console.log(`[${y} GABARITO] Tamanho texto: ${gbTxt.length}`);
    
    // Exam booklet
    const pvPath = `data/official_exams/UERJ/UERJ_${y}_PROVA_ACESSO_DIRETO.pdf`;
    const pvBuf = new Uint8Array(fs.readFileSync(pvPath));
    const pvP = new PDFParse(pvBuf);
    await pvP.load();
    const pvTxt = (await pvP.getText()).text || await pvP.getText();
    console.log(`[${y} PROVA] Tamanho texto: ${pvTxt.length}`);
  }
}

parseAllUerj().catch(console.error);
