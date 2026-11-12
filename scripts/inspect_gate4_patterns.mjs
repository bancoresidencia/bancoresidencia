import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

console.log('--- AMOSTRAGEM DE PADRÕES PARA O GATE 4 ---');

// 1. Amostra de questões com [IMG: ...]
const sampleImgTag = db.prepare(`
  SELECT id, statement, images
  FROM questions_curated_staging
  WHERE statement LIKE '%[IMG:%'
  LIMIT 3
`).all();
console.log('\n--- PADRÃO 1: [IMG: url] ---');
for (const r of sampleImgTag) {
  console.log(`ID: ${r.id}`);
  console.log(`Images: ${r.images}`);
  console.log(`Stmt: ${r.statement.slice(0, 180)}...\n`);
}

// 2. Amostra de questões com markdown ![...](...) ou <img>
const sampleMdImg = db.prepare(`
  SELECT id, statement, images
  FROM questions_curated_staging
  WHERE statement LIKE '%![%' OR statement LIKE '%<img%'
  LIMIT 3
`).all();
console.log('\n--- PADRÃO 2: Markdown ou HTML <img> ---');
for (const r of sampleMdImg) {
  console.log(`ID: ${r.id}`);
  console.log(`Images: ${r.images}`);
  console.log(`Stmt: ${r.statement.slice(0, 180)}...\n`);
}

// 3. Amostra de questões com imagem na coluna mas SEM tag no statement
const sampleUntagged = db.prepare(`
  SELECT id, statement, images
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND length(images) > 4
    AND statement NOT LIKE '%[IMG%'
    AND statement NOT LIKE '%<img%'
    AND statement NOT LIKE '%![%'
    AND statement NOT LIKE '%[IMAGEM%'
  LIMIT 5
`).all();
console.log('\n--- PADRÃO 3: Untagged (sem tag no statement) ---');
for (const r of sampleUntagged) {
  console.log(`ID: ${r.id}`);
  console.log(`Images: ${r.images}`);
  console.log(`Stmt: ${r.statement.slice(0, 220)}...\n`);
}

// 4. Amostra de questões com MÚLTIPLAS imagens na coluna
const sampleMulti = db.prepare(`
  SELECT id, statement, images
  FROM questions_curated_staging
  WHERE images LIKE '%,%'
  LIMIT 5
`).all();
console.log('\n--- PADRÃO 4: Múltiplas Imagens ---');
for (const r of sampleMulti) {
  console.log(`ID: ${r.id}`);
  console.log(`Images count: ${JSON.parse(r.images || '[]').length}`);
  console.log(`Stmt: ${r.statement.slice(0, 220)}...\n`);
}

