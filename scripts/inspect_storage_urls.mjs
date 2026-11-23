import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`
  SELECT id, images, source_tables
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const prefixes = {};
let totalStorage = 0;
const sampleByPrefix = {};

for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  for (const img of imgs) {
    if (typeof img !== 'string') continue;
    if (img.startsWith('/storage/questoes/')) {
      totalStorage++;
      const parts = img.split('/');
      const prefix = parts.slice(0, 4).join('/');
      prefixes[prefix] = (prefixes[prefix] || 0) + 1;
      if (!sampleByPrefix[prefix]) {
        sampleByPrefix[prefix] = { qId: r.id, url: img };
      }
    }
  }
}

console.log('Total /storage/questoes/ URLs:', totalStorage);
console.log('Breakdown by prefix:');
console.log(JSON.stringify(prefixes, null, 2));
console.log('Samples:');
console.log(JSON.stringify(sampleByPrefix, null, 2));
