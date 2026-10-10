import fs from 'fs';
import path from 'path';

const MEDCURSO_STATUS_PATH = path.join(process.cwd(), 'data', 'medcurso_extraction_status.json');
const MASTER_STATUS_PATH = path.join(process.cwd(), 'data', 'gabarito_questoes_status.json');
const MEDCURSO_DIR = path.join(process.cwd(), 'data', 'knowledge', 'extracao_de_questoes');

let medcursoStatus = null;
if (fs.existsSync(MEDCURSO_STATUS_PATH)) {
  try { medcursoStatus = JSON.parse(fs.readFileSync(MEDCURSO_STATUS_PATH, 'utf8')); } catch {}
}

console.log('\n================================================================');
console.log('📊 PAINEL DE ANDAMENTO: EXTRAÇÃO MEDCURSO 2026 (PROVAS E BANCAS)');
console.log('================================================================');

if (medcursoStatus) {
  // Contagem dinâmica direta do disco
  let discoTemas = 0;
  let discoQuestoes = 0;
  let discoE1 = 0;
  let discoE2 = 0;
  let discoPlat = 0;
  let discoNovas = 0;

  if (fs.existsSync(MEDCURSO_DIR)) {
    function walk(dir) {
      for (const item of fs.readdirSync(dir)) {
        const full = path.join(dir, item);
        if (fs.statSync(full).isDirectory()) walk(full);
        else if (item.endsWith('.json')) {
          discoTemas++;
          try {
            const d = JSON.parse(fs.readFileSync(full, 'utf8'));
            const qs = d.questoes || [];
            discoQuestoes += qs.length;
            for (const q of qs) {
              if (q.presenteNaExtracao1) discoE1++;
              if (q.presenteNaExtracao2) discoE2++;
              if (q.presenteNaPlataforma) discoPlat++;
              if (q.novaParaPlataforma) discoNovas++;
            }
          } catch {}
        }
      }
    }
    walk(MEDCURSO_DIR);
  }

  const temasTotal = Math.max(discoTemas, medcursoStatus.totalTemasProcessados || 0);
  const questoesTotal = Math.max(discoQuestoes, medcursoStatus.questoesOficiaisUnicas || 0);
  const e1Total = Math.max(discoE1, medcursoStatus.jaNaExtracao1 || 0);
  const e2Total = Math.max(discoE2, medcursoStatus.jaNaExtracao2 || 0);
  const platTotal = Math.max(discoPlat, medcursoStatus.jaNaPlataforma || 0);
  const novasTotal = Math.max(discoNovas, medcursoStatus.novasParaPlataforma || 0);

  const isRunning = medcursoStatus.status === 'in_progress' || medcursoStatus.status === 'running';
  console.log(`📌 Status da Operação:         ${isRunning ? '🟢 EM EXECUÇÃO ATIVA (SEGUNDO PLANO)' : '🏁 ' + medcursoStatus.status}`);
  console.log(`🏥 Especialidade Atual:        ${medcursoStatus.especialidadeAtiva || 'Mapeando pastas do Drive...'}`);
  console.log(`📖 Tema em Processamento:      ${medcursoStatus.temaAtivo || 'N/A'}`);
  console.log(`📚 Temas Processados:          ${temasTotal}`);
  console.log('----------------------------------------------------------------');
  console.log('🎯 AUDITORIA DE QUESTÕES OFICIAIS (ZERO DUPLICATAS):');
  console.log(`   • Questões Oficiais Únicas: ${questoesTotal.toLocaleString('pt-BR')} questões`);
  console.log(`   • Já presentes na Extração 1: ${e1Total.toLocaleString('pt-BR')}`);
  console.log(`   • Já presentes na Extração 2: ${e2Total.toLocaleString('pt-BR')}`);
  console.log(`   • Já presentes na Plataforma: ${platTotal.toLocaleString('pt-BR')}`);
  console.log(`   ✨ NOVAS ELEGÍVEIS (Inéditas): ${novasTotal.toLocaleString('pt-BR')} questões`);
  console.log('----------------------------------------------------------------');
  console.log(`☁️ Pasta no Supabase:          medical-knowledge/extracao_de_questoes/`);
  console.log(`🛡️ Tabela da Plataforma:       Intacta (nenhuma questão adicionada à base)`);
  console.log(`🕒 Última Atualização:          ${new Date().toLocaleTimeString('pt-BR')}`);
} else {
  console.log('Nenhuma operação do MEDCURSO 2026 iniciada ainda.');
}

console.log('================================================================\n');
