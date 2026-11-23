import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/sanar_crawler.db');

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in sanar_crawler.db:', tables);

for (const t of tables) {
  try {
    const count = db.prepare(`SELECT count(*) as c FROM "${t.name}"`).get();
    console.log(`Table ${t.name}: ${count.c} rows`);
  } catch (e) {
    console.log(`Table ${t.name}: error (${e.message})`);
  }
}

// Sample questions with images in sanar_crawler.db
try {
  const sample = db.prepare(`
    SELECT sanar_id, instituicao, ano, substr(enunciado_texto, 1, 80) as snippet, url
    FROM questions
    LIMIT 5
  `).all();
  console.log('\nSample questions in sanar_crawler.db:');
  console.log(JSON.stringify(sample, null, 2));
} catch (e) {
  console.log('Error querying questions:', e.message);
}
