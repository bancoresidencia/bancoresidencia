import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath);

console.log('='.repeat(80));
console.log('🔍 VERIFICAÇÃO DE INTEGRIDADE PÓS-GATE 1 & 2');
console.log('='.repeat(80));

const rows = db.prepare(`
  SELECT id, images, options
  FROM questions_curated_staging
  WHERE (images IS NOT NULL AND images != '[]' AND images != '')
     OR (options LIKE '%http%')
`).all();

let countWebp = 0;
let countLegacy = 0;
const legacySamples = [];

for (const r of rows) {
  let list = [];
  try {
    list = JSON.parse(r.images || '[]');
    if (!Array.isArray(list)) list = [r.images];
  } catch {
    if (r.images && r.images.startsWith('http')) list = [r.images];
  }

  for (const u of list) {
    if (typeof u !== 'string') continue;
    const clean = u.split('?')[0].toLowerCase();
    if (clean.endsWith('.webp')) {
      countWebp++;
    } else {
      countLegacy++;
      if (legacySamples.length < 10) {
        legacySamples.push({ id: r.id, url: u });
      }
    }
  }
}

console.log(`Imagens em WebP na coluna images: ${countWebp.toLocaleString('pt-BR')}`);
console.log(`Imagens em formato legado na coluna images: ${countLegacy}`);
if (legacySamples.length > 0) {
  console.log('Amostras legadas restantes:', legacySamples);
} else {
  console.log('🎉 100% DAS IMAGENS DA COLUNA IMAGES AGORA ESTÃO EM WEBP!');
}

