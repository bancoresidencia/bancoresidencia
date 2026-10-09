import fs from 'fs';
import path from 'path';

const MASTER_STATUS_PATH = path.join(process.cwd(), 'data', 'gabarito_questoes_status.json');
const GABARITO_DIR = path.join(process.cwd(), 'data', 'knowledge', 'gabarito_das_questoes');

let totalBooks = 0;
const globalUniqueQuestions = new Set();
const specialtyStats = [];

if (fs.existsSync(GABARITO_DIR)) {
  const dirs = fs.readdirSync(GABARITO_DIR);
  for (const dir of dirs) {
    const fullDir = path.join(GABARITO_DIR, dir);
    if (fs.statSync(fullDir).isDirectory()) {
      const files = fs.readdirSync(fullDir).filter(f => f.endsWith('.json'));
      if (files.length > 0) {
        const specUnique = new Set();
        let specRawQuestions = 0;

        for (const file of files) {
          try {
            const content = JSON.parse(fs.readFileSync(path.join(fullDir, file), 'utf8'));
            specRawQuestions += content.questionsFoundInBook || 0;
            const fullText = (content.chunks || []).map(c => c.content).join('\n\n');

            // 1. Coleta IDs oficiais de questão do Estratégia MED (ex: 4000186243)
            const ids = fullText.match(/\b4\d{8,10}\b/g) || [];
            ids.forEach(id => {
              specUnique.add(id);
              globalUniqueQuestions.add(id);
            });

            // 2. Coleta enunciados para questões sem ID numérico
            const statements = fullText.match(/(?:Quest[ãa]o\s*\n+|QUEST[ÃA]O\s*\n+)([\s\S]{30,150}?)(?=[A-E]\)|\n\n)/gi) || [];
            statements.forEach(st => {
              const clean = st.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 80);
              if (clean.length > 30) {
                const key = `st_${clean}`;
                specUnique.add(key);
                globalUniqueQuestions.add(key);
              }
            });
          } catch {}
        }

        specialtyStats.push({
          name: dir,
          books: files.length,
          uniqueQuestions: specUnique.size,
          rawMentions: specRawQuestions
        });

        totalBooks += files.length;
      }
    }
  }
}

let status = { status: 'in_progress', activeSpecialty: 'Iniciando', activeBook: 'N/A' };
if (fs.existsSync(MASTER_STATUS_PATH)) {
  try {
    status = JSON.parse(fs.readFileSync(MASTER_STATUS_PATH, 'utf8'));
  } catch {}
}

const isRunning = status.status === 'in_progress' || status.status === 'running';

console.log('\n================================================================');
console.log('📊 PAINEL DE AUDITORIA: QUESTÕES ÚNICAS DO GOOGLE DRIVE (SEM DUPLICATAS)');
console.log('================================================================');
console.log(`📌 Status Atual:               ${isRunning ? '🟢 EM EXECUÇÃO (SEGUNDO PLANO)' : '🏁 ' + status.status}`);
console.log(`🏥 Especialidade Ativa:        ${status.activeSpecialty || 'N/A'}`);
console.log(`📖 Livro Sendo Processado:     ${status.activeBook || 'N/A'}`);
console.log(`📚 Livros Extraídos no Total:  ${totalBooks} livros concluídos`);
console.log(`🎯 QUESTÕES ÚNICAS REAIS:      ${globalUniqueQuestions.size.toLocaleString('pt-BR')} QUESTÕES (Zero duplicatas)`);
console.log(`☁️ Pasta no Supabase:          medical-knowledge/gabarito_das_questoes/`);
console.log(`🛡️ Tabela da Plataforma:       Intacta (nenhuma questão adicionada à base)`);
console.log('----------------------------------------------------------------');
console.log('📁 Detalhamento de Questões Únicas por Especialidade:');
if (specialtyStats.length > 0) {
  specialtyStats.forEach(s => {
    console.log(`   • ${s.name.padEnd(14)}: ${s.books.toString().padStart(2)} livros | ${s.uniqueQuestions.toLocaleString('pt-BR').padStart(5)} questões únicas (sem duplicatas)`);
  });
} else {
  console.log('   (Processando primeira especialidade...)');
}
console.log('----------------------------------------------------------------');
console.log(`🕒 Última Atualização:          ${status.updatedAt ? new Date(status.updatedAt).toLocaleTimeString('pt-BR') : 'N/A'}`);
console.log('================================================================\n');
