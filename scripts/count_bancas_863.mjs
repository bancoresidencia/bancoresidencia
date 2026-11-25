import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = cat.catalog || cat;
const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const bancas = {};
for (const item of list) {
  const row = stagingDb.prepare('SELECT institution, year FROM questions_curated_staging WHERE id = ?').get(item.id);
  const key = row ? `${row.institution} (${row.year})` : `${item.banca} (${item.year})`;
  bancas[key] = (bancas[key] || 0) + 1;
}

const sorted = Object.entries(bancas).sort((a, b) => b[1] - a[1]);
console.log('Top 30 bancas remaining:');
sorted.slice(0, 30).forEach(([b, c]) => console.log(`  ${b.padEnd(45)}: ${c}`));
