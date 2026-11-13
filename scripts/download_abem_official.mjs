import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

const DIR = path.resolve('data/official_exams/ABEM');
if (!fs.existsSync(DIR)) fs.mkdirSync(DIR, { recursive: true });

async function downloadAndInspectAbem() {
  const files = [
    { name: 'TPN25_Gabarito_Prova_09h00.pdf', url: 'https://website.abem-educmed.org.br/wp-content/uploads/2025/12/TPN25_Gabarito_Prova_09h00.pdf' },
    { name: 'TPN25_Caderno_Prova_09h00.pdf', url: 'https://website.abem-educmed.org.br/wp-content/uploads/2025/12/TPN25_Caderno_Prova_09h00.pdf' },
    { name: 'TPN25_Gabarito_Prova_19h30.pdf', url: 'https://website.abem-educmed.org.br/wp-content/uploads/2025/12/TPN25_Gabarito_Prova_19h30.pdf' },
    { name: 'TPN25_Caderno_Prova_19h30.pdf', url: 'https://website.abem-educmed.org.br/wp-content/uploads/2025/12/TPN25_Caderno_Prova_19h30.pdf' }
  ];

  for (const f of files) {
    const filePath = path.join(DIR, f.name);
    console.log(`Checking ${f.name}...`);
    let buf;
    if (fs.existsSync(filePath)) {
      buf = fs.readFileSync(filePath);
      console.log(`  Already downloaded (${buf.length} bytes)`);
    } else {
      console.log(`  Downloading from ${f.url}...`);
      const res = await fetch(f.url);
      console.log(`  Status: ${res.status}`);
      if (!res.ok) continue;
      buf = Buffer.from(await res.arrayBuffer());
      fs.writeFileSync(filePath, buf);
      console.log(`  Saved to ${filePath} (${buf.length} bytes)`);
    }

    const parser = new PDFParse({ data: buf });
    const parsed = await parser.getText();
    console.log(`  Text length: ${parsed.text.length} chars`);
    console.log(`  Preview:\n${parsed.text.slice(0, 300).replace(/\n+/g, ' ')}\n`);
  }
}

downloadAndInspectAbem().catch(console.error);

