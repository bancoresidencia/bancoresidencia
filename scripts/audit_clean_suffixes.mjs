import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const allQ = db.prepare("SELECT id, images FROM questions_curated_staging WHERE images IS NOT NULL AND images != '[]' AND images != ''").all();

let countCleanSuffix = 0;
let countHigienizada = 0;
let countResgatadaSanar = 0;
let countResgatadaOther = 0;

for (const q of allQ) {
  const imgStr = q.images || '';
  if (imgStr.includes('_clean.webp') || imgStr.includes('clean_')) countCleanSuffix++;
  if (imgStr.includes('higienizada')) countHigienizada++;
  if (imgStr.includes('_sanar.webp')) countResgatadaSanar++;
  else if (imgStr.includes('resgatada')) countResgatadaOther++;
}

console.log('Total questions with images:', allQ.length);
console.log('With _clean.webp or clean_:', countCleanSuffix);
console.log('With higienizada in path:', countHigienizada);
console.log('With _sanar.webp:', countResgatadaSanar);
console.log('With resgatada (other, potentially inpaint):', countResgatadaOther);
