import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/questoes_132k.db');
const sample = db.prepare(`
  SELECT id, especialidade, novo_foco, novo_subfoco, novo_sub_subfoco, status_recategorizacao, motivo_regra, substr(statement, 1, 140) as st 
  FROM questions 
  WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_EMBEDDING' 
  LIMIT 3
`).all();
console.log(JSON.stringify(sample, null, 2));

const counts = db.prepare(`
  SELECT status_recategorizacao, COUNT(*) as c 
  FROM questions 
  GROUP BY status_recategorizacao
`).all();
console.log('Distribuição Geral:', counts);

db.close();

