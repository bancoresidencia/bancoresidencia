import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/questoes_132k.db');
const cat = JSON.parse(fs.readFileSync('data/catalogo_arvore_canonica_completa.json', 'utf8'));

const subWithSubSubs = new Map();
for (const esp of cat.hierarquia_padrao) {
  for (const t of (esp.temas || [])) {
    for (const f of (t.focos || [])) {
      for (const sf of (f.subfocos || [])) {
        if (Array.isArray(sf.sub_subfocos) && sf.sub_subfocos.length > 0) {
          const key = `${esp.especialidade}|||${sf.subfoco}`.toLowerCase().trim();
          subWithSubSubs.set(key, { esp: esp.especialidade, tema: t.tema, foco: f.foco, sub: sf.subfoco, subs: sf.sub_subfocos });
        }
      }
    }
  }
}

const rows = db.prepare(`
  SELECT id, especialidade, novo_tema, novo_foco, novo_subfoco, novo_sub_subfoco, statement, options, correct_answer
  FROM questions 
  WHERE status_recategorizacao != 'QUARENTENA_ANALISE_HUMANA' 
    AND status_recategorizacao IS NOT NULL 
    AND (novo_sub_subfoco IS NULL OR novo_sub_subfoco = '')
`).all();

const subCounts = new Map();
let targetCount = 0;

for (const q of rows) {
  const key = `${q.especialidade || ''}|||${q.novo_subfoco || ''}`.toLowerCase().trim();
  if (subWithSubSubs.has(key)) {
    targetCount++;
    const data = subWithSubSubs.get(key);
    const display = `${data.esp} -> ${data.foco} -> ${data.sub}`;
    subCounts.set(display, (subCounts.get(display) || 0) + 1);
  }
}

console.log('Total elegíveis para refinamento de 5º nível:', targetCount);
const sorted = Array.from(subCounts.entries()).sort((a,b) => b[1] - a[1]);
console.log('Top 10 Subfocos que possuem questões esperando Sub-subfoco:');
console.log(sorted.slice(0, 10));

db.close();
