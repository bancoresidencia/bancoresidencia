import { DatabaseSync } from 'node:sqlite';
import { clinicalHierarchy } from '../src/data/mockQuestions.ts';

const db = new DatabaseSync('data/questoes_132k.db', { readOnly: true });

// Map sub_subfoco and partial matches to canonical subfoco
// For each foco, map all subfocos and their sub_subfocos
const focoToSubfocoMap = new Map(); // key: foco -> list of { subfoco, sub_subfocos }
const subSubToSubfoco = new Map(); // key: `${foco}:::${subSubNormalized}` -> subfoco

for (const esp of clinicalHierarchy) {
  for (const t of esp.temas) {
    for (const f of t.focos) {
      if (!focoToSubfocoMap.has(f.foco)) {
        focoToSubfocoMap.set(f.foco, []);
      }
      for (const s of f.subfocos) {
        focoToSubfocoMap.get(f.foco).push(s);
        for (const ss of s.sub_subfocos || []) {
          subSubToSubfoco.set(`${f.foco}:::${ss.toLowerCase().trim()}`, s.subfoco);
        }
      }
    }
  }
}

// Find all 145 questions
const invalidRows = db.prepare(`
  SELECT id, especialidade, tema, foco, subfoco 
  FROM questions 
  WHERE subfoco IS NOT NULL
`).all().filter(r => {
  const focosList = focoToSubfocoMap.get(r.foco);
  if (!focosList) return true;
  return !focosList.some(s => s.subfoco === r.subfoco);
});

console.log(`Linhas para remapear: ${invalidRows.length}`);

let resolved = 0;
let unresolved = [];

for (const r of invalidRows) {
  const focosList = focoToSubfocoMap.get(r.foco);
  if (!focosList) {
    unresolved.push(r);
    continue;
  }
  
  // Try 1: check if r.subfoco matches any sub_subfoco (prefix, includes, or normalized)
  const normSub = r.subfoco.toLowerCase().trim();
  let match = null;
  
  for (const s of focosList) {
    for (const ss of s.sub_subfocos || []) {
      const normSS = ss.toLowerCase().trim();
      if (normSS.includes(normSub) || normSub.includes(normSS.slice(0, 30))) {
        match = s.subfoco;
        break;
      }
    }
    if (match) break;
  }
  
  // Try 2: if only 1 or 2 subfocos in this foco, check string similarity
  if (!match) {
    for (const s of focosList) {
      const normS = s.subfoco.toLowerCase().trim();
      if (normS.includes(normSub.slice(0, 20)) || normSub.includes(normS.slice(0, 20))) {
        match = s.subfoco;
        break;
      }
    }
  }

  // Try 3: fallback to first subfoco of the foco if only 1 subfoco exists
  if (!match && focosList.length === 1) {
    match = focosList[0].subfoco;
  }

  if (match) {
    resolved++;
  } else {
    unresolved.push(r);
  }
}

console.log(`Resolvidos automaticamente via sub_subfoco: ${resolved}`);
console.log(`Não resolvidos: ${unresolved.length}`);
if (unresolved.length > 0) {
  console.log('Exemplos não resolvidos:');
  unresolved.slice(0, 10).forEach(u => console.log(`  - Foco: "${u.foco}" | Subfoco atual: "${u.subfoco}"`));
}

