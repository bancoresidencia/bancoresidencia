import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/sanar_crawler.db');

const count = db.prepare('SELECT count(*) as c FROM questions').get();
const queueCount = db.prepare('SELECT count(*) as c FROM crawl_queue').get();
console.log('Sanar DB total questions in questions table:', count.c);
console.log('Sanar DB total items in crawl_queue:', queueCount.c);
