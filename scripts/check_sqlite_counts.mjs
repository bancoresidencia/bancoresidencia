import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const tables = [
  'questions',
  'questions_expansion_direto',
  'questions_expansion_r_plus',
  'questions_expansion_revalida',
  'questions_expansion_titulo_especialista',
  'provaderesidencia_questoes',
  'questions_curated_staging'
];

for (const t of tables) {
  try {
    const r = db.prepare(`SELECT count(*) as count FROM "${t}"`).get();
    console.log(`${t.padEnd(45)}: ${r.count}`);
  } catch (e) {
    console.log(`${t.padEnd(45)}: error (${e.message})`);
  }
}

