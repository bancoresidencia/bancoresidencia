import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`SELECT id, banca, year, images FROM questions_curated_staging WHERE images LIKE '%api.medevo.com.br%' LIMIT 10`).all();

for (const r of rows) {
  const imgs = JSON.parse(r.images);
  console.log(`${r.id} | ${r.banca} (${r.year}) | ${imgs[0]}`);
}

