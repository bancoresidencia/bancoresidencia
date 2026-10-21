import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { execSync } from 'child_process';
import { createClient } from '@supabase/supabase-js';

// Carrega variáveis de ambiente de .env.local
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) process.env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Erro: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

// Argumentos da linha de comando
const args = process.argv.slice(2);
const workerArg = args.find(a => a.startsWith('--worker='));
const WORKER_NAME = workerArg ? workerArg.split('=')[1].trim().toUpperCase() : 'DEV_1';
const isSingle = args.includes('--single');
const specificTask = args.find(a => a.startsWith('--task='))?.split('=')[1]?.trim();

console.log('================================================================');
console.log(`  MOTOR DE BUSCA E HOMOLOGAÇÃO WEB DISTRIBUÍDO — FASE 2`);
console.log(`  Worker Ativo: [${WORKER_NAME}]`);
console.log(`  Modo: ${isSingle ? 'Execução Única (--single)' : 'Varredura Contínua Automática'}`);
console.log(`  Estratégia: Busca e Extração Ativa na Internet (Zero Arquivo Manual)`);
console.log('================================================================\n');

// Conjunto em memória para evitar qualquer repetição na mesma sessão
const processedInThisSession = new Set();

// Funções de Normalização Textual
function cleanText(t) {
  if (!t) return '';
  return t
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/^(leia o caso|com base no|com relacao ao|caso clinico|leia o texto|atencao)[\w\s\d\,\.\:\;\-]+?\:\s*/, '')
    .replace(/^(questao|q\.|q)\s*\d+[\s\:\.\-\)]*/, '')
    .replace(/^\d+[\s\:\.\-\)]+/, '')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Arquivos Canônicos Locais
const CANONICAL_FILES = [
  'data/cirurgia_final_questions.json',
  'data/clinica_medica_final_questions.json',
  'data/ginecologia_final_questions.json',
  'data/obstetricia_final_questions.json',
  'data/pediatria_final_questions.json',
  'data/medicina_preventiva_final_questions.json',
  'data/urologia_final_questions.json'
];

// Conexões com os Bancos de Coleta SQLite
let qmDb = null;
const qmPath = path.resolve('data/questmed_extracted_exams.db');
if (fs.existsSync(qmPath)) {
  try { qmDb = new DatabaseSync(qmPath); } catch (e) {}
}

let pdrDb = null;
const pdrPath = path.resolve('data/provaderesidencia_coleta.db');
if (fs.existsSync(pdrPath)) {
  try { pdrDb = new DatabaseSync(pdrPath); } catch (e) {}
}

function refreshPdrDb() {
  if (fs.existsSync(pdrPath)) {
    try { pdrDb = new DatabaseSync(pdrPath); } catch (e) {}
  }
}

// Heartbeat Daemon
let currentTaskId = null;
let tasksCompletedCount = 0;
let gabaritosAppliedCount = 0;

async function sendHeartbeat(status = 'PROCESSING') {
  const hbData = {
    worker: WORKER_NAME,
    last_heartbeat: new Date().toISOString(),
    status: status,
    current_task: currentTaskId,
    tasks_completed: tasksCompletedCount,
    gabaritos_applied: gabaritosAppliedCount
  };

  try {
    await supabase.storage
      .from('questoes')
      .upload(`fase2_worker_${WORKER_NAME}.json`, JSON.stringify(hbData, null, 2), {
        contentType: 'application/json',
        upsert: true
      });
  } catch (e) {}
}

// Atualização de questão diretamente na tabela 'questions' do Supabase via REST
async function updateQuestionInSupabase(questionId, correctAnswer, commentary) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions?id=eq.${questionId}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({
        correct_answer: correctAnswer,
        commentary: commentary,
        is_anulada: correctAnswer === 'ANULADA'
      })
    });
    return res.ok;
  } catch (e) {
    return false;
  }
}

// Busca da fila viva sempre fresca (Bypassing CDN cache)
async function fetchLiveQueue() {
  const url = `${SUPABASE_URL}/storage/v1/object/questoes/fase2_motor_queue.json?t=${Date.now()}`;
  const res = await fetch(url, {
    headers: {
      'apikey': SERVICE_KEY,
      'Authorization': `Bearer ${SERVICE_KEY}`
    }
  });
  if (!res.ok) {
    throw new Error(`Falha ao ler fila no Supabase (HTTP ${res.status})`);
  }
  return await res.json();
}

// Reivindicação Atômica com Distributed Lease Lock
async function claimNextTask() {
  const queue = await fetchLiveQueue();

  let targetTask = null;
  const now = Date.now();
  const LEASE_TIMEOUT_MS = 20 * 60 * 1000; // 20 minutos de timeout para tarefas abandonadas

  if (specificTask) {
    targetTask = queue.find(t => t.id === specificTask);
  } else {
    // 1. Procura tarefa PENDENTE que não foi processada nesta sessão
    targetTask = queue.find(t => {
      if (processedInThisSession.has(t.id)) return false;
      if (t.status === 'PENDENTE') return true;
      if (t.status === 'EM_ANDAMENTO') {
        const hbTime = t.heartbeat_at ? new Date(t.heartbeat_at).getTime() : 0;
        if (now - hbTime > LEASE_TIMEOUT_MS) return true; // Reivindicação de lease abandonado
      }
      return false;
    });
  }

  if (!targetTask) return { task: null, queue: queue };

  // Grava o Lock Atômico
  targetTask.status = 'EM_ANDAMENTO';
  targetTask.assigned_to = WORKER_NAME;
  targetTask.claimed_at = targetTask.claimed_at || new Date().toISOString();
  targetTask.heartbeat_at = new Date().toISOString();

  // Salva no Supabase Storage
  const { error: uploadErr } = await supabase.storage
    .from('questoes')
    .upload('fase2_motor_queue.json', JSON.stringify(queue, null, 2), {
      contentType: 'application/json',
      upsert: true
    });

  if (uploadErr) {
    throw new Error(`Erro ao salvar lock da tarefa: ${uploadErr.message}`);
  }

  // Verificação de concorrência com fresh fetch
  const verifyQueue = await fetchLiveQueue();
  const verified = verifyQueue.find(t => t.id === targetTask.id);
  if (verified && verified.assigned_to && verified.assigned_to !== WORKER_NAME) {
    console.log(`⚠️ Concorrência detectada na tarefa ${targetTask.id}! Cedendo lock para ${verified.assigned_to}...`);
    return { task: null, queue: verifyQueue };
  }

  return { task: targetTask, queue: queue };
}

// Atualização de Status da Tarefa Finalizada
async function finishTask(taskId, newStatus, resultado, observacoes = '') {
  // Marca na memória da sessão para jamais reprocessar
  processedInThisSession.add(taskId);

  const queue = await fetchLiveQueue();
  const t = queue.find(x => x.id === taskId);
  if (t) {
    t.status = newStatus;
    t.assigned_to = WORKER_NAME;
    t.completed_at = new Date().toISOString();
    t.heartbeat_at = new Date().toISOString();
    t.resultado = {
      gabaritos_aplicados: resultado.gabaritos_aplicados || 0,
      questoes_resolvidas: resultado.questoes_resolvidas || 0,
      observacoes: observacoes || resultado.observacoes || ''
    };
  }

  await supabase.storage
    .from('questoes')
    .upload('fase2_motor_queue.json', JSON.stringify(queue, null, 2), {
      contentType: 'application/json',
      upsert: true
    });
}

// Execução da Coleta Web Ativa via Python
function executeWebScrapePdr(pdrProvaId) {
  try {
    console.log(`  🌐 [Web Scraping] Iniciando download ativo da prova #${pdrProvaId} na internet...`);
    execSync(`python scripts/scrape_single_pdr_exam.py ${pdrProvaId}`, {
      stdio: 'inherit',
      timeout: 120000
    });
    refreshPdrDb();
    return true;
  } catch (e) {
    console.log(`  ⚠️ Coleta web PDR prova #${pdrProvaId}: ${e.message}`);
    return false;
  }
}

// Resolução de Prova Específica (Pesquisa Web + Bases + Homologação)
async function processTask(task) {
  console.log(`\n----------------------------------------------------------------`);
  console.log(`⚡ [${WORKER_NAME}] PROCESSANDO: ${task.id}`);
  console.log(`   Instituição: ${task.instituicao}`);
  console.log(`   Banca: ${task.banca} | Ano: ${task.ano} | Faltam no mapeamento: ${task.faltam_gabaritos} gabaritos`);
  if (task.pdr_prova_id) {
    console.log(`   PDR Prova ID: #${task.pdr_prova_id} (${task.pdr_titulo || 'Mapeada'})`);
  }
  console.log(`   Estratégia: ${task.classificacao_etapa}`);
  console.log(`----------------------------------------------------------------`);

  const targetAno = task.ano;
  const bancaNorm = task.banca.toUpperCase();
  let appliedCount = 0;

  // 1. Extração Web Ativa se houver ID mapeado no portal
  if (task.pdr_prova_id) {
    executeWebScrapePdr(task.pdr_prova_id);
  }

  // 2. Coleta de candidatos de gabaritos em PDR SQLite
  const candidates = [];
  if (pdrDb) {
    try {
      let rows = [];
      if (task.pdr_prova_id) {
        const stmt = pdrDb.prepare(`
          SELECT numero, enunciado, gabarito_oficial, is_anulada 
          FROM questoes 
          WHERE prova_id = ? AND (gabarito_oficial != '' OR is_anulada = 1)
        `);
        rows = stmt.all(task.pdr_prova_id);
      }
      
      if (rows.length === 0) {
        // Busca textual por ano e banca
        const stmt = pdrDb.prepare(`
          SELECT q.numero, q.enunciado, q.gabarito_oficial, q.is_anulada 
          FROM questoes q
          JOIN provas p ON p.id = q.prova_id
          WHERE p.ano = ? AND (q.gabarito_oficial != '' OR q.is_anulada = 1)
        `);
        rows = stmt.all(targetAno);
      }

      for (const r of rows) {
        const cl = cleanText(r.enunciado);
        if (cl.length >= 25) {
          candidates.push({
            gab: r.is_anulada ? 'ANULADA' : (r.gabarito_oficial || '').trim().toUpperCase(),
            clean: cl,
            origem: 'PDR Web'
          });
        }
      }
    } catch (e) {
      console.log(`  ⚠️ Erro na leitura PDR SQLite: ${e.message}`);
    }
  }

  // 3. Coleta de candidatos no QuestMed Staging
  if (qmDb) {
    try {
      const stmt = qmDb.prepare(`
        SELECT numero, enunciado, gabarito 
        FROM questmed_questions 
        WHERE ano = ? AND gabarito IS NOT NULL AND gabarito != ''
      `);
      const qmRows = stmt.all(targetAno);
      for (const r of qmRows) {
        const cl = cleanText(r.enunciado);
        if (cl.length >= 25) {
          candidates.push({
            gab: r.gabarito.trim().toUpperCase(),
            clean: cl,
            origem: 'QuestMed'
          });
        }
      }
    } catch (e) {
      console.log(`  ⚠️ Erro na leitura QuestMed SQLite: ${e.message}`);
    }
  }

  if (candidates.length > 0) {
    console.log(`  🔍 Total de ${candidates.length} questões com gabarito compiladas para cruzamento...`);

    // Cruzamento com arquivos canônicos locais
    for (const filePath of CANONICAL_FILES) {
      const fullPath = path.resolve(filePath);
      if (!fs.existsSync(fullPath)) continue;

      let fileModified = false;
      const questions = JSON.parse(fs.readFileSync(fullPath, 'utf8'));

      for (const q of questions) {
        if (parseInt(q.year) !== targetAno) continue;
        const qBanca = (q.banca || '').toUpperCase();
        const qInst = (q.institution || '').toUpperCase();
        
        const matchBanca = qBanca.includes(bancaNorm) || qInst.includes(bancaNorm) || bancaNorm.includes(qBanca);
        if (!matchBanca) continue;

        // Se já tem gabarito homologado e válido, pula
        const alreadyHomolog = q.commentary && q.commentary.includes('Gabarito Oficial Homologado');
        const hasValidAnswer = ['A', 'B', 'C', 'D', 'E', 'ANULADA'].includes((q.correct_answer || '').toUpperCase());
        if (alreadyHomolog && hasValidAnswer) continue;

        const qClean = cleanText(q.statement);
        if (qClean.length < 25) continue;

        for (const cand of candidates) {
          const prefixMatch = qClean.slice(0, 70) === cand.clean.slice(0, 70);
          const includesMatch = qClean.includes(cand.clean.slice(0, 60)) || cand.clean.includes(qClean.slice(0, 60));

          if (prefixMatch || includesMatch) {
            const validGab = ['A', 'B', 'C', 'D', 'E'].includes(cand.gab) ? cand.gab : 'ANULADA';
            q.correct_answer = validGab;
            if (validGab === 'ANULADA') q.is_anulada = true;

            const stamp = `\n\n[Gabarito Oficial Homologado - Fase 2 (${WORKER_NAME})] Banca: ${task.banca} (${task.ano})`;
            q.commentary = (q.commentary || '') + stamp;

            // Atualiza no Supabase
            await updateQuestionInSupabase(q.id, validGab, q.commentary);

            appliedCount++;
            fileModified = true;
            break;
          }
        }
      }

      if (fileModified) {
        fs.writeFileSync(fullPath, JSON.stringify(questions, null, 2), 'utf8');
      }
    }
  }

  // Avaliação do Resultado
  if (appliedCount > 0) {
    console.log(`  ✅ SUCESSO: ${appliedCount} gabaritos recuperados na web e sincronizados no Supabase!`);
    await finishTask(task.id, 'CONCLUIDO', {
      gabaritos_aplicados: appliedCount,
      questoes_resolvidas: appliedCount,
      observacoes: `Homologado via busca e extração web (${appliedCount} questões).`
    });
    gabaritosAppliedCount += appliedCount;
    tasksCompletedCount++;
  } else {
    console.log(`  ℹ️ Varredura web concluída para ${task.banca} (${task.ano}).`);
    console.log(`     Sem novos gabaritos pendentes de homologação encontrados online nesta rodada.`);
    await finishTask(task.id, 'BUSCA_WEB_CONCLUIDA', {
      gabaritos_aplicados: 0,
      questoes_resolvidas: 0,
      observacoes: `Varredura realizada na web e agregadores; sem novos gabaritos disponíveis nesta rodada.`
    });
  }
}

// Loop Principal do Worker
async function runWorker() {
  // Inicia daemon de heartbeat a cada 30 segundos
  setInterval(() => {
    sendHeartbeat('PROCESSING');
  }, 30000);

  await sendHeartbeat('IDLE');

  let keepRunning = true;

  while (keepRunning) {
    try {
      console.log(`[${new Date().toLocaleTimeString('pt-BR')}] Buscando próxima tarefa na fila do Supabase...`);
      const { task } = await claimNextTask();

      if (!task) {
        console.log('🏁 Não há mais tarefas pendentes na fila! Worker entrando em modo espera...');
        await sendHeartbeat('COMPLETED_OR_IDLE');
        if (isSingle) break;
        await new Promise(r => setTimeout(r, 30000));
        continue;
      }

      currentTaskId = task.id;
      await sendHeartbeat('PROCESSING');

      // Processa a tarefa com busca web
      await processTask(task);

      currentTaskId = null;
      await sendHeartbeat('IDLE');

      if (isSingle) {
        keepRunning = false;
        console.log('\nModo --single concluído.');
      } else {
        await new Promise(r => setTimeout(r, 2000));
      }
    } catch (err) {
      console.error(`❌ Erro no loop do worker: ${err.message}`);
      await new Promise(r => setTimeout(r, 5000));
      if (isSingle) break;
    }
  }

  console.log(`\n================================================================`);
  console.log(`  Worker [${WORKER_NAME}] finalizado.`);
  console.log(`  Tarefas Concluídas  : ${tasksCompletedCount}`);
  console.log(`  Gabaritos Aplicados : ${gabaritosAppliedCount}`);
  console.log(`================================================================\n`);
  process.exit(0);
}

runWorker();
