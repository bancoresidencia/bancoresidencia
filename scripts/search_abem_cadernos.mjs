import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function searchAbemCadernosFuzzy() {
  const files = [
    'data/official_exams/ABEM/TPN25_Caderno_Prova_09h00.pdf',
    'data/official_exams/ABEM/TPN25_Caderno_Prova_19h30.pdf',
    'data/official_exams/ABEM/TPN2024_Caderno_Prova_v1.pdf'
  ];

  for (const f of files) {
    const buf = fs.readFileSync(f);
    const p = new PDFParse({ data: buf });
    await p.load();
    const textObj = await p.getText();
    const text = typeof textObj === 'string' ? textObj : (textObj.text || JSON.stringify(textObj));
    const normalized = text.toLowerCase().replace(/\s+/g, ' ');
    const found = normalized.includes('baixo ganho ponderal') || normalized.includes('otite media');
    console.log(`Arquivo: ${f} -> Encontrou? ${found}`);
    if (found) {
      const idx = normalized.indexOf('baixo ganho ponderal');
      if (idx !== -1) {
        console.log('Contexto:', normalized.slice(Math.max(0, idx - 100), idx + 200));
      }
    }
  }
}

searchAbemCadernosFuzzy();
