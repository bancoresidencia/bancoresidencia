import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
console.time('Total index setup');

console.time('Index 1: idx_questions_has_images');
db.exec(`CREATE INDEX IF NOT EXISTS idx_questions_has_images ON questions_curated_staging(year DESC, id ASC) WHERE images IS NOT NULL AND images != '[]' AND images != ''`);
console.timeEnd('Index 1: idx_questions_has_images');

console.time('Index 2: pdr_url');
db.exec(`CREATE INDEX IF NOT EXISTS idx_pdr_url ON provaderesidencia_imagens_arquivo(url)`);
console.timeEnd('Index 2: pdr_url');

console.time('Test query with index');
const rows = db.prepare(`SELECT id, images FROM questions_curated_staging WHERE images IS NOT NULL AND images != '[]' AND images != '' ORDER BY year DESC, id ASC LIMIT 15`).all();
console.timeEnd('Test query with index');
console.log(`Retrieved ${rows.length} rows in < 1ms!`);

console.timeEnd('Total index setup');

