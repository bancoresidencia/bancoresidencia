import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import { solveQuestionDeep } from './solve_questions_engine.mjs';

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
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERRO: Supabase não configurado.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Parâmetros CLI
const argFile = process.argv.find(a => a.startsWith('--file='));
const argSpec = process.argv.find(a => a.startsWith('--specialty='));
const argWorkers = process.argv.find(a => a.startsWith('--workers='));
const argNext = process.argv.find(a => a.startsWith('--next='));

const DB_PATH = argFile ? argFile.split('=')[1] : 'data/ginecologia_direto_questions.json';
const SPECIALTY_NAME = argSpec ? argSpec.split('=')[1] : 'Ginecologia';
let CONCURRENCY = argWorkers ? parseInt(argWorkers.split('=')[1], 10) : 4;
if (![4, 6, 7, 10].includes(CONCURRENCY)) CONCURRENCY = 4;
const NEXT_SPECIALTY = argNext ? argNext.split('=')[1] : 'obstetricia';

const STATE_PATH = 'data/pipeline_progress_state.json';
const SIGNAL_PATH = 'data/pipeline.signal';
const SQLITE_PATH = 'data/supabase_tables/supabase_tables.db';

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

// Filtra apenas questões de texto puro com gabarito homologado sem comentários padrão-ouro
const validAnswers = ['A', 'B', 'C', 'D', 'E', 'ANULADA'];
const pendingQuestions = allQuestions.filter(q => {
  const ans = (q.correctAnswer || q.correct_answer || q.gabarito || '').toUpperCase().trim();
  const hasValidAns = validAnswers.includes(ans) || q.is_anulada;
  const comm = q.commentary || '';
  const needsComm = !comm.includes('Take-Home Message:') && !comm.includes('Take-Home');
  const noImg = !checkHasImage(q);
  return hasValidAns && needsComm && noImg;
});

const totalToProcess = pendingQuestions.length;
console.log(`================================================================================`);
console.log(`🚀 ESTEIRA DE PRODUÇÃO CONTÍNUA — ${SPECIALTY_NAME.toUpperCase()} (TEXTO PURO)`);
console.log(`- Base de dados: ${DB_PATH}`);
console.log(`- Total de questões pendentes selecionadas: ${totalToProcess}`);
console.log(`- Encadeamento posterior: ${NEXT_SPECIALTY ? NEXT_SPECIALTY.toUpperCase() : 'NENHUM'}`);
console.log(`- Modelo: gemini-3.5-flash-lite (MODO 100% GRATUITO - Custo R$ 0,00)`);
console.log(`- Concorrência: ${CONCURRENCY} workers simultâneos`);
console.log(`================================================================================\n`);

let processedCount = 0;
let successCount = 0;
let errorCount = 0;
let totalPromptTokens = 0;
let totalCandidateTokens = 0;
const startTime = Date.now();
const recentHistory = [];

let dbLocal = null;
if (fs.existsSync(SQLITE_PATH)) {
  try {
    dbLocal = new DatabaseSync(SQLITE_PATH);
  } catch (e) {
    console.warn('⚠️ SQLite local não pôde ser aberto:', e.message);
  }
}

function updateStateFile(currentQ = null, overrideStatus = null) {
  const now = Date.now();
  const elapsedSec = Math.max(1, Math.round((now - startTime) / 1000));
  const qpm = processedCount > 0 ? parseFloat(((processedCount / elapsedSec) * 60).toFixed(1)) : 0;
  const remainingQuestions = Math.max(0, totalToProcess - processedCount);
  const estSecondsRemaining = qpm > 0 ? Math.round((remainingQuestions / qpm) * 60) : 0;
  const etaMinutes = Math.round(estSecondsRemaining / 60);

  let status = overrideStatus || 'RUNNING';
  if (fs.existsSync(SIGNAL_PATH)) {
    const sig = fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase();
    if (sig === 'pause') status = 'PAUSED';
    if (sig === 'stop') status = 'STOPPED';
  }

  const state = {
    status,
    startedAt: new Date(startTime).toISOString(),
    updatedAt: new Date().toISOString(),
    specialty: SPECIALTY_NAME,
    nextSpecialty: NEXT_SPECIALTY,
    scope: 'Questões de Texto Puro com Gabarito Homologado (questions_direto)',
    model: 'gemini-3.5-flash-lite (Pool Gratuito - Custo R$ 0,00)',
    concurrency: CONCURRENCY,
    totalToProcess,
    processedCount,
    successCount,
    errorCount,
    progressPercent: totalToProcess > 0 ? parseFloat(((processedCount / totalToProcess) * 100).toFixed(2)) : 100,
    tokens: {
      promptTokens: totalPromptTokens,
      candidateTokens: totalCandidateTokens,
      totalTokens: totalPromptTokens + totalCandidateTokens,
      avgPromptTokens: processedCount > 0 ? Math.round(totalPromptTokens / processedCount) : 0,
      avgCandidateTokens: processedCount > 0 ? Math.round(totalCandidateTokens / processedCount) : 0
    },
    velocity: {
      questionsPerMinute: qpm,
      elapsedSeconds: elapsedSec,
      estimatedSecondsRemaining: estSecondsRemaining,
      etaFormatted: etaMinutes > 60 ? `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m` : `${etaMinutes}m`
    },
    currentQuestion: currentQ,
    recentHistory: recentHistory.slice(-15).reverse()
  };

  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch {}
}

function flushLocalDB() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(allQuestions, null, 2), 'utf8');
  } catch (err) {
    console.error(`⚠️ Erro ao salvar arquivo local: ${err.message}`);
  }
}

async function checkSignals() {
  if (!fs.existsSync(SIGNAL_PATH)) return;
  const signal = fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase();
  if (signal === 'pause') {
    updateStateFile(null, 'PAUSED');
    console.log(`⏸️ Pipeline pausado por sinal externo (data/pipeline.signal). Aguardando...`);
    while (fs.existsSync(SIGNAL_PATH) && fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase() === 'pause') {
      await new Promise(r => setTimeout(r, 2000));
    }
    console.log(`▶️ Retomando execução...`);
    updateStateFile(null, 'RUNNING');
  } else if (signal === 'stop') {
    updateStateFile(null, 'STOPPED');
    console.log(`⏹️ Sinal de parada detectado. Salvando dados locais e finalizando.`);
    flushLocalDB();
    process.exit(0);
  }
}

function sanitizePostgres(str) {
  if (!str) return '';
  return String(str).replace(/\u0000/g, '').replace(/\\u0000/g, '').replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
}

async function processQuestion(q) {
  const qStart = Date.now();
  updateStateFile({ code: q.code, id: q.id, tema: q.tema, especialidade: q.especialidade });

  try {
    const res = await solveQuestionDeep(q, SPECIALTY_NAME);
    if (!res || !res.commentary) {
      throw new Error('Retorno nulo ou inválido do motor de IA.');
    }

    const durationSec = parseFloat(((Date.now() - qStart) / 1000).toFixed(2));
    const pTokens = res.usageMetadata?.promptTokenCount || 1135;
    const cTokens = res.usageMetadata?.candidatesTokenCount || 490;
    totalPromptTokens += pTokens;
    totalCandidateTokens += cTokens;
    processedCount++;
    successCount++;

    const cleanedOptions = (res.options || []).map(o => ({
      ...o,
      text: sanitizePostgres(o.text),
      explanation: sanitizePostgres(o.explanation)
    }));

    const cleanCommentary = sanitizePostgres(res.commentary);

    // 1. Sincroniza em questions_direto
    const { error: errDireto } = await supabase
      .from('questions_direto')
      .update({
        commentary: cleanCommentary,
        options: cleanedOptions
      })
      .eq('id', q.id);

    // 2. Sincroniza em questions (se existir)
    supabase
      .from('questions')
      .update({
        commentary: cleanCommentary,
        options: cleanedOptions
      })
      .eq('id', q.id)
      .then(() => {})
      .catch(() => {});

    // 3. Atualiza SQLite local se aberto
    if (dbLocal) {
      try {
        dbLocal.prepare(`
          UPDATE questions_curated_staging 
          SET commentary = ?
          WHERE id = ? OR id = ? OR code = ?
        `).run(cleanCommentary, `questions_${q.id}`, `questions_expansion_direto_${q.id}`, q.code);
      } catch {}
    }

    // Atualiza base em memória
    const idxInAll = allQuestions.findIndex(item => item.id === q.id);
    if (idxInAll !== -1) {
      allQuestions[idxInAll] = {
        ...allQuestions[idxInAll],
        commentary: res.commentary,
        options: res.options,
        finalCommentary: res.finalCommentary,
        takeHomeMessage: res.takeHomeMessage
      };
    }

    recentHistory.push({
      code: q.code || q.id,
      tema: q.tema || SPECIALTY_NAME,
      duration: durationSec,
      tokens: pTokens + cTokens,
      status: errDireto ? 'ERRO_SUPABASE' : 'OK',
      timestamp: new Date().toLocaleTimeString('pt-BR')
    });

    console.log(`[${processedCount}/${totalToProcess}] ${q.code || q.id} | ⚡ ${durationSec}s | In=${pTokens}, Out=${cTokens} | ${errDireto ? '❌ ' + errDireto.message : '✅ Supabase OK'}`);

    if (processedCount % 50 === 0) {
      flushLocalDB();
    }

    updateStateFile();
  } catch (err) {
    processedCount++;
    errorCount++;
    console.error(`❌ [${processedCount}/${totalToProcess}] Falha na questão ${q.code || q.id}: ${err.message}`);
    recentHistory.push({
      code: q.code || q.id,
      tema: q.tema || SPECIALTY_NAME,
      duration: 0,
      tokens: 0,
      status: 'ERRO: ' + err.message.slice(0, 30),
      timestamp: new Date().toLocaleTimeString('pt-BR')
    });
    updateStateFile();
  }
}

async function runPipeline() {
  updateStateFile(null, 'RUNNING');
  let currentIndex = 0;
  const runningPromises = new Set();

  while (currentIndex < pendingQuestions.length || runningPromises.size > 0) {
    await checkSignals();

    while (runningPromises.size < CONCURRENCY && currentIndex < pendingQuestions.length) {
      const q = pendingQuestions[currentIndex++];
      const p = processQuestion(q).then(() => {
        runningPromises.delete(p);
      });
      runningPromises.add(p);
    }

    if (runningPromises.size > 0) {
      await Promise.race(runningPromises);
    }
  }

  flushLocalDB();
  updateStateFile(null, 'COMPLETED');
  console.log(`\n🎉 ESPECIALIDADE ${SPECIALTY_NAME} FINALIZADA!`);
  console.log(`- Sucessos: ${successCount}`);
  console.log(`- Falhas: ${errorCount}`);

  // Se houver próxima especialidade encadeada, dispara automaticamente!
  if (NEXT_SPECIALTY === 'obstetricia') {
    console.log(`\n➡️ INICIANDO AUTOMATICAMENTE A PRÓXIMA ESPECIALIDADE: OBSTETRÍCIA...`);
    const { spawn } = await import('child_process');
    spawn('node', [
      'scripts/produce_specialty_batch.mjs',
      '--file=data/obstetricia_direto_questions.json',
      '--specialty=Obstetrícia',
      `--workers=${CONCURRENCY}`,
      '--next=none'
    ], {
      stdio: 'inherit',
      detached: true
    }).unref();
  }
}

runPipeline().catch(err => {
  console.error('Erro fatal:', err);
  updateStateFile(null, 'CRASHED');
});
