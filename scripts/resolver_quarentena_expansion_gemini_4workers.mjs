import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * RESOLVEDOR DE QUARENTENA GEMINI 4 WORKERS PARALELOS COM AUTO-FALLBACK
 * ============================================================================
 * 
 * Arquitetura de 4 Workers Simultâneos (2 modelos x 2 chaves Gemini):
 *   - Worker 1: Chave 1 (GEMINI_API_KEY)   · gemini-3.1-flash-lite (15 RPM / 1.500 RPD)
 *   - Worker 2: Chave 1 (GEMINI_API_KEY)   · gemini-3.5-flash      (15 RPM / 1.500 RPD)
 *   - Worker 3: Chave 2 (GEMINI_API_KEY_1) · gemini-3.1-flash-lite (15 RPM / 1.500 RPD)
 *   - Worker 4: Chave 2 (GEMINI_API_KEY_1) · gemini-3.5-flash      (15 RPM / 1.500 RPD)
 * 
 * Auto-Fallback em caso de 429: cada worker chaveia automaticamente para gemini-3.6-flash.
 * Fila em memória compartilhada entre todos os 4 workers.
 * Gravação atômica no Supabase e checkpoint contínuo.
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase ausentes em .env.local');
  process.exit(1);
}

// 2. Argumentos CLI
const args = process.argv.slice(2);
const getArg = (flag, defaultVal = null) => {
  const idx = args.indexOf(flag);
  return idx !== -1 && idx + 1 < args.length ? args[idx + 1] : defaultVal;
};
const hasFlag = (flag) => args.includes(flag);

const IS_EXECUTE = hasFlag('--execute');
const BATCH_SIZE = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 5;
const RUN_LIMIT = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const TREE_PATH = path.resolve('data/catalogo_arvore_canonica_completa.json');
const QUARANTINE_FILE = path.resolve('data/quarentena_questions_expansion_direto.jsonl');
const PROGRESS_FILE = path.resolve('data/resolucao_quarentena_expansion_progresso.jsonl');
const LIVE_LOG_FILE = path.resolve('data/quarentena_workers_live.log');

function logLive(msg) {
  console.log(msg);
  try {
    fs.appendFileSync(LIVE_LOG_FILE, msg + '\n', 'utf8');
  } catch { }
}

// Inicia arquivo de log ao vivo limpo
try {
  fs.writeFileSync(LIVE_LOG_FILE, `[${new Date().toISOString()}] Inicializando sessão 4 Workers Gemini\n`, 'utf8');
} catch { }

// 3. Rate Limiter Seguro por Worker (4500ms = ~13.3 RPM seguro)
class SafeRateLimiter {
  constructor(minDelayMs = 4500) {
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

// 4. Configuração dos 4 Workers Gemini (2 por chave)
const activeKeys = [
  { name: 'GEMINI_API_KEY', key: env.GEMINI_API_KEY },
  { name: 'GEMINI_API_KEY_1', key: env.GEMINI_API_KEY_1 }
].filter(k => k.key && k.key.length > 10);

if (activeKeys.length === 0) {
  console.error('❌ Nenhuma chave do Gemini encontrada.');
  process.exit(1);
}

const workerConfigs = [
  // Chave 1
  {
    keyObj: activeKeys[0],
    id: 'gemini-k1-3.1lite',
    name: 'Gemini Worker 1 (Chave 1 · 3.1-Lite)',
    shortName: 'G1-3.1Lite',
    models: ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash']
  },
  {
    keyObj: activeKeys[0],
    id: 'gemini-k1-3.5flash',
    name: 'Gemini Worker 2 (Chave 1 · 3.5-Flash)',
    shortName: 'G2-3.5Flash',
    models: ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.6-flash']
  },
  // Chave 2 (se existir, ou fallback chave 1)
  {
    keyObj: activeKeys.length > 1 ? activeKeys[1] : activeKeys[0],
    id: 'gemini-k2-3.1lite',
    name: 'Gemini Worker 3 (Chave 2 · 3.1-Lite)',
    shortName: 'G3-3.1Lite',
    models: ['gemini-3.1-flash-lite', 'gemini-3.5-flash', 'gemini-3.6-flash']
  },
  {
    keyObj: activeKeys.length > 1 ? activeKeys[1] : activeKeys[0],
    id: 'gemini-k2-3.5flash',
    name: 'Gemini Worker 4 (Chave 2 · 3.5-Flash)',
    shortName: 'G4-3.5Flash',
    models: ['gemini-3.5-flash', 'gemini-3.1-flash-lite', 'gemini-3.6-flash']
  }
];

const WORKERS = workerConfigs.map(cfg => ({
  id: cfg.id,
  name: cfg.name,
  shortName: cfg.shortName,
  provider: 'gemini',
  apiKey: cfg.keyObj.key,
  keyName: cfg.keyObj.name,
  models: [...cfg.models],
  modelIndex: 0,
  get model() {
    return this.models[this.modelIndex];
  },
  limiter: new SafeRateLimiter(4500),
  active: true,
  stats: { batches: 0, resolved: 0, modelSwitches: 0 }
}));

logLive('\n========================================================================');
logLive('⚡ RESOLVEDOR DE QUARENTENA GEMINI (4 WORKERS PARALELOS)');
logLive(`🛡️  Modo:              ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA (Grava no Supabase + Checkpoint)' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
logLive(`🚀 Workers Ativos:    ${WORKERS.length} workers operando em paralelo simultâneo:`);
for (const w of WORKERS) {
  logLive(`   • [${w.shortName}] ${w.name} | Modelo: ${w.model} | Fallback: ${w.models.join(' -> ')}`);
}
logLive(`📦 Lotes:             ${BATCH_SIZE} questões por requisição`);
logLive('========================================================================\n');

// 5. Carregar Árvore Canônica Oficial
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
    } catch { }
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
  } catch { }
}

logLive(`📦 Quarentena Elegível: ${pendingQuarantineItems.length.toLocaleString('pt-BR')} questões pendentes prontas para resolução.`);

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

// 11. Funções de Busca e Chamada
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

async function callBatchGemini(questionsPayload, canonicalEntry, worker) {
  const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalEntry.especialidade}
TEMA: ${canonicalEntry.tema}
FOCO: ${canonicalEntry.foco}

SUBFOCOS VÁLIDOS (Escolha estritamente UM por questão a partir desta lista oficial):
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

// 12. Orquestrador Paralelo
let queueIndex = 0;
let totalResolved = 0;
const startTime = Date.now();

function getNextBatch() {
  if (queueIndex >= allBatches.length) return null;
  return allBatches[queueIndex++];
}

async function startWorker(worker) {
  logLive(`  🚀 [${worker.shortName}] inicializado com modelo ${worker.model}!`);

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
      } catch { }

      return {
        id: q.id,
        enunciado: (q.statement || '').slice(0, 800),
        alternativas: optsText.slice(0, 600),
        gabarito_oficial: `Alternativa ${q.correct_answer || ''}`,
        comentario: (q.commentary || '').slice(0, 300)
      };
    });

    await worker.limiter.waitTurn();

    let res;
    try {
      res = await callBatchGemini(questionsPayload, batch.canonicalEntry, worker);
    } catch (e) {
      logLive(`    ⚠️  [${worker.shortName}] Timeout/Rede (${e.message}). Retentando lote...`);
      allBatches.push(batch);
      await new Promise(r => setTimeout(r, 4000));
      continue;
    }

    // Tratamento de Cota Esgotada (HTTP 429) -> Auto-Fallback
    if (res.status === 429) {
      worker.modelIndex++;
      if (worker.modelIndex < worker.models.length) {
        const prev = worker.models[worker.modelIndex - 1];
        const next = worker.models[worker.modelIndex];
        worker.stats.modelSwitches++;
        logLive(`\n  🔄 [${worker.shortName}] Cota de ${prev} esgotada (429). Alternando automaticamente para: ${next}!\n`);
        allBatches.push(batch);
        await new Promise(r => setTimeout(r, 2000));
        continue;
      } else {
        logLive(`\n  🛑 [${worker.shortName}] Todos os modelos esgotaram suas cotas nesta chave. Worker pausado!\n`);
        worker.active = false;
        allBatches.push(batch);
        break;
      }
    }

    // Tratamento de Alta Demanda (HTTP 503)
    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      if (res.status === 503) {
        worker.consecutive503 = (worker.consecutive503 || 0) + 1;
        if (worker.consecutive503 >= 3 && worker.models.length > 1) {
          const prev = worker.model;
          worker.modelIndex = (worker.modelIndex + 1) % worker.models.length;
          logLive(`\n  🔄 [${worker.shortName}] ${prev} congestionado (3x 503). Alternando temporariamente para: ${worker.model}!\n`);
          worker.consecutive503 = 0;
        } else {
          logLive(`    ⚠️  [${worker.shortName}] HTTP 503 (${worker.model} com alta demanda). Aguardando 6s...`);
        }
        allBatches.push(batch);
        await new Promise(r => setTimeout(r, 6000));
        continue;
      }
      worker.consecutive503 = 0;
      logLive(`    ⚠️  [${worker.shortName}] HTTP ${res.status}: ${errBody.slice(0, 100)}. Retornando lote à fila.`);
      allBatches.push(batch);
      await new Promise(r => setTimeout(r, 4000));
      continue;
    }
    worker.consecutive503 = 0;

    // Parsing das Decisões
    let rawText = '';
    try {
      const jsonRes = await res.json();
      rawText = jsonRes?.candidates?.[0]?.content?.parts?.[0]?.text || '';
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
    logLive(`    ⚡ [${worker.shortName} | ${worker.model}] +${batchSuccessCount} resolvidas | Total: ${totalResolved.toLocaleString('pt-BR')} / ${totalQueued.toLocaleString('pt-BR')} (${pct}%)`);
  }
}

logLive('🚀 Disparando Todos os 4 Workers Gemini Simultâneos...\n');
await Promise.all(WORKERS.map(w => startWorker(w)));

const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);

logLive('\n========================================================================');
logLive('📊 RELATÓRIO FINAL DA SESSÃO GEMINI (4 WORKERS PARALELOS)');
logLive('========================================================================');
logLive(`  • Questões Agendadas:      ${totalQueued.toLocaleString('pt-BR')}`);
logLive(`  • Resolvidas com Sucesso:  ${totalResolved.toLocaleString('pt-BR')} (${((totalResolved / Math.max(1, totalQueued)) * 100).toFixed(1)}%)`);
logLive(`  • Desempenho por Worker:`);
for (const w of WORKERS) {
  logLive(`    - ${w.name}: ${w.stats.resolved} questões em ${w.stats.batches} lotes (Trocas: ${w.stats.modelSwitches})`);
}
logLive(`  • Tempo de Execução:       ${totalTimeSec}s`);
logLive(`  • Checkpoint Atualizado:   ${PROGRESS_FILE}`);
logLive('========================================================================\n');

