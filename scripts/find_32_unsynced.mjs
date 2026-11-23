import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const SYNC_STATUS_PATH = path.resolve('data/supabase_tables/supabase_sync_status.json');
const MEDQ_CATALOG_PATH = path.resolve('data/supabase_tables/medq_watermark_catalog.json');

const db = new DatabaseSync(DB_PATH);

let syncStatus = { synced_questions: {}, synced_images: {} };
if (fs.existsSync(SYNC_STATUS_PATH)) {
  syncStatus = JSON.parse(fs.readFileSync(SYNC_STATUS_PATH, 'utf8'));
}

const medqWatermarkSet = new Set();
if (fs.existsSync(MEDQ_CATALOG_PATH)) {
  const cat = JSON.parse(fs.readFileSync(MEDQ_CATALOG_PATH, 'utf8')).catalog || [];
  cat.forEach(i => medqWatermarkSet.add(i.id));
}
medqWatermarkSet.add('questions_66a08e3e-6c58-41bd-8375-c97250110c13');

const rows = db.prepare(`
  SELECT id, institution, year, statement, images, source_tables
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const unsynced32 = [];

for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  if (!Array.isArray(imgs) || imgs.length === 0) continue;

  const hasWatermark = medqWatermarkSet.has(r.id) || imgs.some(u => typeof u === 'string' && u.includes('imagens_medq_originais'));
  if (hasWatermark) continue;

  const isAlreadySynced = Boolean(syncStatus.synced_questions[r.id] || imgs.some(u => typeof u === 'string' && u.includes('supabase.co/storage/v1/object/public/questoes/')));
  if (!isAlreadySynced) {
    unsynced32.push({
      id: r.id,
      institution: r.institution,
      year: r.year,
      statement: r.statement ? r.statement.substring(0, 80) : '',
      images: imgs,
      source_tables: r.source_tables
    });
  }
}

console.log(`Exact unsynced clean questions count: ${unsynced32.length}`);
console.log(JSON.stringify(unsynced32, null, 2));

fs.writeFileSync('data/unsynced_clean_32.json', JSON.stringify(unsynced32, null, 2), 'utf8');
