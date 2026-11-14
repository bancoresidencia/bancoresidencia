import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function downloadAndInspect() {
  const files = [
    {
      name: 'USCS_2025_RECURSOS.pdf',
      url: 'https://anexos.cdn.selecao.net.br/uploads/325/concursos/28/anexos/a49ae07d-146d-4ad4-8ce4-881b818e31a4.pdf'
    },
    {
      name: 'USCS_2026_RECURSOS.pdf',
      url: 'https://anexos.cdn.selecao.net.br/uploads/325/concursos/29/anexos/eaadb7f2-b43f-48f3-8bf8-12b1adcd2873.pdf'
    }
  ];

  for (const f of files) {
    const res = await fetch(f.url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
    const buf = new Uint8Array(await res.arrayBuffer());
    fs.writeFileSync('data/official_exams/USCS/' + f.name, buf);
    console.log(`Salvo: data/official_exams/USCS/${f.name} (${buf.length} bytes)`);

    const p = new PDFParse({ data: buf });
    await p.load();
    const txt = (await p.getText()).text || await p.getText();
    console.log(`Texto extraído: ${txt.length} caracteres`);
    console.log(txt.slice(0, 500).replace(/\n/g, ' '));
  }
}

downloadAndInspect().catch(console.error);
