import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const dbPath = path.resolve('data/questoes_132k.db');
const db = new DatabaseSync(dbPath, { readOnly: true });

console.log('Querying distinct hierarchy branches and counts from SQLite...');

// 1. Contagens de Especialidades
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

// 2. Contagens de Temas
const temaRows = db.prepare(`
  SELECT tema, count(*) as count 
  FROM questions 
  WHERE tema IS NOT NULL AND tema != ''
  GROUP BY tema 
  ORDER BY count DESC
`).all();
const temasCounts = {};
for (const r of temaRows) {
  temasCounts[r.tema] = r.count;
}

// 3. Contagens de Focos
const focoRows = db.prepare(`
  SELECT foco, count(*) as count 
  FROM questions 
  WHERE foco IS NOT NULL AND foco != ''
  GROUP BY foco 
  ORDER BY count DESC
`).all();
const focosCounts = {};
for (const r of focoRows) {
  focosCounts[r.foco] = r.count;
}

// 4. Contagens de Subfocos
const subfocoRows = db.prepare(`
  SELECT subfoco, count(*) as count 
  FROM questions 
  WHERE subfoco IS NOT NULL AND subfoco != ''
  GROUP BY subfoco 
  ORDER BY count DESC
`).all();
const subfocosCounts = {};
for (const r of subfocoRows) {
  subfocosCounts[r.subfoco] = r.count;
}

console.log(`Counts loaded: ${Object.keys(especialidadesCounts).length} specs, ${Object.keys(temasCounts).length} temas, ${Object.keys(focosCounts).length} focos, ${Object.keys(subfocosCounts).length} subfocos`);

// 5. Gera src/data/hierarchyCounts.ts
const hierarchyCountsCode = `// Generated from SQLite questoes_132k.db with canonical taxonomy (103 themes, 680 foci, 3387 subfoci)
export const hierarchyQuestionCounts = {
  "especialidades": ${JSON.stringify(especialidadesCounts, null, 4)},
  "temas": ${JSON.stringify(temasCounts, null, 4)},
  "focos": ${JSON.stringify(focosCounts, null, 4)},
  "subfocos": ${JSON.stringify(subfocosCounts, null, 4)}
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
  subfocos: new Map<string, number>()
};

for (const [type, map] of Object.entries(hierarchyQuestionCounts)) {
  const normMap = normalizedMaps[type as keyof typeof normalizedMaps];
  if (normMap) {
    for (const [key, count] of Object.entries(map as Record<string, number>)) {
      normMap.set(normalizeStr(key), count);
    }
  }
}

export function getQuestionCount(type: 'especialidades' | 'temas' | 'focos' | 'subfocos', name: string): number {
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

fs.writeFileSync('src/data/hierarchyCounts.ts', hierarchyCountsCode, 'utf8');
console.log('✅ Updated src/data/hierarchyCounts.ts');

// 6. Constrói a hierarquia clínica detalhada por especialidade
const treeRows = db.prepare(`
  SELECT DISTINCT especialidade, tema, foco, subfoco 
  FROM questions 
  WHERE tema IS NOT NULL AND tema != '' AND foco IS NOT NULL AND foco != '' AND subfoco IS NOT NULL AND subfoco != ''
  ORDER BY especialidade, tema, foco, subfoco
`).all();

function buildSpecialtyHierarchy(targetSpecialties, displayName) {
  const temaMap = new Map();

  for (const row of treeRows) {
    if (!targetSpecialties.includes(row.especialidade)) continue;
    
    if (!temaMap.has(row.tema)) {
      temaMap.set(row.tema, new Map());
    }
    const focoMap = temaMap.get(row.tema);
    
    if (!focoMap.has(row.foco)) {
      focoMap.set(row.foco, new Set());
    }
    focoMap.get(row.foco).add(row.subfoco);
  }

  const temas = [];
  for (const [tema, focoMap] of temaMap.entries()) {
    const focos = [];
    for (const [foco, subfocoSet] of focoMap.entries()) {
      focos.push({
        foco,
        subfocos: Array.from(subfocoSet).sort((a, b) => a.localeCompare(b, 'pt-BR'))
      });
    }
    // Ordena focos por volume de questões decrescente ou alfabético
    focos.sort((a, b) => (focosCounts[b.foco] || 0) - (focosCounts[a.foco] || 0));
    temas.push({ tema, focos });
  }

  // Ordena temas por volume de questões decrescente
  temas.sort((a, b) => (temasCounts[b.tema] || 0) - (temasCounts[a.tema] || 0));

  return {
    especialidade: displayName,
    temas
  };
}

// Clínica Médica
const clinicaHierarchy = buildSpecialtyHierarchy(['Clínica Médica'], 'Clínica Médica');
fs.writeFileSync(
  'src/data/clinicaMedicaData.ts',
  `import { SpecialtyHierarchy } from '@/types';\n\nexport const clinicaMedicaHierarchy: SpecialtyHierarchy = ${JSON.stringify(clinicaHierarchy, null, 2)};\n`,
  'utf8'
);
console.log(`✅ Updated src/data/clinicaMedicaData.ts (${clinicaHierarchy.temas.length} temas)`);

// Cirurgia Geral
const cirurgiaHierarchy = buildSpecialtyHierarchy(['Cirurgia', 'Cirurgia Geral'], 'Cirurgia Geral');
fs.writeFileSync(
  'src/data/cirurgiaData.ts',
  `import { SpecialtyHierarchy } from '@/types';\n\nexport const cirurgiaHierarchy: SpecialtyHierarchy = ${JSON.stringify(cirurgiaHierarchy, null, 2)};\n`,
  'utf8'
);
console.log(`✅ Updated src/data/cirurgiaData.ts (${cirurgiaHierarchy.temas.length} temas)`);

// Pediatria
const pediatriaHierarchy = buildSpecialtyHierarchy(['Pediatria'], 'Pediatria');
fs.writeFileSync(
  'src/data/pediatriaData.ts',
  `import { SpecialtyHierarchy } from '@/types';\n\nexport const pediatriaHierarchy: SpecialtyHierarchy = ${JSON.stringify(pediatriaHierarchy, null, 2)};\n`,
  'utf8'
);
console.log(`✅ Updated src/data/pediatriaData.ts (${pediatriaHierarchy.temas.length} temas)`);

// Medicina Preventiva e Social
const preventivaHierarchy = buildSpecialtyHierarchy(['Medicina Preventiva e Social', 'Medicina Preventiva'], 'Medicina Preventiva e Social');
fs.writeFileSync(
  'src/data/preventivaData.ts',
  `import { SpecialtyHierarchy } from '@/types';\n\nexport const preventivaHierarchy: SpecialtyHierarchy = ${JSON.stringify(preventivaHierarchy, null, 2)};\n`,
  'utf8'
);
console.log(`✅ Updated src/data/preventivaData.ts (${preventivaHierarchy.temas.length} temas)`);

// Ginecologia
const ginecologiaHierarchy = buildSpecialtyHierarchy(['Ginecologia'], 'Ginecologia');
fs.writeFileSync(
  'src/data/ginecologiaData.ts',
  `import { SpecialtyHierarchy } from '@/types';\n\nexport const ginecologiaHierarchy: SpecialtyHierarchy = ${JSON.stringify(ginecologiaHierarchy, null, 2)};\n`,
  'utf8'
);
console.log(`✅ Updated src/data/ginecologiaData.ts (${ginecologiaHierarchy.temas.length} temas)`);

// Obstetrícia
const obstetriciaHierarchy = buildSpecialtyHierarchy(['Obstetrícia'], 'Obstetrícia');
fs.writeFileSync(
  'src/data/obstetriciaData.ts',
  `import { SpecialtyHierarchy } from '@/types';\n\nexport const obstetriciaHierarchy: SpecialtyHierarchy = ${JSON.stringify(obstetriciaHierarchy, null, 2)};\n`,
  'utf8'
);
console.log(`✅ Updated src/data/obstetriciaData.ts (${obstetriciaHierarchy.temas.length} temas)`);

// 7. Atualiza src/data/hierarquiaCompletaFiltros.json
const completeJson = {
  metadata: {
    versao: '2.0.0-recategorizada',
    descricao: 'Hierarquia clínica canônica completa com 103 temas consolidados, 680 focos padronizados e 3.387 subfocos exclusivos',
    data_geracao: new Date().toISOString(),
    total_questoes: 132947,
    total_especialidades: 6,
    total_temas: Object.keys(temasCounts).length,
    total_focos: Object.keys(focosCounts).length,
    total_subfocos: Object.keys(subfocosCounts).length
  },
  hierarquia_padrao: [
    clinicaHierarchy,
    cirurgiaHierarchy,
    pediatriaHierarchy,
    obstetriciaHierarchy,
    ginecologiaHierarchy,
    preventivaHierarchy
  ]
};

fs.writeFileSync('src/data/hierarquiaCompletaFiltros.json', JSON.stringify(completeJson, null, 2), 'utf8');
console.log('✅ Updated src/data/hierarquiaCompletaFiltros.json');

db.close();
console.log('All frontend taxonomy files generated successfully!');

