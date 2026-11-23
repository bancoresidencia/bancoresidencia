import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/sanar_crawler.db');

const cols = db.prepare("PRAGMA table_info('question_images')").all();
console.log('Columns in question_images:', cols);

const sample = db.prepare("SELECT * FROM question_images LIMIT 5").all();
console.log('\nSample question_images rows:');
console.log(JSON.stringify(sample, null, 2));
