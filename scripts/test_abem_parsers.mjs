import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const files = {
  '2024': 'data/official_exams/ABEM/TPN2024_Caderno_Prova_v1.pdf',
  '2025': 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731653_272749d2.pdf',
  '2026': 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731740_a22389df.pdf'
};

async function testPdfParse() {
  for (const [year, path] of Object.entries(files)) {
    const buf = new Uint8Array(fs.readFileSync(path));
    const p = new PDFParse({ data: buf });
    await p.load();
    const rawText = (await p.getText()).text || await p.getText();
    const qMatches = [...rawText.matchAll(/Quest[aã]o\s+(\d{1,3})/gi)];
    console.log(`Ano ${year} (${path}): total text len = ${rawText.length}, regex matches = ${qMatches.length}`);
  }
}

testPdfParse().catch(console.error);
