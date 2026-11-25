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

// 2. Conecta ao SQLite SSOT para espelhamento
const SQLITE_PATH = 'data/supabase_tables/supabase_tables.db';
const db = new DatabaseSync(SQLITE_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA busy_timeout = 10000;');
db.exec('PRAGMA synchronous = NORMAL;');

// 3. Cadeia de prioridade estrita (Acesso Direto):
// Pediatria -> Cirurgia Geral -> Ginecologia -> Obstetrícia -> Clínica Médica -> Medicina Preventiva e Social
const PRIORITY_CHAIN = ['Pediatria', 'Cirurgia Geral', 'Ginecologia', 'Obstetrícia', 'Clínica Médica', 'Medicina Preventiva e Social'];

const argSpec = process.argv.find(a => a.startsWith('--specialty='));
const INITIAL_SPECIALTY = argSpec ? argSpec.split('=')[1] : null;

let activeChain = [...PRIORITY_CHAIN];
if (INITIAL_SPECIALTY && PRIORITY_CHAIN.includes(INITIAL_SPECIALTY)) {
  activeChain = PRIORITY_CHAIN.slice(PRIORITY_CHAIN.indexOf(INITIAL_SPECIALTY));
}

const argWorkers = process.argv.find(a => a.startsWith('--workers='));
const CONCURRENCY = argWorkers ? parseInt(argWorkers.split('=')[1], 10) : 3;

const STATE_GLOBAL_PATH = 'data/pipeline_progress_state.json';
const SIGNAL_PATH = 'data/pipeline.signal';

function sanitizePostgres(str) {
  if (!str) return '';
  return String(str).replace(/\u0000/g, '').replace(/\\u0000/g, '').replace(/[\u0000-\u0008\u000B-\u000C\u000E-\u001F]/g, '');
}

let cachedPendingBySpec = null;

async function preloadAllPendingFromSupabase() {
  if (cachedPendingBySpec) return cachedPendingBySpec;
  console.log('🔍 Mapeando pendências reais diretamente em Supabase questions_direto (varredura PK estável)...');
  const map = new Map();
  const buckets = '0123456789abcdef'.split('');
  let bIdx = 0;

  async function worker() {
    while (bIdx < buckets.length) {
      const h = buckets[bIdx++];
      const lower = `${h}0000000-0000-0000-0000-000000000000`;
      const upper = `${h}fffffff-ffff-ffff-ffff-ffffffffffff`;
      let lastId = null;

      while (true) {
        let q = supabase
          .from('questions_direto')
          .select('id, especialidade, has_gabarito, commentary, images, correct_answer, is_anulada, year')
          .gte('id', lastId ? lastId : lower)
          .lte('id', upper)
          .order('id', { ascending: true })
          .limit(1000);
        if (lastId) q = q.gt('id', lastId);

        const { data, error } = await q;
        if (error) {
          console.warn(`⚠️ Retry bucket ${h}: ${error.message}`);
          await new Promise(r => setTimeout(r, 1500));
          continue;
        }
        if (!data || data.length === 0) break;
        lastId = data[data.length - 1].id;

        for (const r of data) {
          if (!r.has_gabarito) continue;
          const c = (r.commentary || '').trim();
          if (c.includes('Take-Home')) continue;
          const hasImg = Array.isArray(r.images) && r.images.length > 0;
          if (hasImg) continue;
          const ans = (r.correct_answer || '').toUpperCase().trim();
          const hasValidAns = ['A', 'B', 'C', 'D', 'E'].includes(ans) || Boolean(r.is_anulada);
          if (!hasValidAns) continue;

          const esp = r.especialidade || 'Outros';
          if (!map.has(esp)) map.set(esp, []);
          map.get(esp).push({ id: r.id, year: r.year || 0 });
        }
        if (data.length < 1000) break;
      }
    }
  }

  await Promise.all([worker(), worker(), worker()]);
  for (const [esp, list] of map.entries()) {
    list.sort((a, b) => b.year - a.year);
  }
  cachedPendingBySpec = map;
  return map;
}

async function fetchPendingDirectFromSupabase(specialtyName) {
  const map = await preloadAllPendingFromSupabase();
  const ids = (map.get(specialtyName) || []).map(x => x.id);
  if (ids.length === 0) return [];

  // Hidrata os campos completos em lotes de 150 IDs (instantâneo por PK)
  const fullRows = [];
  for (let i = 0; i < ids.length; i += 150) {
    const chunk = ids.slice(i, i + 150);
    const { data, error } = await supabase
      .from('questions_direto')
      .select('id, code, institution, banca, year, especialidade, tema, type, is_anulada, correct_answer, statement, options, commentary, images')
      .in('id', chunk);
    if (error) throw new Error(`Hydrate error (${specialtyName}): ${error.message}`);
    if (data) fullRows.push(...data);
  }
  fullRows.sort((a, b) => (b.year || 0) - (a.year || 0));
  return fullRows;
}

async function checkSignals(updateStateFn) {
  if (!fs.existsSync(SIGNAL_PATH)) return;
  const signal = fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase();
  if (signal === 'pause') {
    if (updateStateFn) updateStateFn(null, 'PAUSED');
    console.log(`⏸️ Pipeline pausado por sinal externo (data/pipeline.signal). Aguardando...`);
    while (fs.existsSync(SIGNAL_PATH) && fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase() === 'pause') {
      await new Promise(r => setTimeout(r, 2000));
    }
    console.log(`▶️ Retomando execução...`);
    if (updateStateFn) updateStateFn(null, 'RUNNING');
  } else if (signal === 'stop') {
    if (updateStateFn) updateStateFn(null, 'STOPPED');
    console.log(`🛑 Sinal de parada detectado. Finalizando com segurança.`);
    process.exit(0);
  }
}

async function runSpecialty(specialtyName, chainIndex, totalChain) {
  console.log(`\n================================================================================`);
  console.log(`🚀 CADEIA PRIORITÁRIA [${chainIndex + 1}/${totalChain}] — ${specialtyName.toUpperCase()} (FONTE DIRETA: SUPABASE questions_direto)`);
  console.log(`- Prioridade: ${activeChain.join(' ➔ ')}`);
  console.log(`- Concorrência: ${CONCURRENCY} workers paralelos | Pool: 9 chaves gratuitas Gemini (R$ 0,00)`);
  console.log(`================================================================================`);

  const pendingQuestions = await fetchPendingDirectFromSupabase(specialtyName);
  const totalToProcess = pendingQuestions.length;
  console.log(`- Questões elegíveis (texto puro sem Take-Home, incluindo placeholders e legados): ${totalToProcess}\n`);

  if (totalToProcess === 0) {
    console.log(`🎉 [${specialtyName}] 100% zerada no site! Avançando...`);
    return { success: 0, error: 0 };
  }

  let processedCount = 0;
  let successCount = 0;
  let errorCount = 0;
  let totalTokens = 0;
  const startTime = Date.now();
  const recentHistory = [];
  const nextSpecialty = chainIndex + 1 < totalChain ? activeChain[chainIndex + 1] : 'Concluído';

  function updateState(currentQ = null, overrideStatus = null) {
    const elapsedSec = Math.max(1, Math.round((Date.now() - startTime) / 1000));
    const qpm = processedCount > 0 ? parseFloat(((processedCount / elapsedSec) * 60).toFixed(1)) : 0;
    const remaining = totalToProcess - processedCount;
    const etaMinutes = qpm > 0 ? Math.round((remaining / qpm)) : 0;

    let status = overrideStatus || (processedCount >= totalToProcess ? 'COMPLETED' : 'RUNNING');
    if (fs.existsSync(SIGNAL_PATH)) {
      const sig = fs.readFileSync(SIGNAL_PATH, 'utf8').trim().toLowerCase();
      if (sig === 'pause') status = 'PAUSED';
      if (sig === 'stop') status = 'STOPPED';
    }

    const state = {
      status,
      specialty: specialtyName,
      nextSpecialty,
      priorityChain: PRIORITY_CHAIN,
      chainStep: `${chainIndex + 1}/${totalChain}`,
      modalidade: 'Acesso Direto (Supabase Live)',
      concurrency: CONCURRENCY,
      totalToProcess,
      processedCount,
      successCount,
      errorCount,
      progressPercent: totalToProcess > 0 ? parseFloat(((processedCount / totalToProcess) * 100).toFixed(2)) : 100,
      velocity: {
        questionsPerMinute: qpm,
        elapsedSeconds: elapsedSec,
        estimatedSecondsRemaining: etaMinutes * 60,
        etaFormatted: etaMinutes > 60 ? `${Math.floor(etaMinutes / 60)}h ${etaMinutes % 60}m` : `${etaMinutes}m`
      },
      tokens: {
        totalTokens,
        promptTokens: Math.round(totalTokens * 0.7),
        candidateTokens: Math.round(totalTokens * 0.3),
        pricing: { totalCostUSD: 0, totalCostBRL: 0, tier: 'Gratuito (9 Chaves Google Gemini)' }
      },
      currentQuestion: currentQ,
      recentHistory: recentHistory.slice(-15).reverse(),
      updatedAt: new Date().toISOString()
    };

    try { fs.writeFileSync(STATE_GLOBAL_PATH, JSON.stringify(state, null, 2), 'utf8'); } catch { }
  }

  async function processQuestion(q) {
    const startQ = Date.now();
    updateState({ code: q.code, id: q.id, especialidade: q.especialidade, tema: q.tema });

    const options = Array.isArray(q.options) ? q.options : [];
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

      // 1. Atualiza tabela real do site (questions_direto) verificando .select('id')
      const { data: updRows, error: supError } = await supabase
        .from('questions_direto')
        .update({ commentary: cleanCommentary, options: cleanedOptions })
        .eq('id', q.id)
        .select('id');

      if (supError || !updRows || updRows.length === 0) {
        throw new Error(supError?.message || '0 linhas atualizadas em questions_direto');
      }

      // Espelha em tabelas legadas caso existam
      supabase.from('questions').update({ commentary: cleanCommentary, options: cleanedOptions }).eq('id', q.id).then(() => { }).catch(() => { });

      // 2. Atualiza SQLite local SSOT (cobrindo os 3 formatos de ID possíveis)
      for (let retry = 0; retry < 5; retry++) {
        try {
          db.prepare(`
            UPDATE questions_curated_staging
            SET commentary = ?, options = ?
            WHERE id = ? OR id = ? OR id = ?
          `).run(cleanCommentary, JSON.stringify(cleanedOptions), q.id, `questions_${q.id}`, `questions_expansion_direto_${q.id}`);
          break;
        } catch {
          await new Promise(r => setTimeout(r, 200 * (retry + 1)));
        }
      }

      totalTokens += (res.usageMetadata?.totalTokenCount || 1600);
      processedCount++;
      successCount++;
      const duration = ((Date.now() - startQ) / 1000).toFixed(2);
      console.log(`[${processedCount}/${totalToProcess}] ${q.code || q.id} (${q.year || '?'} - ${q.tema || 'Geral'}) | ⚡ ${duration}s | ✅ Site OK`);

      recentHistory.push({
        code: q.code || q.id,
        tema: `${q.especialidade} - ${q.tema || 'Geral'}`,
        duration,
        tokens: 1600,
        status: 'OK',
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });

      updateState();
    } catch (err) {
      processedCount++;
      errorCount++;
      console.error(`❌ [${processedCount}/${totalToProcess}] Falha em ${q.code || q.id}: ${err.message}`);
      recentHistory.push({
        code: q.code || q.id,
        tema: `${q.especialidade} - ${q.tema || 'Geral'}`,
        duration: 0,
        tokens: 0,
        status: 'ERRO: ' + err.message.slice(0, 30),
        timestamp: new Date().toLocaleTimeString('pt-BR')
      });
      updateState();
    }
  }

  updateState(null, 'RUNNING');
  let currentIndex = 0;
  const runningPromises = new Set();

  while (currentIndex < pendingQuestions.length || runningPromises.size > 0) {
    await checkSignals(updateState);

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
  console.log(`\n🎉 ESPECIALIDADE ${specialtyName} FINALIZADA! Sucessos: ${successCount} | Falhas: ${errorCount}`);
  return { success: successCount, error: errorCount };
}

async function runPriorityPipeline() {
  console.log(`\n================================================================================`);
  console.log(`⚡ INICIANDO ESTEIRA PRIORITÁRIA ACESSO DIRETO (FONTE: SUPABASE LIVE)`);
  console.log(`🎯 Cadeia de Execução: ${activeChain.join(' ➔ ')}`);
  console.log(`================================================================================\n`);

  for (let i = 0; i < activeChain.length; i++) {
    await runSpecialty(activeChain[i], i, activeChain.length);
  }

  console.log(`\n🏆 TODAS AS ESPECIALIDADES DA CADEIA PRIORITÁRIA FORAM FINALIZADAS COM SUCESSO!`);
}

runPriorityPipeline().catch(err => {
  console.error('Erro fatal no pipeline:', err);
  process.exit(1);
});
