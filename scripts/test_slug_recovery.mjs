import { DatabaseSync } from 'node:sqlite';

const staging = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const sanar = new DatabaseSync('data/sanar_crawler.db');

const row = staging.prepare('SELECT id, statement, images FROM questions_curated_staging WHERE id = ?').get('questions_2fb64af1-6c05-4102-8593-06c8921e5606');
console.log('Staging row statement:', row ? row.statement.substring(0, 100) : 'NOT_FOUND');

const queueRow = sanar.prepare("SELECT url FROM crawl_queue WHERE url LIKE '%colecistectomia-pos-pancreatite%' LIMIT 1").get();
console.log('Queue match:', queueRow);
