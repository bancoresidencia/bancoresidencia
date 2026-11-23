import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const total = db.prepare("SELECT count(*) as c FROM questions_curated_staging WHERE modalidade = 'Acesso Direto'").get().c;

const validAnswers = db.prepare(`
  SELECT count(*) as c 
  FROM questions_curated_staging 
  WHERE modalidade = 'Acesso Direto' 
    AND (UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E') OR is_anulada = 1)
`).get().c;

const nullOrEmpty = db.prepare(`
  SELECT count(*) as c 
  FROM questions_curated_staging 
  WHERE modalidade = 'Acesso Direto' 
    AND (correct_answer IS NULL OR TRIM(correct_answer) = '')
    AND (is_anulada = 0 OR is_anulada IS NULL)
`).get().c;

const distinctNonStandard = db.prepare(`
  SELECT UPPER(TRIM(correct_answer)) as ans, count(*) as count
  FROM questions_curated_staging
  WHERE modalidade = 'Acesso Direto'
    AND (correct_answer IS NULL OR UPPER(TRIM(correct_answer)) NOT IN ('A','B','C','D','E'))
    AND (is_anulada = 0 OR is_anulada IS NULL)
  GROUP BY ans
  ORDER BY count DESC
`).all();

console.log('=== AUDITORIA REAL DE GABARITOS NO ACESSO DIRETO ===');
console.log('Total Acesso Direto:', total);
console.log('Com gabarito homologado válido (A, B, C, D, E ou anulada):', validAnswers);
console.log('SEM gabarito homologado (Total - Válidos):', total - validAnswers);
console.log('\nDistribuição dos valores não-padronizados:');
console.table(distinctNonStandard);
