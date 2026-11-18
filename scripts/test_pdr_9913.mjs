import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/questions_golden_fts.db', { readOnly: true });
const r = db.prepare("SELECT id, content FROM questions_fts WHERE foco = 'Rubéola Congênita e Adquirida' LIMIT 2").all();
console.log('Sample 1:', r[0].content.slice(0, 300));
console.log('Sample 2:', r[1]?.content.slice(0, 300));
