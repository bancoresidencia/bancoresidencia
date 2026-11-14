import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function testFubog() {
  const dir = 'data/official_exams/FUBOG';
  const files = fs.readdirSync(dir);
  console.log('Files in FUBOG:', files);

  for (const f of files) {
    if (f.endsWith('.pdf')) {
      const buf = new Uint8Array(fs.readFileSync(`${dir}/${f}`));
      const p = new PDFParse({ data: buf });
      await p.load();
      const txt = (await p.getText()).text || await p.getText();
      console.log(`\n=== ${f} (${txt.length} chars) ===`);
      console.log(txt.slice(0, 400));
    }
  }
}

testFubog().catch(console.error);
