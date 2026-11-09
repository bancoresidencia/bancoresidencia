import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/questoes_132k.db');
const cat = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));

// Build canonical map for subfocos with subsubs
const subWithSubSubs = new Set();
const focoWithSubSubs = new Set();

for (const esp of cat.hierarquia_padrao) {
  for (const t of (esp.temas || [])) {
    for (const f of (t.focos || [])) {
      for (const sf of (f.subfocos || [])) {
        if (Array.isArray(sf.sub_subfocos) && sf.sub_subfocos.length > 0) {
          subWithSubSubs.add((esp.especialidade + '|||' + sf.subfoco).toLowerCase().trim());
          focoWithSubSubs.add((esp.especialidade + '|||' + f.foco).toLowerCase().trim());
        }
      }
    }
  }
}

// 1. Quarentena
const quarentena = db.prepare(`
  SELECT id, especialidade, foco, antigo_foco, novo_foco 
  FROM questions 
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'
`).all();

let quarentenaComSubSub = 0;
let quarentenaSoSubfoco = 0;

for (const q of quarentena) {
  const f = q.novo_foco || q.antigo_foco || q.foco;
  const key = (q.especialidade + '|||' + f).toLowerCase().trim();
  if (focoWithSubSubs.has(key)) {
    quarentenaComSubSub++;
  } else {
    quarentenaSoSubfoco++;
  }
}

// 2. Classificadas faltando sub-subfoco
const classificadas = db.prepare(`
  SELECT id, especialidade, novo_subfoco, novo_sub_subfoco 
  FROM questions 
  WHERE status_recategorizacao IN ('REMANEJO_BLOCO_SUBFOCO_REFINADO', 'SUBFOCO_RESOLVIDO_LLM')
`).all();

let classificadasFaltandoSubSub = 0;
let classificadasComSubSub = 0;
let classificadasAtomic4 = 0;

for (const q of classificadas) {
  const hasSubSub = q.novo_sub_subfoco && q.novo_sub_subfoco.trim() !== '';
  if (hasSubSub) {
    classificadasComSubSub++;
  } else {
    const key = (q.especialidade + '|||' + (q.novo_subfoco || '')).toLowerCase().trim();
    if (subWithSubSubs.has(key)) {
      classificadasFaltandoSubSub++;
    } else {
      classificadasAtomic4++;
    }
  }
}

console.log(JSON.stringify({
  totalQuestoesBanco: 132947,
  quarentena: {
    total: quarentena.length,
    soSubfoco: quarentenaSoSubfoco,
    comSubSub: quarentenaComSubSub
  },
  classificadas: {
    total: classificadas.length,
    completasNivel4: classificadasAtomic4,
    completasNivel5: classificadasComSubSub,
    faltandoNivel5: classificadasFaltandoSubSub
  }
}, null, 2));

db.close();

