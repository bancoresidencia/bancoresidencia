import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';
import { injectDeterministicImageTags } from './test_gate4_full_pipeline.mjs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const validatedData = JSON.parse(fs.readFileSync('data/supabase_tables/intrabank_validated_matches.json', 'utf8'));
const matches = validatedData.validated || [];

console.log('='.repeat(80));
console.log(`🚀 APLICANDO ${matches.length} MATCHES INTRA-BANCO RIGOROSAMENTE VALIDADOS`);
console.log('='.repeat(80));

db.exec('BEGIN TRANSACTION');

const updateStmt = db.prepare(`
  UPDATE questions_curated_staging
  SET images = ?, statement = ?
  WHERE id = ?
`);

let appliedCount = 0;
const appliedIds = [];

try {
  for (const m of matches) {
    const target = db.prepare('SELECT id, statement, images FROM questions_curated_staging WHERE id = ?').get(m.target_id);
    if (!target) continue;

    const donorImgs = m.donor_images;
    if (!donorImgs || donorImgs.length === 0) continue;

    // Injetar tags determinísticas
    let newStmt = target.statement;
    const tagRes = injectDeterministicImageTags(newStmt, donorImgs.length);
    newStmt = tagRes.newStmt;

    const imagesJson = JSON.stringify(donorImgs);
    updateStmt.run(imagesJson, newStmt, m.target_id);
    appliedCount++;
    appliedIds.push(m.target_id);

    console.log(`✅ Aplicado em ${m.target_id} (${donorImgs.length} imagens herdadas de ${m.donor_id})`);
  }

  db.exec('COMMIT');
  console.log(`\n🎉 Total de matches intra-banco aplicados com sucesso: ${appliedCount}`);
} catch (err) {
  db.exec('ROLLBACK');
  console.error('❌ Erro na transação:', err);
  process.exit(1);
}

// Atualizar catálogo de faltantes
const catalogFile = 'data/supabase_tables/gate6_missing_catalog.json';
const catData = JSON.parse(fs.readFileSync(catalogFile, 'utf8'));
const oldCatalog = catData.catalog || [];
const newCatalog = oldCatalog.filter(q => !appliedIds.includes(q.id));

catData.catalog = newCatalog;
catData.total_missing = newCatalog.length;
fs.writeFileSync(catalogFile, JSON.stringify(catData, null, 2), 'utf8');

console.log(`\nCatálogo atualizado: de ${oldCatalog.length} para ${newCatalog.length} questões faltantes.`);
