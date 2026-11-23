import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/sanar_crawler.db');

const rows = db.prepare(`
  SELECT count(*) as count
  FROM questions
  WHERE enunciado_original LIKE '%<img%'
`).get();

console.log('Sanar questions with <img> in enunciado_original:', rows.count);

// Sample
const sample = db.prepare(`
  SELECT sanar_id, instituicao, ano, substr(enunciado_original, 1, 150) as snippet
  FROM questions
  WHERE enunciado_original LIKE '%<img%'
  LIMIT 5
`).all();

console.log('\nSample:', JSON.stringify(sample, null, 2));
