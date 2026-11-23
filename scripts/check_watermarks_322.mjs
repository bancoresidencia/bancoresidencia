import fs from 'fs';
import path from 'path';

const catalogPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
let catalog = [];
if (fs.existsSync(catalogPath)) {
  catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')).catalog || [];
}
const catalogIds = new Set(catalog.map(c => c.id));

const questions = JSON.parse(fs.readFileSync('data/broken_questions_list.json', 'utf8'));

let inCatalog = 0;
for (const q of questions) {
  if (catalogIds.has(q.id)) {
    inCatalog++;
  }
}

console.log(`Total questions checked: ${questions.length}`);
console.log(`Found in medq_watermark_catalog: ${inCatalog}`);
