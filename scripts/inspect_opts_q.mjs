import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

const rows = db.prepare(`
  SELECT id, images, options
  FROM questions_curated_staging
  WHERE options LIKE '%http%'
  LIMIT 5
`).all();

console.log('--- 5 QUESTÕES COM OPÇÕES COM HTTP ---');
for (const r of rows) {
  console.log(`ID: ${r.id}`);
  console.log(`Images: ${r.images}`);
  const opts = JSON.parse(r.options || '[]');
  console.log(`Options texts:`, opts.map(o => o.text.slice(0, 60)));
}

