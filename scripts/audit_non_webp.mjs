import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath);

console.log('--- ANÁLISE DE IMAGENS NÃO-WEBP QUE NÃO SÃO PDRES.S3 ---');

const rows = db.prepare(`
  SELECT id, images, statement
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]'
`).all();

const nonPdrNonWebp = [];

for (const r of rows) {
  let list = [];
  try {
    list = JSON.parse(r.images);
  } catch {
    if (r.images.startsWith('http')) list = [r.images];
  }
  if (!Array.isArray(list)) list = [list];

  for (const url of list) {
    if (typeof url !== 'string') continue;
    const clean = url.split('?')[0].toLowerCase();
    if (!clean.endsWith('.webp')) {
      if (!clean.includes('pdres.s3.amazonaws.com')) {
        nonPdrNonWebp.push({ id: r.id, url });
      }
    }
  }
}

console.log(`Total de URLs não-WebP fora do pdres: ${nonPdrNonWebp.length}`);
const domains = {};
const exts = {};
for (const item of nonPdrNonWebp) {
  try {
    const dom = new URL(item.url).hostname;
    domains[dom] = (domains[dom] || 0) + 1;
  } catch {
    domains['invalido'] = (domains['invalido'] || 0) + 1;
  }
  const clean = item.url.split('?')[0].toLowerCase();
  const ext = clean.split('.').pop();
  exts[ext] = (exts[ext] || 0) + 1;
}

console.log('Domínios dos não-WebP restantes:', domains);
console.log('Extensões dos não-WebP restantes:', exts);
console.log('\nAmostra de 10 URLs não-WebP restantes:');
console.log(nonPdrNonWebp.slice(0, 10));

