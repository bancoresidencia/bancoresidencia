import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const catPath = 'data/supabase_tables/medq_watermark_catalog.json';
const catalog = JSON.parse(fs.readFileSync(catPath, 'utf8')).catalog || [];
const catSet = new Set(catalog.map(c => c.id));

const rows = stagingDb.prepare(`
  SELECT id, institution, year, statement, images
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const remainingWatermarked = [];
const byInstYear = {};

for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  const isWatermarked = catSet.has(r.id) || imgs.some(u => typeof u === 'string' && u.includes('imagens_medq_originais'));
  if (isWatermarked) {
    remainingWatermarked.push(r);
    const k = `${r.institution || 'SEM_BANCA'} ${r.year || 'SEM_ANO'}`;
    byInstYear[k] = (byInstYear[k] || 0) + 1;
  }
}

console.log(`Remaining watermarked count: ${remainingWatermarked.length}`);
const sorted = Object.entries(byInstYear).sort((a, b) => b[1] - a[1]);
console.log('\nTop 20 remaining bancas/anos:');
console.log(JSON.stringify(sorted.slice(0, 20), null, 2));

fs.writeFileSync('data/remaining_watermarked_1769.json', JSON.stringify(remainingWatermarked, null, 2), 'utf8');
