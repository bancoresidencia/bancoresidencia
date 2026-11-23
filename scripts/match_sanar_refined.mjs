import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const sanarDb = new DatabaseSync('data/sanar_crawler.db');

function cleanText(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('Building search index from sanar_crawler.db...');
const sanarRows = sanarDb.prepare(`
  SELECT q.sanar_id, q.enunciado_texto, q.instituicao, q.ano, qi.local_webp_path, qi.original_url, qi.width, qi.height
  FROM questions q
  JOIN question_images qi ON q.sanar_id = qi.sanar_id
  WHERE qi.context = 'enunciado' AND qi.local_webp_path IS NOT NULL
`).all();

const sanarEntries = sanarRows.map(r => ({
  ...r,
  cleaned: cleanText(r.enunciado_texto),
  words: new Set(cleanText(r.enunciado_texto).split(' ').filter(w => w.length > 3))
}));

const watermarked = JSON.parse(fs.readFileSync('data/watermarked_questions_list.json', 'utf8'));

let matchCount = 0;
const matched = [];
const matchedQIds = new Set();

for (const w of watermarked) {
  const cw = cleanText(w.statement);
  if (cw.length < 20) continue;

  const wWords = new Set(cw.split(' ').filter(word => word.length > 3));
  if (wWords.size < 4) continue;

  let bestMatch = null;
  let bestScore = 0;

  for (const s of sanarEntries) {
    // Check prefix exact match first
    const p1 = cw.substring(0, 60);
    const p2 = s.cleaned.substring(0, 60);
    if (p1.length >= 40 && p1 === p2) {
      bestMatch = s;
      bestScore = 1.0;
      break;
    }

    // Check substring containment
    if (cw.length >= 60 && s.cleaned.includes(cw.substring(0, 50))) {
      bestMatch = s;
      bestScore = 0.95;
      break;
    }

    // Jaccard similarity on significant words
    let overlap = 0;
    for (const wd of wWords) {
      if (s.words.has(wd)) overlap++;
    }
    const score = overlap / Math.max(wWords.size, s.words.size);
    if (score > 0.75 && score > bestScore) {
      bestScore = score;
      bestMatch = s;
    }
  }

  if (bestMatch && bestScore >= 0.75) {
    const webpPath = path.resolve(bestMatch.local_webp_path);
    if (fs.existsSync(webpPath)) {
      matchCount++;
      matchedQIds.add(w.id);
      matched.push({
        qId: w.id,
        banca: w.institution,
        year: w.year,
        score: bestScore,
        stmt: w.statement.substring(0, 80),
        sanar_id: bestMatch.sanar_id,
        local_webp_path: bestMatch.local_webp_path,
        original_url: bestMatch.original_url,
        width: bestMatch.width,
        height: bestMatch.height
      });
    }
  }
}

console.log(`\n========================================`);
console.log(`REFINED MATCHES FOUND: ${matchCount}`);
console.log(`========================================\n`);

fs.writeFileSync('data/sanar_refined_matches.json', JSON.stringify(matched, null, 2), 'utf8');
