import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const questions322 = JSON.parse(fs.readFileSync('data/broken_questions_list.json', 'utf8'));
const syncStatus = JSON.parse(fs.readFileSync('data/supabase_tables/supabase_sync_status.json', 'utf8'));

let alreadyHasSupabase = 0;
let alreadyInSyncStatus = 0;
let inQueue = 0;
let other = 0;

const queue = JSON.parse(fs.readFileSync('data/clean_unsynced_queue.json', 'utf8'));
const queueSet = new Set(queue.map(q => q.id));

for (const q of questions322) {
  const row = db.prepare('SELECT images FROM questions_curated_staging WHERE id = ?').get(q.id);
  const imgs = JSON.parse(row.images || '[]');
  const hasSupabase = imgs.some(u => typeof u === 'string' && u.includes('supabase.co'));
  const inSync = Boolean(syncStatus.synced_questions[q.id]);

  if (queueSet.has(q.id)) {
    inQueue++;
  } else if (hasSupabase) {
    alreadyHasSupabase++;
  } else if (inSync) {
    alreadyInSyncStatus++;
  } else {
    other++;
  }
}

console.log(`Of the 322 previously "broken" questions:`);
console.log(`  In unsynced queue to process: ${inQueue}`);
console.log(`  Already has Supabase URL in DB: ${alreadyHasSupabase}`);
console.log(`  Already in syncStatus: ${alreadyInSyncStatus}`);
console.log(`  Other: ${other}`);
