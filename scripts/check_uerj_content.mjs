import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function checkUerjContent() {
  const p = new PDFParse({ data: fs.readFileSync('data/official_exams/UERJ/UERJ_2024_PROVA_ACESSO_DIRETO.pdf') });
  await p.load();
  const text = (await p.getText()).text || await p.getText();
  console.log('PDF text length:', text.length);
  console.log('Contains exantemas:', text.includes('exantemas'));
  console.log('Contains COVID-19:', text.includes('COVID-19') || text.includes('covid'));
  console.log('Contains metformina:', text.includes('metformina'));
  console.log('\nFirst 800 chars:\n', text.slice(0, 800));
}

checkUerjContent();

