import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rawCat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = Array.isArray(rawCat) ? rawCat : (rawCat.catalog || rawCat.items || []);

const unicamp = list.filter(q => (q.banca||'').includes('UNICAMP'));
console.log(`Total UNICAMP in catalog: ${unicamp.length}`);

for (const q of unicamp) {
  const row = db.prepare('SELECT id, year, numero_questao, statement, images FROM questions_curated_staging WHERE id = ?').get(q.id);
  console.log(`\nID: ${q.id} | Year: ${row?.year} | Q: ${row?.numero_questao}`);
  console.log(`Statement: ${row?.statement?.replace(/\s+/g, ' ').slice(0, 100)}...`);
  console.log(`Images: ${row?.images}`);
}
