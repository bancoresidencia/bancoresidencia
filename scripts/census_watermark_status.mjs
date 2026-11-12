import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const totalQuestions = db.prepare('SELECT count(id) as c FROM questions_curated_staging').get().c;
const withStatementImages = db.prepare(`SELECT count(id) as c FROM questions_curated_staging WHERE images IS NOT NULL AND images != '[]' AND images != ''`).get().c;
const withOptionsImages = db.prepare(`SELECT count(id) as c FROM questions_curated_staging WHERE options LIKE '%http%'`).get().c;

const remoteStatementImages = db.prepare(`SELECT count(id) as c FROM questions_curated_staging WHERE images LIKE '%http%'`).get().c;
const localStatementImages = db.prepare(`SELECT count(id) as c FROM questions_curated_staging WHERE images LIKE '%/storage/questoes/%'`).get().c;

// Breakdown by domain in statement
const allStmtRows = db.prepare(`SELECT images FROM questions_curated_staging WHERE images LIKE '%http%'`).all();
const stmtDomains = {};
for (const r of allStmtRows) {
  try {
    for (const url of JSON.parse(r.images)) {
      if (url.startsWith('http')) {
        const h = new URL(url).hostname;
        stmtDomains[h] = (stmtDomains[h] || 0) + 1;
      }
    }
  } catch {}
}

// Breakdown by domain in options
const allOptRows = db.prepare(`SELECT options FROM questions_curated_staging WHERE options LIKE '%http%'`).all();
const optDomains = {};
let totalOptImages = 0;
for (const r of allOptRows) {
  try {
    for (const opt of JSON.parse(r.options)) {
      if (opt.text && opt.text.startsWith('http')) {
        totalOptImages++;
        const h = new URL(opt.text).hostname;
        optDomains[h] = (optDomains[h] || 0) + 1;
      }
    }
  } catch {}
}

console.log('=== CENSO COMPLETO DO ACERVO VISUAL ===');
console.log({
  totalQuestions,
  withStatementImages,
  withOptionsImages,
  remoteStatementImages,
  localStatementImages,
  totalOptImages,
  stmtDomains,
  optDomains
});
