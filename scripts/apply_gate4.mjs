import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';
import { injectDeterministicImageTags } from './test_gate4_full_pipeline.mjs';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

console.log('='.repeat(80));
console.log('🚀 APLICANDO GATE 4: VÍNCULO DETERMINÍSTICO ENUNCIADO-IMAGEM');
console.log('='.repeat(80));

// Buscar todas as questões que possuem imagens na coluna images
const rows = db.prepare(`
  SELECT id, statement, images
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

console.log(`Carregadas ${rows.length.toLocaleString('pt-BR')} questões com imagem para vinculação.`);

const updateStmt = db.prepare(`
  UPDATE questions_curated_staging
  SET statement = ?
  WHERE id = ?
`);

// Iniciar transação atômica
db.exec('BEGIN TRANSACTION');

let updatedCount = 0;
let unchangedCount = 0;
const strategyStats = {};

try {
  for (const r of rows) {
    let imgCount = 1;
    try {
      const arr = JSON.parse(r.images);
      if (Array.isArray(arr)) imgCount = arr.length;
    } catch {}

    const { newStmt, strategy } = injectDeterministicImageTags(r.statement, imgCount);
    strategyStats[strategy] = (strategyStats[strategy] || 0) + 1;

    if (newStmt !== r.statement) {
      updateStmt.run(newStmt, r.id);
      updatedCount++;
    } else {
      unchangedCount++;
    }
  }

  db.exec('COMMIT');
  console.log(`\n✅ Transação confirmada (COMMIT)!`);
  console.log(`- Questões com enunciado atualizado com tags determinísticas: ${updatedCount.toLocaleString('pt-BR')}`);
  console.log(`- Questões mantidas (já perfeitamente ancoradas): ${unchangedCount}`);
  console.log('\nEstatísticas por Estratégia Aplicada:');
  console.table(strategyStats);

} catch (err) {
  db.exec('ROLLBACK');
  console.error('❌ ERRO crítico durante aplicação! Rollback executado:', err);
  process.exit(1);
}

// Auditoria pós-execução
console.log('\n🔍 Executando auditoria pós-aplicação no banco SQLite...');
const postCheck = db.prepare(`
  SELECT count(*) as c
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
    AND statement NOT LIKE '%[IMAGEM 1]%'
`).get().c;

console.log(`Questões com imagens mas sem [IMAGEM 1] no enunciado: ${postCheck}`);
if (postCheck === 0) {
  console.log('🏆 GATE 4 100% HOMOLOGADO NO BANCO DE DADOS!');
} else {
  console.error(`⚠️ Atenção: ${postCheck} questões não possuem a tag.`);
}

