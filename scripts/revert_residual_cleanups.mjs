import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const manifestPath = 'data/supabase_tables/residual_cleaned_manifest.json';
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log('='.repeat(80));
console.log(`🔄 REVERTENDO HIGIENIZAÇÃO DE ENUNCIADOS PARA ${manifest.cleaned_ids.length} QUESTÕES`);
console.log('='.repeat(80));

db.exec('BEGIN TRANSACTION');

const updateStmt = db.prepare(`
  UPDATE questions_curated_staging
  SET statement = (
    SELECT statement 
    FROM questions_curated_staging_pre_images_backup 
    WHERE questions_curated_staging_pre_images_backup.id = questions_curated_staging.id
  )
  WHERE id = ?
`);

let revertedCount = 0;

try {
  for (const id of manifest.cleaned_ids) {
    updateStmt.run(id);
    revertedCount++;
  }

  db.exec('COMMIT');
  console.log(`✅ ${revertedCount} enunciados revertidos com 100% de integridade a partir de questions_curated_staging_pre_images_backup.`);
} catch (err) {
  db.exec('ROLLBACK');
  console.error('❌ Erro ao reverter:', err);
  process.exit(1);
}

// Verificação pós-reversão
let mismatchCount = 0;
for (const id of manifest.cleaned_ids) {
  const current = db.prepare('SELECT statement FROM questions_curated_staging WHERE id = ?').get(id);
  const backup = db.prepare('SELECT statement FROM questions_curated_staging_pre_images_backup WHERE id = ?').get(id);
  if (current.statement !== backup.statement) {
    mismatchCount++;
    console.warn(`⚠️ Divergência no ID: ${id}`);
  }
}

if (mismatchCount === 0) {
  console.log('🎉 Auditoria de integridade pós-reversão: 100% idêntico ao original oficial!');
  // Gravar status no manifesto
  manifest.reverted = true;
  manifest.reverted_at = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8');
} else {
  console.error(`❌ Houve ${mismatchCount} divergências pós-reversão!`);
}

