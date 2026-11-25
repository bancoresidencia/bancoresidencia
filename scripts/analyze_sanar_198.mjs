import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const sanarDb = new DatabaseSync('data/sanar_crawler.db');
const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const catData = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const watermarkedList = catData.catalog || [];

function normalizeText(text) {
  if (!text) return '';
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('Loading Sanar questions...');
const sanarQuestions = sanarDb.prepare('SELECT sanar_id, enunciado_texto, enunciado_original, alternativa_a, alternativa_b, has_images FROM questions').all();

// Index by first 30 chars of enunciado_texto
const p30Index = new Map();
const optAIndex = new Map();

for (const sq of sanarQuestions) {
  const norm = normalizeText(sq.enunciado_texto);
  if (norm.length >= 20) {
    sq.norm = norm;
    const p30 = norm.slice(0, 30);
    if (!p30Index.has(p30)) p30Index.set(p30, []);
    p30Index.get(p30).push(sq);
  }
  const normA = normalizeText(sq.alternativa_a);
  if (normA.length >= 15) {
    if (!optAIndex.has(normA)) optAIndex.set(normA, []);
    optAIndex.get(normA).push(sq);
  }
}

console.log(`Indexed ${sanarQuestions.length} Sanar questions.`);

const matches = [];

for (const w of watermarkedList) {
  const qRow = stagingDb.prepare('SELECT id, statement, options, correct_answer, banca, year FROM questions_curated_staging WHERE id = ?').get(w.id);
  if (!qRow || !qRow.statement) continue;

  const wNorm = normalizeText(qRow.statement);
  if (wNorm.length < 20) continue;

  let matchedSanar = null;
  let matchType = null;

  // 1. Prefix 30
  const p30 = wNorm.slice(0, 30);
  if (p30Index.has(p30)) {
    matchedSanar = p30Index.get(p30)[0];
    matchType = 'p30';
  } else {
    // 2. Mid 30
    const mid30 = wNorm.length > 70 ? wNorm.slice(25, 55) : '';
    if (mid30) {
      for (const sq of sanarQuestions) {
        if (sq.norm && sq.norm.includes(mid30)) {
          matchedSanar = sq;
          matchType = 'mid30';
          break;
        }
      }
    }
  }

  // 3. If not matched, try matching by options (if options exist in staging)
  if (!matchedSanar && qRow.options) {
    try {
      const opts = JSON.parse(qRow.options);
      const optA = Array.isArray(opts) ? (opts[0]?.text || opts[0]) : opts.A || opts.a;
      const normA = normalizeText(optA);
      if (normA.length >= 20 && optAIndex.has(normA)) {
        const candidates = optAIndex.get(normA);
        // Verify with another option or part of statement
        for (const cand of candidates) {
          const words = wNorm.split(' ').filter(w => w.length > 5);
          const matchCount = words.filter(w => cand.norm && cand.norm.includes(w)).length;
          if (matchCount >= 3) {
            matchedSanar = cand;
            matchType = 'option_A+keywords';
            break;
          }
        }
      }
    } catch {}
  }

  if (matchedSanar) {
    // Check images in DB for this sanar_id
    const imgs = sanarDb.prepare('SELECT * FROM question_images WHERE sanar_id = ?').all(matchedSanar.sanar_id);
    matches.push({
      stagingId: qRow.id,
      sanarId: matchedSanar.sanar_id,
      matchType,
      has_images_flag: matchedSanar.has_images,
      dbImagesCount: imgs.length,
      dbImages: imgs,
      enunciado_original: matchedSanar.enunciado_original
    });
  }
}

console.log(`Total matched in Sanar: ${matches.length} / ${watermarkedList.length}`);
const withDbImgs = matches.filter(m => m.dbImagesCount > 0);
console.log(`Matches with question_images in DB: ${withDbImgs.length}`);

// Check if any of the other matches have images in enunciado_original
let originalImgCount = 0;
for (const m of matches) {
  if (m.dbImagesCount === 0 && m.enunciado_original) {
    const urls = m.enunciado_original.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp)/gi);
    if (urls) {
      originalImgCount++;
    }
  }
}
console.log(`Matches with image URLs in enunciado_original: ${originalImgCount}`);

fs.writeFileSync('data/sanar_matches_round2.json', JSON.stringify({
  total_matched: matches.length,
  with_db_images: withDbImgs.length,
  matches: matches
}, null, 2));

console.log('Saved to data/sanar_matches_round2.json');
