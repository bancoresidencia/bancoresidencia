import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/questoes_132k.db');

const counts = db.prepare('SELECT status_recategorizacao, COUNT(*) as c FROM questions GROUP BY status_recategorizacao').all();
console.log('Distribuição Geral:', counts);

const dupCheck = db.prepare(`
  SELECT COUNT(*) as c FROM questions 
  WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
    AND LOWER(TRIM(novo_subfoco)) = LOWER(TRIM(novo_foco))
`).get().c;

const sufixCheck = db.prepare(`
  SELECT COUNT(*) as c FROM questions 
  WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
    AND novo_subfoco LIKE '%: Diagnóstico e Conduta%'
`).get().c;

const nullSubfoco = db.prepare(`
  SELECT COUNT(*) as c FROM questions 
  WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
    AND (novo_subfoco IS NULL OR TRIM(novo_subfoco) = '')
`).get().c;

const subsubCount = db.prepare(`
  SELECT COUNT(*) as c FROM questions 
  WHERE novo_sub_subfoco IS NOT NULL AND TRIM(novo_sub_subfoco) != ''
`).get().c;

console.log('Quality Gates SUBFOCO_RESOLVIDO_LLM:');
console.log('  - Inconsistências de duplicação (subfoco == foco):', dupCheck);
console.log('  - Sufixos artificiais (: Diagnóstico e Conduta):', sufixCheck);
console.log('  - Subfocos nulos ou vazios:', nullSubfoco);
console.log('  - Total geral com Sub-subfoco:', subsubCount);

db.close();

