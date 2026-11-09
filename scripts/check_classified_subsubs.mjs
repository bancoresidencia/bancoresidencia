import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/questoes_132k.db');
const cat = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));

// Build map of subfoco -> sub_subfocos
const subWithSubSubs = new Map();
for (const esp of cat.hierarquia_padrao) {
  for (const t of (esp.temas || [])) {
    for (const f of (t.focos || [])) {
      for (const sf of (f.subfocos || [])) {
        if (Array.isArray(sf.sub_subfocos) && sf.sub_subfocos.length > 0) {
          const key = `${esp.especialidade}|||${sf.subfoco}`.toLowerCase().trim();
          subWithSubSubs.set(key, sf.sub_subfocos);
        }
      }
    }
  }
}

console.log('Subfocos no catálogo com Sub-subfocos cadastrados:', subWithSubSubs.size);

const classified = db.prepare(`
  SELECT id, especialidade, novo_tema, novo_foco, novo_subfoco, novo_sub_subfoco, status_recategorizacao 
  FROM questions 
  WHERE status_recategorizacao != 'QUARENTENA_ANALISE_HUMANA' 
    AND status_recategorizacao IS NOT NULL
`).all();

let canHaveSubSub = 0;
let alreadyHasSubSub = 0;
let missingSubSub = 0;

for (const q of classified) {
  const key = `${q.especialidade || ''}|||${q.novo_subfoco || ''}`.toLowerCase().trim();
  if (subWithSubSubs.has(key)) {
    canHaveSubSub++;
    if (q.novo_sub_subfoco && q.novo_sub_subfoco.trim() !== '') {
      alreadyHasSubSub++;
    } else {
      missingSubSub++;
    }
  }
}

const statusCounts = db.prepare(`
  SELECT status_recategorizacao, count(*) as count
  FROM questions
  GROUP BY status_recategorizacao
`).all();

console.log('Distribuição Geral por Status:', statusCounts);
console.log('Detalhamento das Classificadas com Sub-subfocos potenciais:');
console.log({
  totalClassified: classified.length,
  canHaveSubSub,
  alreadyHasSubSub,
  missingSubSub
});

db.close();
