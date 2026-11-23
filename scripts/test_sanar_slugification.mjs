import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const sanarDb = new DatabaseSync('data/sanar_crawler.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const remaining = cat.catalog || cat;

function toSanarSlug(str) {
  if (!str) return '';
  let s = str.toLowerCase();
  
  // Sanar's HTML entity slugification
  s = s.replace(/á/g, 'aacute')
       .replace(/à/g, 'agrave')
       .replace(/ã/g, 'atilde')
       .replace(/â/g, 'acirc')
       .replace(/é/g, 'eacute')
       .replace(/ê/g, 'ecirc')
       .replace(/í/g, 'iacute')
       .replace(/ó/g, 'oacute')
       .replace(/õ/g, 'otilde')
       .replace(/ô/g, 'ocirc')
       .replace(/ú/g, 'uacute')
       .replace(/ç/g, 'ccedil');

  // fallback NFD for anything else
  s = s.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  return s.replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

console.log('Loading all 164,885 URLs from crawl_queue...');
const rows = sanarDb.prepare("SELECT url FROM crawl_queue WHERE stage = 'question'").all();
console.log(`Loaded ${rows.length} URLs.`);

// Index by both exact slug and prefixes of 35, 45, 55
const queueSlugs = new Set();
const prefixMap35 = new Map();
const prefixMap45 = new Map();

for (const r of rows) {
  const match = r.url.match(/\/q\/([^\/]+)/);
  if (match) {
    const slug = match[1];
    queueSlugs.add(slug);
    const p35 = slug.substring(0, 35);
    const p45 = slug.substring(0, 45);
    if (!prefixMap35.has(p35)) prefixMap35.set(p35, r.url);
    if (!prefixMap45.has(p45)) prefixMap45.set(p45, r.url);
  }
}

console.log(`Checking ${remaining.length} remaining watermarked questions with Sanar entity slugs...`);
let matchCount = 0;
const newMatches = [];

for (const w of remaining) {
  const stmt = w.statement_snippet || w.statement || '';
  const sanarSlug = toSanarSlug(stmt);
  
  const p45 = sanarSlug.substring(0, 45);
  const p35 = sanarSlug.substring(0, 35);

  let matchedUrl = null;
  if (prefixMap45.has(p45)) {
    matchedUrl = prefixMap45.get(p45);
  } else if (p35.length >= 30 && prefixMap35.has(p35)) {
    matchedUrl = prefixMap35.get(p35);
  }

  if (matchedUrl) {
    matchCount++;
    newMatches.push({
      qId: w.id,
      banca: w.banca,
      year: w.year,
      statement: stmt.substring(0, 80),
      sanar_url: matchedUrl
    });
  }
}

console.log(`\n=======================================================`);
console.log(`ADDITIONAL SANAR QUEUE MATCHES FOUND: ${matchCount} / ${remaining.length}`);
console.log(`=======================================================\n`);

if (newMatches.length > 0) {
  console.log('Sample new matches:');
  console.log(JSON.stringify(newMatches.slice(0, 5), null, 2));
  fs.writeFileSync('data/sanar_queue_matches_pass2.json', JSON.stringify(newMatches, null, 2), 'utf8');
}
