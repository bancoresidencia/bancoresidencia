import sqlite3 from 'sqlite3';

const db = new sqlite3.Database('data/questoes_132k.db');

db.all("SELECT name FROM sqlite_master WHERE type='table'", (err, tables) => {
  if (err) {
    console.error('Error:', err.message);
  } else {
    console.log('Tables:', tables);
    for (const t of tables) {
      db.all(`PRAGMA table_info(${t.name})`, (err, cols) => {
        console.log(`Columns of ${t.name}:`, cols.map(c => `${c.name} (${c.type})`));
      });
      db.get(`SELECT COUNT(*) as cnt FROM ${t.name}`, (err, row) => {
        console.log(`Row count of ${t.name}:`, row?.cnt);
      });
    }
  }
});
