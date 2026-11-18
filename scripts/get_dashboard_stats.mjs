import { DatabaseSync } from 'node:sqlite';
import path from 'path';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
try {
  const db = new DatabaseSync(dbPath, { readOnly: true });
  const totalRow = db.prepare(`SELECT count(1) as total, count(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 30 THEN 1 END) as com_comentario FROM questions_curated_staging`).get();
  console.log('Total Staging:', totalRow);

  const specRows = db.prepare(`SELECT especialidade, count(1) as total, count(CASE WHEN commentary IS NOT NULL AND length(trim(commentary)) > 30 THEN 1 END) as com_comentario FROM questions_curated_staging WHERE especialidade IN ('Cirurgia Geral', 'Medicina Preventiva', 'Clínica Médica', 'Pediatria', 'Ginecologia e Obstetrícia', 'Ginecologia', 'Obstetrícia') GROUP BY especialidade`).all();
  console.log('Specs:', specRows);
} catch (e) {
  console.error('Error:', e.message);
}
