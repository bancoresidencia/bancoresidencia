import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const db = new DatabaseSync(path.resolve('data/supabase_tables/supabase_tables.db'), { readOnly: true });
const row = db.prepare(`SELECT code, statement, options, correct_answer, commentary, especialidade, tema FROM questions_curated_staging WHERE code = 'UNIVERSIDADE-2018-MPS-0371'`).get();
console.log('Found question in SQLite:', row ? {
  code: row.code,
  correct_answer: row.correct_answer,
  has_commentary: !!row.commentary,
  commentary_len: row.commentary ? row.commentary.length : 0
} : 'Not found');
