import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = stagingDb.prepare(`
  SELECT count(*) as c 
  FROM questions_curated_staging 
  WHERE images LIKE '%_clean.webp%' OR images LIKE '%clean_%' OR images LIKE '%higienizada%'
`).get();
console.log('Remaining questions with clean/higienizada in DB:', rows.c);

const sanarCount = stagingDb.prepare(`
  SELECT count(*) as c 
  FROM questions_curated_staging 
  WHERE images LIKE '%_sanar.webp%'
`).get();
console.log('Total questions with authentic Sanar images:', sanarCount.c);
