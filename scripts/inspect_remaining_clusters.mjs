import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8')).catalog || [];

console.log('Total in catalog:', cat.length);

const uspItems = cat.filter(c => c.banca && c.banca.includes('USP/HCFMUSP'));
console.log('Total remaining USP/HCFMUSP:', uspItems.length);

const years = {};
for (const item of uspItems) {
  const row = db.prepare('SELECT id, year, statement FROM questions_curated_staging WHERE id = ?').get(item.id);
  if (row) {
    years[row.year] = (years[row.year] || 0) + 1;
  }
}
console.log('USP/HCFMUSP by year:', years);

for (let i = 0; i < Math.min(8, uspItems.length); i++) {
  const row = db.prepare('SELECT id, year, statement FROM questions_curated_staging WHERE id = ?').get(uspItems[i].id);
  console.log(`[${row.year}] (${row.id}): ${row.statement.substring(0, 110).replace(/\n/g, ' ')}`);
}
