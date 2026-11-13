import fs from 'fs';
import path from 'path';
import { extractPdfText } from './pdf_crossref_utils.mjs';

async function scanPdfsSafely() {
  const base = 'data/official_exams';
  const dirs = fs.readdirSync(base);
  const results = [];

  for (const d of dirs) {
    const fullDir = path.join(base, d);
    if (!fs.statSync(fullDir).isDirectory()) continue;
    const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.pdf'));
    for (const f of files) {
      const fullPath = path.join(fullDir, f);
      const stat = fs.statSync(fullPath);
      if (stat.size === 0) {
        results.push({ hub: d, file: f, sizeMb: 0, txtLen: 0, status: 'ARQUIVO_VAZIO_0_BYTES' });
        continue;
      }
      try {
        const txt = await extractPdfText(fullPath);
        const sizeMb = (stat.size / (1024 * 1024)).toFixed(1);
        let status = 'TEXTO_DIGITAL_OK';
        if (stat.size > 1.5 * 1024 * 1024 && txt.length < 1500) {
          status = 'IMAGEM_ESCANEADA_SEM_TEXTO';
        }
        results.push({ hub: d, file: f, sizeMb, txtLen: txt.length, status });
      } catch (e) {
        results.push({ hub: d, file: f, sizeMb: (stat.size / (1024 * 1024)).toFixed(1), txtLen: 0, status: 'ERRO_CORROMPIDO' });
      }
    }
  }

  const imageScans = results.filter(r => r.status === 'IMAGEM_ESCANEADA_SEM_TEXTO');
  const emptyPdfs = results.filter(r => r.status === 'ARQUIVO_VAZIO_0_BYTES');
  console.log(`Total PDFs auditados: ${results.length}`);
  console.log(`PDFs em Imagem Escaneada (necessitam OCR): ${imageScans.length}`);
  console.log(imageScans);
  console.log(`PDFs Vazios (0 bytes): ${emptyPdfs.length}`);
  console.log(emptyPdfs);
}

scanPdfsSafely();
