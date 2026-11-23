import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const rows = db.prepare(`
  SELECT id, code, source_tables, commentary, has_images, correct_answer
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
    AND especialidade = 'Cirurgia Geral'
    AND (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1)
    AND (commentary NOT LIKE '%Take-Home%' OR commentary IS NULL)
    AND (has_images = 0 OR has_images IS NULL)
  LIMIT 5
`).all();

console.log('Amostra de 5 das 1.078 questões de Cirurgia Geral no SQLite:');
console.log(JSON.stringify(rows, null, 2));

const bySource = db.prepare(`
  SELECT source_tables, count(*) as count
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
    AND especialidade = 'Cirurgia Geral'
    AND (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1)
    AND (commentary NOT LIKE '%Take-Home%' OR commentary IS NULL)
    AND (has_images = 0 OR has_images IS NULL)
  GROUP BY source_tables
`).all();

console.log('\nDistribuição por source_tables:');
console.table(bySource);
