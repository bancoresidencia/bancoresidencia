import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

function decodeHtmlEntities(str) {
  if (!str) return '';
  return str
    .replace(/&atilde;/gi, 'ã')
    .replace(/&Atilde;/gi, 'Ã')
    .replace(/&ccedil;/gi, 'ç')
    .replace(/&Ccedil;/gi, 'Ç')
    .replace(/&eacute;/gi, 'é')
    .replace(/&Eacute;/gi, 'É')
    .replace(/&ecirc;/gi, 'ê')
    .replace(/&Ecirc;/gi, 'Ê')
    .replace(/&aacute;/gi, 'á')
    .replace(/&Aacute;/gi, 'Á')
    .replace(/&agrave;/gi, 'à')
    .replace(/&Agrave;/gi, 'À')
    .replace(/&oacute;/gi, 'ó')
    .replace(/&Oacute;/gi, 'Ó')
    .replace(/&ocirc;/gi, 'ô')
    .replace(/&Ocirc;/gi, 'Ô')
    .replace(/&otilde;/gi, 'õ')
    .replace(/&Otilde;/gi, 'Õ')
    .replace(/&iacute;/gi, 'í')
    .replace(/&Iacute;/gi, 'Í')
    .replace(/&uacute;/gi, 'ú')
    .replace(/&Uacute;/gi, 'Ú')
    .replace(/&ordm;/gi, 'º')
    .replace(/&ordf;/gi, 'ª')
    .replace(/&quot;/gi, '"')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&#(\d+);/g, (m, dec) => String.fromCharCode(dec))
    .replace(/&#x([0-9a-f]+);/gi, (m, hex) => String.fromCharCode(parseInt(hex, 16)));
}

function normalize(str) {
  return decodeHtmlEntities(str)
    .toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const sanarDb = new DatabaseSync('data/sanar_crawler.db');

console.log('Loading questions with images from questions_curated_staging...');
const stagingRows = stagingDb.prepare(`
  SELECT id, institution, year, statement, images 
  FROM questions_curated_staging 
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();
console.log(`Loaded ${stagingRows.length} questions with images from staging.`);

// Build index of staging questions
const stagingMap = new Map();
const stagingPrefixMap = new Map();

for (const q of stagingRows) {
  const norm = normalize(q.statement);
  if (norm.length > 20) {
    const key = norm.slice(0, 100);
    stagingMap.set(key, q);
    const shortKey = norm.slice(0, 60);
    if (!stagingPrefixMap.has(shortKey)) stagingPrefixMap.set(shortKey, []);
    stagingPrefixMap.get(shortKey).push(q);
  }
}

console.log('Loading questions and images from sanar_crawler.db...');
const sanarQuestions = sanarDb.prepare(`
  SELECT q.sanar_id, q.instituicao, q.ano, q.enunciado_texto, q.enunciado_original, q.has_images
  FROM questions q
  WHERE q.has_images = 1
`).all();
console.log(`Loaded ${sanarQuestions.length} questions marked has_images=1 from sanar_crawler.db.`);

const sanarImages = sanarDb.prepare(`SELECT * FROM question_images`).all();
const imagesBySanarId = new Map();
for (const img of sanarImages) {
  if (!imagesBySanarId.has(img.sanar_id)) imagesBySanarId.set(img.sanar_id, []);
  imagesBySanarId.get(img.sanar_id).push(img);
}

// Load existing matches
const existingMatchesPath = 'data/sanar_all_matches_complete.json';
let existingMatches = [];
if (fs.existsSync(existingMatchesPath)) {
  existingMatches = JSON.parse(fs.readFileSync(existingMatchesPath, 'utf8'));
}
const matchedQIds = new Set(existingMatches.map(m => m.question_id));
console.log(`Existing matches: ${existingMatches.length} questions already matched.`);

let newMatchesCount = 0;
const allMatches = [...existingMatches];

for (const sq of sanarQuestions) {
  const imgs = imagesBySanarId.get(sq.sanar_id) || [];
  if (imgs.length === 0) continue;

  // Verify that local webp exists on disk
  const validImgs = [];
  for (const im of imgs) {
    let p = im.local_webp_path;
    if (p && !fs.existsSync(p)) {
      // Check alternative path
      const fn = path.basename(p);
      const altP = path.join('data/sanar_media/webp', fn);
      if (fs.existsSync(altP)) p = altP;
    }
    if (p && fs.existsSync(p)) {
      validImgs.push({
        original_url: im.original_url,
        local_webp: p,
        width: im.width,
        height: im.height
      });
    }
  }

  if (validImgs.length === 0) continue;

  const rawText = sq.enunciado_texto || sq.enunciado_original || '';
  const norm = normalize(rawText);
  if (norm.length < 20) continue;

  let matchedStaging = null;
  const key100 = norm.slice(0, 100);
  if (stagingMap.has(key100)) {
    matchedStaging = stagingMap.get(key100);
  } else {
    const key60 = norm.slice(0, 60);
    const candidates = stagingPrefixMap.get(key60) || [];
    for (const c of candidates) {
      const cNorm = normalize(c.statement);
      if (cNorm.slice(0, 120) === norm.slice(0, 120) || cNorm.includes(norm.slice(0, 80))) {
        matchedStaging = c;
        break;
      }
    }
  }

  if (matchedStaging) {
    if (!matchedQIds.has(matchedStaging.id)) {
      matchedQIds.add(matchedStaging.id);
      newMatchesCount++;
      allMatches.push({
        question_id: matchedStaging.id,
        sanar_id: sq.sanar_id,
        banca: sq.instituicao,
        year: sq.ano,
        sanar_images: validImgs
      });
    }
  }
}

console.log(`\n========================================`);
console.log(`New matches found from sanar_crawler.db: ${newMatchesCount}`);
console.log(`Total combined matches in Sanar: ${allMatches.length}`);
console.log(`========================================\n`);

fs.writeFileSync('data/sanar_all_matches_complete.json', JSON.stringify(allMatches, null, 2), 'utf8');
console.log('Saved updated data/sanar_all_matches_complete.json.');
