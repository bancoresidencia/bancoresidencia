import fs from 'fs';
import path from 'path';

const jsonPath = path.join(process.cwd(), 'data', 'gemelaridade_study_materials.json');
const materials = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));

const mdFiles = [
  'docs/resumo_gemelaridade_01.md',
  'docs/resumo_gemelaridade_02.md',
  'docs/resumo_gemelaridade_03.md',
  'docs/resumo_gemelaridade_04.md'
];

materials.forEach((mat, idx) => {
  const content = fs.readFileSync(path.join(process.cwd(), mdFiles[idx]), 'utf8');
  mat.markdownContent = content;
});

fs.writeFileSync(jsonPath, JSON.stringify(materials, null, 2), 'utf8');
console.log('data/gemelaridade_study_materials.json updated from docs/resumo_gemelaridade_0*.md');

