import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pdf = require('pdf-parse');

async function parseUnicamp() {
  const { PDFParse } = require('pdf-parse');
  const fileBuffer = fs.readFileSync('data/official_exams/UNICAMP/UNICAMP_2026_GABARITO_DEFINITIVO.pdf');
  const parser = new PDFParse({ data: fileBuffer });
  await parser.load();
  const text = await parser.getText();
  
  console.log('--- GABARITO DEFINITIVO UNICAMP 2026 ---');
  console.log('Texto extraído:\n', text.text || text);
}

parseUnicamp().catch(console.error);
