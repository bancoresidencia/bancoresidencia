import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function parseAllPsuKeys() {
  const years = [2025, 2024, 2023, 2022, 2021, 2020];
  
  for (const year of years) {
    console.log(`\n=================== PSU-MG ${year} ===================`);
    
    // 1. Preliminar
    const prePath = `data/official_exams/PSU_MG/PSU_MG_${year}_GABARITO_PRELIMINAR_TIPO1.pdf`;
    if (fs.existsSync(prePath)) {
      const buf = new Uint8Array(fs.readFileSync(prePath));
      const p = new PDFParse(buf);
      await p.load();
      const txt = (await p.getText()).text || await p.getText();
      console.log(`[${year} PRELIMINAR] len: ${txt.length}`);
      console.log(txt.slice(0, 500).replace(/\n/g, ' '));
    }
    
    // 2. Definitivo / Alteração
    const defPath = `data/official_exams/PSU_MG/PSU_MG_${year}_ALTERACAO_GABARITO_DEFINITIVO.pdf`;
    if (fs.existsSync(defPath)) {
      const buf = new Uint8Array(fs.readFileSync(defPath));
      const p = new PDFParse(buf);
      await p.load();
      const txt = (await p.getText()).text || await p.getText();
      console.log(`[${year} ALTERAÇÃO/DEFINITIVO] len: ${txt.length}`);
      console.log(txt.slice(0, 500).replace(/\n/g, ' '));
    }
  }
}

parseAllPsuKeys().catch(console.error);
