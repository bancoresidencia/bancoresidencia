import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

if (fs.existsSync('data/provaderesidencia_coleta.db')) {
  const db = new DatabaseSync('data/provaderesidencia_coleta.db');
  const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
  console.log('Tabelas:', tables);
  for (const t of tables) {
    try {
      const rows = db.prepare(`SELECT * FROM ${t.name} WHERE LOWER(pdf_name) LIKE '%sirio%' OR LOWER(pdf_name) LIKE '%hsl%' OR LOWER(pdf_path) LIKE '%sirio%' OR LOWER(pdf_path) LIKE '%hsl%'`).all();
      console.log(`Tabela ${t.name} encontrou ${rows.length} registros com HSL/Sirio`);
      if (rows.length > 0) {
        console.log('Exemplos:', rows.slice(0, 3));
      }
    } catch(e) {
      // tabela pode não ter essas colunas
      try {
        const any = db.prepare(`SELECT * FROM ${t.name} LIMIT 1`).all();
        console.log(`Colunas de ${t.name}:`, Object.keys(any[0] || {}));
      } catch(err) {}
    }
  }
}
