import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const MEDQ_CATALOG_PATH = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const db = new DatabaseSync(DB_PATH);

let catalog = [];
if (fs.existsSync(MEDQ_CATALOG_PATH)) {
  catalog = JSON.parse(fs.readFileSync(MEDQ_CATALOG_PATH, 'utf8')).catalog || [];
}
const catSet = new Set(catalog.map(c => c.id));
catSet.add('questions_66a08e3e-6c58-41bd-8375-c97250110c13');

const rows = db.prepare(`
  SELECT id, institution, year, statement, images, options, correct_answer
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const watermarked = [];

for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  const isWatermarked = catSet.has(r.id) || imgs.some(u => typeof u === 'string' && u.includes('imagens_medq_originais'));
  if (isWatermarked) {
    watermarked.push({
      id: r.id,
      institution: r.institution,
      year: r.year,
      statement: r.statement,
      images: imgs,
      options: r.options,
      correct_answer: r.correct_answer
    });
  }
}

console.log(`Total watermarked questions identified: ${watermarked.length}`);

// Group by institution & year
const byInstYear = {};
for (const w of watermarked) {
  const k = `${w.institution || 'SEM_BANCA'} ${w.year || 'SEM_ANO'}`;
  byInstYear[k] = (byInstYear[k] || 0) + 1;
}

const sortedInstYear = Object.entries(byInstYear).sort((a, b) => b[1] - a[1]);
console.log('\nTop 25 bancas/anos with watermarks:');
console.log(JSON.stringify(sortedInstYear.slice(0, 25), null, 2));

// Save full list to json
fs.writeFileSync('data/watermarked_questions_list.json', JSON.stringify(watermarked, null, 2), 'utf8');
console.log('Saved to data/watermarked_questions_list.json');
