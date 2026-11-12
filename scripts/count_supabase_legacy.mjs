import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`SELECT id, banca, year, images FROM questions_curated_staging WHERE images LIKE '%bxedpdmgvgatjdfxgxij.supabase.co%'`).all();

console.log('Supabase legacy questions count:', rows.length);
const years = {};
const bancas = {};
for (const r of rows) {
  years[r.year] = (years[r.year] || 0) + 1;
  bancas[r.banca] = (bancas[r.banca] || 0) + 1;
}
console.log('Years breakdown:', years);
console.log('Top Bancas:', Object.entries(bancas).sort((a,b)=>b[1]-a[1]).slice(0, 10));

