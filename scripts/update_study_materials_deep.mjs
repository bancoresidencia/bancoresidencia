import fs from 'fs';
import path from 'path';

const dataPath = path.join(process.cwd(), 'src', 'data', 'studyMaterialsData.ts');
const jsonPath = path.join(process.cwd(), 'data', 'gemelaridade_study_materials.json');

const newMaterials = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
let tsContent = fs.readFileSync(dataPath, 'utf8');

// Find where mat-gem-01 starts
const firstGemIndex = tsContent.indexOf('mat-gem-01');
if (firstGemIndex === -1) {
  console.log('mat-gem-01 not found');
  process.exit(1);
}

// Find the opening brace before mat-gem-01
const startObjIndex = tsContent.lastIndexOf('{', firstGemIndex);

// Find the end of array ];
const endArrIndex = tsContent.lastIndexOf('];');

console.log('startObjIndex:', startObjIndex, 'endArrIndex:', endArrIndex);

// Let's replace everything from startObjIndex to endArrIndex with the new serialized materials
let replacement = '';
newMaterials.forEach((m, idx) => {
  replacement += `  {\n`;
  replacement += `    id: ${JSON.stringify(m.id)},\n`;
  replacement += `    focusId: ${JSON.stringify(m.focusId)},\n`;
  replacement += `    title: ${JSON.stringify(m.title)},\n`;
  replacement += `    specialty: ${JSON.stringify(m.specialty)},\n`;
  replacement += `    theme: ${JSON.stringify(m.theme)},\n`;
  replacement += `    focus: ${JSON.stringify(m.focus)},\n`;
  replacement += `    readTimeMinutes: ${m.readTimeMinutes},\n`;
  replacement += `    lastUpdatedYear: ${m.lastUpdatedYear},\n`;
  replacement += `    guidelineBadge: ${JSON.stringify(m.guidelineBadge)},\n`;
  replacement += `    summarySnippet: ${JSON.stringify(m.summarySnippet)},\n`;
  replacement += `    keyPoints: ${JSON.stringify(m.keyPoints, null, 6).replace(/\n/g, '\n    ')},\n`;
  replacement += `    markdownContent: ${JSON.stringify(m.markdownContent)}\n`;
  replacement += `  }${idx < newMaterials.length - 1 ? ',\n' : '\n'}`;
});

const updatedContent = tsContent.slice(0, startObjIndex) + replacement + tsContent.slice(endArrIndex);
fs.writeFileSync(dataPath, updatedContent, 'utf8');
console.log('Successfully updated src/data/studyMaterialsData.ts with all 4 new deep materials!');

