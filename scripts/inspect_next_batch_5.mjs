import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = cat.catalog || cat;
const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const sample = [];
for (let i = 0; i < Math.min(10, list.length); i++) {
  const item = list[i];
  const row = stagingDb.prepare('SELECT id, statement, institution, year FROM questions_curated_staging WHERE id = ?').get(item.id);
  if (row) {
    sample.push({
      id: row.id,
      banca: row.institution,
      year: row.year,
      statement: row.statement.substring(0, 120).replace(/\n/g, ' ')
    });
  }
}

console.log('Sample 10 next watermarked questions:');
sample.forEach((s, idx) => console.log(`[${idx+1}] ${s.banca} (${s.year}): ${s.statement}`));

fs.writeFileSync('data/sample_10_target.json', JSON.stringify(sample, null, 2), 'utf8');
