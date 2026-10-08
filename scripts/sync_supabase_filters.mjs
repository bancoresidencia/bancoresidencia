import fs from 'fs';
import path from 'path';

const filesMap = {
  'Obstetrícia': 'data/obstetricia_final_questions.json',
  'Cirurgia': 'data/cirurgia_final_questions.json',
  'Medicina Preventiva e Social': 'data/medicina_preventiva_final_questions.json',
  'Pediatria': 'data/pediatria_final_questions.json',
  'Clínica Médica': 'data/clinica_medica_final_questions.json',
  'Ginecologia': 'data/ginecologia_final_questions.json'
};

const outputFiles = {
  'Obstetrícia': { file: 'src/data/obstetriciaData.ts', exportName: 'obstetriciaHierarchy' },
  'Cirurgia': { file: 'src/data/cirurgiaData.ts', exportName: 'cirurgiaHierarchy' },
  'Medicina Preventiva e Social': { file: 'src/data/preventivaData.ts', exportName: 'preventivaHierarchy' },
  'Pediatria': { file: 'src/data/pediatriaData.ts', exportName: 'pediatriaHierarchy' },
  'Clínica Médica': { file: 'src/data/clinicaMedicaData.ts', exportName: 'clinicaMedicaHierarchy' },
  'Ginecologia': { file: 'src/data/ginecologiaData.ts', exportName: 'ginecologiaHierarchy' }
};

const counts = {
  especialidades: {},
  temas: {},
  focos: {},
  subfocos: {}
};

const allBancasMap = new Map();
const allInstsMap = new Map();

for (const [espName, filePath] of Object.entries(filesMap)) {
  if (!fs.existsSync(filePath)) {
    console.error(`Arquivo não encontrado: ${filePath}`);
    continue;
  }

  console.log(`Processando ${espName} de ${filePath}...`);
  const list = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  counts.especialidades[espName] = list.length;
  if (espName === 'Cirurgia') {
    counts.especialidades['Cirurgia Geral'] = list.length;
  }

  const temasMap = new Map();

  for (const q of list) {
    // Contagem de bancas e instituicoes
    if (q.banca) {
      allBancasMap.set(q.banca, (allBancasMap.get(q.banca) || 0) + 1);
    }
    if (q.institution) {
      allInstsMap.set(q.institution, (allInstsMap.get(q.institution) || 0) + 1);
    }

    const tema = q.tema || 'Geral';
    const foco = q.foco || 'Geral';
    const subfoco = q.subfoco || '';

    counts.temas[tema] = (counts.temas[tema] || 0) + 1;
    counts.focos[foco] = (counts.focos[foco] || 0) + 1;
    if (subfoco) {
      counts.subfocos[subfoco] = (counts.subfocos[subfoco] || 0) + 1;
    }

    if (!temasMap.has(tema)) temasMap.set(tema, new Map());
    const focosMap = temasMap.get(tema);

    if (!focosMap.has(foco)) focosMap.set(foco, new Set());
    if (subfoco) focosMap.get(foco).add(subfoco);
  }

  const temasArr = [];
  for (const [tema, focosMap] of temasMap.entries()) {
    const focosArr = [];
    for (const [foco, subfocosSet] of focosMap.entries()) {
      focosArr.push({
        foco,
        subfocos: Array.from(subfocosSet).sort((a, b) => a.localeCompare(b, 'pt-BR'))
      });
    }
    focosArr.sort((a, b) => a.foco.localeCompare(b.foco, 'pt-BR'));
    temasArr.push({
      tema,
      focos: focosArr
    });
  }
  temasArr.sort((a, b) => a.tema.localeCompare(b.tema, 'pt-BR'));

  const hierarchyObj = {
    especialidade: espName,
    temas: temasArr
  };

  const { file, exportName } = outputFiles[espName];
  const fileContent = `import { SpecialtyHierarchy } from '@/types';\n\nexport const ${exportName}: SpecialtyHierarchy = ${JSON.stringify(hierarchyObj, null, 2)};\n`;

  fs.writeFileSync(file, fileContent, 'utf8');
  console.log(`Gerado: ${file} (${temasArr.length} temas)`);
}

// Ginecologia e Obstetrícia combinada
counts.especialidades['Ginecologia e Obstetrícia'] =
  (counts.especialidades['Ginecologia'] || 0) + (counts.especialidades['Obstetrícia'] || 0);

// Gera src/data/hierarchyCounts.ts com normalização resiliente
const hierarchyCountsContent = `export const hierarchyQuestionCounts = ${JSON.stringify(counts, null, 2)};

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

fs.writeFileSync('src/data/hierarchyCounts.ts', hierarchyCountsContent, 'utf8');
console.log('src/data/hierarchyCounts.ts atualizado com sucesso!');

// Processa Bancas e Instituições
const sortedBancas = [...allBancasMap.entries()].sort((a, b) => b[1] - a[1]);
const sortedInsts = [...allInstsMap.entries()].sort((a, b) => b[1] - a[1]);

console.log(`Total de Bancas: ${sortedBancas.length}`);
console.log(`Total de Instituições: ${sortedInsts.length}`);

// Extrai instituições com sigla e nome descritivo
const institutionEntries = [];
const seenSiglas = new Set();

for (const [instFullName, count] of sortedInsts) {
  // Padrão 'SIGLA - NOME COMPLETO'
  let sigla = '';
  let nome = instFullName;

  if (instFullName.includes(' - ')) {
    const parts = instFullName.split(' - ');
    sigla = parts[0].trim();
    nome = instFullName;
  } else if (instFullName.includes('/')) {
    sigla = instFullName.split('/')[0].trim();
    nome = instFullName;
  } else {
    sigla = instFullName.trim();
    nome = instFullName;
  }

  // Se sigla já existe, usa o nome completo como chave ou sigla única
  if (seenSiglas.has(sigla)) {
    sigla = `${sigla} (${instFullName.split(' - ')[1]?.slice(0, 15) || instFullName.slice(0, 15)})`;
  }
  seenSiglas.add(sigla);

  institutionEntries.push({ sigla, nome });
}

// Bancas Oficiais principais
const bancasOficiais = sortedBancas.map(([bancaName, count]) => `${bancaName} (${count} questões)`);

const instituicoesDataContent = `export interface MedicalInstitution {
  sigla: string;
  nome: string;
}

export const medicalInstitutionsDirectory: MedicalInstitution[] = ${JSON.stringify(institutionEntries, null, 2)};

export const bancasExaminadorasOficiais: string[] = ${JSON.stringify(bancasOficiais, null, 2)};

export const allInstituicoesSiglas: string[] = Array.from(
  new Set(medicalInstitutionsDirectory.map((i) => i.sigla))
).sort((a, b) => a.localeCompare(b, 'pt-BR'));
`;

fs.writeFileSync('src/data/instituicoesData.ts', instituicoesDataContent, 'utf8');
console.log('src/data/instituicoesData.ts atualizado com sucesso!');
