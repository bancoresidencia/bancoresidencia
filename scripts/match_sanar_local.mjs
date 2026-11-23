import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const sanarDb = new DatabaseSync('data/sanar_crawler.db');

// Helper to normalize text for match
function norm(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('Loading questions with images from sanar_crawler.db...');
const sanarImgs = sanarDb.prepare(`
  SELECT q.sanar_id, q.enunciado_texto, q.instituicao, q.ano, qi.local_webp_path, qi.original_url, qi.width, qi.height
  FROM questions q
  JOIN question_images qi ON q.sanar_id = qi.sanar_id
  WHERE qi.context = 'enunciado' AND qi.local_webp_path IS NOT NULL
`).all();

console.log(`Loaded ${sanarImgs.length} image rows from Sanar DB.`);

// Map by normalized 80-char prefix
const sanarMap = new Map();
for (const row of sanarImgs) {
  const n = norm(row.enunciado_texto).substring(0, 90);
  if (n.length >= 25 && !sanarMap.has(n)) {
    sanarMap.set(n, row);
  }
}

console.log(`Unique normalized prefixes in Sanar: ${sanarMap.size}`);

// Check our watermarked questions
const watermarked = JSON.parse(fs.readFileSync('data/watermarked_questions_list.json', 'utf8'));
console.log(`Checking ${watermarked.length} watermarked questions against Sanar...`);

let matches = 0;
const matchedList = [];

for (const w of watermarked) {
  const nw = norm(w.statement).substring(0, 90);
  if (sanarMap.has(nw)) {
    const s = sanarMap.get(nw);
    const webpPath = path.resolve(s.local_webp_path);
    if (fs.existsSync(webpPath)) {
      matches++;
      matchedList.push({
        qId: w.id,
        banca: w.institution,
        year: w.year,
        stmt: w.statement.substring(0, 80),
        sanar_id: s.sanar_id,
        local_webp_path: s.local_webp_path,
        original_url: s.original_url,
        width: s.width,
        height: s.height
      });
    }
  }
}

console.log(`\n========================================`);
console.log(`TOTAL INSTANT LOCAL SANAR MATCHES: ${matches}`);
console.log(`========================================\n`);

if (matchedList.length > 0) {
  console.log('Sample matched questions (first 5):');
  console.log(JSON.stringify(matchedList.slice(0, 5), null, 2));
}

fs.writeFileSync('data/sanar_instant_matches.json', JSON.stringify(matchedList, null, 2), 'utf8');
