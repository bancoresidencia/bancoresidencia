import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/questoes_132k.db');
const cat = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));

// Build map of foco -> boolean (has at least one subfoco with sub_subfocos)
const focoHasSubSubMap = new Map();
const focoSubSubDetails = new Map();

for (const esp of cat.hierarquia_padrao) {
  for (const t of (esp.temas || [])) {
    for (const f of (t.focos || [])) {
      const subsWithSubSubs = (f.subfocos || []).filter(sf => Array.isArray(sf.sub_subfocos) && sf.sub_subfocos.length > 0);
      const key = `${esp.especialidade}|||${f.foco}`.toLowerCase().trim();
      focoHasSubSubMap.set(key, subsWithSubSubs.length > 0);
      if (subsWithSubSubs.length > 0) {
        focoSubSubDetails.set(key, subsWithSubSubs.map(s => s.subfoco));
      }
    }
  }
}

const quarantine = db.prepare(`
  SELECT id, especialidade, novo_tema, novo_foco, foco, antigo_foco, novo_subfoco, novo_sub_subfoco
  FROM questions 
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'
`).all();

let withSubSubBranch = 0;
let onlySubfocoBranch = 0;
const countsPerFoco = new Map();

for (const q of quarantine) {
  const f = q.novo_foco || q.antigo_foco || q.foco;
  const key = `${q.especialidade || ''}|||${f || ''}`.toLowerCase().trim();
  if (focoHasSubSubMap.get(key) === true) {
    withSubSubBranch++;
    const name = `${q.especialidade} -> ${f}`;
    countsPerFoco.set(name, (countsPerFoco.get(name) || 0) + 1);
  } else {
    onlySubfocoBranch++;
  }
}

console.log('Quarentena Total:', quarantine.length);
console.log('1. Pertencem a Focos COM Sub-subfocos na árvore:', withSubSubBranch);
console.log('2. Pertencem a Focos SEM Sub-subfocos (árvore para no 4º nível):', onlySubfocoBranch);
console.log('\nTop 8 Focos da Quarentena com ramificações de 5º nível:');
const sorted = Array.from(countsPerFoco.entries()).sort((a,b) => b[1] - a[1]);
console.log(sorted.slice(0, 8));

db.close();
