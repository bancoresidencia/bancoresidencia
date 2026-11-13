import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const dbPath = 'data/supabase_tables/supabase_tables.db';
if (fs.existsSync(dbPath)) {
  const db = new DatabaseSync(dbPath);
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tabelas em supabase_tables.db:', tables.map(t => t.name));
  
  for (const t of tables) {
    const count = db.prepare(`SELECT count(*) as c FROM "${t.name}"`).get();
    console.log(` - ${t.name}: ${count.c} linhas`);
  }
} else {
  console.log('Banco local não encontrado');
}

