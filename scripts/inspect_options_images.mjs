import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath);

console.log('--- AMOSTRA DE QUESTÕES COM IMAGENS NAS OPÇÕES ---');

const rows = db.prepare(`
  SELECT id, banca, year, statement, options, images
  FROM questions_curated_staging
  WHERE options LIKE '%http%webp%' OR options LIKE '%http%jpg%' OR options LIKE '%http%png%' OR options LIKE '%[IMG%'
  LIMIT 5
`).all();

for (const r of rows) {
  console.log(`\nID: ${r.id} (${r.banca} ${r.year})`);
  console.log('Statement:', r.statement.slice(0, 100));
  try {
    const opts = JSON.parse(r.options);
    console.log('Options count:', opts.length);
    opts.forEach(o => {
      console.log(`  [${o.letter}]: text="${o.text?.slice(0, 50)}" | images=${JSON.stringify(o.images || [])}`);
    });
  } catch (e) {
    console.log('Raw options:', r.options.slice(0, 150));
  }
}

