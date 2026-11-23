import fs from 'fs';
import path from 'path';

const catalogPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
let catalog = [];
if (fs.existsSync(catalogPath)) {
  catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf8')).catalog || [];
}
const catMap = new Map(catalog.map(c => [c.id, c]));

const questions = JSON.parse(fs.readFileSync('data/broken_questions_list.json', 'utf8'));

for (const q of questions) {
  if (catMap.has(q.id)) {
    console.log(`\nID: ${q.id}`);
    console.log(`Cat entry:`, catMap.get(q.id));
    console.log(`Images:`, q.images);
  }
}
