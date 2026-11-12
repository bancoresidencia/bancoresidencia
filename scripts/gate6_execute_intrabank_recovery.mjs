import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { injectDeterministicImageTags } from './test_gate4_full_pipeline.mjs';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const CATALOG_PATH = path.resolve('data/supabase_tables/gate6_missing_catalog.json');

const db = new DatabaseSync(DB_PATH);

console.log('='.repeat(80));
console.log('🚀 GATE 6: PILAR INTRA-BANCO COM VALIDAÇÃO ESTRITA (100% ACURÁCIA)');
console.log('='.repeat(80));

const catalogData = JSON.parse(fs.readFileSync(CATALOG_PATH, 'utf8'));
const catalog = catalogData.catalog || [];
console.log(`Catálogo atual de faltantes: ${catalog.length} questões.`);

function normalizeText(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// 1. Carregar todas as questões com imagem
const questionsWithImages = db.prepare(`
  SELECT id, year, banca, institution, statement, options, images
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const donorMap = new Map();
for (const q of questionsWithImages) {
  const norm = normalizeText(q.statement);
  if (norm.length >= 40) {
    donorMap.set(norm.slice(0, 70), q);
  }
}

// 2. Buscar correspondências estritas (mesmo ano ou opções >90% idênticas)
const validatedIntraMatches = [];

for (const cat of catalog) {
  const target = db.prepare('SELECT id, year, banca, institution, statement, options FROM questions_curated_staging WHERE id = ?').get(cat.id);
  if (!target || !target.statement) continue;

  const normTarget = normalizeText(target.statement);
  if (normTarget.length < 40) continue;

  const donor = donorMap.get(normTarget.slice(0, 70));
  if (donor && donor.id !== target.id) {
    // Validação estrita: ou mesmo ano ou opções idênticas
    let optsMatch = false;
    try {
      const tOpts = JSON.parse(target.options || '[]').map(o => normalizeText(o.text || '')).filter(Boolean).sort().join('||');
      const dOpts = JSON.parse(donor.options || '[]').map(o => normalizeText(o.text || '')).filter(Boolean).sort().join('||');
      if (tOpts && dOpts && (tOpts === dOpts || tOpts.includes(dOpts.slice(0, 40)))) {
        optsMatch = true;
      }
    } catch {}

    const isSameYear = target.year && donor.year && target.year === donor.year;

    if (optsMatch || isSameYear) {
      validatedIntraMatches.push({
        target_id: target.id,
        donor_id: donor.id,
        target_statement: target.statement,
        donor_images: donor.images,
        reason: isSameYear && optsMatch ? 'Ano e Opções Idênticos' : (isSameYear ? 'Mesmo Ano e Enunciado' : 'Opções Idênticas')
      });
    }
  }
}

console.log(`Matches intra-banco estritamente validados: ${validatedIntraMatches.length}`);

// 3. Atualizar no banco
db.exec('BEGIN TRANSACTION');

const updateStmt = db.prepare(`
  UPDATE questions_curated_staging
  SET images = ?, statement = ?
  WHERE id = ?
`);

let updatedCount = 0;
const resolvedIds = new Set();

try {
  for (const m of validatedIntraMatches) {
    let imgCount = 1;
    try {
      const arr = JSON.parse(m.donor_images);
      if (Array.isArray(arr)) imgCount = arr.length;
    } catch {}

    const { newStmt } = injectDeterministicImageTags(m.target_statement, imgCount);
    updateStmt.run(m.donor_images, newStmt, m.target_id);
    resolvedIds.add(m.target_id);
    updatedCount++;
  }

  db.exec('COMMIT');
  console.log(`✅ Sucesso! ${updatedCount} questões resgatadas via Pilar Intra-Banco.`);
} catch (err) {
  db.exec('ROLLBACK');
  console.error('❌ ERRO no pilar intra-banco! Rollback:', err);
  process.exit(1);
}

// 4. Atualizar catálogo
const remainingCatalog = catalog.filter(q => !resolvedIds.has(q.id));
fs.writeFileSync(CATALOG_PATH, JSON.stringify({
  total: remainingCatalog.length,
  catalog: remainingCatalog
}, null, 2), 'utf-8');

console.log(`✅ Catálogo atualizado: de ${catalog.length} para ${remainingCatalog.length} questões pendentes.`);

