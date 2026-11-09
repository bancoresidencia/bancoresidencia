import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const dbPath = path.resolve('data/questoes_132k.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

console.log('🔄 Re-calculando contagens taxonômicas exatas do SQLite...');

// 1. Especialidades
const specRows = db.prepare(`
  SELECT especialidade, count(*) as count 
  FROM questions 
  GROUP BY especialidade
`).all();

const especialidadesCounts = {};
let cirurgiaTotal = 0;
let goTotal = 0;

for (const r of specRows) {
  especialidadesCounts[r.especialidade] = r.count;
  if (r.especialidade === 'Cirurgia' || r.especialidade === 'Cirurgia Geral') {
    cirurgiaTotal += r.count;
  }
  if (r.especialidade === 'Ginecologia' || r.especialidade === 'Obstetrícia') {
    goTotal += r.count;
  }
}
especialidadesCounts['Cirurgia Geral'] = cirurgiaTotal;
especialidadesCounts['Cirurgia'] = cirurgiaTotal;
especialidadesCounts['Ginecologia e Obstetrícia'] = goTotal;
if (especialidadesCounts['Medicina Preventiva e Social']) {
  especialidadesCounts['Medicina Preventiva'] = especialidadesCounts['Medicina Preventiva e Social'];
}

// 2. Temas (usa COALESCE(novo_tema, tema))
const temaRows = db.prepare(`
  SELECT COALESCE(novo_tema, tema) as t, count(*) as count 
  FROM questions 
  WHERE COALESCE(novo_tema, tema) IS NOT NULL AND COALESCE(novo_tema, tema) != ''
  GROUP BY t 
  ORDER BY count DESC
`).all();
const temasCounts = {};
for (const r of temaRows) {
  temasCounts[r.t] = r.count;
}

// 3. Focos (usa COALESCE(novo_foco, foco))
const focoRows = db.prepare(`
  SELECT COALESCE(novo_foco, foco) as f, count(*) as count 
  FROM questions 
  WHERE COALESCE(novo_foco, foco) IS NOT NULL AND COALESCE(novo_foco, foco) != ''
  GROUP BY f 
  ORDER BY count DESC
`).all();
const focosCounts = {};
for (const r of focoRows) {
  focosCounts[r.f] = r.count;
}

// 4. Subfocos (usa COALESCE(novo_subfoco, subfoco))
const subfocoRows = db.prepare(`
  SELECT COALESCE(novo_subfoco, subfoco) as s, count(*) as count 
  FROM questions 
  WHERE COALESCE(novo_subfoco, subfoco) IS NOT NULL AND COALESCE(novo_subfoco, subfoco) != ''
  GROUP BY s 
  ORDER BY count DESC
`).all();
const subfocosCounts = {};
for (const r of subfocoRows) {
  subfocosCounts[r.s] = r.count;
}

// 5. Sub-subfocos (usa novo_sub_subfoco)
const subSubRows = db.prepare(`
  SELECT novo_sub_subfoco as ss, count(*) as count 
  FROM questions 
  WHERE novo_sub_subfoco IS NOT NULL AND novo_sub_subfoco != ''
  GROUP BY ss 
  ORDER BY count DESC
`).all();
const subSubfocosCounts = {};
for (const r of subSubRows) {
  subSubfocosCounts[r.ss] = r.count;
}

console.log(`✅ Contagens consolidadas:`);
console.log(`   - Especialidades: ${Object.keys(especialidadesCounts).length}`);
console.log(`   - Temas: ${Object.keys(temasCounts).length}`);
console.log(`   - Focos: ${Object.keys(focosCounts).length}`);
console.log(`   - Subfocos: ${Object.keys(subfocosCounts).length}`);
console.log(`   - Sub-subfocos: ${Object.keys(subSubfocosCounts).length}`);

const code = `// Generated from SQLite questoes_132k.db with canonical taxonomy (updated Ginecologia & Cross-Specialties)
export const hierarchyQuestionCounts = {
  "especialidades": ${JSON.stringify(especialidadesCounts, null, 2)},
  "temas": ${JSON.stringify(temasCounts, null, 2)},
  "focos": ${JSON.stringify(focosCounts, null, 2)},
  "subfocos": ${JSON.stringify(subfocosCounts, null, 2)},
  "sub_subfocos": ${JSON.stringify(subSubfocosCounts, null, 2)}
};

const normalizeStr = (str: string): string =>
  (str || '')
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .toLowerCase()
    .trim();

// Mapas auxiliares para busca resiliente (case-insensitive / sem acento)
const normalizedMaps = {
  especialidades: new Map<string, number>(),
  temas: new Map<string, number>(),
  focos: new Map<string, number>(),
  subfocos: new Map<string, number>(),
  sub_subfocos: new Map<string, number>()
};

for (const [type, map] of Object.entries(hierarchyQuestionCounts)) {
  const normMap = normalizedMaps[type as keyof typeof normalizedMaps];
  if (normMap) {
    for (const [key, count] of Object.entries(map as Record<string, number>)) {
      normMap.set(normalizeStr(key), count);
    }
  }
}

export function getQuestionCount(type: 'especialidades' | 'temas' | 'focos' | 'subfocos' | 'sub_subfocos', name: string): number {
  if (type === 'especialidades') {
    if (name === 'Cirurgia' || name === 'Cirurgia Geral') {
      return hierarchyQuestionCounts.especialidades['Cirurgia Geral'] || hierarchyQuestionCounts.especialidades['Cirurgia'] || 0;
    }
    if (name === 'Ginecologia e Obstetrícia') {
      return hierarchyQuestionCounts.especialidades['Ginecologia e Obstetrícia'] || 0;
    }
  }

  // 1. Match exato
  const exact = (hierarchyQuestionCounts[type] as Record<string, number>)[name];
  if (exact !== undefined) return exact;

  // 2. Fallback normalizado resiliente (ignora maiúsculas/minúsculas e acentos)
  const normVal = normalizedMaps[type]?.get(normalizeStr(name));
  return normVal || 0;
}
`;

fs.writeFileSync('src/data/hierarchyCounts.ts', code, 'utf8');
console.log('🎉 src/data/hierarchyCounts.ts atualizado com sucesso!');
