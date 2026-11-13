import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const DIR = path.resolve('data/official_exams/ABEM');

async function testMatchAbem2024() {
  const url = 'https://website.abem-educmed.org.br/wp-content/uploads/2024/10/TPN2024_Caderno_Prova_v1.pdf';
  const filePath = path.join(DIR, 'TPN2024_Caderno_Prova_v1.pdf');
  if (!fs.existsSync(filePath)) {
    const res = await fetch(url);
    fs.writeFileSync(filePath, Buffer.from(await res.arrayBuffer()));
  }
  const p = new PDFParse({ data: fs.readFileSync(filePath) });
  const text = (await p.getText()).text;
  
  const queries = [
    'apresentando tosse, cansaço e “chiado no peito”',
    'enxaqueca com aura e está visivelmente ansiosa sobre a possibilidade de uma gestação',
    'evacuação com aspecto de "geleia de framboesa"',
    'pediatra realiza a manobra de Ortolani'
  ];

  for (const q of queries) {
    console.log(`Query: "${q.slice(0, 40)}..." -> In 2024? ${text.includes(q)}`);
  }
}

testMatchAbem2024().catch(console.error);

