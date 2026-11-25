import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8')).catalog || [];

const usp2026 = [];
for (const item of cat) {
  const row = db.prepare('SELECT id, year, banca, statement FROM questions_curated_staging WHERE id = ?').get(item.id);
  if (row && row.year === 2026 && (row.banca || '').includes('USP')) {
    usp2026.push(row);
  }
}

console.log(`Remaining USP 2026 questions in catalog: ${usp2026.length}`);
for (const q of usp2026) {
  console.log(`[${q.id}] ${q.statement.substring(0, 100).replace(/\n/g, ' ')}...`);
}
