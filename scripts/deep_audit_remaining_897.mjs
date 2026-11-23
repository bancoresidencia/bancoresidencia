import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = cat.catalog || cat;
const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

console.log(`Auditing remaining ${list.length} watermarked questions...`);

const detailed = [];
for (const item of list) {
  const row = stagingDb.prepare('SELECT id, statement, options, correct_answer, images, institution, year, especialidade, tema, foco, subfoco FROM questions_curated_staging WHERE id = ?').get(item.id);
  if (row) {
    detailed.push({
      id: row.id,
      banca: row.institution || item.banca,
      year: row.year || item.year,
      statement: row.statement || '',
      images: row.images,
      especialidade: row.especialidade,
      tema: row.tema,
      foco: row.foco,
      reason: item.reason
    });
  }
}

console.log(`Loaded ${detailed.length} questions from staging DB.`);

// Group by banca & year
const bancaCounts = {};
for (const d of detailed) {
  const b = `${d.banca || 'DESCONHECIDA'} (${d.year || 'SEM_ANO'})`;
  bancaCounts[b] = (bancaCounts[b] || 0) + 1;
}

const sorted = Object.entries(bancaCounts).sort((a, b) => b[1] - a[1]);
console.log('\nTop 25 exam clusters:');
sorted.slice(0, 25).forEach(([b, c]) => console.log(`  ${b.padEnd(45)}: ${c}`));

// Save detailed list for batch processing
fs.writeFileSync('data/remaining_watermarked_detailed.json', JSON.stringify(detailed, null, 2), 'utf8');
