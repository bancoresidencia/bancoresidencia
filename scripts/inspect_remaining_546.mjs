import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = cat.catalog || [];

console.log(`Remaining in catalog: ${list.length}`);

const map = new Map();
for (const item of list) {
  const q = stagingDb.prepare('SELECT id, banca, year, statement FROM questions_curated_staging WHERE id = ?').get(item.id);
  const key = `${q?.banca || 'UNKNOWN'} | ${q?.year || '?'}`;
  map.set(key, (map.get(key) || 0) + 1);
}

const sorted = [...map.entries()].sort((a,b) => b[1] - a[1]);
console.log('Top 25 banca/year combos in remaining 546:');
for (const [k, v] of sorted.slice(0, 25)) {
  console.log(`  ${k}: ${v} questões`);
}
