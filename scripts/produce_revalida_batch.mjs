import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';
import { solveQuestionDeep } from './solve_questions_engine.mjs';

// 1. Carrega variáveis de ambiente
const envPath = path.resolve('.env.local');
const env = {};
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^["']|["']$/g, '');
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Supabase não configurado no .env.local');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Conecta ao SQLite SSOT
const SQLITE_PATH = 'data/supabase_tables/supabase_tables.db';
const db = new DatabaseSync(SQLITE_PATH);

// 3. Parâmetros de Execução
const argWorkers = process.argv.find(a => a.startsWith('--workers='));
const CONCURRENCY = argWorkers ? parseInt(argWorkers.split('=')[1], 10) : 4;

const STATE_PATH = 'data/pipeline_revalida_state.json';
const SIGNAL_PATH = 'data/pipeline.signal';

// 4. Seleciona todas as questões pendentes do Revalida com gabarito homologado e texto puro
const pendingQuestions = db.prepare(`
  SELECT * FROM questions_curated_staging
  WHERE modalidade = 'Revalida'
    AND ((UPPER(TRIM(correct_answer)) IN ('A','B','C','D','E')) OR is_anulada = 1)
    AND (commentary IS NULL OR commentary NOT LIKE '%Take-Home%')
    AND (has_images = 0 OR has_images IS NULL)
    AND (images IS NULL OR images = '[]' OR images = '')
  ORDER BY especialidade ASC, id ASC
`).all();

const TARGET_TOTAL = pendingQuestions.length;
console.log(`================================================================================`);
console.log(`🚀 ESTEIRA DE PRODUÇÃO REVALIDA (100% CHAVES GRATUITAS DO GOOGLE)`);
console.log(`- Modalidade: Revalida (Todas as Especialidades)`);
console.log(`- Total de questões pendentes selecionadas: ${TARGET_TOTAL}`);
console.log(`- Pool: 9 chaves gratuitas do Gemini (Custo R$ 0,00)`);
console.log(`- Concorrência: ${CONCURRENCY} workers paralelos`);
console.log(`- Supabase: questions_revalida & questions_expansion_revalida`);
console.log(`- SQLite: questions_curated_staging`);
console.log(`================================================================================\n`);

let processedCount = 0;
let successCount = 0;
let errorCount = 0;
const startTime = Date.now();

function updateState(currentQ = null, overrideStatus = null) {
  const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
  const qpm = processedCount > 0 ? parseFloat(((processedCount / elapsedSec) * 60).toFixed(1)) : 0;
  const remaining = TARGET_TOTAL - processedCount;
  const etaMinutes = qpm > 0 ? Math.round((remaining / qpm)) : 0;

  let status = overrideStatus || (processedCount >= TARGET_TOTAL ? 'COMPLETED' : 'RUNNING');
  if (fs.existsSync(SIGNAL_PATH)) {
    const sig = fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase();
    if (sig === 'pause') status = 'PAUSED';
    if (sig === 'stop') status = 'STOPPED';
  }

  const state = {
    status,
    modalidade: 'Revalida',
    target: TARGET_TOTAL,
    processed: processedCount,
    success: successCount,
    errors: errorCount,
    progressPercent: TARGET_TOTAL > 0 ? parseFloat(((processedCount / TARGET_TOTAL) * 100).toFixed(2)) : 100,
    velocity: {
      qpm,
      elapsedSec,
      etaMinutes: etaMinutes > 60 ? `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m` : `${etaMinutes}m`
    },
    currentQuestion: currentQ,
    updatedAt: new Date().toISOString()
  };

  try {
    fs.writeFileSync(STATE_PATH, JSON.stringify(state, null, 2), 'utf8');
  } catch {}
}

function sanitizePostgres(str) {
  if (!str) return '';
  return String(str).replace(/\u0000/g, '').replace(/\\u0000/g, '').replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
}

async function checkSignals() {
  if (!fs.existsSync(SIGNAL_PATH)) return;
  const signal = fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase();
  if (signal === 'pause') {
    updateState(null, 'PAUSED');
    console.log(`⏸️ Pipeline pausado. Aguardando remoção do sinal em ${SIGNAL_PATH}...`);
    while (fs.existsSync(SIGNAL_PATH) && fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase() === 'pause') {
      await new Promise(r => setTimeout(r, 2000));
    }
    console.log(`▶️ Retomando execução...`);
    updateState(null, 'RUNNING');
  } else if (signal === 'stop') {
    updateState(null, 'STOPPED');
    console.log(`🛑 Sinal de parada detectado. Finalizando.`);
    process.exit(0);
  }
}

async function processQuestion(q) {
  const startQ = Date.now();
  updateState({ code: q.code, id: q.id, especialidade: q.especialidade, tema: q.tema });

  let options = q.options;
  if (typeof options === 'string') {
    try { options = JSON.parse(options); } catch { options = []; }
  }
  if (!Array.isArray(options)) options = [];

  const qObj = {
    ...q,
    options,
    correctAnswer: q.correct_answer,
    specialty: q.especialidade
  };

  try {
    const res = await solveQuestionDeep(qObj, q.especialidade, null, false);
    if (!res || !res.commentary) throw new Error('Retorno nulo ou inválido do modelo.');

    const cleanCommentary = sanitizePostgres(res.commentary);
    const cleanedOptions = (res.options || []).map(o => ({
      ...o,
      text: sanitizePostgres(o.text),
      explanation: sanitizePostgres(o.explanation)
    }));

    // Extrai o UUID puro (36 caracteres)
    const uuidMatch = q.id.match(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i);
    const plainUuid = uuidMatch ? uuidMatch[0] : q.id;

    // 1. Atualiza Supabase questions_revalida
    const { error: errRev } = await supabase
      .from('questions_revalida')
      .update({ commentary: cleanCommentary, options: cleanedOptions })
      .eq('id', plainUuid);

    // 2. Atualiza Supabase questions_expansion_revalida
    supabase
      .from('questions_expansion_revalida')
      .update({ commentary: cleanCommentary, options: cleanedOptions })
      .eq('id', plainUuid)
      .then(() => {})
      .catch(() => {});

    // 3. Atualiza SQLite local SSOT
    db.prepare(`
      UPDATE questions_curated_staging
      SET commentary = ?, options = ?
      WHERE id = ?
    `).run(cleanCommentary, JSON.stringify(cleanedOptions), q.id);

    processedCount++;
    successCount++;
    const duration = ((Date.now() - startQ) / 1000).toFixed(2);
    console.log(`[${processedCount}/${TARGET_TOTAL}] ${q.code || plainUuid} (${q.especialidade}) | ⚡ ${duration}s | ${errRev ? '❌ ' + errRev.message : '✅ Supabase OK'}`);

    updateState();
  } catch (err) {
    processedCount++;
    errorCount++;
    console.error(`❌ [${processedCount}/${TARGET_TOTAL}] Falha na questão ${q.code || q.id}: ${err.message}`);
    updateState();
  }
}

async function runPipeline() {
  updateState(null, 'RUNNING');
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

  updateState(null, 'COMPLETED');
  console.log(`\n🎉 TODAS AS QUESTÕES DO REVALIDA FINALIZADAS!`);
  console.log(`- Sucessos: ${successCount}`);
  console.log(`- Falhas: ${errorCount}`);
}

runPipeline().catch(err => {
  console.error('Erro fatal:', err);
  updateState(null, 'CRASHED');
});
