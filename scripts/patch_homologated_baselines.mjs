import fs from 'node:fs';

const filePath = 'src/data/homologatedFacetsBaseline.ts';
let content = fs.readFileSync(filePath, 'utf8');

// 1. Atualiza interface HomologatedBaseline
const oldInterface = `export interface HomologatedBaseline {
  total: number;
  especialidades: Record<string, number>;
  temas: Record<string, number>;
  focos: Record<string, number>;
  subfocos: Record<string, number>;
}`;

const newInterface = `export interface HomologatedBaseline {
  total: number;
  uncategorized: number;
  especialidades: Record<string, number>;
  temas: Record<string, number>;
  focos: Record<string, number>;
  subfocos: Record<string, number>;
  dificuldades: Record<'Fácil' | 'Médio' | 'Difícil', number>;
  tipos: Record<string, number>;
  anos: Record<number, number>;
}`;

content = content.replace(oldInterface, newInterface);

// 2. Patch em homologatedDiretoBaseline
content = content.replace(
  'export const homologatedDiretoBaseline: HomologatedBaseline = {\n  "total": 206599,\n  "especialidades": {',
  `export const homologatedDiretoBaseline: HomologatedBaseline = {
  "total": 206599,
  "uncategorized": 28945,
  "dificuldades": { "Fácil": 57171, "Médio": 124667, "Difícil": 24761 },
  "tipos": { "Múltipla escolha": 202289, "Certo ou errado": 3582, "Dissertativa": 728, "Discursiva": 0 },
  "anos": { 2027: 729, 2026: 9601, 2025: 9166, 2024: 9253, 2023: 11438, 2022: 10911, 2021: 12932, 2020: 13744, 2019: 16500, 2018: 15751, 2017: 15282, 2016: 15052, 2015: 12537, 2014: 11135, 2013: 9718, 2012: 8367, 2011: 6122, 2010: 6113, 2009: 7287, 2008: 1431, 2007: 1598, 2006: 1582, 2005: 350 },
  "especialidades": {
    "Outras / Em Curadoria": 28945,`
);

content = content.replace(
  '  "temas": {\n    "Infectologia (Doenças Infecciosas e Parasitárias)": 2228,',
  '  "temas": {\n    "Aguardando Classificação por Subespecialidade": 28945,\n    "Infectologia (Doenças Infecciosas e Parasitárias)": 2228,'
);

// 3. Patch em homologatedRevalidaBaseline
content = content.replace(
  'export const homologatedRevalidaBaseline: HomologatedBaseline = {\n  "total": 4411,\n  "especialidades": {',
  `export const homologatedRevalidaBaseline: HomologatedBaseline = {
  "total": 4411,
  "uncategorized": 50,
  "dificuldades": { "Fácil": 1115, "Médio": 2973, "Difícil": 323 },
  "tipos": { "Múltipla escolha": 4057, "Certo ou errado": 0, "Dissertativa": 124, "Discursiva": 230 },
  "anos": { 2026: 362, 2025: 204, 2024: 271, 2023: 419, 2022: 469, 2021: 464, 2020: 124, 2019: 397, 2018: 59, 2017: 204, 2016: 229, 2015: 209, 2014: 225, 2013: 242, 2012: 218, 2011: 213, 2010: 80, 2007: 7, 2004: 15 },
  "especialidades": {
    "Outras / Em Curadoria": 50,`
);

// 4. Patch em homologatedRPlusBaseline
content = content.replace(
  'export const homologatedRPlusBaseline: HomologatedBaseline = {\n  "total": 45413,\n  "especialidades": {',
  `export const homologatedRPlusBaseline: HomologatedBaseline = {
  "total": 45413,
  "uncategorized": 1604,
  "dificuldades": { "Fácil": 330, "Médio": 44642, "Difícil": 441 },
  "tipos": { "Múltipla escolha": 42992, "Certo ou errado": 1881, "Dissertativa": 540, "Discursiva": 0 },
  "anos": { 2027: 256, 2026: 3592, 2025: 1523, 2024: 1953, 2023: 2871, 2022: 3971, 2021: 6649, 2020: 5311, 2019: 4097, 2018: 4523, 2017: 3368, 2016: 1456, 2015: 1707, 2014: 1173, 2013: 985, 2012: 814, 2011: 6, 2010: 541, 2009: 617 },
  "especialidades": {
    "Outras / Em Curadoria": 1604,`
);

// 5. Patch em homologatedTituloBaseline
content = content.replace(
  'export const homologatedTituloBaseline: HomologatedBaseline = {\n  "total": 688,\n  "especialidades": {',
  `export const homologatedTituloBaseline: HomologatedBaseline = {
  "total": 688,
  "uncategorized": 0,
  "dificuldades": { "Fácil": 0, "Médio": 688, "Difícil": 0 },
  "tipos": { "Múltipla escolha": 688, "Certo ou errado": 0, "Dissertativa": 0, "Discursiva": 0 },
  "anos": { 2026: 102, 2025: 89, 2024: 85, 2023: 155, 2022: 85, 2021: 89, 2020: 83 },
  "especialidades": {
    "Outras / Em Curadoria": 0,`
);

// 6. Atualizar combineBaselines
const oldCombine = `function combineBaselines(baselines: HomologatedBaseline[]): HomologatedBaseline {
  let total = 0;
  const especialidades: Record<string, number> = {};
  const temas: Record<string, number> = {};
  const focos: Record<string, number> = {};
  const subfocos: Record<string, number> = {};

  for (const b of baselines) {
    total += b.total;
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
  }

  return { total, especialidades, temas, focos, subfocos };
}`;

const newCombine = `function combineBaselines(baselines: HomologatedBaseline[]): HomologatedBaseline {
  let total = 0;
  let uncategorized = 0;
  const especialidades: Record<string, number> = {};
  const temas: Record<string, number> = {};
  const focos: Record<string, number> = {};
  const subfocos: Record<string, number> = {};
  const dificuldades: Record<'Fácil' | 'Médio' | 'Difícil', number> = { 'Fácil': 0, 'Médio': 0, 'Difícil': 0 };
  const tipos: Record<string, number> = {};
  const anos: Record<number, number> = {};

  for (const b of baselines) {
    total += b.total;
    uncategorized += b.uncategorized || 0;
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

  return { total, uncategorized, especialidades, temas, focos, subfocos, dificuldades, tipos, anos };
}`;

content = content.replace(oldCombine, newCombine);

fs.writeFileSync(filePath, content, 'utf8');
console.log('src/data/homologatedFacetsBaseline.ts atualizado com sucesso!');

