import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/sanar_crawler.db');

const count = db.prepare('SELECT count(*) as c FROM question_images').get();
console.log('Total in question_images:', count.c);

const sample = db.prepare('SELECT * FROM question_images LIMIT 5').all();
console.log('Sample question_images rows:');
sample.forEach(s => console.log(s));
