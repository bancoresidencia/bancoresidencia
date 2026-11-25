import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rawCat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = Array.isArray(rawCat) ? rawCat : (rawCat.catalog || rawCat.items || []);
const catIds = new Set(list.map(x => x.id));

const rows = db.prepare(`
  SELECT id, banca, year, numero_questao, statement, images
  FROM questions_curated_staging
  WHERE banca IN ('HCOR', 'HVC-SP', 'HPEV')
  ORDER BY banca, year, id
`).all();

const inCatalog = rows.filter(r => catIds.has(r.id));
console.log(`Total questions in HCOR, HVC-SP, HPEV: ${rows.length}, of which ${inCatalog.length} are in medq catalog:`);

for (const r of inCatalog) {
  let imgs = [];
  try { imgs = JSON.parse(r.images); } catch { imgs = [r.images]; }
  console.log(`\nID: ${r.id} | ${r.banca} (${r.year}) | Q: ${r.numero_questao}`);
  console.log(`Statement: ${r.statement?.replace(/\s+/g, ' ').slice(0, 110)}...`);
  console.log(`Images: ${JSON.stringify(imgs)}`);
}
