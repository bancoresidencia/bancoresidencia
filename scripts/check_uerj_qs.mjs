import fs from 'fs';
import { PDFParse } from 'pdf-parse';

async function checkPages() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf'));
  const parser = new PDFParse(buf);
  await parser.load();
  const res = await parser.getText();
  const txt = typeof res === 'string' ? res : res.text;

  // Find all question numbers: (\d{1,3})\)
  const matches = [...txt.matchAll(/(?:^|\n)\s*(\d{1,3})\)\s+([^\n]+)/g)];
  console.log(`Total questoes encontradas em UERJ 2024: ${matches.length}`);
  matches.slice(0, 10).forEach(m => console.log(`  Q#${m[1]}: ${m[2].slice(0, 80)}`));
  matches.slice(-5).forEach(m => console.log(`  Q#${m[1]}: ${m[2].slice(0, 80)}`));
}
checkPages();

