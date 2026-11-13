import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve('data/questoes_132k.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

const withAns = db.prepare("SELECT count(*) as count FROM questions WHERE correct_answer IS NOT NULL AND correct_answer != ''").get().count;
const withoutAns = db.prepare("SELECT count(*) as count FROM questions WHERE correct_answer IS NULL OR correct_answer = ''").get().count;

console.log(`questoes_132k.db: With answer = ${withAns}, Without answer = ${withoutAns}`);

