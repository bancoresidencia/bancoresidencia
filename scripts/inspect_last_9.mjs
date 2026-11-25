import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = stagingDb.prepare(`
  SELECT id, institution, year, images 
  FROM questions_curated_staging 
  WHERE images LIKE '%_clean.webp%' OR images LIKE '%clean_%' OR images LIKE '%higienizada%'
`).all();

console.log(`Found ${rows.length} remaining questions:`);
for (const r of rows) {
  console.log(`- ${r.id} (${r.institution} ${r.year}): ${r.images}`);
}
