import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/sanar_crawler.db');

const rows = db.prepare(`
  SELECT instituicao, count(*) as count
  FROM questions
  GROUP BY instituicao
  ORDER BY count DESC
  LIMIT 30
`).all();

console.log('Top institutions in sanar_crawler.db:');
console.log(JSON.stringify(rows, null, 2));
