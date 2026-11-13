import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const DIR = path.resolve('data/official_exams/ABEM');

async function testMatchAbem() {
  const p1 = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'TPN25_Caderno_Prova_09h00.pdf')) });
  const t1 = (await p1.getText()).text;
  
  const p2 = new PDFParse({ data: fs.readFileSync(path.join(DIR, 'TPN25_Caderno_Prova_19h30.pdf')) });
  const t2 = (await p2.getText()).text;

  const queries = [
    'Durante atendimento em Ambulatório de Puericultura',
    'Lactente de 8 meses de idade, do sexo feminino, nascida a termo',
    'Criança de 1 ano e 6 meses de idade foi admitida em Pronto Socorro após ingestão'
  ];

  for (const q of queries) {
    const in1 = t1.includes(q);
    const in2 = t2.includes(q);
    console.log(`Query: "${q.slice(0, 40)}..."`);
    console.log(`  In 09h00 PDF? ${in1} | In 19h30 PDF? ${in2}`);
  }
}

testMatchAbem().catch(console.error);

