import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`
  SELECT id, code, merged_from_ids, source_tables 
  FROM questions_curated_staging 
  LIMIT 20
`).all();

console.log(JSON.stringify(rows, null, 2));

const prefixCount = db.prepare(`
  SELECT 
    CASE 
      WHEN id LIKE 'pdr_%' THEN 'pdr_...'
      WHEN id LIKE '%-%-%-%-%' THEN 'uuid'
      ELSE 'other'
    END as id_type,
    count(*) as c
  FROM questions_curated_staging
  GROUP BY id_type
`).all();

console.log('\nID Types in questions_curated_staging:');
console.log(JSON.stringify(prefixCount, null, 2));

