import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/questoes_132k.db');
const cat = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));

// Build map of subfocos that have sub_subfocos
const subWithSubSubs = new Map();
for (const esp of cat.hierarquia_padrao) {
  for (const t of (esp.temas || [])) {
    for (const f of (t.focos || [])) {
      for (const sf of (f.subfocos || [])) {
        if (Array.isArray(sf.sub_subfocos) && sf.sub_subfocos.length > 0) {
          const key = `${esp.especialidade}|||${sf.subfoco}`.toLowerCase().trim();
          subWithSubSubs.set(key, sf.sub_subfocos.length);
        }
      }
    }
  }
}

// Build map of focos that have sub_subfocos
const focoWithSubSubs = new Map();
for (const esp of cat.hierarquia_padrao) {
  for (const t of (esp.temas || [])) {
    for (const f of (t.focos || [])) {
      const count = (f.subfocos || []).filter(s => Array.isArray(s.sub_subfocos) && s.sub_subfocos.length > 0).length;
      if (count > 0) {
        const key = `${esp.especialidade}|||${f.foco}`.toLowerCase().trim();
        focoWithSubSubs.set(key, count);
      }
    }
  }
}

const liveRows = db.prepare(`
  SELECT id, especialidade, novo_foco, foco, antigo_foco, novo_subfoco, novo_sub_subfoco, status_recategorizacao
  FROM questions
`).all();

let totalWithSubSub = 0;
let llmWithSubSub = 0;
let remanejoWithSubSub = 0;

let remanejoMissingSubSub = 0;
let quarentenaPendingSubSub = 0;

for (const q of liveRows) {
  const hasSubSubPopulated = q.novo_sub_subfoco && q.novo_sub_subfoco.trim() !== '';
  if (hasSubSubPopulated) {
    totalWithSubSub++;
    if (q.status_recategorizacao === 'SUBFOCO_RESOLVIDO_LLM') llmWithSubSub++;
    if (q.status_recategorizacao === 'REMANEJO_BLOCO_SUBFOCO_REFINADO') remanejoWithSubSub++;
  } else {
    if (q.status_recategorizacao === 'REMANEJO_BLOCO_SUBFOCO_REFINADO') {
      const key = `${q.especialidade || ''}|||${q.novo_subfoco || ''}`.toLowerCase().trim();
      if (subWithSubSubs.has(key)) remanejoMissingSubSub++;
    } else if (q.status_recategorizacao === 'QUARENTENA_ANALISE_HUMANA') {
      const f = q.novo_foco || q.antigo_foco || q.foco;
      const key = `${q.especialidade || ''}|||${f || ''}`.toLowerCase().trim();
      if (focoWithSubSubs.has(key)) quarentenaPendingSubSub++;
    }
  }
}

console.log('Sub-subfocos no Banco:');
console.log({
  totalWithSubSub,
  llmWithSubSub,
  remanejoWithSubSub,
  remanejoMissingSubSub,
  quarentenaPendingSubSub
});

db.close();

