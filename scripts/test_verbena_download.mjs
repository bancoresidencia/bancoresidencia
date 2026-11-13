import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const DIR = path.resolve('data/official_exams/SES_GO_2026');
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

async function downloadVerbenaPediatria() {
  const base = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/';
  const files = [
    { name: 'SES_GO_2026_PV_PEDIATRIA_A.pdf', path: 'provas/R1%20COM%20PR%C3%89-REQUISITO%20EM%20PEDIATRIA%20TIPO%20A.pdf' },
    { name: 'SES_GO_2026_GB_PEDIATRIA_A.pdf', path: 'gabaritos_finais/Gabarito%20Final%20-%20R1%20com%20pre-requisito%20em%20Pediatria%20todos%20Tipo%20A.pdf' }
  ];

  for (const f of files) {
    const url = base + f.path;
    const dest = path.join(DIR, f.name);
    console.log(`Downloading ${f.name} from ${url}...`);
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    console.log(`Saved ${buf.length} bytes.`);
    const p = new PDFParse({ data: buf });
    const text = (await p.getText()).text;
    console.log(`Text length: ${text.length} chars`);
    console.log(`Preview:\n${text.slice(0, 300).replace(/\n+/g, ' ')}\n`);
  }
}

downloadVerbenaPediatria().catch(console.error);

