import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db', { open: true, readOnly: true });

// Query por especialidade no Acesso Direto (foco principal)
const statsDireto = db.prepare(`
  SELECT 
    COALESCE(especialidade, 'Não Definida / Outras') as especialidade,
    COUNT(*) as total_direto,
    SUM(CASE WHEN commentary LIKE '%Take-Home%' OR commentary LIKE '%Principal Motivo de Erro%' THEN 1 ELSE 0 END) as ouro,
    SUM(CASE WHEN (commentary IS NOT NULL AND commentary != '') AND (commentary NOT LIKE '%Take-Home%' AND commentary NOT LIKE '%Principal Motivo de Erro%') THEN 1 ELSE 0 END) as legado,
    SUM(CASE WHEN commentary IS NULL OR commentary = '' THEN 1 ELSE 0 END) as sem_comentario,
    SUM(CASE WHEN (images IS NOT NULL AND images != '[]' AND images != '') OR statement LIKE '%![%' THEN 1 ELSE 0 END) as com_imagem,
    SUM(CASE WHEN (correct_answer NOT IN ('A', 'B', 'C', 'D', 'E') OR correct_answer IS NULL) AND is_anulada != 1 THEN 1 ELSE 0 END) as sem_gabarito_oficial,
    SUM(CASE 
      WHEN (commentary NOT LIKE '%Take-Home%' AND commentary NOT LIKE '%Principal Motivo de Erro%' OR commentary IS NULL)
       AND ((images IS NULL OR images = '[]' OR images = '') AND statement NOT LIKE '%![%')
       AND (correct_answer IN ('A', 'B', 'C', 'D', 'E') OR is_anulada = 1)
      THEN 1 ELSE 0 
    END) as pendentes_ouro_texto_puro
  FROM questions_curated_staging
  WHERE source_tables LIKE '%questions_expansion_direto%' 
     OR source_tables LIKE '%questions_direto%' 
     OR source_tables LIKE '%"questions"%'
  GROUP BY COALESCE(especialidade, 'Não Definida / Outras')
  ORDER BY total_direto DESC
`).all();

// Query global de todas as tabelas (Acesso Direto, Revalida, R+, Título)
const statsGlobal = db.prepare(`
  SELECT 
    COUNT(*) as total_acervo,
    SUM(CASE WHEN commentary LIKE '%Take-Home%' OR commentary LIKE '%Principal Motivo de Erro%' THEN 1 ELSE 0 END) as ouro,
    SUM(CASE WHEN (commentary IS NOT NULL AND commentary != '') AND (commentary NOT LIKE '%Take-Home%' AND commentary NOT LIKE '%Principal Motivo de Erro%') THEN 1 ELSE 0 END) as legado,
    SUM(CASE WHEN commentary IS NULL OR commentary = '' THEN 1 ELSE 0 END) as sem_comentario,
    SUM(CASE WHEN (images IS NOT NULL AND images != '[]' AND images != '') OR statement LIKE '%![%' THEN 1 ELSE 0 END) as com_imagem,
    SUM(CASE WHEN (correct_answer NOT IN ('A', 'B', 'C', 'D', 'E') OR correct_answer IS NULL) AND is_anulada != 1 THEN 1 ELSE 0 END) as sem_gabarito_oficial,
    SUM(CASE 
      WHEN (commentary NOT LIKE '%Take-Home%' AND commentary NOT LIKE '%Principal Motivo de Erro%' OR commentary IS NULL)
       AND ((images IS NULL OR images = '[]' OR images = '') AND statement NOT LIKE '%![%')
       AND (correct_answer IN ('A', 'B', 'C', 'D', 'E') OR is_anulada = 1)
      THEN 1 ELSE 0 
    END) as pendentes_ouro_texto_puro
  FROM questions_curated_staging
`).get();

console.log('=== ESTATÍSTICA GLOBAL DO ACERVO ===');
console.log(statsGlobal);

console.log('\n=== ESTATÍSTICAS POR ESPECIALIDADE (ACESSO DIRETO) ===');
console.table(statsDireto);

// Salvar JSON com os dados para geração do relatório
fs.writeFileSync('data/relatorio_stats_cache.json', JSON.stringify({ statsDireto, statsGlobal }, null, 2), 'utf8');

db.close();
