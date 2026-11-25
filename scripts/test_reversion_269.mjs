import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare("SELECT id, images FROM questions_curated_staging WHERE images LIKE '%imagens_higienizadas_medq%'").all();

let foundBg = 0;
let foundConverted = 0;
let foundPdr = 0;
let foundOrig = 0;
let notFound = 0;
const missingList = [];

for (const r of rows) {
  let parsed = [];
  try {
    parsed = JSON.parse(r.images);
    if (!Array.isArray(parsed)) parsed = [parsed];
  } catch {
    parsed = [r.images];
  }

  for (const u of parsed) {
    const base = path.basename(u.split('?')[0]);
    const cleanBase = base.replace(/^clean_/, '');

    const pBg = `data/imagens_banco_geral/${cleanBase}`;
    const pConv = `data/imagens_convertidas_webp/${cleanBase}`;
    const pPdr = `data/imagens_provaderesidencia/${cleanBase}`;
    const pOrig = `data/imagens_medq_originais/orig_${r.id}_${cleanBase}`;

    if (fs.existsSync(pBg)) foundBg++;
    else if (fs.existsSync(pConv)) foundConverted++;
    else if (fs.existsSync(pPdr)) foundPdr++;
    else if (fs.existsSync(pOrig)) foundOrig++;
    else {
      notFound++;
      missingList.push({ id: r.id, url: u, cleanBase });
    }
  }
}

console.log('Results:');
console.log(`- Found in imagens_banco_geral: ${foundBg}`);
console.log(`- Found in imagens_convertidas_webp: ${foundConverted}`);
console.log(`- Found in imagens_provaderesidencia: ${foundPdr}`);
console.log(`- Found in imagens_medq_originais: ${foundOrig}`);
console.log(`- Not found: ${notFound}`);

if (notFound > 0) {
  console.log('Sample not found:', missingList.slice(0, 5));
}
