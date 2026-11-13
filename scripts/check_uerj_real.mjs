import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function checkRealQs() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));
  const parser = new PDFParse(buf);
  await parser.load();
  const res = await parser.getText();
  const txt = typeof res === 'string' ? res : res.text;

  // Split by page marker "-- 2 of 29 --" or similar
  const pages = txt.split(/--\s*\d+\s*of\s*\d+\s*--/);
  console.log(`Total páginas divididas: ${pages.length}`);
  
  // Page 2 onwards has real questions
  const examText = pages.slice(1).join('\n\n');
  console.log(`Texto sem a capa: ${examText.length} caracteres.`);

  // Regex para questões no examText
  const qRegex = /(?:^|\n)\s*(\b\d{1,3}\b)\)\s+([^\n]+)/g;
  const matches = [...examText.matchAll(qRegex)];
  console.log(`Questões encontradas no examText: ${matches.length}`);
  matches.slice(0, 5).forEach(m => console.log(`  Q#${m[1]}: ${m[2].slice(0, 70)}`));
}

checkRealQs();

