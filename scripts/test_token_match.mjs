import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const sanarDb = new DatabaseSync('data/sanar_crawler.db');
const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const remaining = cat.catalog || cat;

console.log(`Remaining in catalog: ${remaining.length}`);

// Load statements from staging
const qMap = new Map();
for (const r of remaining) {
  const row = stagingDb.prepare('SELECT id, statement, institution, year FROM questions_curated_staging WHERE id = ?').get(r.id);
  if (row && row.statement) {
    qMap.set(r.id, row);
  }
}
console.log(`Loaded ${qMap.size} statements from staging DB.`);

// Fetch all crawl_queue URLs
const queueUrls = sanarDb.prepare("SELECT url FROM crawl_queue WHERE stage = 'question'").all().map(r => r.url);
console.log(`Loaded ${queueUrls.length} queue URLs.`);

function getSignificantWords(text) {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length >= 4 && !['anos', 'idade', 'paciente', 'apresenta', 'quadro', 'referindo', 'procura', 'hospital', 'exame'].includes(w));
}

let pass3Matches = [];

for (const [id, q] of qMap.entries()) {
  const words = getSignificantWords(q.statement);
  if (words.length < 3) continue;

  // Take first 3 distinctive words
  const keyWords = words.slice(0, 3);
  
  // Find URL that contains all 3 words in its slug
  const matched = queueUrls.find(u => keyWords.every(kw => u.includes(kw)));
  if (matched) {
    pass3Matches.push({
      qId: id,
      banca: q.institution,
      year: q.year,
      statement: q.statement.substring(0, 80),
      matched_url: matched,
      keywords: keyWords
    });
  }
}

console.log(`\n=======================================================`);
console.log(`TOKEN-BASED CRAWL QUEUE MATCHES FOUND: ${pass3Matches.length} / ${remaining.length}`);
console.log(`=======================================================\n`);

if (pass3Matches.length > 0) {
  console.log('Sample matches (first 5):');
  console.log(JSON.stringify(pass3Matches.slice(0, 5), null, 2));
  fs.writeFileSync('data/sanar_queue_matches_pass3.json', JSON.stringify(pass3Matches, null, 2), 'utf8');
}
