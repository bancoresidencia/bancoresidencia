import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const r = db.prepare("SELECT count(*) as c FROM questions_curated_staging WHERE commentary LIKE '%Take-Home%'").get();
console.log('Take-Home in questions_curated_staging:', r);

const r2 = db.prepare("SELECT count(*) as c FROM questions_curated_staging WHERE commentary LIKE '%Motivo%'").get();
console.log('Motivo in questions_curated_staging:', r2);

