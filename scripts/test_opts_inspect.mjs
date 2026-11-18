import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db', { readOnly: true });
const row = db.prepare(`SELECT code, options, commentary FROM questions_curated_staging WHERE code = 'UNIVERSIDADE-2018-MPS-0371'`).get();
if (row) {
  console.log('Code:', row.code);
  let opts = row.options;
  if (typeof opts === 'string') opts = JSON.parse(opts);
  console.log('Options:', opts);
} else {
  console.log('Row not found');
}
