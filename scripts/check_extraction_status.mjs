import fs from 'fs';
import path from 'path';

const STATUS_PATH = path.join(process.cwd(), 'data', 'extraction_status.json');
const KNOWLEDGE_DIR = path.join(process.cwd(), 'data', 'knowledge');

let totalBooksOnDisk = 0;
let totalChunksOnDisk = 0;
const specialtiesFound = [];

if (fs.existsSync(KNOWLEDGE_DIR)) {
  const dirs = fs.readdirSync(KNOWLEDGE_DIR);
  for (const dir of dirs) {
    const fullDir = path.join(KNOWLEDGE_DIR, dir);
    if (fs.statSync(fullDir).isDirectory()) {
      const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.json'));
      if (files.length > 0) {
        specialtiesFound.push(`${dir} (${files.length} livros)`);
        totalBooksOnDisk += files.length;
        for (const file of files) {
          try {
            const content = JSON.parse(fs.readFileSync(path.join(fullDir, file), 'utf8'));
            totalChunksOnDisk += content.totalChunks || content.chunks?.length || 0;
          } catch {}
        }
      }
    }
  }
}

let status = { status: 'running', currentSpecialty: 'Iniciando', lastBook: 'N/A' };
if (fs.existsSync(STATUS_PATH)) {
  try {
    status = JSON.parse(fs.readFileSync(STATUS_PATH, 'utf8'));
  } catch {}
}

const isRunning = status.status === 'running';

console.log('\n======================================================');
console.log('📊 PAINEL DE ANDAMENTO DA EXTRAÇÃO DOS LIVROS');
console.log('======================================================');
console.log(`📌 Status Atual:          ${isRunning ? '🟢 EM EXECUÇÃO (SEGUNDO PLANO)' : '🏁 ' + status.status}`);
console.log(`📚 Especialidade Atual:    ${status.currentSpecialty || 'N/A'}`);
console.log(`📖 Último Livro Lido:      ${status.lastBook || 'N/A'}`);
console.log(`✅ Total de Livros Prontos: ${totalBooksOnDisk} livros extraídos`);
console.log(`🧠 Blocos Teóricos Prontos: ${totalChunksOnDisk.toLocaleString('pt-BR')} blocos indexados`);
console.log(`📂 Especialidades no Banco: ${specialtiesFound.join(', ')}`);
console.log(`🕒 Última Atualização:     ${status.updatedAt ? new Date(status.updatedAt).toLocaleTimeString('pt-BR') : 'N/A'}`);
console.log('======================================================\n');
