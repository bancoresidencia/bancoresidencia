import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge', 'extracao_ajudamedico');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'questions', 'ajudamedico');

console.log('Analisando acervo extraído...\n');

const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
let totalQuestions = 0;
const years = {};
const bancas = {};
const exams = {};
const tags = {};
let withExplanations = 0;
let withImages = 0;
let withOfficialPdfs = 0;

for (const file of files) {
  try {
    const questions = JSON.parse(fs.readFileSync(path.join(DATA_DIR, file), 'utf8'));
    for (const q of questions) {
      totalQuestions++;
      if (q.medicalExplanation && q.medicalExplanation.trim().length > 10) withExplanations++;
      if (q.images && q.images.length > 0) withImages++;
      if (q.officialFiles && (q.officialFiles.examPdf || q.officialFiles.keyPdf)) withOfficialPdfs++;

      const y = q.year || 'Sem Ano';
      years[y] = (years[y] || 0) + 1;

      const b = q.banca || 'Outras';
      bancas[b] = (bancas[b] || 0) + 1;

      const e = q.exam || 'Outros';
      exams[e] = (exams[e] || 0) + 1;

      if (Array.isArray(q.tags)) {
        for (const t of q.tags) {
          tags[t] = (tags[t] || 0) + 1;
        }
      }
    }
  } catch (err) {}
}

const totalImagesOnDisk = fs.existsSync(IMAGES_DIR) ? fs.readdirSync(IMAGES_DIR).length : 0;

console.log('===============================================================');
console.log('🏆 RELATÓRIO CONSOLIDADO FINAL DA EXTRAÇÃO AJUDAMÉDICO');
console.log('===============================================================');
console.log(`📚 Total de Questões Extraídas:  ${totalQuestions.toLocaleString('pt-BR')}`);
console.log(`🖼️ Total de Imagens no Disco:    ${totalImagesOnDisk.toLocaleString('pt-BR')} arquivos .webp`);
console.log(`🩺 Questões com Resolução Médica: ${withExplanations.toLocaleString('pt-BR')} (${((withExplanations / totalQuestions) * 100).toFixed(1)}%)`);
console.log(`📄 Questões com Cadernos/PDF:    ${withOfficialPdfs.toLocaleString('pt-BR')} (${((withOfficialPdfs / totalQuestions) * 100).toFixed(1)}%)`);

console.log('\n📅 Distribuição por Ano:');
Object.entries(years).sort((a, b) => String(b[0]).localeCompare(String(a[0]))).slice(0, 10).forEach(([y, c]) => {
  console.log(`   - ${y}: ${c.toLocaleString('pt-BR')} questões`);
});

console.log('\n🏛️ Top 10 Bancas / Instituições:');
Object.entries(exams).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([ex, c]) => {
  console.log(`   - ${ex}: ${c.toLocaleString('pt-BR')} questões`);
});

console.log('\n🏷️ Top 10 Temas Clínicos:');
Object.entries(tags).sort((a, b) => b[1] - a[1]).slice(0, 10).forEach(([t, c]) => {
  console.log(`   - ${t}: ${c.toLocaleString('pt-BR')} questões`);
});
console.log('===============================================================\n');
