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

const GENERIC_PREFIXES = [
  'assinale a alternativa',
  'observe a imagem',
  'com base na figura',
  'considerando a imagem',
  'a imagem abaixo',
  'a figura abaixo',
  'analise a imagem'
];

console.log('Loading Sanar image entries...');
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

const strictMatches = [];

for (const w of watermarked) {
  const cw = cleanText(w.statement);
  if (cw.length < 25) continue;

  const isGeneric = GENERIC_PREFIXES.some(gp => cw.startsWith(gp));
  const wWords = new Set(cw.split(' ').filter(word => word.length > 3));

  let bestMatch = null;
  let bestScore = 0;

  for (const s of sanarEntries) {
    // 1. Long prefix exact match (minimum 35 chars, non-generic)
    if (!isGeneric) {
      const p1 = cw.substring(0, 38);
      const p2 = s.cleaned.substring(0, 38);
      if (p1.length >= 35 && p1 === p2) {
        bestMatch = s;
        bestScore = 1.0;
        break;
      }
      if (cw.length >= 45 && s.cleaned.includes(cw.substring(0, 42))) {
        bestMatch = s;
        bestScore = 0.98;
        break;
      }
    }

    // 2. High clinical word overlap (>= 0.88 Jaccard)
    if (wWords.size >= 8 && s.words.size >= 8) {
      let overlap = 0;
      for (const wd of wWords) {
        if (s.words.has(wd)) overlap++;
      }
      const jaccard = overlap / Math.max(wWords.size, s.words.size);
      if (jaccard >= 0.88 && jaccard > bestScore) {
        bestScore = jaccard;
        bestMatch = s;
      }
    }
  }

  if (bestMatch && bestScore >= 0.88) {
    const webpPath = path.resolve(bestMatch.local_webp_path);
    if (fs.existsSync(webpPath)) {
      strictMatches.push({
        qId: w.id,
        banca: w.institution,
        year: w.year,
        score: bestScore,
        staging_stmt: w.statement.substring(0, 90).replace(/\n/g, ' '),
        sanar_stmt: bestMatch.enunciado_texto.substring(0, 90).replace(/\n/g, ' '),
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
console.log(`STRICT ZERO-ERROR MATCHES: ${strictMatches.length}`);
console.log(`========================================\n`);

console.log('Sample strict matches (first 8):');
console.log(JSON.stringify(strictMatches.slice(0, 8), null, 2));

fs.writeFileSync('data/sanar_strict_matches.json', JSON.stringify(strictMatches, null, 2), 'utf8');
