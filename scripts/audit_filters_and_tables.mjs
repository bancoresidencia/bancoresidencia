import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables.db', { readOnly: true });

console.log('=== 1. TABELAS PRESENTES NO SQLITE LOCAL ===');
const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log(tables.map(t => t.name));

const targetTables = ['questions_direto', 'questions_revalida', 'questions_rplus', 'questions_titulo', 'questions_curated_staging'];

for (const t of targetTables) {
  try {
    const total = db.prepare(`SELECT count(*) as c FROM ${t}`).get().c;
    console.log(`\nTabela: ${t} -> Total: ${total}`);
    
    // Check columns
    const cols = db.prepare(`PRAGMA table_info(${t})`).all().map(c => c.name);
    console.log(`  Colunas: ${cols.join(', ')}`);
  } catch (e) {
    console.log(`\nTabela ${t} NÃO encontrada: ${e.message}`);
  }
}

