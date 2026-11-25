import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rawCat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = Array.isArray(rawCat) ? rawCat : (rawCat.catalog || rawCat.items || []);

const hvc = list.filter(q => (q.banca||'').includes('HVC'));
console.log(`HVC in catalog: ${hvc.length}`);

for (const q of hvc) {
  const r = db.prepare('SELECT id, code, year, numero_questao, statement FROM questions_curated_staging WHERE id = ?').get(q.id);
  console.log(`[${r.id}] Code: ${r.code} | Year: ${r.year} | Q: ${r.numero_questao}`);
  console.log(`Statement: ${r.statement?.replace(/\s+/g, ' ').slice(0, 100)}...`);
}
