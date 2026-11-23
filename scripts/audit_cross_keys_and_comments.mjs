import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

console.log('=== CRUZAMENTO REAL DE GABARITOS E COMENTÁRIOS NO ACESSO DIRETO ===\n');

const stats = db.prepare(`
  SELECT 
    count(*) as total,
    
    -- 1. GRUPO COM GABARITO OFICIAL HOMOLOGADO (A, B, C, D, E ou ANULADA)
    sum(CASE WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1) THEN 1 ELSE 0 END) as total_com_gabarito,
    
    sum(CASE 
      WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1) 
       AND commentary LIKE '%Take-Home%' 
      THEN 1 ELSE 0 
    END) as com_gabarito_e_padrao_ouro,
    
    sum(CASE 
      WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1) 
       AND commentary NOT LIKE '%Take-Home%' 
       AND commentary IS NOT NULL 
       AND TRIM(commentary) != '' 
      THEN 1 ELSE 0 
    END) as com_gabarito_e_comentario_legado,
    
    sum(CASE 
      WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1) 
       AND (commentary IS NULL OR TRIM(commentary) = '') 
      THEN 1 ELSE 0 
    END) as com_gabarito_e_sem_comentario,

    -- 2. GRUPO SEM GABARITO HOMOLOGADO (NULL, Vazio ou Dissertativa)
    sum(CASE WHEN (correct_answer IS NULL OR UPPER(TRIM(correct_answer)) NOT IN ('A','B','C','D','E')) AND (is_anulada = 0 OR is_anulada IS NULL) THEN 1 ELSE 0 END) as total_sem_gabarito,
    
    sum(CASE 
      WHEN (correct_answer IS NULL OR UPPER(TRIM(correct_answer)) NOT IN ('A','B','C','D','E')) AND (is_anulada = 0 OR is_anulada IS NULL)
       AND commentary LIKE '%Take-Home%' 
      THEN 1 ELSE 0 
    END) as sem_gabarito_mas_tem_padrao_ouro,
    
    sum(CASE 
      WHEN (correct_answer IS NULL OR UPPER(TRIM(correct_answer)) NOT IN ('A','B','C','D','E')) AND (is_anulada = 0 OR is_anulada IS NULL)
       AND commentary NOT LIKE '%Take-Home%' 
       AND commentary IS NOT NULL 
       AND TRIM(commentary) != '' 
      THEN 1 ELSE 0 
    END) as sem_gabarito_mas_tem_comentario_legado,
    
    sum(CASE 
      WHEN (correct_answer IS NULL OR UPPER(TRIM(correct_answer)) NOT IN ('A','B','C','D','E')) AND (is_anulada = 0 OR is_anulada IS NULL)
       AND (commentary IS NULL OR TRIM(commentary) = '') 
      THEN 1 ELSE 0 
    END) as sem_gabarito_e_sem_comentario

  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
`).get();

console.log(JSON.stringify(stats, null, 2));

// Detalhamento por Especialidade
const perSpec = db.prepare(`
  SELECT 
    COALESCE(especialidade, 'Não Definida') as especialidade,
    count(*) as total,
    
    -- COM GABARITO
    sum(CASE WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1) THEN 1 ELSE 0 END) as com_gabarito,
    sum(CASE WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1) AND commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as padrao_ouro,
    sum(CASE WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1) AND commentary NOT LIKE '%Take-Home%' AND commentary IS NOT NULL AND TRIM(commentary) != '' THEN 1 ELSE 0 END) as comentario_legado,
    sum(CASE WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1) AND (commentary IS NULL OR TRIM(commentary) = '') THEN 1 ELSE 0 END) as sem_comentario,
    
    -- PENDENTES TEXTO PURO (QUE A ESTEIRA PODE PRODUZIR)
    sum(CASE 
      WHEN (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1) 
       AND (commentary NOT LIKE '%Take-Home%' OR commentary IS NULL)
       AND (has_images = 0 OR has_images IS NULL)
      THEN 1 ELSE 0 
    END) as pendentes_texto_com_gabarito,
    
    -- SEM GABARITO
    sum(CASE WHEN (correct_answer IS NULL OR UPPER(TRIM(correct_answer)) NOT IN ('A','B','C','D','E')) AND (is_anulada = 0 OR is_anulada IS NULL) THEN 1 ELSE 0 END) as sem_gabarito_homologado

  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
  GROUP BY especialidade
  ORDER BY total DESC
`).all();

console.log('\n--- DETALHAMENTO POR ESPECIALIDADE ---');
console.table(perSpec);
