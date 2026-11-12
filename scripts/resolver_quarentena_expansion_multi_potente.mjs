import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * RESOLVEDOR DE QUARENTENA MULTI-CLOUD DE ALTA POTÊNCIA (BATCH 10)
 * ============================================================================
 * 
 * Orquestração Multi-Cloud com os Modelos Mais Potentes:
 *   - Groq Cloud: openai/gpt-oss-120b (120 Bilhões de parâmetros)
 *   - Google Gemini: gemini-3-flash-preview (Chave 1)
 *   - Google Gemini: gemini-3-flash-preview (Chave 2)
 *   - Groq Cloud: qwen/qwen3.8-27b (27 Bilhões de parâmetros)
 *   - OpenRouter: nvidia/nemotron-3-ultra-550b-a55b:free (550B MoE - auto-pausa sob cota diária)
 * 
 * Lotes de 10 questões por requisição (--batch 10).
 * Fila compartilhada dinâmica em memória.
 * Persistência atômica no Supabase, log em tempo real e checkpoint auditado.
 */

// 1. Variáveis de Ambiente
const env = {};
const envPath = path.resolve('.env.local');
if (fs.existsSync(envPath)) {
  fs.readFileSync(envPath, 'utf8').split('\n').forEach(line => {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL     = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY      = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;
const GROQ_KEY         = env.GROQ_API_KEY;
const GEMINI_KEY_1     = env.GEMINI_API_KEY;
const GEMINI_KEY_2     = env.GEMINI_API_KEY_1;
const OPENROUTER_KEY   = env.OPENROUTER_API_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase ausentes em .env.local');
  process.exit(1);
}

// 2. Argumentos de Linha de Comando
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

const IS_EXECUTE      = hasFlag('--execute');
const BATCH_SIZE      = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 10;
const RUN_LIMIT       = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const TREE_PATH       = path.resolve('data/catalogo_arvore_canonica_completa.json');
const QUARANTINE_FILE = path.resolve('data/quarentena_questions_expansion_direto.jsonl');
const PROGRESS_FILE   = path.resolve('data/resolucao_quarentena_expansion_progresso.jsonl');
const LIVE_LOG_FILE   = path.resolve('data/quarentena_workers_live.log');

function logLive(msg) {
  console.log(msg);
  try {
    fs.appendFileSync(LIVE_LOG_FILE, msg + '\n', 'utf8');
  } catch {}
}

// 3. Rate Limiter Seguro por Worker
class SafeRateLimiter {
  constructor(minDelayMs = 5000) {
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

// 4. Configuração dos Workers de Alta Potência
const WORKERS = [];

if (OPENROUTER_KEY) {
  WORKERS.push({
    id: 'or-nemotron-lightning',
    name: 'OpenRouter (Nemotron 3.5 Lightning)',
    shortName: 'OR-Lightning',
    provider: 'openrouter',
    apiKey: OPENROUTER_KEY,
    model: 'nvidia/nemotron-3.5-lightning:free',
    limiter: new SafeRateLimiter(4500),
    active: true,
    stats: { batches: 0, resolved: 0 }
  });
}

if (GROQ_KEY) {
  WORKERS.push({
    id: 'groq-gpt-120b',
    name: 'Groq Cloud (GPT 120B Flagship)',
    shortName: 'Groq-120B',
    provider: 'groq',
    apiKey: GROQ_KEY,
    model: 'openai/gpt-oss-120b',
    limiter: new SafeRateLimiter(5000),
    active: true,
    stats: { batches: 0, resolved: 0 }
  });

  WORKERS.push({
    id: 'groq-qwen-27b',
    name: 'Groq Cloud (Qwen 27B Fast)',
    shortName: 'Groq-27B',
    provider: 'groq',
    apiKey: GROQ_KEY,
    model: 'qwen/qwen3.8-27b',
    limiter: new SafeRateLimiter(5000),
    active: true,
    stats: { batches: 0, resolved: 0 }
  });
}

if (GEMINI_KEY_1) {
  WORKERS.push({
    id: 'gemini-key1',
    name: 'Google Gemini 3.1 Flash (Chave 1)',
    shortName: 'Gemini-K1',
    provider: 'gemini',
    apiKey: GEMINI_KEY_1,
    model: 'gemini-3.1-flash-lite',
    limiter: new SafeRateLimiter(4500),
    active: true,
    stats: { batches: 0, resolved: 0 }
  });
}

if (GEMINI_KEY_2) {
  WORKERS.push({
    id: 'gemini-key2',
    name: 'Google Gemini 3.1 Flash (Chave 2)',
    shortName: 'Gemini-K2',
    provider: 'gemini',
    apiKey: GEMINI_KEY_2,
    model: 'gemini-3.1-flash-lite',
    limiter: new SafeRateLimiter(4500),
    active: true,
    stats: { batches: 0, resolved: 0 }
  });
}

logLive('\n========================================================================');
logLive('⚡ RESOLVEDOR DE QUARENTENA MULTI-CLOUD DE ALTA POTÊNCIA (BATCH 10)');
logLive('========================================================================');
logLive(`🛡️  Modo:              ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA (Grava no Supabase + Checkpoint)' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
logLive(`🚀 Workers Ativos:    ${WORKERS.length} workers multi-cloud de alta potência:`);
for (const w of WORKERS) {
  logLive(`   • [${w.shortName}] ${w.name} | Provedor: ${w.provider.toUpperCase()} | Modelo: ${w.model}`);
}
logLive(`📦 Lotes:             ${BATCH_SIZE} questões por requisição`);
logLive('========================================================================\n');

// 5. Carregar Árvore Canônica
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada: ${TREE_PATH}`);
  process.exit(1);
}

const rawTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));
const canonicalFocoMap = new Map();

for (const espNode of (rawTree.hierarquia_padrao || [])) {
  const espName = espNode.especialidade;
  for (const t of (espNode.temas || [])) {
    for (const f of (t.focos || [])) {
      const focoName = f.foco;
      const subfocosList = [];

      for (const s of (f.subfocos || [])) {
        const sName = typeof s === 'string' ? s : s.subfoco;
        if (sName) subfocosList.push(sName);
      }

      const entry = {
        especialidade: espName,
        tema: t.tema,
        foco: focoName,
        subfocosList
      };

      canonicalFocoMap.set(`${espName.toLowerCase().trim()}|||${focoName.toLowerCase().trim()}`, entry);
      canonicalFocoMap.set(focoName.toLowerCase().trim(), entry);
    }
  }
}

// 6. Carregar Checkpoint de Progresso Anterior
const resolvedIds = new Set();
if (fs.existsSync(PROGRESS_FILE)) {
  const progLines = fs.readFileSync(PROGRESS_FILE, 'utf8').trim().split('\n');
  for (const l of progLines) {
    if (!l.trim()) continue;
    try {
      const p = JSON.parse(l);
      if (p.id) resolvedIds.add(p.id);
    } catch {}
  }
  logLive(`📋 Checkpoint existente: ${resolvedIds.size.toLocaleString('pt-BR')} questões já resolvidas anteriormente.`);
}

// 7. Sincronização Dinâmica com Supabase: Busca IDs com subfoco = 'Geral'
logLive('🔄 Sincronizando questões pendentes (subfoco = Geral) com o Supabase...');
const existingGeralIds = new Set();
let fetchOffset = 0;
const pageLimit = 1000;

while (true) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions_expansion_direto?subfoco=eq.Geral&select=id&offset=${fetchOffset}&limit=${pageLimit}`, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      signal: AbortSignal.timeout(20000)
    });
    if (!res.ok) {
      console.warn(`⚠️ Erro ao buscar IDs do Supabase: HTTP ${res.status}`);
      break;
    }
    const rows = await res.json();
    if (!rows || rows.length === 0) break;
    for (const r of rows) existingGeralIds.add(r.id);
    if (rows.length < pageLimit) break;
    fetchOffset += pageLimit;
  } catch (err) {
    console.error(`❌ Falha na sincronização com Supabase: ${err.message}`);
    break;
  }
}
logLive(`✅ Supabase possui ${existingGeralIds.size.toLocaleString('pt-BR')} questões pendentes com subfoco = 'Geral'.`);

// 8. Carregar Questões da Quarentena
if (!fs.existsSync(QUARANTINE_FILE)) {
  console.error(`❌ Arquivo de quarentena não encontrado em: ${QUARANTINE_FILE}`);
  process.exit(1);
}

const rawQuarantineLines = fs.readFileSync(QUARANTINE_FILE, 'utf8').trim().split('\n');
const pendingQuarantineItems = [];

for (const l of rawQuarantineLines) {
  if (!l.trim()) continue;
  try {
    const item = JSON.parse(l);
    if (existingGeralIds.has(item.id) && !resolvedIds.has(item.id)) {
      pendingQuarantineItems.push(item);
    }
  } catch {}
}

logLive(`📦 Quarentena Elegível: ${pendingQuarantineItems.length.toLocaleString('pt-BR')} questões prontas para resolução.`);

if (pendingQuarantineItems.length === 0) {
  logLive('🎉 Todas as questões elegíveis da quarentena já foram resolvidas!');
  process.exit(0);
}

// 9. Agrupamento por Foco Canônico
const focoGroups = new Map();

for (const qItem of pendingQuarantineItems) {
  const espTarget = qItem.especialidade_resolvida || qItem.especialidade_original;
  const focoTarget = qItem.foco_sugerido;

  const canonicalEntry = canonicalFocoMap.get(`${(espTarget || '').toLowerCase().trim()}|||${(focoTarget || '').toLowerCase().trim()}`) ||
                         canonicalFocoMap.get((focoTarget || '').toLowerCase().trim());

  if (!canonicalEntry || !canonicalEntry.subfocosList || canonicalEntry.subfocosList.length === 0) {
    continue;
  }

  const gKey = `${canonicalEntry.especialidade}|||${canonicalEntry.foco}`;
  if (!focoGroups.has(gKey)) {
    focoGroups.set(gKey, { canonicalEntry, items: [] });
  }
  focoGroups.get(gKey).items.push(qItem);
}

// 10. Montagem dos Lotes de Trabalho
const allBatches = [];
let totalQueued = 0;
const effectiveLimit = RUN_LIMIT ? Math.min(RUN_LIMIT, pendingQuarantineItems.length) : pendingQuarantineItems.length;

for (const [key, group] of focoGroups.entries()) {
  if (totalQueued >= effectiveLimit) break;
  const items = group.items;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    if (totalQueued >= effectiveLimit) break;
    const chunk = items.slice(i, Math.min(items.length, i + BATCH_SIZE, i + (effectiveLimit - totalQueued)));
    allBatches.push({
      canonicalEntry: group.canonicalEntry,
      items: chunk
    });
    totalQueued += chunk.length;
  }
}

logLive(`📦 Fila Paralela: ${allBatches.length.toLocaleString('pt-BR')} lotes agendados (${totalQueued.toLocaleString('pt-BR')} questões em lotes de ${BATCH_SIZE}).\n`);

// 11. Busca de Dados das Questões
async function fetchFullQuestionsFromSupabase(ids) {
  try {
    const url = `${SUPABASE_URL}/rest/v1/questions_expansion_direto?id=in.(${ids.join(',')})&select=id,code,statement,options,correct_answer,commentary`;
    const res = await fetch(url, {
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`
      },
      signal: AbortSignal.timeout(15000)
    });
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

// 12. Execução de Inferência LLM Multi-Provedor
async function callBatchLLM(questionsPayload, canonicalEntry, worker) {
  const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalEntry.especialidade}
TEMA: ${canonicalEntry.tema}
FOCO: ${canonicalEntry.foco}

SUBFOCOS VÁLIDOS (Escolha estritAMENTE UM por questão a partir desta lista oficial):
${JSON.stringify(canonicalEntry.subfocosList, null, 2)}

REGRAS:
1. Para cada questão, escolha OBRIGATORIAMENTE um dos nomes exatos da lista de Subfocos acima.
2. Analise Enunciado, Alternativas, Gabarito e Comentário.
3. Seja conciso na justificativa médica (1 frase).

LOTE DE QUESTÕES:
${JSON.stringify(questionsPayload, null, 2)}

RESPONDA ESTRITAMENTE EM FORMATO JSON COMO UM ARRAY DE OBJETOS:
[
  {
    "id": "ID_EXATO_DA_QUESTAO",
    "subfoco_escolhido": "NOME_EXATO_DO_SUBFOCO",
    "justificativa_clinica": "Explicação médica concisa."
  }
]`;

  if (worker.provider === 'gemini') {
    // Chamada à API nativa do Google Gemini
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${worker.model}:generateContent?key=${worker.apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: {
          temperature: 0.1,
          responseMimeType: 'application/json'
        }
      }),
      signal: AbortSignal.timeout(45000)
    });
    return res;
  }

  // OpenAI-compatible (Groq Cloud ou OpenRouter)
  const isOR = worker.provider === 'openrouter';
  const url = isOR ? 'https://openrouter.ai/api/v1/chat/completions' : 'https://api.groq.com/openai/v1/chat/completions';

  const headers = {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${worker.apiKey}`
  };
  if (isOR) {
    headers['HTTP-Referer'] = 'https://bancoresidencia.com.br';
    headers['X-Title'] = 'Banco Residencia';
  }

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: worker.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 3500
    }),
    signal: AbortSignal.timeout(45000)
  });

  return res;
}

// 13. Persistência Atômica no Supabase
async function applyUpdateToSupabase(id, tema, foco, subfoco) {
  if (!IS_EXECUTE) return true;
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/questions_expansion_direto?id=eq.${id}`, {
      method: 'PATCH',
      headers: {
        'apikey': SERVICE_KEY,
        'Authorization': `Bearer ${SERVICE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify({ tema, foco, subfoco })
    });
    return res.ok;
  } catch {
    return false;
  }
}

// 14. Orquestrador de Execução Paralela
let queueIndex = 0;
let totalResolved = 0;
const startTime = Date.now();

function getNextBatch() {
  if (queueIndex >= allBatches.length) return null;
  return allBatches[queueIndex++];
}

async function startWorker(worker) {
  logLive(`  🚀 [${worker.shortName}] inicializado e operando!`);

  while (worker.active) {
    const batch = getNextBatch();
    if (!batch) break;

    const batchIds = batch.items.map(it => it.id);
    const fullRows = await fetchFullQuestionsFromSupabase(batchIds);
    if (!fullRows || fullRows.length === 0) continue;

    const questionsPayload = fullRows.map(q => {
      let optsText = '';
      try {
        const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]');
        optsText = opts.map(o => `${o.letter || o.index}) ${o.text}`).join(' | ');
      } catch {}

      return {
        id: q.id,
        enunciado: (q.statement || '').slice(0, 700),
        alternativas: optsText.slice(0, 500),
        gabarito_oficial: `Alternativa ${q.correct_answer || ''}`,
        comentario: (q.commentary || '').slice(0, 300)
      };
    });

    await worker.limiter.waitTurn();

    let res;
    try {
      res = await callBatchLLM(questionsPayload, batch.canonicalEntry, worker);
    } catch (e) {
      logLive(`    ⚠️  [${worker.shortName}] Timeout/Rede (${e.message}). Retentando lote...`);
      allBatches.push(batch);
      await new Promise(r => setTimeout(r, 4000));
      continue;
    }

    // Tratamento de Rate Limit (HTTP 429) e Sobrecarga (HTTP 503)
    if (res.status === 429) {
      const errText = await res.text().catch(() => '');

      if (worker.provider === 'openrouter') {
        if (errText.includes('free-models-per-day') || errText.includes('openrouter_free_tier_daily')) {
          worker.active = false;
          logLive(`    🛑 [${worker.shortName}] Cota diária do OpenRouter atingida. Worker pausado com segurança!`);
          allBatches.push(batch);
          break;
        }
        logLive(`    ⏳ [${worker.shortName}] OpenRouter rate-limit. Aguardando 15s...`);
        allBatches.push(batch);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      } else if (worker.provider === 'groq') {
        if (errText.includes('tokens per day (TPD)')) {
          worker.active = false;
          logLive(`\n  🛑 [${worker.name}] Cota diária TPD atingida na Groq. Worker pausado!\n`);
          allBatches.push(batch);
          break;
        }
        let waitSec = 20;
        const match = errText.match(/retry in ([\d\.]+)s/i) || errText.match(/try again in ([\d\.]+)s/i);
        if (match) waitSec = Math.ceil(parseFloat(match[1])) + 2;
        logLive(`    ⏳ [${worker.shortName}] Groq TPM limit. Aguardando ${waitSec}s...`);
        allBatches.push(batch);
        await new Promise(r => setTimeout(r, waitSec * 1000));
        continue;
      } else if (worker.provider === 'gemini') {
        if (errText.includes('requests per day') || errText.includes('RESOURCE_EXHAUSTED') || errText.includes('quota exceeded')) {
          worker.active = false;
          logLive(`\n  🛑 [${worker.name}] Cota diária atingida no Google Gemini. Worker pausado!\n`);
          allBatches.push(batch);
          break;
        }
        logLive(`    ⏳ [${worker.shortName}] Gemini rate-limit (429). Aguardando 15s...`);
        allBatches.push(batch);
        await new Promise(r => setTimeout(r, 15000));
        continue;
      }
    }

    if (res.status === 503) {
      logLive(`    ⏳ [${worker.shortName}] Serviço temporariamente ocupado (503). Backoff 8s...`);
      allBatches.push(batch);
      await new Promise(r => setTimeout(r, 8000));
      continue;
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      logLive(`    ⚠️  [${worker.shortName}] HTTP ${res.status}: ${errBody.slice(0, 100)}. Retornando lote à fila.`);
      allBatches.push(batch);
      await new Promise(r => setTimeout(r, 4000));
      continue;
    }

    // Parsing das Decisões
    let rawText = '';
    try {
      const jsonRes = await res.json();
      if (worker.provider === 'gemini') {
        rawText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
      } else {
        rawText = jsonRes?.choices?.[0]?.message?.content || '';
      }
    } catch {
      allBatches.push(batch);
      continue;
    }

    if (!rawText) {
      allBatches.push(batch);
      continue;
    }

    let parsed;
    try {
      const clean = rawText.replace(/```json\s*|\s*```/g, '').trim();
      parsed = JSON.parse(clean);
    } catch {
      allBatches.push(batch);
      continue;
    }

    const decisions = Array.isArray(parsed) ? parsed : (parsed.decisoes || parsed.decisions || []);
    if (!Array.isArray(decisions) || decisions.length === 0) {
      allBatches.push(batch);
      continue;
    }

    let batchSuccessCount = 0;
    for (let decIdx = 0; decIdx < decisions.length; decIdx++) {
      const dec = decisions[decIdx];
      const matchingItem = batch.items.find(it => String(it.id).trim() === String(dec.id).trim()) ||
                           batch.items.find(it => it.code && dec.id && it.code.trim().toLowerCase() === String(dec.id).trim().toLowerCase()) ||
                           batch.items[decIdx];

      if (!matchingItem || !dec.subfoco_escolhido) continue;

      let chosenSubfoco = String(dec.subfoco_escolhido).replace(/^["']|["']$/g, '').trim();
      if (chosenSubfoco.includes(': Diagnóstico e Conduta')) {
        chosenSubfoco = chosenSubfoco.replace(': Diagnóstico e Conduta', '').trim();
      }

      const matched = batch.canonicalEntry.subfocosList.find(s => s === chosenSubfoco) ||
                      batch.canonicalEntry.subfocosList.find(s => s.toLowerCase().trim() === chosenSubfoco.toLowerCase().trim()) ||
                      batch.canonicalEntry.subfocosList.find(s => s.toLowerCase().includes(chosenSubfoco.toLowerCase()) || chosenSubfoco.toLowerCase().includes(s.toLowerCase()));

      if (!matched) continue;
      if (matched.toLowerCase().trim() === batch.canonicalEntry.foco.toLowerCase().trim()) continue;

      if (IS_EXECUTE) {
        await applyUpdateToSupabase(matchingItem.id, batch.canonicalEntry.tema, batch.canonicalEntry.foco, matched);

        const logLine = JSON.stringify({
          id: matchingItem.id,
          code: matchingItem.code,
          especialidade: batch.canonicalEntry.especialidade,
          tema: batch.canonicalEntry.tema,
          foco: batch.canonicalEntry.foco,
          subfoco: matched,
          justificativa: dec.justificativa_clinica || '',
          model: worker.model,
          worker: worker.name,
          timestamp: new Date().toISOString()
        });
        fs.appendFileSync(PROGRESS_FILE, logLine + '\n', 'utf8');
      }

      totalResolved++;
      worker.stats.resolved++;
      batchSuccessCount++;
    }

    worker.stats.batches++;
    const pct = ((totalResolved / totalQueued) * 100).toFixed(1);
    logLive(`    ⚡ [${worker.shortName}] +${batchSuccessCount} resolvidas | Total: ${totalResolved.toLocaleString('pt-BR')} / ${totalQueued.toLocaleString('pt-BR')} (${pct}%)`);
  }
}

logLive('🚀 Disparando Todos os Workers Simultâneos de Alta Potência (Groq 120B + Gemini 3 Flash + OpenRouter 550B)...\n');
await Promise.all(WORKERS.map(w => startWorker(w)));

const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);

logLive('\n========================================================================');
logLive('📊 RELATÓRIO FINAL DA SESSÃO MULTI-CLOUD DE ALTA POTÊNCIA (BATCH 10)');
logLive('========================================================================');
logLive(`  • Questões Agendadas:      ${totalQueued.toLocaleString('pt-BR')}`);
logLive(`  • Resolvidas com Sucesso:  ${totalResolved.toLocaleString('pt-BR')} (${((totalResolved / Math.max(1, totalQueued)) * 100).toFixed(1)}%)`);
logLive(`  • Desempenho por Worker:`);
for (const w of WORKERS) {
  logLive(`    - ${w.name}: ${w.stats.resolved} questões em ${w.stats.batches} lotes`);
}
logLive(`  • Tempo de Execução:       ${totalTimeSec}s`);
logLive(`  • Checkpoint Atualizado:   ${PROGRESS_FILE}`);
logLive('========================================================================\n');

