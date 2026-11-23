import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/sanar_crawler.db');
const years = db.prepare("SELECT ano, COUNT(*) as c FROM questions WHERE instituicao LIKE '%UNIFESP%' GROUP BY ano ORDER BY ano DESC").all();
console.log('UNIFESP questions by year in our DB:');
console.log(years);

const total = db.prepare("SELECT COUNT(*) as c FROM questions WHERE instituicao LIKE '%UNIFESP%'").get();
console.log('Total UNIFESP in DB:', total.c);
