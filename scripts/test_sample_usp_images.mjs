import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`SELECT id, banca, year, images FROM questions_curated_staging WHERE images LIKE '%bxedpdmgvgatjdfxgxij.supabase.co%' AND banca = 'USP/HCFMUSP' LIMIT 5`).all();

console.log('Sample USP questions:');
for (const r of rows) {
  const imgs = JSON.parse(r.images);
  console.log(`- ${r.id} (${r.year}): ${imgs[0]}`);
}

