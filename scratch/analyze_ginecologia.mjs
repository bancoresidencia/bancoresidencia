import fs from 'fs';

const p = 'd:/bancoresidencia/data/ginecologia_medevo_extracted.json';
console.log('Lendo dataset extraído...');
const raw = JSON.parse(fs.readFileSync(p, 'utf8'));

console.log('Total bruto de questões:', raw.questions.length);

let autorais = 0;
const officialQuestions = [];
const themesMap = new Map();
const focusMap = new Map();
const imageAttachments = [];

raw.questions.forEach(q => {
  const loc = (q.location?.name || '').toLowerCase();
  const stmt = (q.question_content || '').toLowerCase();
  
  if (loc.includes('medevo') || loc.includes('simulado medevo') || stmt.includes('medevo autoral')) {
    autorais++;
    return;
  }
  officialQuestions.push(q);

  const themeName = q.theme_v2?.name || 'Ginecologia Geral';
  themesMap.set(themeName, (themesMap.get(themeName) || 0) + 1);

  const focusName = q.focus_v2?.name || 'Geral';
  focusMap.set(focusName, (focusMap.get(focusName) || 0) + 1);

  if (Array.isArray(q.media_attachments) && q.media_attachments.length > 0) {
    q.media_attachments.forEach(att => {
      const url = att.url || att;
      if (typeof url === 'string') imageAttachments.push({ questionId: q.id, url });
    });
  }
});

console.log('----------------------------------------------------');
console.log(`Questões Autorais MedEvo Excluídas: ${autorais}`);
console.log(`Questões Oficiais de Prova Mantidas: ${officialQuestions.length}`);
console.log(`Total de Imagens Anexadas: ${imageAttachments.length}`);
console.log(`Total de Temas Distintos: ${themesMap.size}`);
console.log('Distribuição por Temas:');
for (const [theme, count] of Array.from(themesMap.entries()).sort((a,b) => b[1] - a[1])) {
  console.log(`  - ${theme}: ${count} questões`);
}
console.log('----------------------------------------------------');

fs.writeFileSync('d:/bancoresidencia/data/ginecologia_image_attachments.json', JSON.stringify(imageAttachments, null, 2));
console.log('Lista de imagens salva em data/ginecologia_image_attachments.json');
