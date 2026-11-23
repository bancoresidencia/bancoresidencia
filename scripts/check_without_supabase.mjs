import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`
  SELECT id, images, source_tables
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const withoutSupabase = [];

for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  const hasSupabase = imgs.some(u => typeof u === 'string' && u.includes('supabase.co'));
  if (!hasSupabase) {
    withoutSupabase.push({ id: r.id, images: imgs, source_tables: r.source_tables });
  }
}

console.log(`Total questions without Supabase URL: ${withoutSupabase.length}`);

// Group by image path prefix
const prefixes = {};
for (const q of withoutSupabase) {
  for (const img of q.images) {
    const prefix = typeof img === 'string' ? img.split('/').slice(0, 4).join('/') : 'other';
    prefixes[prefix] = (prefixes[prefix] || 0) + 1;
  }
}
console.log('Breakdown by prefix:');
console.log(JSON.stringify(prefixes, null, 2));

console.log('Sample without Supabase (first 10):');
console.log(JSON.stringify(withoutSupabase.slice(0, 10), null, 2));
