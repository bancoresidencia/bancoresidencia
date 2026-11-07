import fs from 'fs';
import path from 'path';

console.log('='.repeat(80));
console.log('AUDITORIA DE CONFORMIDADE: REGRA DE SIMILARIDADE >= 85% E ATRIBUIÇÃO TEXTUAL');
console.log('='.repeat(80));

// 1. Carregar os 17.581 itens sincronizados para o Supabase
const pendingFile = 'data/pending_supabase_gabarito_sync.json';
const pendingItems = JSON.parse(fs.readFileSync(pendingFile, 'utf8'));
console.log(`\n1. Itens sincronizados analisados: ${pendingItems.length.toLocaleString('pt-BR')}`);

const pendingMap = new Map();
for (const it of pendingItems) {
  pendingMap.set(it.id, it);
}

// 2. Carregar todos os logs de cruzamento em data/logs_cruzamento/*.jsonl
const logsDir = 'data/logs_cruzamento';
const logFiles = fs.readdirSync(logsDir).filter(f => f.endsWith('.jsonl'));
console.log(`2. Arquivos de log de cruzamento encontrados: ${logFiles.length}`);

const crossedLogsMap = new Map();
let totalLogEntries = 0;

for (const lf of logFiles) {
  const content = fs.readFileSync(path.join(logsDir, lf), 'utf8');
  const lines = content.trim().split('\n').filter(Boolean);
  totalLogEntries += lines.length;
  for (const line of lines) {
    try {
      const entry = JSON.parse(line);
      if (entry.question_id) {
        crossedLogsMap.set(entry.question_id, entry);
      }
    } catch {}
  }
}
console.log(`   Total de logs carregados: ${totalLogEntries.toLocaleString('pt-BR')} (IDs únicos nos logs: ${crossedLogsMap.size.toLocaleString('pt-BR')})`);

// 3. Cruzar pending com os logs de cruzamento textual
let syncedInLogs = 0;
let syncedNotInLogs = 0;
let scrambledCount = 0;
let emptyFilledCount = 0;
let divergenceCorrectedCount = 0;
let verifiedExistingCount = 0;
let anuladaCount = 0;

const logStatuses = {};

for (const it of pendingItems) {
  const log = crossedLogsMap.get(it.id);
  if (log) {
    syncedInLogs++;
    logStatuses[log.status] = (logStatuses[log.status] || 0) + 1;
    if (log.is_scrambled) scrambledCount++;
    if (log.status === 'FILLED_EMPTY') emptyFilledCount++;
    if (log.status === 'DIVERGENCE_CORRECTED') divergenceCorrectedCount++;
    if (log.status === 'VERIFIED_EXISTING') verifiedExistingCount++;
    if (log.status === 'MARKED_ANULADA') anuladaCount++;
  } else {
    syncedNotInLogs++;
  }
}

console.log('\n3. Relação entre os 17.581 sincronizados e o Motor de Cruzamento Textual:');
console.log(`   • Itens presentes nos logs de cruzamento textual: ${syncedInLogs.toLocaleString('pt-BR')} (${(syncedInLogs / pendingItems.length * 100).toFixed(2)}%)`);
console.log(`   • Itens não registrados nesses logs específicos: ${syncedNotInLogs.toLocaleString('pt-BR')} (${(syncedNotInLogs / pendingItems.length * 100).toFixed(2)}%)`);
console.log(`   • Status nos logs de cruzamento:`, logStatuses);
console.log(`   • Casos com letra de caderno diferente corrigida pelo texto (is_scrambled): ${scrambledCount.toLocaleString('pt-BR')}`);

// 4. Analisar os itens nos arquivos locais para verificar a consistência das opções
const SPECIALTIES = [
  'data/urologia_final_questions.json',
  'data/ginecologia_final_questions.json',
  'data/cirurgia_final_questions.json',
  'data/obstetricia_final_questions.json',
  'data/pediatria_final_questions.json',
  'data/medicina_preventiva_final_questions.json',
  'data/clinica_medica_final_questions.json',
  'data/cirurgia_geral_final_questions.json'
];

console.log('\n4. Verificando consistência interna das opções das 17.581 questões nos arquivos locais...');
const localQuestionsMap = new Map();
for (const sf of SPECIALTIES) {
  if (fs.existsSync(sf)) {
    const list = JSON.parse(fs.readFileSync(sf, 'utf8'));
    for (const q of list) {
      if (pendingMap.has(q.id)) {
        localQuestionsMap.set(q.id, q);
      }
    }
  }
}
console.log(`   Questões localizadas nos arquivos locais: ${localQuestionsMap.size.toLocaleString('pt-BR')} de ${pendingItems.length.toLocaleString('pt-BR')}`);

// Verificar se para cada questão sincronizada com gabarito A-E:
// - A questão possui a opção correspondente
// - O texto da opção é válido e não vazio
let validOptionMatches = 0;
let missingOptionForAnswer = 0;
let anuladasChecked = 0;
let discursivasChecked = 0;

for (const it of pendingItems) {
  const lq = localQuestionsMap.get(it.id);
  if (!lq) continue;

  if (it.is_anulada || it.correct_answer === 'ANULADA') {
    anuladasChecked++;
    continue;
  }
  if (lq.type === 'Discursiva') {
    discursivasChecked++;
    continue;
  }

  const opt = (lq.options || []).find(o => o.letter === it.correct_answer);
  if (opt && opt.text && opt.text.trim().length > 0) {
    validOptionMatches++;
  } else {
    missingOptionForAnswer++;
  }
}

console.log(`   • Questões com alternativa correspondente válida e com texto no banco: ${validOptionMatches.toLocaleString('pt-BR')}`);
console.log(`   • Questões anuladas checadas: ${anuladasChecked.toLocaleString('pt-BR')}`);
console.log(`   • Questões com opção faltante para a letra atribuída: ${missingOptionForAnswer.toLocaleString('pt-BR')}`);

// 5. Para os itens que não estavam nos logs de cruzamento, de onde vieram?
console.log('\n5. Investigando proveniência dos itens sem log de cruzamento direto:');
const notInLogsSample = [];
const sourcesMap = {};
for (const it of pendingItems) {
  if (!crossedLogsMap.has(it.id)) {
    const lq = localQuestionsMap.get(it.id);
    if (lq) {
      const src = lq.source || lq.banca || lq.institution || 'Desconhecido';
      sourcesMap[src] = (sourcesMap[src] || 0) + 1;
      if (notInLogsSample.length < 5) {
        notInLogsSample.push({
          id: lq.id,
          banca: lq.banca,
          year: lq.year,
          ans: it.correct_answer,
          commentary_snippet: (lq.commentary || '').slice(0, 100),
          options_count: (lq.options || []).length
        });
      }
    }
  }
}

const topSources = Object.entries(sourcesMap).sort((a, b) => b[1] - a[1]).slice(0, 10);
console.log('   Top fontes dos itens sincronizados fora dos logs de 03/11:', topSources);
console.log('   Amostra de itens:', JSON.stringify(notInLogsSample, null, 2));

console.log('\n='.repeat(80));
console.log('AUDITORIA CONCLUÍDA');
console.log('='.repeat(80));
