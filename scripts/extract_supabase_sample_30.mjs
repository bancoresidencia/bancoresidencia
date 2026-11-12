import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`SELECT id, banca, year, images FROM questions_curated_staging WHERE images LIKE '%bxedpdmgvgatjdfxgxij.supabase.co%' AND year >= 2022 LIMIT 30`).all();

const list = [];
for (const r of rows) {
  try {
    const imgs = JSON.parse(r.images);
    list.push({ id: r.id, year: r.year, banca: r.banca, url: imgs[0] });
  } catch {}
}

fs.writeFileSync('data/test_supabase_sample_30.json', JSON.stringify(list, null, 2));
console.log('Saved 30 sample URLs');

