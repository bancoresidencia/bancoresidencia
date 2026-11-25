import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const sanarDb = new DatabaseSync('data/sanar_crawler.db');
const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

console.log('--- COLUMNS IN QUESTIONS TABLE OF SANAR ---');
const cols = sanarDb.prepare("PRAGMA table_info(questions)").all();
console.log(cols.map(c => c.name));

// Total distinct sanar_ids in question_images
const distQi = sanarDb.prepare('SELECT count(DISTINCT sanar_id) as c FROM question_images').get();
console.log('Distinct sanar_ids in question_images:', distQi.c);

// Check files in data/sanar_media/
if (fs.existsSync('data/sanar_media')) {
  const mediaSubdirs = fs.readdirSync('data/sanar_media');
  console.log('\n--- SANAR MEDIA SUBDIRS ---', mediaSubdirs);
  for (const sub of mediaSubdirs) {
    const p = `data/sanar_media/${sub}`;
    if (fs.statSync(p).isDirectory()) {
      const files = fs.readdirSync(p);
      console.log(`data/sanar_media/${sub}: ${files.length} files`);
    }
  }
}

// Now examine the 598 remaining watermarked questions
const catData = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const watermarkedList = catData.catalog || [];
console.log(`\n--- REMAINING WATERMARKED QUESTIONS: ${watermarkedList.length} ---`);

const bancaCounts = {};
for (const w of watermarkedList) {
  const row = stagingDb.prepare('SELECT banca, year FROM questions_curated_staging WHERE id = ?').get(w.id);
  const key = `${row?.banca || 'UNKNOWN'} (${row?.year || '?'})`;
  bancaCounts[key] = (bancaCounts[key] || 0) + 1;
}

const sortedBancas = Object.entries(bancaCounts).sort((a, b) => b[1] - a[1]);
console.log('Top bancas in remaining 598 watermarked:');
console.log(sortedBancas.slice(0, 20));

// Check if crawl_queue has any downloaded items or pending images
console.log('\n--- CRAWL_QUEUE STATUS ---');
const qStatus = sanarDb.prepare('SELECT status, count(*) as c FROM crawl_queue GROUP BY status').all();
console.log(qStatus);
