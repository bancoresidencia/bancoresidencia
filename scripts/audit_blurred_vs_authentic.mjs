import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const questions = stagingDb.prepare('SELECT id, images, banca, year FROM questions_curated_staging WHERE has_images = 1').all();

console.log(`Total questions with has_images=1: ${questions.length}`);

// Load Sanar matches that were deployed
const sanarMatchesR1 = JSON.parse(fs.readFileSync('data/sanar_direct_matches_watermarked.json', 'utf8'));
const sanarSet = new Set(sanarMatchesR1.map(m => m.question_id));

// Load Sanar matches R2
if (fs.existsSync('data/sanar_matches_round2.json')) {
  const r2 = JSON.parse(fs.readFileSync('data/sanar_matches_round2.json', 'utf8'));
  for (const m of (r2.matches || []).filter(m => m.dbImagesCount > 0)) {
    sanarSet.add(m.stagingId);
  }
}

// Load decisions file
const dec = JSON.parse(fs.readFileSync('data/supabase_tables/image_watermark_decisions.json', 'utf8'));
const medqActions = dec.medq_actions || {};

let countSanarAuthentic = 0;
let countInpaintedHigienizadas = 0;
let countResgatadasInpainted = 0;
let countOtherClean = 0;

for (const q of questions) {
  const imgStr = q.images || '';
  if (sanarSet.has(q.id)) {
    countSanarAuthentic++;
  } else if (imgStr.includes('imagens_higienizadas_medq')) {
    countInpaintedHigienizadas++;
  } else if (medqActions[q.id] && medqActions[q.id].action === 'inpainted') {
    countInpaintedHigienizadas++;
  } else {
    countOtherClean++;
  }
}

console.log(`Authentic Sanar Replacements (no blur, 100% clean official exam): ${countSanarAuthentic}`);
console.log(`Inpainted with blurred square (imagens_higienizadas_medq): ${countInpaintedHigienizadas}`);
console.log(`Other clean images (pdr, converted originals, etc.): ${countOtherClean}`);
