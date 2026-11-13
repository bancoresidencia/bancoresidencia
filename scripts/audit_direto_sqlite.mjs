import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const cols = db.prepare(`PRAGMA table_info(questions_curated_staging)`).all();
console.log('Colunas de questions_curated_staging:');
console.log(cols.map(c => c.name).join(', '));

// Vamos verificar se a coluna commentary está preenchida e se tem Take-Home Message
const sample = db.prepare(`SELECT count(*) as total,
  sum(CASE WHEN correct_answer IN ('A','B','C','D','E') OR is_anulada = 1 THEN 1 ELSE 0 END) as homologadas,
  sum(CASE WHEN commentary IS NOT NULL AND (commentary LIKE '%Take-Home Message%' OR commentary LIKE '%Take-Home%') THEN 1 ELSE 0 END) as gold,
  sum(CASE WHEN commentary IS NOT NULL AND length(commentary) > 50 AND commentary NOT LIKE '%Take-Home%' THEN 1 ELSE 0 END) as legacy,
  sum(CASE WHEN commentary IS NULL OR length(trim(commentary)) = 0 THEN 1 ELSE 0 END) as sem_comentario
FROM questions_curated_staging WHERE modalidade = 'Acesso Direto'`).get();

console.log('\nAudit Direto em questions_curated_staging:');
console.table([sample]);

