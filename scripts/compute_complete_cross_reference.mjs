import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

console.log('🔄 Criando tabela auxiliar indexada de mapeamento de IDs SSOT para UUID...');

// Criar tabela de mapeamento: ssot_staging_id, raw_uuid, origin_type
db.exec(`
  DROP TABLE IF EXISTS ssot_id_mapping;
  CREATE TABLE ssot_id_mapping (
    ssot_id TEXT NOT NULL,
    clean_id TEXT NOT NULL,
    is_primary INTEGER NOT NULL
  );
  CREATE INDEX IF NOT EXISTS idx_sim_clean ON ssot_id_mapping(clean_id);
  CREATE INDEX IF NOT EXISTS idx_sim_ssot ON ssot_id_mapping(ssot_id);
`);

function cleanPrefix(id) {
  if (!id) return '';
  if (id.startsWith('questions_expansion_titulo_especialista_')) return id.slice(40);
  if (id.startsWith('questions_expansion_revalida_')) return id.slice(29);
  if (id.startsWith('questions_expansion_direto_')) return id.slice(27);
  if (id.startsWith('questions_expansion_r_plus_')) return id.slice(27);
  if (id.startsWith('questions_')) return id.slice(10);
  return id;
}

const insertMap = db.prepare('INSERT INTO ssot_id_mapping (ssot_id, clean_id, is_primary) VALUES (?, ?, ?)');

const allSSOT = db.prepare('SELECT id, merged_from_ids FROM questions_curated_staging').all();

db.exec('BEGIN TRANSACTION');
for (const row of allSSOT) {
  const primaryClean = cleanPrefix(row.id);
  insertMap.run(row.id, primaryClean, 1);

  if (row.merged_from_ids) {
    try {
      const mergedList = JSON.parse(row.merged_from_ids);
      for (const mId of mergedList) {
        const mClean = cleanPrefix(mId);
        if (mClean !== primaryClean) {
          insertMap.run(row.id, mClean, 0);
        }
      }
    } catch (e) {}
  }
}
db.exec('COMMIT');

console.log('✅ Mapeamento de IDs criado. Total mapeado:', db.prepare('SELECT count(*) as c FROM ssot_id_mapping').get().c);

// 1. Totalizadores gerais
const totalSSOT = db.prepare('SELECT count(*) as c FROM questions_curated_staging').get().c;
const totalSupa = db.prepare('SELECT count(*) as c FROM supabase_live_questions').get().c;

// 2. Quantas questões do Supabase têm correspondência na SSOT (por clean_id)?
const supaMatched = db.prepare(`
  SELECT count(DISTINCT supa.id) as c
  FROM supabase_live_questions supa
  INNER JOIN ssot_id_mapping m ON supa.id = m.clean_id
`).get().c;

// Quantas questões da SSOT têm correspondência com o Supabase?
const ssotMatched = db.prepare(`
  SELECT count(DISTINCT m.ssot_id) as c
  FROM ssot_id_mapping m
  INNER JOIN supabase_live_questions supa ON m.clean_id = supa.id
`).get().c;

// 3. Inéditas na SSOT (questões da SSOT que NÃO têm nenhum ID no Supabase)
const ssotInedits = db.prepare(`
  SELECT count(*) as c
  FROM questions_curated_staging q
  WHERE q.id NOT IN (
    SELECT DISTINCT m.ssot_id 
    FROM ssot_id_mapping m 
    INNER JOIN supabase_live_questions supa ON m.clean_id = supa.id
  )
`).get().c;

// 4. Inéditas na SSOT por modalidade e tabela de destino
const ineditsByModalidade = db.prepare(`
  SELECT 
    q.modalidade, 
    CASE 
      WHEN q.modalidade = 'Acesso Direto' THEN 'questions_direto'
      WHEN q.modalidade = 'R+' THEN 'questions_rplus'
      WHEN q.modalidade = 'Revalida' THEN 'questions_revalida'
      WHEN q.modalidade = 'Título de Especialista' THEN 'questions_titulo'
      ELSE 'questions_direto'
    END as target_table,
    count(*) as c
  FROM questions_curated_staging q
  WHERE q.id NOT IN (
    SELECT DISTINCT m.ssot_id 
    FROM ssot_id_mapping m 
    INNER JOIN supabase_live_questions supa ON m.clean_id = supa.id
  )
  GROUP BY q.modalidade, target_table
  ORDER BY c DESC
`).all();

// 5. Presentes no Supabase mas NÃO na SSOT (órfãs no Supabase)
const supaOrphans = db.prepare(`
  SELECT count(*) as c
  FROM supabase_live_questions supa
  LEFT JOIN ssot_id_mapping m ON supa.id = m.clean_id
  WHERE m.clean_id IS NULL
`).get().c;

const supaOrphansByTable = db.prepare(`
  SELECT supa.supabase_table, count(*) as c
  FROM supabase_live_questions supa
  LEFT JOIN ssot_id_mapping m ON supa.id = m.clean_id
  WHERE m.clean_id IS NULL
  GROUP BY supa.supabase_table
`).all();

// 6. Divergência de Tabela / Modalidade nas correspondentes
// (Ex: Está em questions_direto no Supabase, mas na SSOT sua modalidade é Revalida ou R+ e deve migrar de tabela)
const modalidadeDivergences = db.prepare(`
  SELECT 
    supa.supabase_table as current_supa_table,
    q.modalidade as ssot_modalidade,
    CASE 
      WHEN q.modalidade = 'Acesso Direto' THEN 'questions_direto'
      WHEN q.modalidade = 'R+' THEN 'questions_rplus'
      WHEN q.modalidade = 'Revalida' THEN 'questions_revalida'
      WHEN q.modalidade = 'Título de Especialista' THEN 'questions_titulo'
      ELSE 'unknown'
    END as target_supa_table,
    count(DISTINCT q.id) as c
  FROM questions_curated_staging q
  INNER JOIN ssot_id_mapping m ON q.id = m.ssot_id
  INNER JOIN supabase_live_questions supa ON m.clean_id = supa.id
  WHERE 
    (supa.supabase_table = 'questions_direto' AND q.modalidade != 'Acesso Direto')
    OR (supa.supabase_table = 'questions_rplus' AND q.modalidade != 'R+')
    OR (supa.supabase_table = 'questions_revalida' AND q.modalidade != 'Revalida')
    OR (supa.supabase_table = 'questions_titulo' AND q.modalidade != 'Título de Especialista')
  GROUP BY current_supa_table, ssot_modalidade, target_supa_table
  ORDER BY c DESC
`).all();

// 7. Divergência de Tipo de Questão (Ex: Múltipla escolha vs Dissertativa)
const typeDivergences = db.prepare(`
  SELECT 
    supa.type as supa_type,
    q.type as ssot_type,
    count(DISTINCT q.id) as c
  FROM questions_curated_staging q
  INNER JOIN ssot_id_mapping m ON q.id = m.ssot_id
  INNER JOIN supabase_live_questions supa ON m.clean_id = supa.id
  WHERE (supa.type != q.type OR (supa.type IS NULL AND q.type IS NOT NULL))
  GROUP BY supa_type, ssot_type
  ORDER BY c DESC
`).all();

// 8. Diagnóstico de comentários nas 4 tabelas do Supabase
const supaCommentsByTable = db.prepare(`
  SELECT 
    supabase_table,
    count(*) as total_questions,
    sum(has_commentary) as with_commentary,
    sum(is_placeholder) as with_placeholder,
    sum(has_commentary - is_placeholder) as with_real_commentary,
    sum(is_llm) as with_llm,
    sum(has_take_home) as with_take_home,
    sum(has_motivo) as with_motivo,
    sum(has_justificativa) as with_justificativa,
    round(avg(CASE WHEN comm_len > 0 THEN comm_len ELSE NULL END), 0) as avg_comm_len
  FROM supabase_live_questions
  GROUP BY supabase_table
`).all();

// 9. Comentários completos / LLM nas questões coincidentes
const matchingCommentaryStats = db.prepare(`
  SELECT 
    supa.supabase_table,
    count(DISTINCT q.id) as matching_questions,
    sum(supa.has_commentary) as supa_with_commentary,
    sum(supa.is_placeholder) as supa_with_placeholder,
    sum(supa.has_commentary - supa.is_placeholder) as supa_real_commentary,
    sum(supa.has_take_home) as supa_with_take_home,
    sum(CASE WHEN q.commentary IS NOT NULL AND length(trim(q.commentary)) > 0 THEN 1 ELSE 0 END) as ssot_with_commentary
  FROM questions_curated_staging q
  INNER JOIN ssot_id_mapping m ON q.id = m.ssot_id
  INNER JOIN supabase_live_questions supa ON m.clean_id = supa.id
  GROUP BY supa.supabase_table
`).all();

// 10. Qualidade do merge de comentários nas questões coincidentes
const mergePriorityReport = db.prepare(`
  SELECT 
    CASE 
      WHEN (supa.has_take_home = 1) THEN '1. Preserva Supabase: Comentário Padrão-Ouro / LLM (Take-Home)'
      WHEN (supa.has_commentary = 1 AND supa.is_placeholder = 0) THEN '2. Preserva Supabase: Comentário Médico Legado Completo'
      WHEN (supa.has_commentary = 0 OR supa.is_placeholder = 1) AND (q.commentary IS NOT NULL AND length(trim(q.commentary)) > 0) THEN '3. Preserva SSOT: Supabase sem comentário ou placeholder, SSOT possui comentário'
      ELSE '4. Ambas sem comentário'
    END as merge_decision,
    count(DISTINCT q.id) as c
  FROM questions_curated_staging q
  INNER JOIN ssot_id_mapping m ON q.id = m.ssot_id
  INNER JOIN supabase_live_questions supa ON m.clean_id = supa.id
  GROUP BY merge_decision
  ORDER BY merge_decision ASC
`).all();

const finalReport = {
  generated_at: new Date().toISOString(),
  totals: {
    ssot_total: totalSSOT,
    supabase_total: totalSupa,
    ssot_matched_to_supabase: ssotMatched,
    supabase_matched_to_ssot: supaMatched,
    ssot_inedits_to_insert: ssotInedits,
    supabase_orphans: supaOrphans
  },
  inedits_by_modalidade: ineditsByModalidade,
  supabase_orphans_by_table: supaOrphansByTable,
  modalidade_divergences: modalidadeDivergences,
  type_divergences: typeDivergences,
  supabase_comments_by_table: supaCommentsByTable,
  matching_commentary_stats: matchingCommentaryStats,
  merge_priority_report: mergePriorityReport
};

fs.writeFileSync('data/supabase_tables/complete_cross_reference_report.json', JSON.stringify(finalReport, null, 2));
console.log('✅ Relatório consolidado gerado em data/supabase_tables/complete_cross_reference_report.json');
console.log(JSON.stringify(finalReport, null, 2));

