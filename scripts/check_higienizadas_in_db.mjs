import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const rowsWithHigienizadas = db.prepare("SELECT id, images, banca, year FROM questions_curated_staging WHERE images LIKE '%imagens_higienizadas_medq%'").all();
console.log(`Questions with 'imagens_higienizadas_medq' in images: ${rowsWithHigienizadas.length}`);

const rowsWithResgatadas = db.prepare("SELECT id, images, banca, year FROM questions_curated_staging WHERE images LIKE '%resgatada_%'").all();
console.log(`Questions with 'resgatada_' in images: ${rowsWithResgatadas.length}`);

// Check decisions file
if (fs.existsSync('data/supabase_tables/image_watermark_decisions.json')) {
  const dec = JSON.parse(fs.readFileSync('data/supabase_tables/image_watermark_decisions.json', 'utf8'));
  console.log('image_watermark_decisions keys:', Object.keys(dec));
  console.log('medq_actions count:', Object.keys(dec.medq_actions || {}).length);
}
