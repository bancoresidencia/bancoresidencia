import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const rows = stagingDb.prepare(`
  SELECT count(*) as c 
  FROM questions_curated_staging 
  WHERE images LIKE '%clean%' OR images LIKE '%higienizada%' OR images LIKE '%inpaint%'
`).get();

console.log('Total questions with clean/higienizada/inpaint:', rows.c);

// Also verify how many total questions have images
const totalWithImages = stagingDb.prepare(`
  SELECT count(*) as c 
  FROM questions_curated_staging 
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).get();
console.log('Total questions with images in staging:', totalWithImages.c);

const sanarCount = stagingDb.prepare(`
  SELECT count(*) as c 
  FROM questions_curated_staging 
  WHERE images LIKE '%_sanar.webp%'
`).get();
console.log('Total questions with authentic Sanar substitutions:', sanarCount.c);
