import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const sanarDb = new DatabaseSync('data/sanar_crawler.db');
const bgFiles = fs.readdirSync('data/imagens_banco_geral');

const unresolved = [
  "questions_690c186d-6980-444d-8246-4a30104d024e",
  "questions_6bc4ae30-89d1-429d-808c-52a1d4f94359",
  "questions_07a1f259-2732-4b82-9bb9-a333c0eed8c2",
  "questions_67ad255a-3914-435d-b5d6-d17b457fbec4",
  "questions_ebdb99d8-fe3e-4905-a68e-a6ec5c819d17"
];

for (const id of unresolved) {
  const q = stagingDb.prepare('SELECT statement, institution, year, images FROM questions_curated_staging WHERE id = ?').get(id);
  if (!q) continue;

  const stmt = q.statement || '';
  console.log(`\n=== ${id} (${q.institution} ${q.year}) ===`);
  console.log('Stmt:', stmt.substring(0, 80));

  // 1. Search in sanar_crawler.db
  const sMatches = sanarDb.prepare(`SELECT sanar_id, enunciado_texto FROM questions WHERE enunciado_texto LIKE ?`).all(`%${stmt.substring(0, 40)}%`);
  console.log('Sanar matches:', sMatches.length);
  for (const sm of sMatches) {
    const imgs = sanarDb.prepare('SELECT * FROM question_images WHERE sanar_id = ?').all(sm.sanar_id);
    console.log('  -> Sanar imgs:', imgs.length);
  }

  // 2. Search in banco_geral by keywords
  const words = stmt.toLowerCase().replace(/[^a-z0-9]/g, ' ').split(/\s+/).filter(w => w.length > 5).slice(0, 5);
  const bgMatches = bgFiles.filter(f => words.every(w => f.includes(w)));
  console.log('Banco geral keyword matches:', bgMatches.slice(0, 3));
}
