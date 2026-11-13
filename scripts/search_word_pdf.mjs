import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function searchWord() {
  const files = [
    'data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf',
    'data/official_exams/UERJ/UERJ_2024_PROVA_PARTE2.pdf',
    'data/official_exams/UERJ/UERJ_2023_PROVA_ACESSO_DIRETO.pdf'
  ];

  for (const f of files) {
    if (!fs.existsSync(f)) continue;
    const buf = new Uint8Array(fs.readFileSync(f));
    const p = new PDFParse(buf);
    await p.load();
    const raw = await p.getText();
    const text = typeof raw === 'string' ? raw : (raw.text || JSON.stringify(raw));
    const found = text.includes('exantemas') || text.includes('suplementação profilática');
    console.log(`File: ${f} -> Match found? ${found}`);
    if (found) {
      const idx = text.indexOf('exantemas');
      if (idx !== -1) console.log('Sample context:', text.slice(idx - 50, idx + 200));
    }
  }
}

searchWord().catch(console.error);
