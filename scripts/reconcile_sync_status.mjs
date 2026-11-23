import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const SYNC_STATUS_PATH = path.resolve('data/supabase_tables/supabase_sync_status.json');
const db = new DatabaseSync(DB_PATH);

let syncStatus = { synced_questions: {}, synced_images: {} };
if (fs.existsSync(SYNC_STATUS_PATH)) {
  syncStatus = JSON.parse(fs.readFileSync(SYNC_STATUS_PATH, 'utf8'));
}

const rows = db.prepare(`
  SELECT id, images, source_tables
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

console.log(`Total questions in staging with images: ${rows.length}`);
console.log(`Currently indexed in syncStatus.synced_questions: ${Object.keys(syncStatus.synced_questions).length}`);

let newlyAdded = 0;
for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  if (!Array.isArray(imgs) || imgs.length === 0) continue;

  const hasSupabase = imgs.some(u => typeof u === 'string' && u.includes('supabase.co/storage/v1/object/public/questoes/'));
  if (hasSupabase && !syncStatus.synced_questions[r.id]) {
    let sourceTable = 'questions';
    try {
      const parsed = JSON.parse(r.source_tables || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) sourceTable = parsed[0];
    } catch {}

    syncStatus.synced_questions[r.id] = {
      public_urls: imgs,
      synced_at: new Date().toISOString(),
      remote_table: sourceTable,
      remote_updated: true
    };
    newlyAdded++;
  }
}

console.log(`Newly indexed questions that were already on Supabase: ${newlyAdded}`);
console.log(`New total synced questions: ${Object.keys(syncStatus.synced_questions).length}`);

syncStatus.updated_at = new Date().toISOString();
fs.writeFileSync(SYNC_STATUS_PATH, JSON.stringify(syncStatus, null, 2), 'utf8');
console.log('Saved updated syncStatus.json successfully!');
