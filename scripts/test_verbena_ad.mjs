import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const DIR = path.resolve('data/official_exams/SES_GO_2026');

async function downloadVerbenaAcessoDireto() {
  const base = 'https://sistemas.institutoverbena.ufg.br/2026/coreme-ses/sistema/provas_gabaritos/';
  const files = [
    { name: 'SES_GO_2026_PV_ACESSO_DIRETO_A.pdf', path: 'provas/%C3%81REAS%20B%C3%81SICAS%20E%20ESPECIALIDADES%20DE%20ACESSO%20DIRETO%20R1%20TIPO%20A.pdf' },
    { name: 'SES_GO_2026_GB_ACESSO_DIRETO_A.pdf', path: 'gabaritos_finais/Gabarito%20Final%20-%20Acesso%20direto%20tipo%20A.pdf' }
  ];

  for (const f of files) {
    const url = base + f.path;
    const dest = path.join(DIR, f.name);
    console.log(`Downloading ${f.name}...`);
    const res = await fetch(url);
    console.log(`Status: ${res.status}`);
    if (!res.ok) continue;
    const buf = Buffer.from(await res.arrayBuffer());
    fs.writeFileSync(dest, buf);
    const p = new PDFParse({ data: buf });
    const text = (await p.getText()).text;
    console.log(`Saved ${buf.length} bytes. Text length: ${text.length}`);
    console.log(`Preview:\n${text.slice(0, 300).replace(/\n+/g, ' ')}\n`);
  }
}

downloadVerbenaAcessoDireto().catch(console.error);

