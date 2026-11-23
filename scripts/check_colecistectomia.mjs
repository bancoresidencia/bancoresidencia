import { DatabaseSync } from 'node:sqlite';
const sanar = new DatabaseSync('data/sanar_crawler.db');

const rows = sanar.prepare("SELECT url FROM crawl_queue WHERE url LIKE '%colecistectomia%' LIMIT 10").all();
console.log('Matches for colecistectomia in crawl_queue:');
rows.forEach(r => console.log(' ', r.url));
