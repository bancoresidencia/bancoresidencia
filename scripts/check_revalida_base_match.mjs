import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const p = 'data/backups/supabase_backup_2026-11-13T02-27-33-296Z/tables/questions_revalida_base.json';
const revalidaBase = JSON.parse(fs.readFileSync(p, 'utf8'));
console.log('Total in questions_revalida_base.json:', revalidaBase.length);

const sample = revalidaBase.find(q => q.id === '000338fe-1ad7-4351-83b6-d903fdf8d376');
console.log('Sample statement:', sample?.statement?.slice(0, 100));

// Check if statement exists in questions_curated_staging
if (sample?.statement) {
  const match = db.prepare('SELECT id, modalidade FROM questions_curated_staging WHERE statement LIKE ?').get(sample.statement.slice(0, 50) + '%');
  console.log('Match in questions_curated_staging by statement:', match);
}

// Check how many of revalidaBase match statement in questions_curated_staging
let statementMatches = 0;
const stmtCheck = db.prepare('SELECT id, modalidade FROM questions_curated_staging WHERE statement = ? LIMIT 1');
for (const q of revalidaBase) {
  if (q.statement) {
    const m = stmtCheck.get(q.statement);
    if (m) statementMatches++;
  }
}
console.log(`Of ${revalidaBase.length} questions in questions_revalida_base, ${statementMatches} match exact statement in questions_curated_staging.`);

