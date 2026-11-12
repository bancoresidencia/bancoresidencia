import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

console.log('--- 5 AMOSTRAS REAIS APÓS APLICAÇÃO DO GATE 4 ---');

const samples = db.prepare(`
  SELECT id, statement, images
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]'
  LIMIT 5
`).all();

for (const s of samples) {
  console.log(`\n================================================================================`);
  console.log(`ID: ${s.id}`);
  console.log(`Imagens: ${s.images}`);
  console.log(`Enunciado Resultante:\n${s.statement}`);
}

