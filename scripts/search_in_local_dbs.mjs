import fs from 'fs';
import Database from 'better-sqlite3';

function searchInDbs(term) {
  const dbs = ['provaderesidencia_coleta_parte2.db', 'supabase_tables.db', 'banco_questoes.db'];
  for (const dbName of dbs) {
    if (!fs.existsSync(dbName)) continue;
    try {
      const db = new Database(dbName, { readonly: true });
      // find tables
      const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
      for (const t of tables) {
        try {
          const rows = db.prepare(`SELECT * FROM "${t.name}" WHERE statement LIKE ? LIMIT 5`).all(`%${term}%`);
          if (rows.length > 0) {
            console.log(`FOUND ${rows.length} rows in ${dbName} -> table ${t.name}!`);
            rows.forEach(r => console.log('  ->', r.code, r.institution, r.year, r.correct_answer || r.gabarito));
          }
        } catch (e) {}
      }
      db.close();
    } catch (e) {
      console.error(`Error opening ${dbName}:`, e.message);
    }
  }
}

searchInDbs('tiroteio');
searchInDbs('8.142/1990');
