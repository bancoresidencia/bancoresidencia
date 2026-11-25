import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const matches = JSON.parse(fs.readFileSync('data/sanar_all_matches_complete.json', 'utf8'));
const matchMap = new Map();
for (const m of matches) matchMap.set(m.question_id, m);

const allQ = db.prepare('SELECT id, images, banca, year FROM questions_curated_staging WHERE has_images = 1').all();

let higienizadasMatchedBySanar = 0;
let higienizadasNotMatchedBySanar = 0;

for (const q of allQ) {
  if ((q.images || '').includes('imagens_higienizadas_medq')) {
    if (matchMap.has(q.id)) {
      higienizadasMatchedBySanar++;
    } else {
      higienizadasNotMatchedBySanar++;
    }
  }
}

console.log(`Total questions with imagens_higienizadas_medq: ${higienizadasMatchedBySanar + higienizadasNotMatchedBySanar}`);
console.log(`  - Can be substituted by clean Sanar: ${higienizadasMatchedBySanar}`);
console.log(`  - Need reversion to original un-blurred file: ${higienizadasNotMatchedBySanar}`);

console.log(`\nTotal questions in our base: ${allQ.length}`);
console.log(`Total matches in Sanar: ${matchMap.size}`);
