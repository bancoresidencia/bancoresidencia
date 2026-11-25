import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8')).catalog || [];

const usp = cat.filter(c => c.banca && c.banca.includes('USP/HCFMUSP')).slice(0, 10);

console.log('Inspecting 10 remaining USP/HCFMUSP questions:');
for (const item of usp) {
  const row = db.prepare('SELECT id, year, statement, images FROM questions_curated_staging WHERE id = ?').get(item.id);
  console.log(`\nID: ${row.id} | Year: ${row.year}`);
  console.log(`Statement: ${row.statement.substring(0, 120).replace(/\n/g, ' ')}...`);
  console.log(`Images: ${row.images}`);
}
