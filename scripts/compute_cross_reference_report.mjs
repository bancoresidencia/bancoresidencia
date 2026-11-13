import fs from 'node:fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

console.log('📊 Executando cruzamentos relacionais entre SSOT e Supabase Live...');

// 1. Totalizadores gerais
const totalSSOT = db.prepare('SELECT count(*) as c FROM questions_curated_staging').get().c;
const totalSupa = db.prepare('SELECT count(*) as c FROM supabase_live_questions').get().c;

// 2. IDs correspondentes (Match exato por ID)
const matching = db.prepare(`
  SELECT count(*) as c 
  FROM questions_curated_staging ssot
  INNER JOIN supabase_live_questions supa ON ssot.id = supa.id
`).get().c;

// 3. Inéditas na SSOT (IDs em questions_curated_staging mas NÃO no Supabase)
const ineditsTotal = db.prepare(`
  SELECT count(*) as c 
  FROM questions_curated_staging ssot
  LEFT JOIN supabase_live_questions supa ON ssot.id = supa.id
  WHERE supa.id IS NULL
`).get().c;

// 4. Inéditas por modalidade / tabela de destino
const ineditsByModalidade = db.prepare(`
  SELECT 
    ssot.modalidade, 
    CASE 
      WHEN ssot.modalidade = 'Acesso Direto' THEN 'questions_direto'
      WHEN ssot.modalidade = 'R+' THEN 'questions_rplus'
      WHEN ssot.modalidade = 'Revalida' THEN 'questions_revalida'
      WHEN ssot.modalidade = 'Título de Especialista' THEN 'questions_titulo'
      ELSE 'questions_direto'
    END as target_table,
    count(*) as c 
  FROM questions_curated_staging ssot
  LEFT JOIN supabase_live_questions supa ON ssot.id = supa.id
  WHERE supa.id IS NULL
  GROUP BY ssot.modalidade, target_table
  ORDER BY c DESC
`).all();

// 5. Presentes no Supabase mas NÃO na SSOT
const supaOnlyTotal = db.prepare(`
  SELECT count(*) as c 
  FROM supabase_live_questions supa
  LEFT JOIN questions_curated_staging ssot ON supa.id = ssot.id
  WHERE ssot.id IS NULL
`).get().c;

const supaOnlyByTable = db.prepare(`
  SELECT supa.supabase_table, count(*) as c 
  FROM supabase_live_questions supa
  LEFT JOIN questions_curated_staging ssot ON supa.id = ssot.id
  WHERE ssot.id IS NULL
  GROUP BY supa.supabase_table
`).all();

// 6. Divergência de Tabela/Modalidade (Questão está no Supabase em uma tabela, mas SSOT tem modalidade que pertence a outra tabela)
const modalidadeDivergences = db.prepare(`
  SELECT 
    supa.supabase_table as current_supa_table,
    ssot.modalidade as ssot_modalidade,
    CASE 
      WHEN ssot.modalidade = 'Acesso Direto' THEN 'questions_direto'
      WHEN ssot.modalidade = 'R+' THEN 'questions_rplus'
      WHEN ssot.modalidade = 'Revalida' THEN 'questions_revalida'
      WHEN ssot.modalidade = 'Título de Especialista' THEN 'questions_titulo'
      ELSE 'unknown'
    END as target_supa_table,
    count(*) as c
  FROM questions_curated_staging ssot
  INNER JOIN supabase_live_questions supa ON ssot.id = supa.id
  WHERE 
    (supa.supabase_table = 'questions_direto' AND ssot.modalidade != 'Acesso Direto')
    OR (supa.supabase_table = 'questions_rplus' AND ssot.modalidade != 'R+')
    OR (supa.supabase_table = 'questions_revalida' AND ssot.modalidade != 'Revalida')
    OR (supa.supabase_table = 'questions_titulo' AND ssot.modalidade != 'Título de Especialista')
  GROUP BY current_supa_table, ssot_modalidade, target_supa_table
  ORDER BY c DESC
`).all();

// 7. Divergência de tipo de questão (Ex: múltipla escolha vs dissertativa)
const typeDivergences = db.prepare(`
  SELECT 
    supa.type as supa_type,
    ssot.type as ssot_type,
    count(*) as c
  FROM questions_curated_staging ssot
  INNER JOIN supabase_live_questions supa ON ssot.id = supa.id
  WHERE supa.type != ssot.type OR (supa.type IS NULL AND ssot.type IS NOT NULL)
  GROUP BY supa_type, ssot_type
  ORDER BY c DESC
`).all();

// 8. Análise profunda dos comentários no Supabase por tabela
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

// 9. Comparação de Comentários entre Supabase e SSOT para as questões coincidentes
const commentaryMergeComparison = db.prepare(`
  SELECT 
    CASE 
      WHEN (supa.has_commentary = 1 AND supa.is_placeholder = 0) AND (ssot.commentary IS NOT NULL AND length(trim(ssot.commentary)) > 0) THEN 'Ambos possuem comentário real'
      WHEN (supa.has_commentary = 1 AND supa.is_placeholder = 0) AND (ssot.commentary IS NULL OR length(trim(ssot.commentary)) = 0) THEN 'Apenas Supabase possui comentário real'
      WHEN (supa.has_commentary = 0 OR supa.is_placeholder = 1) AND (ssot.commentary IS NOT NULL AND length(trim(ssot.commentary)) > 0) THEN 'Apenas SSOT possui comentário real'
      ELSE 'Nenhum possui comentário real'
    END as status,
    count(*) as c
  FROM questions_curated_staging ssot
  INNER JOIN supabase_live_questions supa ON ssot.id = supa.id
  GROUP BY status
  ORDER BY c DESC
`).all();

// 10. Quantas questões coincidentes com Take-Home no Supabase
const takeHomeInMatching = db.prepare(`
  SELECT 
    supa.supabase_table,
    count(*) as total_matching,
    sum(supa.has_take_home) as with_take_home,
    sum(supa.has_commentary - supa.is_placeholder) as with_real_comm
  FROM questions_curated_staging ssot
  INNER JOIN supabase_live_questions supa ON ssot.id = supa.id
  GROUP BY supa.supabase_table
`).all();

const report = {
  generated_at: new Date().toISOString(),
  totals: {
    ssot_total: totalSSOT,
    supabase_total: totalSupa,
    matching_by_id: matching,
    inedits_in_ssot: ineditsTotal,
    supabase_only: supaOnlyTotal
  },
  inedits_by_modalidade: ineditsByModalidade,
  supabase_only_by_table: supaOnlyByTable,
  modalidade_divergences: modalidadeDivergences,
  type_divergences: typeDivergences,
  supabase_comments_by_table: supaCommentsByTable,
  commentary_merge_comparison: commentaryMergeComparison,
  take_home_in_matching: takeHomeInMatching
};

fs.writeFileSync('data/supabase_tables/audit_cross_reference_report.json', JSON.stringify(report, null, 2));
console.log('✅ Relatório completo gerado em data/supabase_tables/audit_cross_reference_report.json');

