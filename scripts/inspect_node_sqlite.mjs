import { DatabaseSync } from 'node:sqlite';

try {
  const db = new DatabaseSync('data/questoes_132k.db');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tables in questoes_132k.db:', tables);
  for (const t of tables) {
    const count = db.prepare(`SELECT count(*) as cnt FROM ${t.name}`).get();
    console.log(`Table ${t.name}: ${count.cnt} rows`);
    const info = db.prepare(`PRAGMA table_info(${t.name})`).all();
    console.log(`  Columns:`, info.map(c => c.name).join(', '));
  }
} catch (e) {
  console.error('Error with DatabaseSync:', e.message);
}
