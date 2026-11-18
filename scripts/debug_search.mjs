import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/questions_golden_fts.db', { readOnly: true });

console.log('--- TEST 1: AND query ---');
const r1 = db.prepare('SELECT especialidade, tema, foco, subfoco, bm25(questions_fts) as rank FROM questions_fts WHERE questions_fts MATCH ? LIMIT 5').all('"comatosos" AND "estruturais" AND "metabolicas"');
console.log('Matches:', r1);

console.log('--- TEST 2: Clinical query ---');
const r2 = db.prepare('SELECT especialidade, tema, foco, subfoco, bm25(questions_fts) as rank FROM questions_fts WHERE questions_fts MATCH ? ORDER BY rank LIMIT 10').all('coma OR comatoso OR pupilar OR "reatividade pupilar"');
console.log('Matches:', r2.slice(0, 5));
