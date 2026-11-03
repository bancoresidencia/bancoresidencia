import fs from 'fs';
import path from 'path';

function appendMaterials() {
  const dataPath = path.join(process.cwd(), 'src', 'data', 'studyMaterialsData.ts');
  const jsonPath = path.join(process.cwd(), 'data', 'gemelaridade_study_materials.json');

  const rawJson = fs.readFileSync(jsonPath, 'utf8');
  const materials = JSON.parse(rawJson);

  let tsContent = fs.readFileSync(dataPath, 'utf8');

  // Verifica se já existem para evitar duplicações
  for (const mat of materials) {
    if (tsContent.includes(`'${mat.id}'`) || tsContent.includes(`"${mat.id}"`)) {
      console.log(`[Skip] Material ${mat.id} já existe em studyMaterialsData.ts`);
      return;
    }
  }

  // Localiza o último fechamento '];'
  const lastBracketIndex = tsContent.lastIndexOf('];');
  if (lastBracketIndex === -1) {
    throw new Error('Não foi possível encontrar o fechamento ]; em studyMaterialsData.ts');
  }

  // Serializa os 4 materiais formatados em TypeScript
  let appendString = ',\n';
  materials.forEach((m, idx) => {
    appendString += `  {\n`;
    appendString += `    id: ${JSON.stringify(m.id)},\n`;
    appendString += `    focusId: ${JSON.stringify(m.focusId)},\n`;
    appendString += `    title: ${JSON.stringify(m.title)},\n`;
    appendString += `    specialty: ${JSON.stringify(m.specialty)},\n`;
    appendString += `    theme: ${JSON.stringify(m.theme)},\n`;
    appendString += `    focus: ${JSON.stringify(m.focus)},\n`;
    appendString += `    readTimeMinutes: ${m.readTimeMinutes},\n`;
    appendString += `    lastUpdatedYear: ${m.lastUpdatedYear},\n`;
    appendString += `    guidelineBadge: ${JSON.stringify(m.guidelineBadge)},\n`;
    appendString += `    summarySnippet: ${JSON.stringify(m.summarySnippet)},\n`;
    appendString += `    keyPoints: ${JSON.stringify(m.keyPoints, null, 6).replace(/\n/g, '\n    ')},\n`;
    appendString += `    markdownContent: ${JSON.stringify(m.markdownContent)}\n`;
    appendString += `  }${idx < materials.length - 1 ? ',' : ''}\n`;
  });

  const updatedTs = tsContent.slice(0, lastBracketIndex).trimEnd() + appendString + '];\n';

  fs.writeFileSync(dataPath, updatedTs, 'utf8');
  console.log(`✅ Sucesso! 4 resumos de Gestação Múltipla integrados a src/data/studyMaterialsData.ts.`);
}

appendMaterials();

