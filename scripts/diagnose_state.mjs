import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

// 1. Search for user's question
const targetQ = db.prepare('SELECT id, institution, year, images, statement FROM questions_curated_staging WHERE statement LIKE ?')
  .get('%Escolar, 6 anos, chega ao plantão febril%');

console.log('--- TARGET QUESTION ---');
if (targetQ) {
  console.log('ID:', targetQ.id);
  console.log('Institution:', targetQ.institution, '| Year:', targetQ.year);
  console.log('Images:', targetQ.images);
} else {
  console.log('Target question NOT FOUND with that exact snippet. Trying broader search...');
  const broader = db.prepare('SELECT id, institution, year, images, statement FROM questions_curated_staging WHERE statement LIKE ?')
    .all('%derrame pleural direito%septações%');
  console.log(`Found ${broader.length} questions matching derrame pleural direito + septações:`);
  for (const b of broader) {
    console.log(`- ${b.id}: ${b.institution} (${b.year}) | ${b.images}`);
  }
}

// 2. Check how many questions currently reference 'clean_' or 'higienizada' in questions_curated_staging
const allQuestionsWithImages = db.prepare("SELECT id, images FROM questions_curated_staging WHERE images IS NOT NULL AND images != '[]' AND images != ''").all();

let countClean = 0;
let countHigienizada = 0;
let countResgatada = 0;
let countSanarMedia = 0;
let countOther = 0;

for (const q of allQuestionsWithImages) {
  const imgsStr = q.images || '';
  if (imgsStr.includes('clean_')) countClean++;
  if (imgsStr.includes('higienizada')) countHigienizada++;
  if (imgsStr.includes('resgatada')) countResgatada++;
  if (imgsStr.includes('sanar')) countSanarMedia++;
}

console.log('\n--- IMAGE REFERENCE AUDIT IN questions_curated_staging ---');
console.log('Total questions with images:', allQuestionsWithImages.length);
console.log('Referencing clean_:', countClean);
console.log('Referencing higienizada:', countHigienizada);
console.log('Referencing resgatada:', countResgatada);
console.log('Referencing sanar:', countSanarMedia);

// 3. Check 2695 Sanar matches
if (fs.existsSync('data/sanar_all_matches_complete.json')) {
  const sanarMatches = JSON.parse(fs.readFileSync('data/sanar_all_matches_complete.json', 'utf8'));
  console.log('\n--- SANAR ALL MATCHES STATUS ---');
  console.log('Total matches in complete JSON:', sanarMatches.length);

  let alreadyDeployed = 0;
  let notDeployed = 0;
  for (const m of sanarMatches) {
    const qRow = db.prepare('SELECT images FROM questions_curated_staging WHERE id = ?').get(m.question_id);
    if (qRow && qRow.images && qRow.images.includes('resgatada')) {
      alreadyDeployed++;
    } else {
      notDeployed++;
    }
  }
  console.log('Already pointing to resgatada in DB:', alreadyDeployed);
  console.log('Pending deployment in DB:', notDeployed);

  // Check if targetQ is in sanarMatches
  if (targetQ) {
    const inSanar = sanarMatches.find(m => m.question_id === targetQ.id);
    console.log('Target question in sanarMatches:', Boolean(inSanar));
    if (inSanar) {
      console.log('Sanar images:', JSON.stringify(inSanar.sanar_images));
    }
  }
}
