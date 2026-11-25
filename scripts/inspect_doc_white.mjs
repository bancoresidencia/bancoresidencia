import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rawCat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = Array.isArray(rawCat) ? rawCat : (rawCat.catalog || rawCat.items || []);

const docWhite = list.filter(q => (q.reason || '').includes('Documento em fundo branco com carimbo cinza central'));
console.log(`Total "Documento em fundo branco com carimbo cinza central": ${docWhite.length}`);

for (const q of docWhite.slice(0, 15)) {
  const row = db.prepare('SELECT id, banca, year, numero_questao, statement, images FROM questions_curated_staging WHERE id = ?').get(q.id);
  console.log(`\nID: ${q.id} | ${row?.banca} (${row?.year}) | Q: ${row?.numero_questao}`);
  console.log(`Reason: ${q.reason}`);
  console.log(`Image URL: ${q.image_url}`);
  console.log(`Statement: ${row?.statement?.replace(/\s+/g, ' ').slice(0, 90)}...`);
}
