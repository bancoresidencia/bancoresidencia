import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve('data/questoes_132k.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
console.log('Tables in questoes_132k.db:');
for (const t of tables) {
  const count = db.prepare(`SELECT count(*) as count FROM ${t.name}`).get().count;
  console.log(`- ${t.name}: ${count} rows`);
}

// Columns in first table
if (tables.length > 0) {
  const firstTable = tables[0].name;
  const sample = db.prepare(`SELECT * FROM ${firstTable} LIMIT 1`).get();
  console.log(`Columns in ${firstTable}:`, Object.keys(sample));
}

