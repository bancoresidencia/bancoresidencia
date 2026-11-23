import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/sanar_crawler.db');
const tables = db.prepare("SELECT name, sql FROM sqlite_master WHERE type='table'").all();
console.log('Tables in sanar_crawler.db:');
for (const t of tables) {
  console.log(`\nTable: ${t.name}`);
  console.log(t.sql);
}
