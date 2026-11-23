import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const sanarDb = new DatabaseSync('data/sanar_crawler.db');

function toSlug(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .substring(0, 75);
}

console.log('Loading all 164,885 question URLs from crawl_queue...');
const rows = sanarDb.prepare("SELECT url, parent_url FROM crawl_queue WHERE stage = 'question'").all();
console.log(`Loaded ${rows.length} URLs from crawl_queue.`);

// Build map of url slugs
const urlMap = new Map();
for (const r of rows) {
  const match = r.url.match(/\/q\/([^\/]+)/);
  if (match) {
    const slug = match[1].substring(0, 50);
    if (!urlMap.has(slug)) {
      urlMap.set(slug, r);
    }
  }
}
console.log(`Indexed ${urlMap.size} unique URL prefixes from crawl_queue.`);

// Load our remaining 1,768 watermarked questions
const watermarked = JSON.parse(fs.readFileSync('data/remaining_watermarked_1769.json', 'utf8'));
console.log(`Checking ${watermarked.length} remaining watermarked questions...`);

const matchedQueue = [];

for (const w of watermarked) {
  const slug = toSlug(w.statement).substring(0, 50);
  if (slug.length >= 25 && urlMap.has(slug)) {
    const queueItem = urlMap.get(slug);
    matchedQueue.push({
      qId: w.id,
      banca: w.institution,
      year: w.year,
      statement: w.statement.substring(0, 80),
      sanar_url: queueItem.url,
      parent_url: queueItem.parent_url
    });
  }
}

console.log(`\n========================================`);
console.log(`MATCHED WITH PENDING CRAWL QUEUE: ${matchedQueue.length}`);
console.log(`========================================\n`);

if (matchedQueue.length > 0) {
  console.log('Sample matched (first 10):');
  console.log(JSON.stringify(matchedQueue.slice(0, 10), null, 2));
}

fs.writeFileSync('data/sanar_queue_matches.json', JSON.stringify(matchedQueue, null, 2), 'utf8');
