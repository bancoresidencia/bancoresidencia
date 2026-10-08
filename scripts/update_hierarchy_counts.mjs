import fs from 'fs';
import path from 'path';

const files = [
  'data/obstetricia_final_questions.json',
  'data/cirurgia_final_questions.json',
  'data/medicina_preventiva_final_questions.json',
  'data/pediatria_final_questions.json',
  'data/clinica_medica_final_questions.json',
  'data/ginecologia_final_questions.json'
];

const counts = {
  especialidades: {},
  temas: {},
  focos: {},
  subfocos: {}
};

for (const file of files) {
  if (!fs.existsSync(file)) continue;
  console.log(`Lendo ${file}...`);
  const list = JSON.parse(fs.readFileSync(file, 'utf8'));

  for (const q of list) {
    const esp = q.especialidade || q.specialty;
    if (esp) {
      counts.especialidades[esp] = (counts.especialidades[esp] || 0) + 1;
      if (esp === 'Cirurgia') {
        counts.especialidades['Cirurgia Geral'] = (counts.especialidades['Cirurgia Geral'] || 0) + 1;
      }
    }

    const tema = q.tema;
    if (tema) counts.temas[tema] = (counts.temas[tema] || 0) + 1;

    const foco = q.foco;
    if (foco) counts.focos[foco] = (counts.focos[foco] || 0) + 1;

    const subfoco = q.subfoco;
    if (subfoco) counts.subfocos[subfoco] = (counts.subfocos[subfoco] || 0) + 1;
  }
}

// Ginecologia e Obstetrícia combinada
counts.especialidades['Ginecologia e Obstetrícia'] =
  (counts.especialidades['Ginecologia'] || 0) + (counts.especialidades['Obstetrícia'] || 0);

console.log('Especialidades contadas:', counts.especialidades);
console.log('Total de temas:', Object.keys(counts.temas).length);
console.log('Total de focos:', Object.keys(counts.focos).length);
console.log('Total de subfocos:', Object.keys(counts.subfocos).length);

const fileContent = `export const hierarchyQuestionCounts = ${JSON.stringify(counts, null, 2)};

export function getQuestionCount(type: 'especialidades' | 'temas' | 'focos' | 'subfocos', name: string): number {
  if (type === 'especialidades') {
    if (name === 'Cirurgia' || name === 'Cirurgia Geral') {
      return hierarchyQuestionCounts.especialidades['Cirurgia Geral'] || hierarchyQuestionCounts.especialidades['Cirurgia'] || 0;
    }
    if (name === 'Ginecologia e Obstetrícia') {
      return hierarchyQuestionCounts.especialidades['Ginecologia e Obstetrícia'] || 0;
    }
  }
  return (hierarchyQuestionCounts[type] as Record<string, number>)[name] || 0;
}
`;

fs.writeFileSync('src/data/hierarchyCounts.ts', fileContent, 'utf8');
console.log('src/data/hierarchyCounts.ts atualizado com sucesso!');
