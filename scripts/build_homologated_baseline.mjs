import fs from 'node:fs';
import path from 'node:path';
import { DatabaseSync } from 'node:sqlite';

const dbPath = path.resolve('data/supabase_tables.db');
if (!fs.existsSync(dbPath)) {
  console.error('❌ Banco de dados data/supabase_tables.db não encontrado!');
  process.exit(1);
}

const db = new DatabaseSync(dbPath);

console.log('🔄 Extraindo questões homologadas com comentário padrão-ouro...');

const query = `
  SELECT
    modalidade,
    especialidade,
    tema,
    foco,
    subfoco,
    sub_subfoco,
    difficulty,
    type,
    year,
    banca
  FROM questions_curated_staging
  WHERE ((correct_answer IS NOT NULL AND trim(correct_answer) != '' AND trim(correct_answer) != 'null') OR is_anulada = 1)
    AND commentary_tier = 'padrao_ouro'
`;

const rows = db.prepare(query).all();
console.log(`✅ Total de questões extraídas: ${rows.length}`);

function normalizeSpecialty(esp) {
  if (!esp) return '';
  const trimmed = esp.trim();
  if (trimmed === 'Cirurgia') return 'Cirurgia Geral';
  if (trimmed === 'Medicina Preventiva') return 'Medicina Preventiva e Social';
  if (trimmed.includes('Curadoria') || trimmed.includes('Outras')) return '';
  return trimmed;
}

function normalizeType(t) {
  if (!t) return 'Múltipla escolha';
  const low = t.trim().toLowerCase();
  if (low.includes('certo') || low.includes('verdadeiro')) return 'Certo ou errado';
  if (low.includes('discursiva') || low.includes('dissertativa')) return 'Dissertativa';
  return 'Múltipla escolha';
}

function normalizeDifficulty(d) {
  if (!d) return 'Médio';
  const trimmed = d.trim();
  if (trimmed === 'Fácil' || trimmed === 'Médio' || trimmed === 'Difícil') return trimmed;
  return 'Médio';
}

const modalities = {
  'Acesso Direto': { name: 'homologatedDiretoBaseline' },
  'R+': { name: 'homologatedRPlusBaseline' },
  'Revalida': { name: 'homologatedRevalidaBaseline' },
  'Título de Especialista': { name: 'homologatedTituloBaseline' }
};

for (const m of Object.keys(modalities)) {
  modalities[m].total = 0;
  modalities[m].uncategorized = 0;
  modalities[m].paths = {};
  modalities[m].especialidades = {};
  modalities[m].temas = {};
  modalities[m].focos = {};
  modalities[m].subfocos = {};
  modalities[m].subSubfocos = {};
  modalities[m].dificuldades = { 'Fácil': 0, 'Médio': 0, 'Difícil': 0 };
  modalities[m].tipos = { 'Múltipla escolha': 0, 'Certo ou errado': 0, 'Dissertativa': 0 };
  modalities[m].anos = {};
  modalities[m].bancas = {};
}

// Global combined maps for hierarchyQuestionCounts
const globalCounts = {
  especialidades: {},
  temas: {},
  focos: {},
  subfocos: {},
  subSubfocos: {}
};

for (const row of rows) {
  let mod = row.modalidade;
  if (!mod || !modalities[mod]) {
    if (mod === 'Residência Médica') mod = 'Acesso Direto';
    else mod = 'Acesso Direto';
  }

  const target = modalities[mod];
  target.total++;

  const esp = normalizeSpecialty(row.especialidade);
  if (esp) {
    target.especialidades[esp] = (target.especialidades[esp] || 0) + 1;
    globalCounts.especialidades[esp] = (globalCounts.especialidades[esp] || 0) + 1;
  } else {
    target.uncategorized++;
  }

  const tema = row.tema ? row.tema.trim() : '';
  if (tema) {
    target.temas[tema] = (target.temas[tema] || 0) + 1;
    globalCounts.temas[tema] = (globalCounts.temas[tema] || 0) + 1;
  }

  const foco = row.foco ? row.foco.trim() : '';
  if (foco) {
    target.focos[foco] = (target.focos[foco] || 0) + 1;
    globalCounts.focos[foco] = (globalCounts.focos[foco] || 0) + 1;
  }

  const subfoco = row.subfoco ? row.subfoco.trim() : '';
  if (subfoco) {
    target.subfocos[subfoco] = (target.subfocos[subfoco] || 0) + 1;
    globalCounts.subfocos[subfoco] = (globalCounts.subfocos[subfoco] || 0) + 1;
  }

  const subSubfoco = row.sub_subfoco ? row.sub_subfoco.trim() : '';
  if (subSubfoco) {
    target.subSubfocos[subSubfoco] = (target.subSubfocos[subSubfoco] || 0) + 1;
    globalCounts.subSubfocos[subSubfoco] = (globalCounts.subSubfocos[subSubfoco] || 0) + 1;
  }

  // Pre-computa os caminhos taxonômicos exatos separados por unit separator (\u001f)
  if (esp) {
    const parts = [esp];
    if (tema) parts.push(tema);
    if (foco && parts.length === 2) parts.push(foco);
    if (subfoco && parts.length === 3) parts.push(subfoco);
    if (subSubfoco && parts.length === 4) parts.push(subSubfoco);

    for (let i = 1; i <= parts.length; i++) {
      const k = parts.slice(0, i).join('\u001f');
      target.paths[k] = (target.paths[k] || 0) + 1;
    }
  }

  const diff = normalizeDifficulty(row.difficulty);
  target.dificuldades[diff] = (target.dificuldades[diff] || 0) + 1;

  const tipo = normalizeType(row.type);
  target.tipos[tipo] = (target.tipos[tipo] || 0) + 1;

  const year = row.year ? Number(row.year) : null;
  if (year && year >= 2000 && year <= 2030) {
    target.anos[year] = (target.anos[year] || 0) + 1;
  }

  const banca = row.banca ? row.banca.trim() : '';
  if (banca) {
    target.bancas[banca] = (target.bancas[banca] || 0) + 1;
  }
}

// Garante aliases de Especialidade (Cirurgia, Medicina Preventiva, Ginecologia e Obstetrícia)
for (const m of Object.keys(modalities)) {
  const target = modalities[m];
  const esp = target.especialidades;
  if (esp['Cirurgia Geral'] && !esp['Cirurgia']) {
    esp['Cirurgia'] = esp['Cirurgia Geral'];
  }
  if (esp['Medicina Preventiva e Social'] && !esp['Medicina Preventiva']) {
    esp['Medicina Preventiva'] = esp['Medicina Preventiva e Social'];
  }
  const gin = esp['Ginecologia'] || 0;
  const obs = esp['Obstetrícia'] || 0;
  if (gin + obs > 0) {
    esp['Ginecologia e Obstetrícia'] = gin + obs;
  }

  // Adiciona aliases de raiz para Cirurgia e Medicina Preventiva
  if (target.paths['Cirurgia Geral'] && !target.paths['Cirurgia']) {
    target.paths['Cirurgia'] = target.paths['Cirurgia Geral'];
  }
  if (target.paths['Medicina Preventiva e Social'] && !target.paths['Medicina Preventiva']) {
    target.paths['Medicina Preventiva'] = target.paths['Medicina Preventiva e Social'];
  }

  console.log(`📊 [${m}] Total: ${target.total} | Especialidades:`, esp, `| Caminhos únicos: ${Object.keys(target.paths).length} | Bancas únicas: ${Object.keys(target.bancas).length}`);
}

// Aliases para contagens globais
if (globalCounts.especialidades['Cirurgia Geral'] && !globalCounts.especialidades['Cirurgia']) {
  globalCounts.especialidades['Cirurgia'] = globalCounts.especialidades['Cirurgia Geral'];
}
if (globalCounts.especialidades['Medicina Preventiva e Social'] && !globalCounts.especialidades['Medicina Preventiva']) {
  globalCounts.especialidades['Medicina Preventiva'] = globalCounts.especialidades['Medicina Preventiva e Social'];
}
const gGin = globalCounts.especialidades['Ginecologia'] || 0;
const gObs = globalCounts.especialidades['Obstetrícia'] || 0;
if (gGin + gObs > 0) {
  globalCounts.especialidades['Ginecologia e Obstetrícia'] = gGin + gObs;
}

// 1. Gera src/data/homologatedFacetsBaseline.ts
let tsContent = `// Arquivo canônico gerado automaticamente — Taxonomia Autoral v3 (Gabarito Homologado + Padrão-Ouro)
// Total de questões ativas para estudantes: ${rows.length.toLocaleString('pt-BR')}
import { StudyModalidade } from '@/types';
import type { StudyQuestionFacets, StudyCatalogCounts } from '@/services/studyQuestionCatalog';

export interface HomologatedBaseline {
  total: number;
  uncategorized: number;
  paths: Record<string, number>;
  bancas: Record<string, number>;
  especialidades: Record<string, number>;
  temas: Record<string, number>;
  focos: Record<string, number>;
  subfocos: Record<string, number>;
  subSubfocos?: Record<string, number>;
  dificuldades: Record<'Fácil' | 'Médio' | 'Difícil', number>;
  tipos: Record<string, number>;
  anos: Record<number, number>;
}
`;

for (const [mod, data] of Object.entries(modalities)) {
  tsContent += `\nexport const ${data.name}: HomologatedBaseline = {\n`;
  tsContent += `  "total": ${data.total},\n`;
  tsContent += `  "uncategorized": ${data.uncategorized},\n`;
  tsContent += `  "dificuldades": ${JSON.stringify(data.dificuldades)},\n`;
  tsContent += `  "tipos": ${JSON.stringify(data.tipos)},\n`;
  tsContent += `  "anos": ${JSON.stringify(data.anos)},\n`;
  tsContent += `  "bancas": ${JSON.stringify(data.bancas)},\n`;
  tsContent += `  "especialidades": ${JSON.stringify(data.especialidades)},\n`;
  tsContent += `  "temas": ${JSON.stringify(data.temas)},\n`;
  tsContent += `  "focos": ${JSON.stringify(data.focos)},\n`;
  tsContent += `  "subfocos": ${JSON.stringify(data.subfocos)},\n`;
  tsContent += `  "subSubfocos": ${JSON.stringify(data.subSubfocos)},\n`;
  tsContent += `  "paths": ${JSON.stringify(data.paths)}\n`;
  tsContent += `};\n`;
}

tsContent += `
export function getHomologatedBaseline(modalidades?: StudyModalidade[]): HomologatedBaseline {
  if (!modalidades || modalidades.length === 0) {
    return combineBaselines([
      homologatedDiretoBaseline,
      homologatedRevalidaBaseline,
      homologatedRPlusBaseline,
      homologatedTituloBaseline
    ]);
  }

  const selectedBaselines: HomologatedBaseline[] = [];
  for (const m of modalidades) {
    if (m === 'Acesso Direto' || m === 'Residência Médica') {
      selectedBaselines.push(homologatedDiretoBaseline);
    } else if (m === 'Revalida') {
      selectedBaselines.push(homologatedRevalidaBaseline);
    } else if (m === 'R+' || (typeof m === 'string' && m.startsWith('R+'))) {
      selectedBaselines.push(homologatedRPlusBaseline);
    } else if (m === 'Título de Especialista' || (typeof m === 'string' && m.startsWith('Título'))) {
      selectedBaselines.push(homologatedTituloBaseline);
    }
  }

  if (selectedBaselines.length === 0) {
    return homologatedDiretoBaseline;
  }
  if (selectedBaselines.length === 1) {
    return selectedBaselines[0];
  }
  return combineBaselines(selectedBaselines);
}

export function getHomologatedFacets(modalidades?: StudyModalidade[]): StudyQuestionFacets {
  const b = getHomologatedBaseline(modalidades);
  return {
    totalRightCardCount: b.total,
    paths: b.paths || {}
  };
}

export function getHomologatedCatalog(modalidades?: StudyModalidade[]): StudyCatalogCounts {
  const b = getHomologatedBaseline(modalidades);
  const years = Object.keys(b.anos).map(Number).sort((a, b) => b - a);
  return {
    total: b.total,
    bancas: b.bancas || {},
    years
  };
}

function combineBaselines(baselines: HomologatedBaseline[]): HomologatedBaseline {
  let total = 0;
  let uncategorized = 0;
  const paths: Record<string, number> = {};
  const bancas: Record<string, number> = {};
  const especialidades: Record<string, number> = {};
  const temas: Record<string, number> = {};
  const focos: Record<string, number> = {};
  const subfocos: Record<string, number> = {};
  const subSubfocos: Record<string, number> = {};
  const dificuldades: Record<'Fácil' | 'Médio' | 'Difícil', number> = { 'Fácil': 0, 'Médio': 0, 'Difícil': 0 };
  const tipos: Record<string, number> = {};
  const anos: Record<number, number> = {};

  for (const b of baselines) {
    total += b.total;
    uncategorized += b.uncategorized || 0;
    for (const [k, v] of Object.entries(b.paths || {})) {
      paths[k] = (paths[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.bancas || {})) {
      bancas[k] = (bancas[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.especialidades)) {
      especialidades[k] = (especialidades[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.temas)) {
      temas[k] = (temas[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.focos)) {
      focos[k] = (focos[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.subfocos)) {
      subfocos[k] = (subfocos[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.subSubfocos || {})) {
      subSubfocos[k] = (subSubfocos[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.dificuldades || {})) {
      dificuldades[k as 'Fácil' | 'Médio' | 'Difícil'] = (dificuldades[k as 'Fácil' | 'Médio' | 'Difícil'] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.tipos || {})) {
      tipos[k] = (tipos[k] || 0) + v;
    }
    for (const [k, v] of Object.entries(b.anos || {})) {
      anos[Number(k)] = (anos[Number(k)] || 0) + v;
    }
  }

  return { total, uncategorized, paths, bancas, especialidades, temas, focos, subfocos, subSubfocos, dificuldades, tipos, anos };
}
`;

const targetPath = path.resolve('src/data/homologatedFacetsBaseline.ts');
fs.writeFileSync(targetPath, tsContent, 'utf8');
console.log(`🎉 Arquivo ${targetPath} gerado com sucesso!`);

// 2. Gera src/data/hierarchyCounts.ts
const hierarchyPath = path.resolve('src/data/hierarchyCounts.ts');
const hierarchyContent = `// Generated automatically from Published Gold-Standard Questions (${rows.length.toLocaleString('pt-BR')} questions)
export const hierarchyQuestionCounts = {
  especialidades: ${JSON.stringify(globalCounts.especialidades, null, 2)},
  temas: ${JSON.stringify(globalCounts.temas, null, 2)},
  focos: ${JSON.stringify(globalCounts.focos, null, 2)},
  subfocos: ${JSON.stringify(globalCounts.subfocos, null, 2)},
  subSubfocos: ${JSON.stringify(globalCounts.subSubfocos, null, 2)}
};

export function getQuestionCount(
  type: 'especialidades' | 'temas' | 'focos' | 'subfocos' | 'subSubfocos',
  name: string
): number {
  const map = hierarchyQuestionCounts[type];
  if (!map) return 0;
  return (map as Record<string, number>)[name] || 0;
}
`;
fs.writeFileSync(hierarchyPath, hierarchyContent, 'utf8');
console.log(`🎉 Arquivo ${hierarchyPath} gerado com sucesso!`);
