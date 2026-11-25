import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const sanarDb = new DatabaseSync('data/sanar_crawler.db');
const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const catData = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const watermarkedList = catData.catalog || [];

console.log(`Checking ${watermarkedList.length} remaining watermarked questions against sanar_crawler.db...`);

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Check sample of enunciado_original for images
const sampleOriginal = sanarDb.prepare("SELECT enunciado_original, enunciado_texto, has_images FROM questions WHERE has_images = 1 LIMIT 3").all();
console.log('\nSample enunciado_original with has_images=1:');
for (const s of sampleOriginal) {
  console.log('Original snippet:', s.enunciado_original?.slice(0, 200));
}

// Check if any questions with has_images=0 actually have <img> or image URLs in enunciado_original
const origWithImg = sanarDb.prepare("SELECT count(*) as c FROM questions WHERE has_images = 0 AND (enunciado_original LIKE '%<img%' OR enunciado_original LIKE '%.jpg%' OR enunciado_original LIKE '%.png%' OR enunciado_original LIKE '%.webp%')").get();
console.log('\nQuestions with has_images=0 but images in enunciado_original:', origWithImg.c);

// Load all 49,212 questions from Sanar into a lightweight search structure
console.log('\nLoading all 49k Sanar questions for text matching...');
const allSanar = sanarDb.prepare('SELECT sanar_id, enunciado_texto, enunciado_original, banca, ano, has_images, gabarito FROM (SELECT sanar_id, enunciado_texto, enunciado_original, instituicao as banca, ano, has_images, gabarito FROM questions)').all();

console.log(`Loaded ${allSanar.length} questions from Sanar.`);

// Create word 5-gram or 30-char index
const index = new Map();
for (const sq of allSanar) {
  const norm = normalizeText(sq.enunciado_texto);
  if (norm.length < 20) continue;
  sq.norm = norm;
  const key = norm.slice(0, 30);
  if (!index.has(key)) index.set(key, []);
  index.get(key).push(sq);
}

let matchedInSanarAny = [];
let matchedWithImages = [];

for (const w of watermarkedList) {
  const qRow = stagingDb.prepare('SELECT id, statement, options, correct_answer, banca, year FROM questions_curated_staging WHERE id = ?').get(w.id);
  if (!qRow || !qRow.statement) continue;

  const wNorm = normalizeText(qRow.statement);
  if (wNorm.length < 20) continue;

  const key = wNorm.slice(0, 30);
  let matched = null;

  if (index.has(key)) {
    matched = index.get(key)[0];
  } else {
    // Try mid 30 chars
    const midKey = wNorm.length > 70 ? wNorm.slice(25, 55) : '';
    if (midKey) {
      for (const sq of allSanar) {
        if (sq.norm && sq.norm.includes(midKey)) {
          matched = sq;
          break;
        }
      }
    }
  }

  if (matched) {
    matchedInSanarAny.push({ staging: qRow, sanar: matched });
    if (matched.has_images) {
      matchedWithImages.push({ staging: qRow, sanar: matched });
    }
  }
}

console.log(`\nMatched in Sanar (ANY question): ${matchedInSanarAny.length} / ${watermarkedList.length}`);
console.log(`Matched in Sanar with has_images=1: ${matchedWithImages.length} / ${watermarkedList.length}`);

// If there are matches with has_images=1, check if they have question_images
if (matchedWithImages.length > 0) {
  console.log('\nChecking images for matchedWithImages:');
  for (const m of matchedWithImages.slice(0, 5)) {
    const imgs = sanarDb.prepare('SELECT * FROM question_images WHERE sanar_id = ?').all(m.sanar.sanar_id);
    console.log(`Staging ID ${m.staging.id} -> Sanar ID ${m.sanar.sanar_id}: found ${imgs.length} images`);
  }
}
