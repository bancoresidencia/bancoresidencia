import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(JSON.stringify(tables, null, 2));

