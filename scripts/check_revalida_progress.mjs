import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

// Revalida
const revalidaSpec = db.prepare(`
  SELECT 
    COALESCE(especialidade, 'NÃO CLASSIFICADA') as especialidade,
    COUNT(*) as total_com_gabarito,
    SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as concluidas,
    SUM(CASE WHEN commentary IS NULL OR commentary NOT LIKE '%Take-Home%' THEN 1 ELSE 0 END) as faltam,
    ROUND((CAST(SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) AS REAL) / COUNT(*)) * 100, 1) as perc_concluido
  FROM questions_curated_staging
  WHERE modalidade = 'Revalida'
    AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1)
  GROUP BY especialidade
  ORDER BY faltam DESC
`).all();

console.log('=== REVALIDA POR ESPECIALIDADE ===');
console.table(revalidaSpec);

// Acesso Direto para visão geral comparativa
const diretoSpec = db.prepare(`
  SELECT 
    COALESCE(especialidade, 'NÃO CLASSIFICADA') as especialidade,
    COUNT(*) as total_com_gabarito,
    SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) as concluidas,
    SUM(CASE WHEN commentary IS NULL OR commentary NOT LIKE '%Take-Home%' THEN 1 ELSE 0 END) as faltam,
    ROUND((CAST(SUM(CASE WHEN commentary LIKE '%Take-Home%' THEN 1 ELSE 0 END) AS REAL) / COUNT(*)) * 100, 1) as perc_concluido
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
    AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1)
  GROUP BY especialidade
  ORDER BY faltam DESC
`).all();

console.log('\n=== ACESSO DIRETO POR ESPECIALIDADE ===');
console.table(diretoSpec);

// Status do state file
if (fs.existsSync('data/pipeline_revalida_state.json')) {
  console.log('\n=== ESTADO DA ESTEIRA REVALIDA (LIVE) ===');
  console.log(JSON.parse(fs.readFileSync('data/pipeline_revalida_state.json', 'utf8')));
}
