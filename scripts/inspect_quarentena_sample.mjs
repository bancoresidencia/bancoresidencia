import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/questoes_132k.db');
const sample = db.prepare(`
  SELECT id, especialidade, tema, foco, subfoco, antigo_tema, antigo_foco, antigo_subfoco, novo_tema, novo_foco, motivo_regra, substr(statement, 1, 150) as st 
  FROM questions 
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA' 
  LIMIT 5
`).all();
console.log(JSON.stringify(sample, null, 2));

const motivos = db.prepare(`
  SELECT motivo_regra, count(*) as c 
  FROM questions 
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA' 
  GROUP BY motivo_regra 
  ORDER BY c DESC 
  LIMIT 10
`).all();
console.log('Top Motivos de Quarentena:');
console.log(JSON.stringify(motivos, null, 2));

db.close();

