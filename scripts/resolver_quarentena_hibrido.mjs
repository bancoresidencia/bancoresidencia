import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

/**
 * ========================================================================
 * RESOLVEDOR DE QUARENTENA HÍBRIDO QUAD-CORE (OPÇÃO B)
 * ========================================================================
 * 
 * Arquitetura de 4 Workers Simultâneos (100% Custo Zero):
 *   - Worker 1: Groq Cloud (openai/gpt-oss-120b) - ritmo 18s / trava TPD
 *   - Worker 2: Groq Cloud (qwen/qwen3.8-27b)    - ritmo 7.5s / 8.000 TPM
 *   - Worker 3: Groq Cloud (openai/gpt-oss-20b)  - ritmo 7.5s / 8.000 TPM
 *   - Worker 4: Local GPU VRAM (qwen2.5:3b via Ollama na NVIDIA GTX 1650)
 * 
 * Proteção do SSD:
 *   - In-RAM Transaction Buffer: comita a cada ~30 questões em transação atômica.
 *   - PRAGMA temp_store = MEMORY; synchronous = NORMAL; cache_size = -64000;
 * 
 * Regras Estritas de Negócio:
 *   1. Classifica EXCLUSIVAMENTE o Subfoco (novo_sub_subfoco = NULL).
 *   2. Análise completa dos 4 pilares: Enunciado, Alternativas, Comentários e Gabarito.
 *   3. Fidelidade 100% à árvore canônica oficial.
 *   4. Quality gates: Anti-duplicação, zero sufixos, tupla válida e histórico preservado.
 */

// 1. Variáveis de Ambiente
const env = {};
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY;
const OLLAMA_URL = 'http://127.0.0.1:11434/v1/chat/completions';
const DB_PATH = path.resolve('data/questoes_132k.db');
const TREE_PATH = path.resolve('data/catalogo_arvore_canonica_completa.json');

// 2. Argumentos CLI
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

const IS_EXECUTE = hasFlag('--execute');
const BATCH_SIZE = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 3;
const RUN_LIMIT = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const ESPECIALIDADE_FILTER = getArg('--especialidade', null);

if (!fs.existsSync(DB_PATH)) {
  console.error(`❌ SQLite não encontrado em: ${DB_PATH}`);
  process.exit(1);
}
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada em: ${TREE_PATH}`);
  process.exit(1);
}

// 3. Rate Limiter Seguro por Modelo
class SafeRateLimiter {
  constructor(minDelayMs = 7500) {
    this.minDelayMs = minDelayMs;
    this.lastTime = 0;
  }
  async waitTurn() {
    const now = Date.now();
    const diff = now - this.lastTime;
    if (diff < this.minDelayMs) {
      await new Promise(r => setTimeout(r, this.minDelayMs - diff));
    }
    this.lastTime = Date.now();
  }
}

// 4. Definição da Arquitetura dos 4 Workers
const WORKERS = [
  {
    id: 'groq-120b',
    name: 'Groq 120B (Nuvem)',
    shortName: 'Groq120B',
    type: 'groq',
    model: 'openai/gpt-oss-120b',
    limiter: new SafeRateLimiter(18000), // ~3.3 chamadas/min (conservador contra cota diária TPD)
    active: false,
    pausedReason: null,
    stats: { resolved: 0, failed: 0 }
  },
  {
    id: 'groq-27b',
    name: 'Groq 27B (Nuvem)',
    shortName: 'Groq27B',
    type: 'groq',
    model: 'qwen/qwen3.8-27b',
    limiter: new SafeRateLimiter(7500), // ~8 chamadas/min (8.000 TPM)
    active: false,
    pausedReason: null,
    stats: { resolved: 0, failed: 0 }
  },
  {
    id: 'groq-20b',
    name: 'Groq 20B (Nuvem)',
    shortName: 'Groq20B',
    type: 'groq',
    model: 'openai/gpt-oss-20b',
    limiter: new SafeRateLimiter(7500), // ~8 chamadas/min (8.000 TPM)
    active: false,
    pausedReason: null,
    stats: { resolved: 0, failed: 0 }
  },
  {
    id: 'ollama-gpu',
    name: 'Ollama 3B (GPU VRAM)',
    shortName: 'VRAM_3B',
    type: 'ollama',
    model: 'qwen2.5:3b',
    limiter: new SafeRateLimiter(300), // Local sem limite de TPM
    active: false,
    pausedReason: null,
    stats: { resolved: 0, failed: 0 }
  }
];

// 5. Pre-Flight Checks
console.log('🔍 Executando Pre-Flight Checks nos 4 Motores de IA...');

async function testWorker(w) {
  const isGroq = w.type === 'groq';
  const url = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : OLLAMA_URL;
  const headers = { 'Content-Type': 'application/json' };
  if (isGroq) {
    if (!GROQ_API_KEY) {
      console.warn(`  ⚠️  ${w.name}: GROQ_API_KEY ausente`);
      return false;
    }
    headers['Authorization'] = `Bearer ${GROQ_API_KEY}`;
  }

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: w.model,
        messages: [{ role: 'user', content: 'Ping' }],
        max_tokens: 15
      }),
      signal: AbortSignal.timeout(12000)
    });
    if (res.ok) {
      w.active = true;
      console.log(`  ✅ ${w.name}: ONLINE [${w.model}]`);
      return true;
    } else {
      console.warn(`  ⚠️  ${w.name}: Respondeu HTTP ${res.status}`);
      return false;
    }
  } catch (err) {
    console.warn(`  ⚠️  ${w.name}: Erro de conexão (${err.message})`);
    return false;
  }
}

await Promise.all(WORKERS.map(testWorker));

const activeWorkers = WORKERS.filter(w => w.active);
if (activeWorkers.length === 0) {
  console.error('❌ Nenhum worker de IA está online. Abortando.');
  process.exit(1);
}

console.log('\n========================================================================');
console.log('⚡ RESOLVEDOR DE QUARENTENA HÍBRIDO QUAD-CORE (OPÇÃO B)');
console.log(`🛡️  Modo: ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA NO SQLITE LOCAL' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🚀 Workers Ativos (${activeWorkers.length}): ${activeWorkers.map(w => w.name).join(' | ')}`);
console.log(`📦 Lotes: ${BATCH_SIZE} questões/requisição agrupadas por Foco Canônico`);
console.log(`🎯 Escopo: EXCLUSIVAMENTE SUBFOCO (novo_sub_subfoco = NULL)`);
console.log(`📚 Análise: 4 Pilares Clínicos (Enunciado + Alternativas + Comentários + Gabarito)`);
console.log(`💾 Proteção SSD: In-RAM Transaction Buffer (Commits atômicos a cada 30 questões)`);
console.log(`🔒 Custo Financeiro: R$ 0,00 (100% Free Tier)`);
console.log('========================================================================\n');

// 6. Carrega e Indexa Árvore Canônica Oficial
const rawTreeData = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));

function buildCanonicalFocoIndex(inputTree) {
  const compositeFocoMap = new Map();
  const focoFallbackMap = new Map();
  const canonicalTuples = new Set();

  let treeObject = inputTree;
  if (Array.isArray(inputTree.hierarquia_padrao)) {
    treeObject = {};
    for (const espNode of inputTree.hierarquia_padrao) {
      const espName = espNode.especialidade;
      treeObject[espName] = {};
      for (const t of espNode.temas || []) {
        treeObject[espName][t.tema] = {};
        for (const f of t.focos || []) {
          treeObject[espName][t.tema][f.foco] = f;
        }
      }
    }
  }

  for (const [esp, temas] of Object.entries(treeObject)) {
    if (esp === 'metadata' || typeof temas !== 'object' || temas === null) continue;
    const espLower = esp.toLowerCase().trim();

    for (const [tema, focos] of Object.entries(temas)) {
      for (const [foco, focoData] of Object.entries(focos)) {
        const focoLower = foco.toLowerCase().trim();
        let subfocosList = [];

        const processSubItem = (item) => {
          if (typeof item === 'string') {
            subfocosList.push(item);
          } else if (item && typeof item === 'object') {
            const subName = item.subfoco || item.nome;
            if (subName) subfocosList.push(subName);
          }
        };

        if (Array.isArray(focoData)) {
          for (const item of focoData) processSubItem(item);
        } else if (focoData && typeof focoData.subfocos === 'object') {
          if (Array.isArray(focoData.subfocos)) {
            for (const item of focoData.subfocos) processSubItem(item);
          } else {
            for (const subName of Object.keys(focoData.subfocos)) {
              subfocosList.push(subName);
            }
          }
        }

        subfocosList = subfocosList.filter(s => !s.includes(': Diagnóstico e Conduta'));

        const entry = { especialidade: esp, tema, foco, subfocosList };
        compositeFocoMap.set(`${espLower}|||${focoLower}`, entry);

        if (!focoFallbackMap.has(focoLower)) focoFallbackMap.set(focoLower, []);
        focoFallbackMap.get(focoLower).push(entry);

        for (const s of subfocosList) {
          canonicalTuples.add(`${esp}|||${tema}|||${foco}|||${s}`);
        }
      }
    }
  }

  return { compositeFocoMap, focoFallbackMap, canonicalTuples };
}

const canonicalIndex = buildCanonicalFocoIndex(rawTreeData);

function findCanonicalEntry(esp, focoName) {
  if (!focoName) return null;
  let espLower = (esp || '').toLowerCase().trim();
  if (espLower === 'cirurgia') espLower = 'cirurgia geral';
  if (espLower === 'medicina preventiva') espLower = 'medicina preventiva e social';
  const fLower = focoName.toLowerCase().trim();

  let entry = canonicalIndex.compositeFocoMap.get(`${espLower}|||${fLower}`);
  if (!entry) {
    const fallbacks = canonicalIndex.focoFallbackMap.get(fLower);
    if (fallbacks && fallbacks.length === 1) entry = fallbacks[0];
  }
  return entry;
}

// 7. Chamada de Inferência Médica Estruturada para Lote
async function inferBatch(items, canonicalFoco, worker) {
  const isGroq = worker.type === 'groq';
  const url = isGroq ? 'https://api.groq.com/openai/v1/chat/completions' : OLLAMA_URL;
  const headers = { 'Content-Type': 'application/json' };
  if (isGroq) headers['Authorization'] = `Bearer ${GROQ_API_KEY}`;

  const questionsPayload = items.map(q => {
    let optsText = '';
    try {
      const opts = typeof q.options === 'string' ? JSON.parse(q.options || '[]') : (q.options || []);
      optsText = opts.map(o => `${o.letter}) ${o.text}`).join(' | ');
    } catch (_) { }

    return {
      id: q.id,
      enunciado: (q.statement || '').slice(0, 900),
      alternativas: optsText.slice(0, 700),
      comentarios_banca: q.commentary ? q.commentary.slice(0, 600) : 'Sem comentário adicional.',
      gabarito_oficial: `Alternativa ${q.correct_answer || ''}`
    };
  });

  const systemPrompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalFoco.especialidade}
TEMA: ${canonicalFoco.tema}
FOCO: ${canonicalFoco.foco}

SUBFOCOS VÁLIDOS (Escolha estritamente UM da lista abaixo para cada questão):
${JSON.stringify(canonicalFoco.subfocosList, null, 2)}

REGRAS OBRIGATÓRIAS:
1. Para cada questão, analise o Enunciado, as Alternativas, os Comentários da banca e o Gabarito oficial.
2. Escolha OBRIGATORIAMENTE um dos nomes exatos da lista de Subfocos acima.
3. Responda ESTRITAMENTE em formato JSON como um objeto contendo a propriedade "decisoes":
{
  "decisoes": [
    {
      "id": "ID_EXATO",
      "subfoco_escolhido": "NOME_EXATO_DO_SUBFOCO",
      "justificativa_clinica": "Explicação médica concisa em 1 frase."
    }
  ]
}`;

  let attempts = 0;
  const maxAttempts = 3;

  while (attempts < maxAttempts) {
    attempts++;
    try {
      await worker.limiter.waitTurn();

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: worker.model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: JSON.stringify(questionsPayload) }
          ],
          response_format: { type: 'json_object' },
          temperature: 0.1,
          max_tokens: 800
        }),
        signal: AbortSignal.timeout(28000)
      });

      if (res.status === 429) {
        const errText = await res.text();

        // Verifica se é limite diário de tokens (TPD) no Groq
        if (errText.includes('tokens per day (TPD)')) {
          worker.active = false;
          worker.pausedReason = 'TPD_DAILY_LIMIT';
          console.log(`\n  🛑 [${worker.name}] Cota diária TPD atingida (200k). Worker pausado; os demais continuam!\n`);
          return { status: 'WORKER_PAUSED' };
        }

        let waitSec = 15;
        const match = errText.match(/retry in ([\d\.]+)s/i) || errText.match(/try again in ([\d\.]+)s/i);
        if (match) waitSec = Math.ceil(parseFloat(match[1])) + 2;
        await new Promise(r => setTimeout(r, waitSec * 1000));
        continue;
      }

      if (!res.ok) {
        continue;
      }

      const data = await res.json();
      const content = data?.choices?.[0]?.message?.content;
      if (!content) continue;

      const parsed = JSON.parse(content.trim());
      const decisions = Array.isArray(parsed) ? parsed : (parsed.decisoes || parsed.decisions || []);

      if (Array.isArray(decisions) && decisions.length > 0) {
        return {
          status: 'SUCCESS',
          decisions,
          worker: worker.shortName
        };
      }
    } catch (e) {
      // Timeout ou oscilação de rede
    }
  }

  return { status: 'FAILED' };
}

// 8. Conexão ao SQLite e Otimização para Alta Performance de Disco
const db = new DatabaseSync(DB_PATH);
db.exec('PRAGMA journal_mode = WAL;');
db.exec('PRAGMA synchronous = NORMAL;');
db.exec('PRAGMA temp_store = MEMORY;');
db.exec('PRAGMA cache_size = -64000;'); // 64 MB de cache em RAM
db.exec('PRAGMA busy_timeout = 30000;');

let quarantineQuery = `
  SELECT id, code, especialidade, tema, foco, subfoco,
         antigo_tema, antigo_foco, antigo_subfoco,
         novo_tema, novo_foco,
         statement, options, correct_answer, commentary, is_anulada, motivo_regra
  FROM questions
  WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'
`;
if (ESPECIALIDADE_FILTER) {
  quarantineQuery += ` AND especialidade = '${ESPECIALIDADE_FILTER.replace(/'/g, "''")}'`;
}
quarantineQuery += ` ORDER BY id ASC;`;

const allQuarantine = db.prepare(quarantineQuery).all();
console.log(`📋 Total de Questões na Quarentena: ${allQuarantine.length.toLocaleString('pt-BR')}`);

if (allQuarantine.length === 0) {
  console.log('🎉 Quarentena zerada! Todas as questões já estão homologadas.');
  db.close();
  process.exit(0);
}

// Agrupamento por Foco Canônico (com fallback de novo_foco -> foco original)
const focusGroups = new Map();
let unmappedCount = 0;

for (const q of allQuarantine) {
  let canonicalEntry = findCanonicalEntry(q.especialidade, q.novo_foco);
  if (!canonicalEntry || canonicalEntry.subfocosList.length === 0) {
    canonicalEntry = findCanonicalEntry(q.especialidade, q.foco);
  }

  if (!canonicalEntry || canonicalEntry.subfocosList.length === 0) {
    unmappedCount++;
    continue;
  }

  const groupKey = `${canonicalEntry.especialidade}|||${canonicalEntry.tema}|||${canonicalEntry.foco}`;
  if (!focusGroups.has(groupKey)) {
    focusGroups.set(groupKey, {
      canonicalFoco: canonicalEntry,
      items: []
    });
  }
  focusGroups.get(groupKey).items.push(q);
}

// Montagem dos Lotes
const batchQueue = [];
let targetLimit = RUN_LIMIT || allQuarantine.length;
let scheduled = 0;

for (const [key, group] of focusGroups.entries()) {
  if (scheduled >= targetLimit) break;
  const items = group.items;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    if (scheduled >= targetLimit) break;
    const chunk = items.slice(i, Math.min(items.length, i + BATCH_SIZE, i + (targetLimit - scheduled)));
    batchQueue.push({
      canonicalFoco: group.canonicalFoco,
      items: chunk,
      retries: 0
    });
    scheduled += chunk.length;
  }
}

console.log(`📦 Fila Montada: ${batchQueue.length.toLocaleString('pt-BR')} lotes para ${scheduled.toLocaleString('pt-BR')} questões agendadas`);
if (unmappedCount > 0) {
  console.log(`ℹ️  Questões sem foco canônico imediato (focos legados para etapa de foco): ${unmappedCount.toLocaleString('pt-BR')}`);
}
console.log('');

// Update Statement
const updateStmt = IS_EXECUTE ? db.prepare(`
  UPDATE questions
  SET novo_tema              = ?,
      novo_foco              = ?,
      novo_subfoco           = ?,
      novo_sub_subfoco       = NULL,
      status_recategorizacao = ?,
      motivo_regra           = ?
  WHERE id = ?;
`) : null;

// 9. Buffer em RAM para Gravação em Disco (Proteção Atômica do SSD)
const writeBuffer = [];
const BUFFER_FLUSH_SIZE = 30; // Grava em disco apenas a cada 30 questões resolvidas

function flushWriteBuffer(force = false) {
  if (writeBuffer.length === 0) return;
  if (!force && writeBuffer.length < BUFFER_FLUSH_SIZE) return;

  if (IS_EXECUTE && updateStmt) {
    db.exec('BEGIN IMMEDIATE TRANSACTION;');
    try {
      while (writeBuffer.length > 0) {
        const item = writeBuffer.shift();
        updateStmt.run(
          item.tema,
          item.foco,
          item.subfoco,
          item.status,
          item.motivo,
          item.id
        );
      }
      db.exec('COMMIT;');
    } catch (err) {
      db.exec('ROLLBACK;');
      console.error('\n❌ Erro ao persistir lote no SQLite:', err.message);
      throw err;
    }
  } else {
    writeBuffer.length = 0;
  }
}

// Handlers de saída graciosa para proteger integridade do banco
process.on('SIGINT', () => {
  console.log('\n🛑 Recebido SIGINT. Persistindo buffer em RAM e fechando SQLite...');
  flushWriteBuffer(true);
  try { db.close(); } catch (_) {}
  process.exit(0);
});
process.on('SIGTERM', () => {
  console.log('\n🛑 Recebido SIGTERM. Persistindo buffer em RAM e fechando SQLite...');
  flushWriteBuffer(true);
  try { db.close(); } catch (_) {}
  process.exit(0);
});

// 10. Orquestração Paralela Híbrida Quad-Core
let resolvedCount = 0;
let skippedCount = 0;
let activeWorkersCount = 0;
const startTime = Date.now();

const norm = str => (str || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

function saveDecisions(result, items, canonicalFoco, worker) {
  for (const q of items) {
    const decision = result.decisions.find(d => String(d.id).trim() === String(q.id).trim()) ||
      result.decisions[items.indexOf(q)];

    if (!decision || !decision.subfoco_escolhido) {
      skippedCount++;
      continue;
    }

    let chosenSubfoco = String(decision.subfoco_escolhido).trim();

    // Invariante: Zero Sufixos Artificiais
    if (chosenSubfoco.includes(': Diagnóstico e Conduta')) {
      chosenSubfoco = chosenSubfoco.replace(': Diagnóstico e Conduta', '').trim();
    }

    // Validação do Subfoco na Árvore Canônica (com tolerância a acentos)
    let matchedSubfoco = canonicalFoco.subfocosList.find(s => s === chosenSubfoco) ||
      canonicalFoco.subfocosList.find(s => s.toLowerCase().trim() === chosenSubfoco.toLowerCase()) ||
      canonicalFoco.subfocosList.find(s => norm(s) === norm(chosenSubfoco));

    if (!matchedSubfoco) {
      skippedCount++;
      continue;
    }

    // Invariante: Anti-Duplicação
    if (matchedSubfoco.toLowerCase().trim() === canonicalFoco.foco.toLowerCase().trim()) {
      skippedCount++;
      continue;
    }

    // Invariante: Tupla Fechada Canônica
    const tuple4 = `${canonicalFoco.especialidade}|||${canonicalFoco.tema}|||${canonicalFoco.foco}|||${matchedSubfoco}`;
    if (!canonicalIndex.canonicalTuples.has(tuple4)) {
      skippedCount++;
      continue;
    }

    const novoStatus = 'SUBFOCO_RESOLVIDO_LLM';
    const motivoFinal = `[Preceptor ${worker.name}] ${decision.justificativa_clinica || 'Classificado via Preceptor Híbrido'}`;

    writeBuffer.push({
      tema: canonicalFoco.tema,
      foco: canonicalFoco.foco,
      subfoco: matchedSubfoco,
      status: novoStatus,
      motivo: motivoFinal,
      id: q.id
    });

    resolvedCount++;
    worker.stats.resolved++;
    flushWriteBuffer(false);
  }

  const remaining = scheduled - resolvedCount;
  const elapsedMinutes = Math.max(0.01, (Date.now() - startTime) / 60000);
  const currentRPM = Math.round(resolvedCount / elapsedMinutes);

  const workerStatsSummary = WORKERS
    .filter(w => w.stats.resolved > 0 || w.active)
    .map(w => `${w.shortName}:${w.stats.resolved}`)
    .join(' | ');

  process.stdout.write(`\r   ⚡ [Quad-Core] Resolvidas: ${resolvedCount.toLocaleString('pt-BR')} | Restam: ${remaining.toLocaleString('pt-BR')} | Vazão: ~${currentRPM} q/min | ${workerStatsSummary}   `);
}

async function runWorkerLoop(worker) {
  while (worker.active) {
    if (batchQueue.length === 0) {
      if (activeWorkersCount === 0) break;
      await new Promise(r => setTimeout(r, 1000));
      if (batchQueue.length === 0) break;
    }

    const batch = batchQueue.shift();
    if (!batch) break;

    activeWorkersCount++;
    try {
      const result = await inferBatch(batch.items, batch.canonicalFoco, worker);

      if (result.status === 'SUCCESS' && Array.isArray(result.decisions)) {
        saveDecisions(result, batch.items, batch.canonicalFoco, worker);
      } else if (result.status === 'WORKER_PAUSED') {
        // Devolve o lote para que outro worker ativo assuma
        batchQueue.unshift(batch);
        break;
      } else {
        // Falha transitória: devolve para a fila com limite de retentativas
        worker.stats.failed++;
        batch.retries = (batch.retries || 0) + 1;
        if (batch.retries <= 3) {
          batchQueue.push(batch);
        } else {
          skippedCount += batch.items.length;
        }
      }
    } finally {
      activeWorkersCount--;
    }
  }
}

// Dispara os Workers Ativos em Paralelo
console.log(`🚀 Iniciando ${activeWorkers.length} Workers Paralelos em Produção...\n`);
await Promise.all(activeWorkers.map(runWorkerLoop));

// Força o Flush de quaisquer itens restantes no buffer de RAM
flushWriteBuffer(true);

const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
const finalRPM = Math.round(resolvedCount / (Math.max(1, elapsedSec) / 60));

console.log('\n\n========================================================================');
console.log('📊 RELATÓRIO FINAL DE RESOLUÇÃO HÍBRIDA QUAD-CORE:');
console.log('========================================================================');
console.log(`  • Questões Agendadas:           ${scheduled.toLocaleString('pt-BR')}`);
console.log(`  • Resolvidas com Sucesso:       ${resolvedCount.toLocaleString('pt-BR')} (${((resolvedCount / Math.max(1, scheduled)) * 100).toFixed(1)}%)`);
for (const w of WORKERS) {
  console.log(`    - ${w.name.padEnd(26)}: ${w.stats.resolved.toLocaleString('pt-BR')} resolvidas ${w.pausedReason ? `(Pausado: ${w.pausedReason})` : ''}`);
}
console.log(`  • Falhas / Pulos no Lote:       ${skippedCount.toLocaleString('pt-BR')}`);
if (unmappedCount > 0) {
  console.log(`  • Focos Não Mapeáveis na Base:  ${unmappedCount.toLocaleString('pt-BR')}`);
}
console.log(`  • Tempo Total de Execução:      ${elapsedSec}s (~${(elapsedSec / 60).toFixed(1)} min)`);
console.log(`  • Vazão Média Real:             ~${finalRPM} questões por minuto`);
console.log('========================================================================\n');

// 11. Quality Gates de Validação Pós-Execução
if (IS_EXECUTE && resolvedCount > 0) {
  console.log('🔍 Executando Quality Gates sobre as questões resolvidas...');

  const espCheckSql = ESPECIALIDADE_FILTER ? `AND especialidade = '${ESPECIALIDADE_FILTER.replace(/'/g, "''")}'` : '';

  const dupCheck = db.prepare(`
    SELECT COUNT(*) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND LOWER(TRIM(novo_subfoco)) = LOWER(TRIM(novo_foco))
      ${espCheckSql}
  `).get().c;
  console.log(`  ${dupCheck === 0 ? '✅' : '❌'} Anti-Duplicação (novo_subfoco != novo_foco): ${dupCheck} inconsistências`);

  const sufixCheck = db.prepare(`
    SELECT COUNT(*) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND novo_subfoco LIKE '%: Diagnóstico e Conduta%'
      ${espCheckSql}
  `).get().c;
  console.log(`  ${sufixCheck === 0 ? '✅' : '❌'} Zero Sufixos Artificiais: ${sufixCheck} inconsistências`);

  const histCheck = db.prepare(`
    SELECT COUNT(*) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND (antigo_tema IS NULL OR antigo_foco IS NULL OR antigo_subfoco IS NULL)
      ${espCheckSql}
  `).get().c;
  console.log(`  ${histCheck === 0 ? '✅' : '❌'} Rastreabilidade Histórica (antigo_* 100% preservado): ${histCheck} inconsistências`);

  const subSubNullCheck = db.prepare(`
    SELECT COUNT(id) as c FROM questions 
    WHERE status_recategorizacao = 'SUBFOCO_RESOLVIDO_LLM' 
      AND motivo_regra LIKE '%Preceptor Híbrido%'
      AND novo_sub_subfoco IS NOT NULL
      ${espCheckSql}
  `).get().c;
  console.log(`  ${subSubNullCheck === 0 ? '✅' : '❌'} Nível 5 Neutro (novo_sub_subfoco = NULL): ${subSubNullCheck} preenchidos incorretamente\n`);
}

// Verifica status atualizado da quarentena
const remQuar = db.prepare("SELECT COUNT(*) as c FROM questions WHERE status_recategorizacao = 'QUARENTENA_ANALISE_HUMANA'").get().c;
console.log(`📊 Questões Restantes na Quarentena: ${remQuar.toLocaleString('pt-BR')}`);

db.close();
console.log('🔒 Banco de dados SQLite preservado e fechado com segurança.');
