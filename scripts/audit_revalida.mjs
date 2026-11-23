import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const rows = db.prepare(`
  SELECT 
    modalidade,
    COUNT(*) as total,
    SUM(CASE WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1 THEN 1 ELSE 0 END) as with_valid_key,
    SUM(CASE WHEN ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) AND commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as with_gold,
    SUM(CASE WHEN ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%') THEN 1 ELSE 0 END) as pending_with_key,
    SUM(CASE WHEN ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%') AND (has_images = 0 OR has_images IS NULL) AND (images IS NULL OR images = '[]' OR images = '') THEN 1 ELSE 0 END) as pure_text_pending
  FROM questions_curated_staging
  WHERE modalidade LIKE '%Revalida%'
  GROUP BY modalidade
`).all();

console.log('AUDITORIA DE QUESTÕES REVALIDA:');
console.table(rows);

// Detalhamento por especialidade no Revalida
const specRows = db.prepare(`
  SELECT 
    COALESCE(especialidade, 'NÃO CLASSIFICADA') as especialidade,
    COUNT(*) as total,
    SUM(CASE WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1 THEN 1 ELSE 0 END) as com_gabarito,
    SUM(CASE WHEN ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) AND commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro,
    SUM(CASE WHEN ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%') AND (has_images = 0 OR has_images IS NULL) AND (images IS NULL OR images = '[]' OR images = '') THEN 1 ELSE 0 END) as texto_puro_pendente,
    SUM(CASE WHEN ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1) AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%') AND (has_images = 1 OR (images IS NOT NULL AND images != '[]' AND images != '')) THEN 1 ELSE 0 END) as com_imagem_pendente
  FROM questions_curated_staging
  WHERE modalidade LIKE '%Revalida%'
  GROUP BY especialidade
  ORDER BY texto_puro_pendente DESC
`).all();

console.log('\nDETALHAMENTO POR ESPECIALIDADE NO REVALIDA:');
console.table(specRows);
