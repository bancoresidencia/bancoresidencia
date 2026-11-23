import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const sanarDb = new DatabaseSync('data/sanar_crawler.db');
const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const remaining = cat.catalog || cat;

console.log(`Auditing ${remaining.length} remaining watermarked questions against Sanar DB...`);

function normalizeText(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// 1. Load all questions with images from Sanar DB
console.log('Loading Sanar questions with images...');
const sanarQuestions = sanarDb.prepare(`
  SELECT q.sanar_id, q.instituicao, q.ano, q.enunciado_texto, q.enunciado_original,
         qi.local_webp_path, qi.original_url
  FROM questions q
  JOIN question_images qi ON q.sanar_id = qi.sanar_id
  WHERE qi.local_webp_path IS NOT NULL
`).all();

console.log(`Loaded ${sanarQuestions.length} Sanar question-image pairs.`);

// Build index of Sanar questions by first 40 chars
const sanarIndex = new Map();
const sanarAll = [];

for (const sq of sanarQuestions) {
  const norm = normalizeText(sq.enunciado_texto);
  if (norm.length < 20) continue;
  const p35 = norm.substring(0, 35);
  const p45 = norm.substring(0, 45);
  
  if (!sanarIndex.has(p35)) sanarIndex.set(p35, []);
  sanarIndex.get(p35).push(sq);

  sanarAll.push({
    ...sq,
    norm
  });
}

// 2. Check remaining watermarked questions
let exactMatches = [];
let partialMatches = [];

for (const w of remaining) {
  const row = stagingDb.prepare('SELECT id, statement, institution, year FROM questions_curated_staging WHERE id = ?').get(w.id);
  if (!row || !row.statement) continue;

  const wNorm = normalizeText(row.statement);
  if (wNorm.length < 20) continue;

  const p35 = wNorm.substring(0, 35);
  const p45 = wNorm.substring(0, 45);

  // Check prefix match
  if (sanarIndex.has(p35)) {
    const candidates = sanarIndex.get(p35);
    for (const c of candidates) {
      const cNorm = normalizeText(c.enunciado_texto);
      // Verify high overlap
      if (cNorm.startsWith(p45) || wNorm.startsWith(cNorm.substring(0, 45))) {
        exactMatches.push({
          qId: row.id,
          banca: row.institution,
          year: row.year,
          sanar_id: c.sanar_id,
          local_webp: c.local_webp_path,
          original_url: c.original_url,
          statement: row.statement.substring(0, 80)
        });
        break;
      }
    }
  }
}

console.log(`\n=======================================================`);
console.log(`DIRECT LOCAL SANAR IMAGE MATCHES: ${exactMatches.length}`);
console.log(`=======================================================\n`);

if (exactMatches.length > 0) {
  console.log('Sample matches (first 5):');
  console.log(JSON.stringify(exactMatches.slice(0, 5), null, 2));
  fs.writeFileSync('data/sanar_local_new_matches.json', JSON.stringify(exactMatches, null, 2), 'utf8');
}
