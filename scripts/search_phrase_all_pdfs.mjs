import fs from 'fs';
import path from 'path';
import { PDFParse } from 'pdf-parse';

async function searchAllPdfs(dir, query) {
  const files = fs.readdirSync(dir, { recursive: true, withFileTypes: true });
  for (const f of files) {
    if (f.isFile() && f.name.endsWith('.pdf')) {
      const fullPath = path.join(f.parentPath || f.path, f.name);
      try {
        const buf = new Uint8Array(fs.readFileSync(fullPath));
        if (buf.length === 0) continue;
        const parser = new PDFParse(buf);
        await parser.load();
        const txt = await parser.getText();
        const t = typeof txt === 'string' ? txt : (txt.text || '');
        if (t.toLowerCase().includes(query.toLowerCase())) {
          console.log(`FOUND "${query}" in: ${fullPath} (length: ${t.length})`);
        }
      } catch (e) {}
    }
  }
}

async function run() {
  console.log('Searching for "coqueluche"...');
  await searchAllPdfs('data/official_exams', 'coqueluche');
  console.log('Searching for "febre reumática"...');
  await searchAllPdfs('data/official_exams', 'febre reumática');
  console.log('Search done.');
}

run().catch(console.error);
