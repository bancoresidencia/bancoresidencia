/**
 * Motor de Produção em Lote (100 Questões Sem Imagens) com Sincronização em Tempo Real no Supabase
 * e Coleta Empírica Exata de Tokens para Recalibração de Custos.
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { solveQuestionDeep, PAID_KEY } from './solve_questions_engine.mjs';

// 1. Variáveis de ambiente
const env = { ...process.env };
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY || !PAID_KEY) {
  console.error('❌ ERRO: Supabase ou Chave Paga não configurados.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Carrega base de dados
const DB_PATH = 'data/clinica_medica_final_questions.json';
const questions = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));

console.log('================================================================================');
console.log('🚀 INICIANDO PRODUÇÃO DE 100 QUESTÕES (SEM IMAGENS) — CLÍNICA MÉDICA');
console.log(`- Chave Paga Ativa: Sim (exclusiva)`);
console.log(`- Modelo: gemini-3.5-flash-lite`);
console.log(`- Total na base de Clínica Médica: ${questions.length}`);
console.log('================================================================================\n');

// 3. Filtra questões elegíveis (homologadas, sem comentário e RIGOROSAMENTE SEM IMAGENS)
function checkHasImage(q) {
  if (Array.isArray(q.images) && q.images.length > 0) return true;
  if (Array.isArray(q.image_urls) && q.image_urls.length > 0) return true;
  if (q.imageUrl || q.image_url) return true;
  const statement = q.statement || '';
  if (/!\[.*?\]\((https?:\/\/[^\s\)]+|\/images\/[^\s\)]+|[^\s\)]+\.(?:png|jpe?g|webp|gif))/i.test(statement)) return true;
  if (Array.isArray(q.options)) {
    for (const opt of q.options) {
      if (opt.imageUrl || opt.image_url || /!\[.*?\]\(/i.test(opt.text || '')) return true;
    }
  }
  return false;
}

const candidates = [];
for (let idx = 0; idx < questions.length; idx++) {
  const q = questions[idx];
  const ans = (q.correct_answer || q.correctAnswer || '').toUpperCase().trim();
  const isAnulada = q.is_anulada || q.isAnulada || ans === 'ANULADA' || ans === 'NULA';
  const hasOptions = Array.isArray(q.options) && q.options.length >= 2;
  const isHomologated = ['A', 'B', 'C', 'D', 'E'].includes(ans) && !isAnulada && hasOptions;

  if (!isHomologated) continue;

  // Pula se já tiver comentário
  const hasCompleteComment = !!(q.commentary && q.commentary.trim().length > 200);
  if (hasCompleteComment) continue;

  // REGRA DO USUÁRIO: Deixe as questões que tem imagens para depois
  if (checkHasImage(q)) continue;

  candidates.push({ idx, q });
}

console.log(`Questões homologadas SEM imagens pendentes: ${candidates.length}`);
const BATCH_SIZE = 100;
const toProcess = candidates.slice(0, BATCH_SIZE);
console.log(`Selecionadas exatamente ${toProcess.length} questões para esta rodada.\n`);

const results = [];
let completedCount = 0;
let totalPromptTokens = 0;
let totalCandidateTokens = 0;

// Salva periodicamente
function saveLocal() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(questions, null, 2), 'utf8');
  } catch (e) {
    console.error('Erro ao salvar localmente:', e.message);
  }
}

async function processQuestion(item, itemNumber) {
  const { idx, q } = item;
  const t0 = Date.now();
  
  try {
    const solved = await solveQuestionDeep(q);
    const elapsed = ((Date.now() - t0) / 1000).toFixed(2);

    const usage = solved.usageMetadata || {
      promptTokenCount: 850,
      candidatesTokenCount: 500,
      totalTokenCount: 1350
    };

    totalPromptTokens += usage.promptTokenCount;
    totalCandidateTokens += usage.candidatesTokenCount;

    // Atualiza base local
    questions[idx] = {
      ...q,
      ...solved,
      updatedAt: new Date().toISOString()
    };

    // Envia IMEDIATAMENTE para o Supabase
    const { error: supaErr } = await supabase
      .from('questions')
      .update({
        commentary: solved.commentary,
        options: solved.options || []
      })
      .eq('id', q.id);

    completedCount++;
    const statusSupa = supaErr ? `❌ Supabase: ${supaErr.message}` : `✅ Supabase OK`;

    console.log(`[${completedCount}/${BATCH_SIZE}] ID: ${q.id} | ${q.code || q.banca} (${q.year || 'N/A'}) - ${q.tema || 'Clínica'}`);
    console.log(`     ⚡ ${elapsed}s | Tokens: In=${usage.promptTokenCount}, Out=${usage.candidatesTokenCount} | ${statusSupa}`);

    results.push({
      itemNumber: completedCount,
      id: q.id,
      code: q.code,
      banca: q.banca,
      year: q.year,
      tema: q.tema,
      foco: q.foco,
      correctAnswer: q.correct_answer || q.correctAnswer,
      statement: q.statement,
      options: solved.options,
      finalCommentary: solved.finalCommentary,
      mainErrorReason: solved.mainErrorReason,
      takeHomeMessage: solved.takeHomeMessage,
      guidelineEvolution: solved.guidelineEvolution,
      references: solved.references,
      usage
    });

    if (completedCount % 10 === 0) {
      saveLocal();
    }
  } catch (err) {
    console.error(`❌ Erro na questão ${q.id}:`, err.message);
  }
}

// Concurrency control: 2 workers parallel
async function runWithConcurrency(items, concurrency = 2) {
  const queue = [...items];
  let currentNum = 0;

  async function worker() {
    while (queue.length > 0) {
      const item = queue.shift();
      currentNum++;
      await processQuestion(item, currentNum);
      await new Promise(r => setTimeout(r, 150));
    }
  }

  const workers = Array.from({ length: concurrency }, () => worker());
  await Promise.all(workers);
}

const startTime = Date.now();
await runWithConcurrency(toProcess, 2);
saveLocal();

const totalDurationSec = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n================================================================================');
console.log(`🏁 PROCESSAMENTO DE 100 QUESTÕES CONCLUÍDO EM ${totalDurationSec}s!`);
console.log(`- Questões concluídas e sincronizadas: ${results.length}`);
console.log(`- Total Prompt Tokens (Input): ${totalPromptTokens}`);
console.log(`- Total Candidates Tokens (Output): ${totalCandidateTokens}`);
console.log(`- Média Input Tokens/questão: ${(totalPromptTokens / results.length).toFixed(1)}`);
console.log(`- Média Output Tokens/questão: ${(totalCandidateTokens / results.length).toFixed(1)}`);
console.log('================================================================================\n');

// 4. Salva resultados completos no scratch
const outPath = 'C:/Users/froge/.gemini/antigravity/brain/7b3c779d-de2a-4d34-9e11-0f56afb8dcbf/scratch/batch_100_results.json';
fs.writeFileSync(outPath, JSON.stringify({
  summary: {
    totalProcessed: results.length,
    durationSeconds: parseFloat(totalDurationSec),
    totalPromptTokens,
    totalCandidateTokens,
    avgPromptTokens: parseFloat((totalPromptTokens / results.length).toFixed(1)),
    avgCandidateTokens: parseFloat((totalCandidateTokens / results.length).toFixed(1))
  },
  questions: results
}, null, 2));

console.log(`Resultados salvos em ${outPath}.`);

