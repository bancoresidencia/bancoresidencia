import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const q = db.prepare('SELECT id, statement, options, correct_answer, images, institution, year FROM questions_curated_staging WHERE id = ?').get('questions_2fb64af1-6c05-4102-8593-06c8921e5606');
console.log(JSON.stringify(q, null, 2));
