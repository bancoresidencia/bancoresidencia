import Database from 'better-sqlite3';
import fs from 'fs';

const dbs = ['data/provaderesidencia_coleta_parte2.db', 'data/supabase_tables.db', 'data/curated_questions.db'];
for (const dbPath of dbs) {
  if (fs.existsSync(dbPath)) {
    try {
      const db = new Database(dbPath);
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      console.log(dbPath, tables.map(t => t.name));
      for (const t of tables) {
        try {
          const row = db.prepare(`SELECT * FROM ${t.name} WHERE code LIKE 'HMG-2026%' LIMIT 1`).get();
          if (row) {
            console.log(`Found in ${dbPath} -> table ${t.name}!`);
            console.log(Object.keys(row));
            console.log('Sample:', { code: row.code, banca: row.banca, correct_answer: row.correct_answer });
          }
        } catch(e) {}
      }
    } catch(err) {
      console.log('Error opening', dbPath, err.message);
    }
  }
}

