import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const sanarDb = new DatabaseSync('data/sanar_crawler.db');
const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

function cleanText(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

console.log('Loading all questions with <img> from sanar_crawler.db...');
const sanarRows = sanarDb.prepare(`
  SELECT sanar_id, instituicao, ano, enunciado_texto, enunciado_original,
         alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e
  FROM questions
  WHERE enunciado_original LIKE '%<img%'
     OR alternativa_a LIKE '%<img%'
     OR alternativa_b LIKE '%<img%'
`).all();

console.log(`Loaded ${sanarRows.length} questions with <img> tags from Sanar.`);

const sanarEntries = [];
for (const r of sanarRows) {
  const fullHtml = [r.enunciado_original, r.alternativa_a, r.alternativa_b, r.alternativa_c, r.alternativa_d, r.alternativa_e].filter(Boolean).join(' ');
  const imgMatches = fullHtml.match(/src=["'](https?:\/\/[^"']+)["']/gi) || [];
  const urls = imgMatches.map(m => m.replace(/^src=["']|["']$/gi, '').split('?')[0]);
  const cleanUrls = urls.filter(u => u.includes('assets') || u.includes('cetrus') || u.includes('lunar') || u.includes('sanar'));

  if (cleanUrls.length > 0) {
    sanarEntries.push({
      sanar_id: r.sanar_id,
      cleaned: cleanText(r.enunciado_texto),
      raw_text: r.enunciado_texto,
      urls: cleanUrls,
      instituicao: r.instituicao,
      ano: r.ano
    });
  }
}

console.log(`Sanar entries with extracted clean image URLs: ${sanarEntries.length}`);

// Load remaining 1,768 watermarked questions
const remaining = JSON.parse(fs.readFileSync('data/remaining_watermarked_1769.json', 'utf8'));
console.log(`Checking ${remaining.length} remaining watermarked questions...`);

const matches = [];
for (const w of remaining) {
  const cw = cleanText(w.statement);
  if (cw.length < 40) continue;

  const pW = cw.substring(0, 50);

  for (const s of sanarEntries) {
    const pS = s.cleaned.substring(0, 50);
    if (pW === pS && pW.length >= 45) {
      matches.push({
        qId: w.id,
        banca: w.institution,
        year: w.year,
        staging_stmt: w.statement.substring(0, 90).replace(/\n/g, ' '),
        sanar_stmt: s.raw_text.substring(0, 90).replace(/\n/g, ' '),
        sanar_id: s.sanar_id,
        urls: s.urls
      });
      break;
    }
  }
}

console.log(`\n========================================`);
console.log(`NEW SANAR MATCHES WITH IMAGE URLS: ${matches.length}`);
console.log(`========================================\n`);

if (matches.length > 0) {
  console.log('Sample matches (first 5):');
  console.log(JSON.stringify(matches.slice(0, 5), null, 2));
}

fs.writeFileSync('data/new_sanar_img_matches.json', JSON.stringify(matches, null, 2), 'utf8');
