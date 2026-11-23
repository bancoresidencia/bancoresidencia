import Database from 'better-sqlite3';

const db = new Database('supabase_tables.db');
const rows = db.prepare(`
  SELECT id, institution, year, especialidade, tema, statement, options, correct_answer, commentary
  FROM questions_curated_staging
  WHERE LOWER(especialidade) LIKE '%gineco%'
    AND (LOWER(statement) LIKE '%sangramento%' OR LOWER(tema) LIKE '%sangramento%' OR LOWER(statement) LIKE '%sua%')
    AND commentary IS NOT NULL AND length(commentary) > 250
  LIMIT 5
`).all();

console.log('Found rows:', rows.length);
rows.forEach((r, idx) => {
  console.log(`\n--- [${idx}] ID: ${r.id} | Year: ${r.year} | Inst: ${r.institution} ---`);
  console.log('Statement preview:', r.statement.slice(0, 150));
  console.log('Correct Answer:', r.correct_answer);
  console.log('Commentary preview:', r.commentary.slice(0, 150));
});
