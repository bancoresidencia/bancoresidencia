import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`SELECT images FROM questions_curated_staging WHERE images LIKE '%http%'`).all();

const domains = {};
let totalUrls = 0;

for (const r of rows) {
  try {
    const imgs = JSON.parse(r.images);
    for (const url of imgs) {
      if (typeof url === 'string' && url.startsWith('http')) {
        totalUrls++;
        try {
          const u = new URL(url);
          domains[u.hostname] = (domains[u.hostname] || 0) + 1;
        } catch {
          domains['invalid_url'] = (domains['invalid_url'] || 0) + 1;
        }
      }
    }
  } catch {}
}

console.log('Total remote URLs:', totalUrls);
console.log('Domains breakdown:', domains);

