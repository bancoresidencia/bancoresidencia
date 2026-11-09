import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/questoes_132k.db');
const rows = db.prepare(`
  SELECT id, especialidade, novo_tema, novo_foco, novo_subfoco, novo_sub_subfoco,
         statement, options, correct_answer, commentary, motivo_regra
  FROM questions
  WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_EMBEDDING'
  ORDER BY id ASC
  LIMIT 3
`).all();

fs.writeFileSync('scripts/sample_complete_embedding.json', JSON.stringify(rows, null, 2), 'utf8');
console.log('Salvas com sucesso! Quantidade:', rows.length);
db.close();

