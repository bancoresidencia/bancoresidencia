import fs from 'fs';
import path from 'path';

const STATUS_PATH = path.join(process.cwd(), 'data', 'ajudamedico_extraction_status.json');
const DATA_DIR = path.join(process.cwd(), 'data', 'knowledge', 'extracao_ajudamedico');
const IMAGES_DIR = path.join(process.cwd(), 'public', 'images', 'questions', 'ajudamedico');

console.log('\n===============================================================');
console.log('📊 STATUS DA EXTRAÇÃO: AJUDAMÉDICO -> BANCO RESIDÊNCIA');
console.log('===============================================================');

if (!fs.existsSync(STATUS_PATH)) {
  console.log('ℹ️ Nenhuma extração iniciada ainda.');
  process.exit(0);
}

const status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));

let filesCount = 0;
let diskQuestionsCount = 0;
if (fs.existsSync(DATA_DIR)) {
  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  filesCount = files.length;
  for (const f of files) {
    try {
      const content = JSON.parse(fs.readFileSync(path.join(DATA_DIR, f), 'utf8'));
      diskQuestionsCount += Array.isArray(content) ? content.length : 0;
    } catch {}
  }
}

let imageFilesCount = 0;
if (fs.existsSync(IMAGES_DIR)) {
  imageFilesCount = fs.readdirSync(IMAGES_DIR).length;
}

console.log(`📌 Estado do Processo:      ${status.status.toUpperCase()}`);
console.log(`📄 Página Atual no Servidor: ${status.currentPage}`);
console.log(`📝 Total de Questões Salvas: ${diskQuestionsCount} (Registradas: ${status.totalQuestions})`);
console.log(`🖼️ Total de Imagens no Disco: ${imageFilesCount} (Registradas: ${status.totalImages})`);
console.log(`📦 Lotes JSON gerados:      ${filesCount} arquivos`);
console.log(`🏥 Última Prova Mapeada:    ${status.lastExam || 'N/A'}`);
console.log(`🕒 Última Atualização:      ${new Date(status.lastUpdated).toLocaleTimeString('pt-BR')} (${new Date(status.lastUpdated).toLocaleDateString('pt-BR')})`);

if (status.lastError) {
  console.log(`⚠️ Último Erro Registrado:   ${status.lastError}`);
}

console.log('===============================================================\n');
