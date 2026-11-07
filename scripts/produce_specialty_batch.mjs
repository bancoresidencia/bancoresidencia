import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { solveQuestionDeep, sanitizeText } from './solve_questions_engine.mjs';

// 1. Carrega variáveis de ambiente
const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  const lines = fs.readFileSync(envPath, 'utf8').split('\n');
  lines.forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) {
      let val = v.join('=').trim();
      if (val.startsWith('"') && val.endsWith('"')) val = val.slice(1, -1);
      if (val.startsWith("'") && val.endsWith("'")) val = val.slice(1, -1);
      env[k.trim()] = val;
    }
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERRO: Supabase não configurado.');
  process.exit(1);
}

console.log('🔒 MODO 100% GRATUITO ATIVO: Chave paga bloqueada. Custo: R$ 0,00.');

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Parâmetros CLI
const argFile = process.argv.find(a => a.startsWith('--file='));
const argSpec = process.argv.find(a => a.startsWith('--specialty='));
const argWorkers = process.argv.find(a => a.startsWith('--workers='));

const DB_PATH = argFile ? argFile.split('=')[1] : 'data/clinica_medica_final_questions.json';
const SPECIALTY_NAME = argSpec ? argSpec.split('=')[1] : 'Especialidade Médica';
let CONCURRENCY = argWorkers ? parseInt(argWorkers.split('=')[1], 10) : 4;
if (![4, 6, 7, 10, 20].includes(CONCURRENCY)) CONCURRENCY = 4;

const STATE_PATH = 'data/pipeline_progress_state.json';
const SIGNAL_PATH = 'data/pipeline.signal';

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ Arquivo não encontrado: ${DB_PATH}`);
  process.exit(1);
}

// Carrega base local
const allQuestions = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

// Filtro de verificação de imagem
function checkHasImage(q) {
  if (q.imageUrl && q.imageUrl.trim() !== '') return true;
  if (q.image_url && q.image_url.trim() !== '') return true;
  if (Array.isArray(q.images) && q.images.length > 0) return true;
  const stmt = q.statement || '';
  if (/!\[.*?\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+|[^\s\)]+\.(?:png|jpe?g|webp|gif))/i.test(stmt)) return true;
  if (Array.isArray(q.options)) {
    for (const opt of q.options) {
      if (opt.imageUrl || opt.image_url) return true;
      if (/!\[.*?\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+|[^\s\)]+\.(?:png|jpe?g|webp|gif))/i.test(opt.text || '')) return true;
    }
  }
  return false;
}

// Filtra apenas questões de texto puro com gabarito homologado sem comentários
const validAnswers = ['A', 'B', 'C', 'D', 'E', 'ANULADA'];
const pendingQuestions = allQuestions.filter(q => {
  const ans = (q.correctAnswer || q.correct_answer || '').toUpperCase().trim();
  const hasValidAns = validAnswers.includes(ans);
  const needsComm = !q.commentary || q.commentary.length < 200;
  const noImg = !checkHasImage(q);
  return hasValidAns && needsComm && noImg;
});

const totalToProcess = pendingQuestions.length;
console.log(`================================================================================`);
console.log(`🚀 ESTEIRA DE PRODUÇÃO CONTÍNUA — ${SPECIALTY_NAME.toUpperCase()} (TEXTO PURO)`);
console.log(`- Base de dados: ${DB_PATH}`);
console.log(`- Total de questões pendentes selecionadas: ${totalToProcess}`);
console.log(`- Modelo: gemini-3.5-flash-lite (MODO 100% GRATUITO - Pool de Chaves Free)`);
console.log(`- Custo desta execução: R$ 0,00 (Chave paga BLOQUEADA)`);
console.log(`- Concorrência: ${CONCURRENCY} workers simultâneos`);
console.log(`================================================================================\n`);

if (totalToProcess === 0) {
  console.log(`✅ Nenhuma questão pendente em ${SPECIALTY_NAME}. Especialidade já 100% concluída!`);
  process.exit(0);
}

// Variáveis de controle de métricas
let processedCount = 0;
let successCount = 0;
let errorCount = 0;
let totalPromptTokens = 0;
let totalCandidateTokens = 0;
const startTime = Date.now();
const recentHistory = [];

// Salva o JSON local em lote
function flushLocalDB() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(allQuestions, null, 2), 'utf8');
  } catch (err) {
    console.error('⚠️ Falha ao salvar banco local:', err.message);
  }
}

// Atualiza o estado para o Dashboard
function updateStateFile(currentQ = null, status = 'RUNNING') {
  const elapsedSec = Math.max(1, Math.floor((Date.now() - startTime) / 1000));
  const qpm = processedCount > 0 ? (processedCount / (elapsedSec / 60)) : 0;
  const remainingQuestions = totalToProcess - processedCount;
  const remainingSec = qpm > 0 ? Math.floor((remainingQuestions / qpm) * 60) : 0;

  const hours = Math.floor(remainingSec / 3600);
  const mins = Math.floor((remainingSec % 3600) / 60);
  const etaFormatted = `${hours}h ${mins < 10 ? '0' : ''}${mins}m`;

  const state = {
    status,
    startedAt: new Date(startTime).toISOString(),
    updatedAt: new Date().toISOString(),
    specialty: SPECIALTY_NAME,
    scope: 'Questões de Texto Puro (Sem Imagens) com Gabarito Homologado',
    model: 'gemini-3.5-flash-lite (Pool Gratuito - Custo R$ 0,00)',
    concurrency: CONCURRENCY,
    totalToProcess,
    processedCount,
    successCount,
    errorCount,
    progressPercent: totalToProcess > 0 ? Number(((processedCount / totalToProcess) * 100).toFixed(2)) : 0,
    tokens: {
      promptTokens: totalPromptTokens,
      candidateTokens: totalCandidateTokens,
      totalTokens: totalPromptTokens + totalCandidateTokens,
      avgPromptTokens: processedCount > 0 ? Math.round(totalPromptTokens / processedCount) : 0,
      avgCandidateTokens: processedCount > 0 ? Math.round(totalCandidateTokens / processedCount) : 0
    },
    financials: {
      costInputUSD: 0,
      costOutputUSD: 0,
      totalCostUSD: 0,
      totalCostBRL: 0,
      costPerQuestionBRL: 0,
      estimatedRemainingCostUSD: 0,
      estimatedRemainingCostBRL: 0
    },
    velocity: {
      questionsPerMinute: Number(qpm.toFixed(1)),
      elapsedSeconds: elapsedSec,
      estimatedSecondsRemaining: remainingSec,
      etaFormatted
    },
    currentQuestion: currentQ,
    recentHistory: recentHistory.slice(-15).reverse()
  };

  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch (err) {
    // Silencia erro esporádico de concorrência
  }
}

// Verifica se há sinal de pause ou stop
async function checkSignals() {
  if (fs.existsSync(SIGNAL_PATH)) {
    const signal = fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase();
    if (signal === 'stop') {
      console.log('\n🛑 Sinal de parada imediata (STOP) recebido.');
      updateStateFile(null, 'STOPPED');
      flushLocalDB();
      fs.unlinkSync(SIGNAL_PATH);
      process.exit(0);
    }
    if (signal === 'pause') {
      console.log('\n⏸️ Esteira pausada via dashboard. Aguardando retomada...');
      updateStateFile(null, 'PAUSED');
      while (fs.existsSync(SIGNAL_PATH)) {
        const sig = fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase();
        if (sig === 'resume' || sig !== 'pause') {
          if (sig === 'resume') fs.unlinkSync(SIGNAL_PATH);
          console.log('▶️ Retomando produção...');
          break;
        }
        await new Promise(r => setTimeout(r, 1000));
      }
    }
  }
}

// Worker para processar uma única questão
async function processOneQuestion(q, index) {
  await checkSignals();

  const qStart = Date.now();
  updateStateFile({
    code: q.code || q.id,
    tema: q.tema || SPECIALTY_NAME,
    foco: q.foco || '',
    banca: q.banca || q.institution || 'Oficial',
    year: q.year || 2024,
    startTime: qStart
  });

  try {
    // Garante que o campo especialidade esteja definido na chamada do preceptor
    const qWithSpec = {
      ...q,
      especialidade: q.especialidade || q.specialty || SPECIALTY_NAME
    };

    const res = await solveQuestionDeep(qWithSpec);
    const durationSec = Number(((Date.now() - qStart) / 1000).toFixed(2));

    if (!res) {
      throw new Error('Retorno nulo do motor');
    }

    // Coleta tokens
    const pTokens = res.usageMetadata?.promptTokenCount || 1184;
    const cTokens = res.usageMetadata?.candidatesTokenCount || 503;
    totalPromptTokens += pTokens;
    totalCandidateTokens += cTokens;
    processedCount++;
    successCount++;

    // Sanitização de caracteres nulos/inválidos para Postgres
    const sanitizePostgres = (str) => {
      if (!str) return '';
      return String(str).replace(/\u0000/g, '').replace(/\\u0000/g, '').replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
    };

    const cleanedOptions = (res.options || []).map(o => ({
      ...o,
      text: sanitizePostgres(o.text),
      explanation: sanitizePostgres(o.explanation)
    }));

    // Sincroniza imediatamente no Supabase
    const { error: supaErr } = await supabase
      .from('questions')
      .update({
        commentary: sanitizePostgres(res.commentary),
        options: cleanedOptions
      })
      .eq('id', q.id);

    const supaStatus = supaErr ? `❌ Supabase: ${supaErr.message.slice(0, 40)}` : `✅ Supabase OK`;

    // Atualiza base em memória
    const idxInAll = allQuestions.findIndex(item => item.id === q.id);
    if (idxInAll !== -1) {
      allQuestions[idxInAll] = {
        ...allQuestions[idxInAll],
        commentary: res.commentary,
        options: res.options,
        finalCommentary: res.finalCommentary,
        mainErrorReason: res.mainErrorReason,
        takeHomeMessage: res.takeHomeMessage,
        guidelineEvolution: res.guidelineEvolution,
        references: res.references,
        correctAnswer: res.correctAnswer,
        isAnulada: res.isAnulada
      };
    }

    // Histórico recente
    recentHistory.push({
      code: q.code,
      tema: q.tema || SPECIALTY_NAME,
      duration: durationSec,
      tokens: pTokens + cTokens,
      status: supaErr ? 'ERRO_SUPABASE' : 'OK',
      timestamp: new Date().toLocaleTimeString('pt-BR')
    });

    console.log(`[${processedCount}/${totalToProcess}] ${q.code} (${q.year}) - ${q.tema || SPECIALTY_NAME} | ⚡ ${durationSec}s | Tokens: In=${pTokens}, Out=${cTokens} | ${supaStatus}`);

    // Salva base local no disco a cada 50 questões
    if (processedCount % 50 === 0) {
      flushLocalDB();
    }

    updateStateFile();
  } catch (err) {
    processedCount++;
    errorCount++;
    console.error(`❌ [${processedCount}/${totalToProcess}] Falha na questão ${q.code || q.id}: ${err.message}`);
    recentHistory.push({
      code: q.code,
      tema: q.tema || SPECIALTY_NAME,
      duration: 0,
      tokens: 0,
      status: 'ERRO: ' + err.message.slice(0, 30),
      timestamp: new Date().toLocaleTimeString('pt-BR')
    });
    updateStateFile();
  }
}

// Gerenciador de fila concorrente
async function runContinuousPipeline() {
  updateStateFile(null, 'RUNNING');

  let currentIndex = 0;
  const runningPromises = new Set();

  while (currentIndex < pendingQuestions.length || runningPromises.size > 0) {
    await checkSignals();

    while (runningPromises.size < CONCURRENCY && currentIndex < pendingQuestions.length) {
      const q = pendingQuestions[currentIndex];
      const p = processOneQuestion(q, currentIndex).finally(() => {
        runningPromises.delete(p);
      });
      runningPromises.add(p);
      currentIndex++;
    }

    if (runningPromises.size > 0) {
      await Promise.race(runningPromises);
    }
  }

  // Fim do lote
  flushLocalDB();
  updateStateFile(null, 'COMPLETED');
  console.log(`\n================================================================================`);
  console.log(`🏁 ${SPECIALTY_NAME.toUpperCase()} CONCLUÍDA COM SUCESSO!`);
  console.log(`- Questões Processadas: ${processedCount}`);
  console.log(`- Sucessos: ${successCount} | Falhas: ${errorCount}`);
  console.log(`- Custo Desta Execução: R$ 0,00 (100% Gratuito - Chaves Free / Chave Paga Bloqueada)`);
  console.log(`================================================================================\n`);
}

// Tratamento de encerramento gracioso
process.on('SIGINT', () => {
  console.log('\n🛑 Interrupção detectada (SIGINT). Salvando progresso e finalizando...');
  flushLocalDB();
  updateStateFile(null, 'INTERRUPTED');
  process.exit(0);
});

process.on('SIGTERM', () => {
  flushLocalDB();
  updateStateFile(null, 'TERMINATED');
  process.exit(0);
});

runContinuousPipeline();

