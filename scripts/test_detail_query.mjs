import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

function getQuestionDetail(code) {
  try {
    const row = db.prepare(`SELECT code, statement, options, correct_answer, commentary, especialidade, tema, institution, year FROM questions_curated_staging WHERE code = ?`).get(code);
    if (!row) return null;
    let options = row.options;
    if (typeof options === 'string') {
      try { options = JSON.parse(options); } catch {}
    }
    return {
      code: row.code,
      statement: row.statement,
      options,
      correct_answer: row.correct_answer,
      commentary: row.commentary,
      especialidade: row.especialidade,
      tema: row.tema,
      institution: row.institution,
      year: row.year
    };
  } catch (e) {
    return { error: e.message };
  }
}

console.log(getQuestionDetail('UNIVERSIDADE-2018-MPS-0371'));
