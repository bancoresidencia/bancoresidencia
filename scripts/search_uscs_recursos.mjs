import fs from 'fs';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { PDFParse } = require('pdf-parse');

async function searchRecursos() {
  const buf = new Uint8Array(fs.readFileSync('data/official_exams/USCS/USCS_2025_RECURSOS.pdf'));
  const p = new PDFParse({ data: buf });
  await p.load();
  const text = (await p.getText()).text || await p.getText();

  const terms = ['leiomioma', 'perfuro cortante', 'amenorreia', 'BI-RADS', 'Gleason', 'Ginecol', 'Cirurg'];
  for (const t of terms) {
    const idx = text.toLowerCase().indexOf(t.toLowerCase());
    if (idx !== -1) {
      console.log(`Found "${t}" in Recursos at ${idx}:`);
      console.log(text.slice(Math.max(0, idx - 50), idx + 150));
    } else {
      console.log(`Term "${t}" not found in Recursos.`);
    }
  }
}

searchRecursos().catch(console.error);
