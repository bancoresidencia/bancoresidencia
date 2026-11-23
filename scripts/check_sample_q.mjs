import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const row = db.prepare('SELECT id, images FROM questions_curated_staging WHERE id = ?').get('questions_3cf66af5-bfd8-457a-afc0-c4e01f9fff8a');
console.log('Row in DB:');
console.log(JSON.stringify(row, null, 2));
