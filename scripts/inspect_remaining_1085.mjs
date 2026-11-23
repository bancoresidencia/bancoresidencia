import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const sanarDb = new DatabaseSync('data/sanar_crawler.db');

console.log(`Current items in watermark catalog: ${cat.catalog ? cat.catalog.length : cat.length}`);

// Let's inspect the first 20 remaining items
const remaining = cat.catalog || cat;
console.log('\nSample 10 remaining watermarked questions:');
remaining.slice(0, 10).forEach((item, idx) => {
  console.log(`[${idx+1}] ID: ${item.id} | Banca: ${item.banca} (${item.year})`);
  console.log(`     Stmt: ${item.statement_snippet ? item.statement_snippet.substring(0, 90) : item.statement.substring(0, 90)}`);
  console.log(`     Reason: ${item.reason}`);
});
