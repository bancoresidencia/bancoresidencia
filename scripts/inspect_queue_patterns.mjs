import { DatabaseSync } from 'node:sqlite';
const sanarDb = new DatabaseSync('data/sanar_crawler.db');

const rows = sanarDb.prepare("SELECT url FROM crawl_queue WHERE stage = 'question' LIMIT 30").all();
console.log('Sample 30 crawl_queue URLs:');
rows.forEach(r => console.log(r.url));
