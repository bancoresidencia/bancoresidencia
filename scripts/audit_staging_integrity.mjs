import { DatabaseSync } from 'node:sqlite';
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const REPORT_PATH = path.resolve('data/supabase_tables/staging_integrity_deep_report.json');

const db = new DatabaseSync(DB_PATH);

console.log('='.repeat(80));
console.log('🔍 AUDITORIA DE INTEGRIDADE E RE-CRUZAMENTO DE questions_curated_staging');
console.log('='.repeat(80));

function sha256(str) {
  return crypto.createHash('sha256').update(str).digest('hex');
}

function normalizeSimple(str) {
  if (!str) return '';
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^\w\s]/g, ' ').replace(/\s+/g, ' ').trim();
}

// 1. Contagem Total
const total = db.prepare('SELECT count(*) as c FROM "questions_curated_staging"').get().c;
console.log(`Total de questões na staging: ${total.toLocaleString('pt-BR')}`);

// 2. Status de Curadoria
const statusDist = db.prepare(`
  SELECT curation_status, count(*) as count,
         ROUND(count(*) * 100.0 / ${total}, 2) as pct
  FROM "questions_curated_staging"
  GROUP BY curation_status
`).all();

// 3. Distribuição de Modalidades
const modalidadeDist = db.prepare(`
  SELECT modalidade, count(*) as count,
         ROUND(count(*) * 100.0 / ${total}, 2) as pct
  FROM "questions_curated_staging"
  GROUP BY modalidade
  ORDER BY count DESC
`).all();

// 4. Integridade de Campos Críticos (Nulos ou Vazios)
const nullChecks = db.prepare(`
  SELECT
    SUM(CASE WHEN statement IS NULL OR TRIM(statement) = '' THEN 1 ELSE 0 END) as statement_empty,
    SUM(CASE WHEN options IS NULL OR TRIM(options) = '' OR options = '[]' THEN 1 ELSE 0 END) as options_empty,
    SUM(CASE WHEN correct_answer IS NULL OR TRIM(correct_answer) = '' THEN 1 ELSE 0 END) as correct_answer_empty,
    SUM(CASE WHEN is_anulada = 1 OR correct_answer = 'ANULADA' THEN 1 ELSE 0 END) as anuladas,
    SUM(CASE WHEN institution IS NULL OR TRIM(institution) = '' THEN 1 ELSE 0 END) as institution_empty,
    SUM(CASE WHEN banca IS NULL OR TRIM(banca) = '' THEN 1 ELSE 0 END) as banca_empty,
    SUM(CASE WHEN year IS NULL OR year = 0 THEN 1 ELSE 0 END) as year_empty,
    SUM(CASE WHEN especialidade IS NULL OR TRIM(especialidade) = '' THEN 1 ELSE 0 END) as especialidade_empty,
    SUM(CASE WHEN tema IS NULL OR TRIM(tema) = '' THEN 1 ELSE 0 END) as tema_empty,
    SUM(CASE WHEN foco IS NULL OR TRIM(foco) = '' THEN 1 ELSE 0 END) as foco_empty,
    SUM(CASE WHEN commentary IS NOT NULL AND LENGTH(TRIM(commentary)) > 20 THEN 1 ELSE 0 END) as com_comentario,
    SUM(CASE WHEN commentary IS NULL OR LENGTH(TRIM(commentary)) <= 20 THEN 1 ELSE 0 END) as sem_comentario,
    AVG(CASE WHEN commentary IS NOT NULL AND LENGTH(TRIM(commentary)) > 20 THEN LENGTH(commentary) ELSE NULL END) as media_caracteres_comentario,
    SUM(CASE WHEN images IS NOT NULL AND images != '[]' AND images != 'null' AND images != '' THEN 1 ELSE 0 END) as com_imagens,
    SUM(CASE WHEN numero_questao IS NOT NULL THEN 1 ELSE 0 END) as com_numero_oficial,
    SUM(CASE WHEN titulo_caderno IS NOT NULL THEN 1 ELSE 0 END) as com_caderno_oficial
  FROM "questions_curated_staging"
`).get();

// 5. Re-cruzamento Interno (Intra-Staging): Há alguma duplicata residual de enunciado + opções no mesmo ano/banca?
console.log('\n⚡ Executando re-cruzamento determinístico de integridade intra-staging...');

// Criando tabela temporária com hashes normalizados da própria staging
db.exec(`DROP TABLE IF EXISTS "temp_staging_hashes"`);
db.exec(`
  CREATE TABLE "temp_staging_hashes" (
    id TEXT PRIMARY KEY,
    year INTEGER,
    institution TEXT,
    stmt_hash TEXT,
    opts_hash TEXT,
    comp_hash TEXT
  )
`);

const insertHashStmt = db.prepare(`INSERT INTO "temp_staging_hashes" VALUES (?, ?, ?, ?, ?, ?)`);

db.exec('BEGIN TRANSACTION');
const rows = db.prepare('SELECT id, year, institution, statement, options FROM "questions_curated_staging"').all();

for (const r of rows) {
  const normStmt = normalizeSimple(r.statement);
  let normOpts = '';
  try {
    const opts = typeof r.options === 'string' ? JSON.parse(r.options) : r.options;
    if (Array.isArray(opts)) {
      normOpts = opts.map(o => normalizeSimple(o.text || '')).filter(Boolean).sort().join('||');
    }
  } catch { }

  const sHash = sha256(normStmt);
  const oHash = sha256(normOpts);
  const cHash = sha256(`${sHash}::${oHash}`);

  insertHashStmt.run(r.id, r.year || null, r.institution || null, sHash, oHash, cHash);
}
db.exec('COMMIT');

db.exec('CREATE INDEX IF NOT EXISTS "idx_tsh_comp" ON "temp_staging_hashes"("comp_hash")');
db.exec('CREATE INDEX IF NOT EXISTS "idx_tsh_stmt" ON "temp_staging_hashes"("stmt_hash")');

// Verifica colisões residuais de fingerprint completo
const compCollisions = db.prepare(`
  SELECT comp_hash, count(*) as cnt,
         GROUP_CONCAT(year) as years,
         GROUP_CONCAT(institution) as insts
  FROM "temp_staging_hashes"
  GROUP BY comp_hash
  HAVING cnt > 1
`).all();

console.log(`Colisões de enunciado + alternativas idênticas na staging: ${compCollisions.length} grupos.`);

// Dentre as colisões, quantas são de anos/bancas diferentes (preservadas de propósito) vs. mesmo ano/banca?
let sameYearBancaResidual = 0;
let differentYearBancaPreserved = 0;

for (const c of compCollisions) {
  const years = (c.years || '').split(',');
  const insts = (c.insts || '').split(',');
  const uniqueYears = new Set(years);
  const uniqueInsts = new Set(insts);

  if (uniqueYears.size > 1 || uniqueInsts.size > 1) {
    differentYearBancaPreserved++;
  } else {
    sameYearBancaResidual++;
  }
}

// 6. Estatísticas de Gabarito
const gabDistribution = db.prepare(`
  SELECT 
    CASE
      WHEN correct_answer IN ('A', 'B', 'C', 'D', 'E') THEN correct_answer
      WHEN correct_answer = 'ANULADA' OR is_anulada = 1 THEN 'ANULADA'
      WHEN correct_answer IS NULL OR TRIM(correct_answer) = '' THEN 'SEM_GABARITO'
      ELSE 'OUTROS'
    END as gab_label,
    count(*) as count,
    ROUND(count(*) * 100.0 / ${total}, 2) as pct
  FROM "questions_curated_staging"
  GROUP BY gab_label
  ORDER BY count DESC
`).all();

// 7. Amostras de Rastreabilidade (merged_from_ids)
const traceSample = db.prepare(`
  SELECT id, code, institution, year, correct_answer,
         merged_from_ids, source_tables, curation_notes
  FROM "questions_curated_staging"
  WHERE merged_from_ids LIKE '%,%'
  LIMIT 3
`).all();

const deepReport = {
  audited_at: new Date().toISOString(),
  table_name: "questions_curated_staging",
  total_records: total,
  curation_status_distribution: statusDist,
  modalidade_distribution: modalidadeDist,
  integrity_metrics: {
    statement_empty: nullChecks.statement_empty,
    options_empty: nullChecks.options_empty,
    correct_answer_empty: nullChecks.correct_answer_empty,
    anuladas: nullChecks.anuladas,
    institution_empty: nullChecks.institution_empty,
    banca_empty: nullChecks.banca_empty,
    year_empty: nullChecks.year_empty,
    especialidade_empty: nullChecks.especialidade_empty,
    tema_empty: nullChecks.tema_empty,
    foco_empty: nullChecks.foco_empty,
    com_comentario: nullChecks.com_comentario,
    pct_com_comentario: ((nullChecks.com_comentario / total) * 100).toFixed(2) + '%',
    sem_comentario: nullChecks.sem_comentario,
    media_caracteres_comentario: Math.round(nullChecks.media_caracteres_comentario || 0),
    com_imagens: nullChecks.com_imagens,
    com_numero_oficial_caderno: nullChecks.com_numero_oficial || 0,
    com_titulo_caderno_oficial: nullChecks.com_caderno_oficial || 0
  },
  intra_staging_crosscheck: {
    total_colisoes_identificadas: compCollisions.length,
    duplicatas_legitimas_preservadas_anos_ou_bancas_distintas: differentYearBancaPreserved,
    duplicatas_residuais_mesmo_ano_e_banca: sameYearBancaResidual,
    veredito_integridade: sameYearBancaResidual === 0 ? "100% LIMPO - ZERO DUPLICATAS INDEVIDAS" : "ATENÇÃO: Existem resíduos"
  },
  gabaritos_distribution: gabDistribution,
  traceability_samples: traceSample
};

fs.writeFileSync(REPORT_PATH, JSON.stringify(deepReport, null, 2), 'utf8');

// Limpeza da tabela temporária
db.exec(`DROP TABLE IF EXISTS "temp_staging_hashes"`);

console.log('\n' + '='.repeat(80));
console.log('🏁 AUDITORIA INTRA-STAGING CONCLUÍDA COM SUCESSO!');
console.log(`📊 Total na Staging: ${total.toLocaleString('pt-BR')}`);
console.log(`✅ Enunciados Vazios: ${nullChecks.statement_empty}`);
console.log(`✅ Opções Vazias: ${nullChecks.options_empty}`);
console.log(`✅ Duplicatas Indevidas Residuais no Mesmo Ano/Banca: ${sameYearBancaResidual}`);
console.log(`🏛️ Ocorrências Preservadas em Anos/Bancas Distintas: ${differentYearBancaPreserved}`);
console.log(`📝 Questões com Comentário: ${nullChecks.com_comentario.toLocaleString('pt-BR')} (${deepReport.integrity_metrics.pct_com_comentario}) | Média: ${deepReport.integrity_metrics.media_caracteres_comentario} chars`);
console.log(`🏷️ Questões com Caderno Oficial Resgatado: ${(nullChecks.com_caderno_oficial || 0).toLocaleString('pt-BR')}`);
console.log(`📄 Relatório JSON Salvo em: ${REPORT_PATH}`);
console.log('='.repeat(80));

db.close();

