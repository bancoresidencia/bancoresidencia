import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

// Vamos ver as tabelas e o número de linhas
const tables = [
  'questions_curated_staging',
  'questions',
  'questions_expansion_direto',
  'supabase_live_questions'
];

for (const t of tables) {
  try {
    const total = db.prepare(`SELECT count(*) as c FROM "${t}"`).get().c;
    const cols = db.prepare(`PRAGMA table_info("${t}")`).all().map(c => c.name);
    console.log(`Tabela ${t}: ${total} linhas. Colunas:`, cols.slice(0, 10).join(', '));
  } catch (e) {
    console.log(`Erro em ${t}:`, e.message);
  }
}

