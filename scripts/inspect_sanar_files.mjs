import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

console.log('sanar_crawler.db size:', (fs.statSync('data/sanar_crawler.db').size / (1024*1024)).toFixed(1) + ' MB');
if (fs.existsSync('data/sanar_questions_export.json')) {
  console.log('sanar_questions_export.json size:', (fs.statSync('data/sanar_questions_export.json').size / (1024*1024)).toFixed(1) + ' MB');
}

const db = new DatabaseSync('data/sanar_crawler.db');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in sanar_crawler.db:', tables);
for (const t of tables) {
  const count = db.prepare('SELECT count(*) as c FROM ' + t.name).get().c;
  console.log('Table', t.name, 'row count:', count);
}
