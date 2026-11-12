import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const remStmt = db.prepare(`SELECT count(id) as c FROM questions_curated_staging WHERE images LIKE '%http%'`).get().c;
const remOpt = db.prepare(`SELECT count(id) as c FROM questions_curated_staging WHERE options LIKE '%http%'`).get().c;
const locStmt = db.prepare(`SELECT count(id) as c FROM questions_curated_staging WHERE images LIKE '%/storage/questoes/%'`).get().c;
console.log({ remStmt, remOpt, locStmt });
