/**
 * Motor de Produção Contínua e Sincronização em Tempo Real — Clínica Médica
 * 
 * Executa a geração padrão-ouro de comentários pedagógicos usando EXCLUSIVAMENTE
 * a chave paga do Gemini 3.5 Flash-Lite com visão multimodal nativa, teto de 650 caracteres
 * no comentário final, destaques em negrito e envio DIRETO para o Supabase questão a questão.
 * 
 * Uso:
 *   node scripts/produce_clinica_medica_stream.mjs [--limit N] [--tema "Tema"] [--foco "Foco"] [--force]
 * 
 * Exemplos:
 *   node scripts/produce_clinica_medica_stream.mjs --limit 5
 *   node scripts/produce_clinica_medica_stream.mjs --tema "Cardiologia" --limit 10
 *   node scripts/produce_clinica_medica_stream.mjs
 */

import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { solveQuestionDeep, PAID_KEY, API_KEYS } from './solve_questions_engine.mjs';

// 1. Carrega variáveis de ambiente
const env = { ...process.env };
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ ERRO: Credenciais do Supabase não encontradas.');
  process.exit(1);
}

if (!PAID_KEY) {
  console.error('❌ ERRO: GEMINI_API_KEY_PAID não configurada para produção de alta performance.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// 2. Parse de argumentos CLI
const args = process.argv.slice(2);
let limit = null;
let targetTema = null;
let targetFoco = null;
let forceRecompute = false;

for (let i = 0; i < args.length; i++) {
  if (args[i] === '--limit' && args[i + 1]) {
    limit = parseInt(args[i + 1], 10);
    i++;
  } else if (args[i] === '--tema' && args[i + 1]) {
    targetTema = args[i + 1].trim().toLowerCase();
    i++;
  } else if (args[i] === '--foco' && args[i + 1]) {
    targetFoco = args[i + 1].trim().toLowerCase();
    i++;
  } else if (args[i] === '--force') {
    forceRecompute = true;
  }
}

console.log('================================================================================');
console.log('🚀 MOTOR DE PRODUÇÃO CONTÍNUA — CLÍNICA MÉDICA (STREAMING SUPABASE)');
console.log(`- Modelo: gemini-3.5-flash-lite (Exclusivo com Chave PAGA)`);
console.log(`- Pool de chaves: ${API_KEYS.length} (Chave PAGA ativa: ${!!PAID_KEY})`);
console.log(`- Filtros: Tema=${targetTema || 'TODOS'} | Foco=${targetFoco || 'TODOS'} | Limite=${limit || 'SEM LIMITE'}`);
console.log(`- Modo Force: ${forceRecompute ? 'Sim (recomputa existentes)' : 'Não (apenas sem comentário)'}`);
console.log('================================================================================\n');

// 3. Carrega base de dados de Clínica Médica
const DB_PATH = 'data/clinica_medica_final_questions.json';
if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ ERRO: Base de dados local '${DB_PATH}' não encontrada.`);
  process.exit(1);
}

const questions = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'));
console.log(`Total de questões em Clínica Médica: ${questions.length}`);

// Filtra candidatas homologadas
const candidates = [];
for (let idx = 0; idx < questions.length; idx++) {
  const q = questions[idx];
  const ans = (q.correct_answer || q.correctAnswer || '').toUpperCase().trim();
  const isAnulada = q.is_anulada || q.isAnulada || ans === 'ANULADA' || ans === 'NULA';
  const hasOptions = Array.isArray(q.options) && q.options.length >= 2;
  const isHomologated = ['A', 'B', 'C', 'D', 'E'].includes(ans) && !isAnulada && hasOptions;

  if (!isHomologated) continue;

  if (targetTema) {
    const qTema = (q.tema || '').toLowerCase();
    if (!qTema.includes(targetTema)) continue;
  }

  if (targetFoco) {
    const qFoco = (q.foco || '').toLowerCase();
    if (!qFoco.includes(targetFoco)) continue;
  }

  const hasCompleteComment = !!(q.commentary && q.commentary.trim().length > 200);
  if (hasCompleteComment && !forceRecompute) continue;

  candidates.push({ idx, q });
}

console.log(`Questões homologadas pendentes para processar: ${candidates.length}`);
const toProcess = limit ? candidates.slice(0, limit) : candidates;
console.log(`Fila de execução desta sessão: ${toProcess.length} questões\n`);

let isShuttingDown = false;
let processedCount = 0;
let successCount = 0;
let errorCount = 0;

function saveLocalState() {
  try {
    fs.writeFileSync(DB_PATH, JSON.stringify(questions, null, 2), 'utf8');
    console.log(`💾 Base local '${DB_PATH}' salva.`);
  } catch (err) {
    console.error('Erro ao salvar base local:', err.message);
  }
}

// Manipulador de interrupção graciosa (Ctrl+C)
process.on('SIGINT', () => {
  console.log('\n⚠️ Interrupção detectada! Salvando progresso antes de encerrar...');
  isShuttingDown = true;
  saveLocalState();
  process.exit(0);
});

async function runStream() {
  const sessionStart = Date.now();

  for (let i = 0; i < toProcess.length; i++) {
    if (isShuttingDown) break;

    const { idx, q } = toProcess[i];
    const itemNum = i + 1;
    const progressHeader = `[${itemNum}/${toProcess.length}]`;

    console.log(`--------------------------------------------------------------------------------`);
    console.log(`${progressHeader} ID: ${q.id} | Código: ${q.code || 'N/A'}`);
    console.log(`Tema: ${q.tema || 'Geral'} | Foco: ${q.foco || 'Geral'}`);
    console.log(`Banca: ${q.banca} (${q.year}) | Gabarito: ${q.correct_answer || q.correctAnswer}`);

    const t0 = Date.now();
    try {
      // 1. Gera resolução profunda com preceptor especializado e multimodalidade
      const solved = await solveQuestionDeep(q);
      const elapsed = ((Date.now() - t0) / 1000).toFixed(2);

      // 2. Imediatamente envia para o Supabase (Sincronização em tempo real)
      const supabasePayload = {
        commentary: solved.commentary,
        options: solved.options || []
      };

      const { error: supaErr } = await supabase
        .from('questions')
        .update(supabasePayload)
        .eq('id', q.id);

      if (supaErr) {
        console.error(`❌ [Supabase Sync Falhou]: ${supaErr.message}`);
      } else {
        console.log(`⚡ Concluído em ${elapsed}s -> 📤 Sincronizado no Supabase em tempo real!`);
        console.log(`   - Comentário Final (${solved.finalCommentary ? solved.finalCommentary.length : 0} chars): "${(solved.finalCommentary || '').slice(0, 90)}..."`);
        successCount++;
      }

      // 3. Atualiza na base de dados em memória
      questions[idx] = {
        ...q,
        ...solved,
        updatedAt: new Date().toISOString()
      };

      processedCount++;

      // Salva localmente a cada 5 questões ou na última
      if (processedCount % 5 === 0 || itemNum === toProcess.length) {
        saveLocalState();
      }

      // Pequena pausa amigável (200ms) entre chamadas
      await new Promise(r => setTimeout(r, 200));

    } catch (err) {
      errorCount++;
      console.error(`❌ Erro ao processar questão ${q.id}:`, err.message);
      // Salva progresso mesmo em caso de erro
      saveLocalState();
      await new Promise(r => setTimeout(r, 1000));
    }
  }

  const totalTime = ((Date.now() - sessionStart) / 1000).toFixed(1);
  console.log('\n================================================================================');
  console.log(`🏁 SESSÃO DE PRODUÇÃO CONCLUÍDA EM ${totalTime}s`);
  console.log(`- Processadas: ${processedCount}`);
  console.log(`- Sincronizadas no Supabase com Sucesso: ${successCount}`);
  console.log(`- Erros: ${errorCount}`);
  console.log('================================================================================');
}

runStream().catch(err => {
  console.error('Erro fatal no motor de produção:', err);
  saveLocalState();
  process.exit(1);
});

