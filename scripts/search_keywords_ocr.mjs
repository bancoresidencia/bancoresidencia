import fs from 'fs';

const ocr = JSON.parse(fs.readFileSync('data/amp_2024_pages/ocr_all_pages.json', 'utf8').replace(/^\uFEFF/, ''));
console.log(`Total páginas no OCR: ${ocr.length}`);

const keywords = [
  'broncoespasmo',
  '18 meses',
  'Conselho Tutelar',
  'Joana',
  'anti-Rh',
  'imunoglobulina',
  'sensibilizada'
];

for (const p of ocr) {
  for (const kw of keywords) {
    if (p.text.toLowerCase().includes(kw.toLowerCase())) {
      console.log(`[ENCONTRADO] Palavra "${kw}" na página ${p.page}!`);
      const idx = p.text.toLowerCase().indexOf(kw.toLowerCase());
      console.log(`Trecho: ${p.text.substring(Math.max(0, idx - 100), Math.min(p.text.length, idx + 300))}\n`);
    }
  }
}

