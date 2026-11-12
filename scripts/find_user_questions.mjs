import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

// Q1: by ID
const q1 = db.prepare('SELECT id, banca, year, images, options FROM questions_curated_staging WHERE id = ?').get('questions_189c4b71-935f-4e3f-8744-78f5cd102f2d');
console.log('Q1 (189c4b71):', q1 ? { id: q1.id, banca: q1.banca, year: q1.year, images: q1.images, optionsPreview: q1.options?.slice(0, 100) } : 'NOT FOUND');

// Q2: ECG 59 anos
const q2 = db.prepare(`SELECT id, banca, year, images, options FROM questions_curated_staging WHERE statement LIKE '%59 anos, tabagista e hipertenso%'`).get();
console.log('Q2 (ECG):', q2 ? { id: q2.id, banca: q2.banca, year: q2.year, images: q2.images } : 'NOT FOUND');

// Q3: Eletroforese 68 anos
const q3 = db.prepare(`SELECT id, banca, year, images, options FROM questions_curated_staging WHERE statement LIKE '%68 anos de idade, passa em consulta ambulatorial. Ele tem fadiga crônica%'`).get();
console.log('Q3 (Eletroforese):', q3 ? { id: q3.id, banca: q3.banca, year: q3.year, images: q3.images } : 'NOT FOUND');

// Q4: Lactente 6 meses caroços
const q4 = db.prepare(`SELECT id, banca, year, images, options FROM questions_curated_staging WHERE statement LIKE '%6 meses de idade, é levado à emergência pediátrica por sua mãe devido ao surgimento de%'`).get();
console.log('Q4 (Lactente):', q4 ? { id: q4.id, banca: q4.banca, year: q4.year, images: q4.images } : 'NOT FOUND');
