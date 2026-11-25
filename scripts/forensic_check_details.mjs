import { DatabaseSync } from 'node:sqlite';
const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const outro = db.prepare(`SELECT id, code, modalidade, especialidade, substr(COALESCE(commentary,''),1,60) as comm FROM questions_curated_staging WHERE id NOT LIKE 'questions_%' LIMIT 10`).all();
console.log('=== 1. AMOSTRA outro_prefixo NO SQLITE ===');
console.table(outro);

const clmCheck = db.prepare(`
  SELECT COUNT(*) as total_pendente_c_gab,
    SUM(CASE WHEN has_images = 1 THEN 1 ELSE 0 END) as has_img_col_1,
    SUM(CASE WHEN images IS NOT NULL AND images != '[]' AND images != '' THEN 1 ELSE 0 END) as images_arr_nao_vazio
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto' AND especialidade = 'Clínica Médica'
    AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%')
    AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1)
`).get();
console.log('\n=== 2. CLINICA MEDICA PENDENTES C/ GABARITO NO SQLITE ===');
console.log(clmCheck);
