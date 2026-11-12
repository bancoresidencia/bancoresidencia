import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const catalog = JSON.parse(fs.readFileSync('data/supabase_tables/gate6_missing_catalog.json', 'utf8')).catalog || [];

console.log('='.repeat(80));
console.log('🔍 PILAR 3: TESTANDO CROSS-MATCHING INTRA-BANCO');
console.log('='.repeat(80));

function normalizeText(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// 1. Carregar todas as questões do banco que JÁ POSSUEM imagens válidas
const questionsWithImages = db.prepare(`
  SELECT id, year, banca, institution, statement, options, images
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

console.log(`Questões ativas com imagem para cross-matching: ${questionsWithImages.length}`);

// Criar mapa por ano e primeiros 60 caracteres normalizados
const indexBySnippet = new Map();
for (const q of questionsWithImages) {
  const norm = normalizeText(q.statement);
  if (norm.length >= 40) {
    const key = norm.slice(0, 60);
    indexBySnippet.set(key, q);
  }
}

let intraBankMatches = [];

for (const cat of catalog) {
  const fullQ = db.prepare('SELECT id, year, banca, statement, options FROM questions_curated_staging WHERE id = ?').get(cat.id);
  if (!fullQ || !fullQ.statement) continue;

  const norm = normalizeText(fullQ.statement);
  if (norm.length < 40) continue;

  const key = norm.slice(0, 60);
  const found = indexBySnippet.get(key);
  if (found && found.id !== fullQ.id) {
    // Verificar se as alternativas também batem
    intraBankMatches.push({
      missing_id: fullQ.id,
      donor_id: found.id,
      year: fullQ.year,
      donor_year: found.year,
      banca: fullQ.banca,
      donor_banca: found.banca,
      images: found.images,
      snippet: fullQ.statement.slice(0, 80)
    });
  }
}

console.log(`🎉 Matches intra-banco encontrados: ${intraBankMatches.length}`);
if (intraBankMatches.length > 0) {
  console.log('Amostra de 5 matches intra-banco:');
  console.log(intraBankMatches.slice(0, 5));
}

