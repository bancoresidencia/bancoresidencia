import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const sanarDb = new DatabaseSync('data/sanar_crawler.db');
const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const matches = JSON.parse(fs.readFileSync('data/sanar_refined_matches.json', 'utf8'));

console.log(`Auditing sample of ${matches.length} matches:`);

for (let i = 0; i < Math.min(10, matches.length); i++) {
  const m = matches[i];
  const stagingQ = stagingDb.prepare('SELECT statement FROM questions_curated_staging WHERE id = ?').get(m.qId);
  const sanarQ = sanarDb.prepare('SELECT enunciado_texto FROM questions WHERE sanar_id = ?').get(m.sanar_id);

  console.log(`\n--- MATCH #${i + 1} (Score: ${m.score}) ---`);
  console.log(`QID: ${m.qId} | ${m.banca} (${m.year})`);
  console.log(`Staging Stmt: ${stagingQ ? stagingQ.statement.substring(0, 100).replace(/\n/g, ' ') : ''}...`);
  console.log(`Sanar Stmt:   ${sanarQ ? sanarQ.enunciado_texto.substring(0, 100).replace(/\n/g, ' ') : ''}...`);
  console.log(`WebP Path:    ${m.local_webp_path} (${m.width}x${m.height})`);
}
