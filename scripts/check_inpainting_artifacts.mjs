import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cols = db.prepare('PRAGMA table_info(questions_curated_staging)').all();
console.log('Columns in questions_curated_staging:', cols.map(c => c.name));

// Check files in directories
if (fs.existsSync('data/imagens_higienizadas_medq')) {
  const hFiles = fs.readdirSync('data/imagens_higienizadas_medq');
  console.log(`\nFiles in data/imagens_higienizadas_medq: ${hFiles.length}`);
}

if (fs.existsSync('data/imagens_resgatadas_gate6')) {
  const rFiles = fs.readdirSync('data/imagens_resgatadas_gate6');
  console.log(`Files in data/imagens_resgatadas_gate6: ${rFiles.length}`);
}
