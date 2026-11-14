import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function checkQ3Extraction() {
  const pdfPath = 'C:/Users/cnath/.gemini/antigravity/brain/9618f204-3788-45d2-8b60-26cb27d0dbd1/.user_uploaded/media_1794604731740_a22389df.pdf';
  const buf = new Uint8Array(fs.readFileSync(pdfPath));
  const p = new PDFParse({ data: buf });
  await p.load();
  const rawText = (await p.getText()).text || await p.getText();

  const qRegex = /Quest[aã]o\s+(\d{1,3})\s*[-–]\s*([^\n]+)/gi;
  const matches = [...rawText.matchAll(qRegex)];
  
  const m3 = matches.find(m => m[1] === '3');
  const idx3 = matches.indexOf(m3);
  const nextM = matches[idx3 + 1];
  
  const block3 = rawText.slice(m3.index, nextM.index);
  console.log('--- BLOCK Q3 ---\n', block3);
}
checkQ3Extraction().catch(console.error);
