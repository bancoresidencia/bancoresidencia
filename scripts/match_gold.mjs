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

const sanarRows = sanarDb.prepare(`
  SELECT q.sanar_id, q.enunciado_texto, q.instituicao, q.ano, qi.local_webp_path, qi.original_url, qi.width, qi.height
  FROM questions q
  JOIN question_images qi ON q.sanar_id = qi.sanar_id
  WHERE qi.context = 'enunciado' AND qi.local_webp_path IS NOT NULL
`).all();

const sanarEntries = sanarRows.map(r => ({
  ...r,
  cleaned: cleanText(r.enunciado_texto)
}));

const watermarked = JSON.parse(fs.readFileSync('data/watermarked_questions_list.json', 'utf8'));

const goldMatches = [];

for (const w of watermarked) {
  const cw = cleanText(w.statement);
  if (cw.length < 50) continue;

  const pW = cw.substring(0, 55);

  for (const s of sanarEntries) {
    const pS = s.cleaned.substring(0, 55);
    if (pW === pS && pW.length >= 50) {
      const webpPath = path.resolve(s.local_webp_path);
      if (fs.existsSync(webpPath)) {
        goldMatches.push({
          qId: w.id,
          banca: w.institution,
          year: w.year,
          staging_stmt: w.statement.substring(0, 90).replace(/\n/g, ' '),
          sanar_stmt: s.enunciado_texto.substring(0, 90).replace(/\n/g, ' '),
          sanar_id: s.sanar_id,
          local_webp_path: s.local_webp_path,
          original_url: s.original_url,
          width: s.width,
          height: s.height
        });
        break;
      }
    }
  }
}

console.log(`\n========================================`);
console.log(`GOLD 55-CHAR EXACT PREFIX MATCHES: ${goldMatches.length}`);
console.log(`========================================\n`);

console.log('Sample gold matches (first 5):');
console.log(JSON.stringify(goldMatches.slice(0, 5), null, 2));

fs.writeFileSync('data/sanar_gold_matches.json', JSON.stringify(goldMatches, null, 2), 'utf8');
