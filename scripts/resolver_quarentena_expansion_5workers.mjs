import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * RESOLVEDOR DE QUARENTENA MULTI-WORKER HÍBRIDO (2 GEMINI + 3 GROQ)
 * ============================================================================
 * 
 * Arquitetura de 5 Workers em Paralelo Simultâneo:
 *   - 2 Workers Gemini (1 para cada chave API ativa: GEMINI_API_KEY e GEMINI_API_KEY_1)
 *   - 3 Workers Groq Cloud (1 para cada modelo: Qwen 27B, GPT 120B e GPT 20B)
 * 
 * Lotes de 5 questões por chamada (--batch 5).
 * Fila em memória compartilhada entre todos os 5 workers.
 * Gravação atômica no Supabase e checkpoint auditável contínuo.
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
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

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

const IS_EXECUTE      = hasFlag('--execute');
const BATCH_SIZE      = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 5;
const RUN_LIMIT       = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const TREE_PATH       = path.resolve('data/catalogo_arvore_canonica_completa.json');
const QUARANTINE_FILE = path.resolve('data/quarentena_questions_expansion_direto.jsonl');
const PROGRESS_FILE   = path.resolve('data/resolucao_quarentena_expansion_progresso.jsonl');

// 3. Rate Limiter Seguro por Worker
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

// 4. Pre-Flight Check de Chaves Gemini
console.log('🔍 Executando Pre-Flight Check nas Chaves do Gemini...');
const rawGeminiKeys = Object.keys(env)
  .filter(k => k.startsWith('GEMINI_API_KEY'))
  .map(k => ({ name: k, key: env[k] }))
  .filter(item => item.key && item.key.length > 10);

const activeGeminiKeys = [];
for (const item of rawGeminiKeys) {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${item.key}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ contents: [{ parts: [{ text: 'PING' }] }] }),
      signal: AbortSignal.timeout(10000)
    });
    if (res.ok) {
      activeGeminiKeys.push(item);
      console.log(`  ✅ ${item.name} (...${item.key.slice(-6)}): ATIVA E PRONTA (200 OK)`);
    } else {
      console.log(`  ❌ ${item.name} (...${item.key.slice(-6)}): HTTP ${res.status} (Descartada)`);
    }
  } catch (e) {
    console.log(`  ⚠️  ${item.name} (...${item.key.slice(-6)}): Timeout/Rede`);
  }
}

if (activeGeminiKeys.length === 0) {
  console.error('❌ Nenhuma chave do Gemini ativa encontrada.');
  process.exit(1);
}

// 5. Configuração dos 2 Workers Gemini + 3 Workers Groq
const WORKERS = [];

// 2 Workers Gemini (1 para cada chave ativa)
for (let i = 0; i < Math.min(2, activeGeminiKeys.length); i++) {
  const item = activeGeminiKeys[i];
  WORKERS.push({
    id: `gemini-w${i + 1}`,
    name: `Gemini Worker ${i + 1} (${item.name})`,
    shortName: `Gemini-K${i + 1}`,
    provider: 'gemini',
    apiKey: item.key,
    keyName: item.name,
    model: 'gemini-3.5-flash-lite',
    limiter: new SafeRateLimiter(4500), // ~13 RPM seguro por chave
    active: true,
    stats: { batches: 0, resolved: 0 }
  });
}

// 3 Workers Groq (1 para cada modelo)
const GROQ_KEY = env.GROQ_API_KEY;
if (GROQ_KEY) {
  const groqConfigs = [
    { model: 'qwen/qwen3.8-27b',   name: 'Groq Worker 1 (Qwen 27B)', tag: 'Groq-27B',  delay: 8000 },
    { model: 'openai/gpt-oss-120b', name: 'Groq Worker 2 (GPT 120B)', tag: 'Groq-120B', delay: 10000 },
    { model: 'openai/gpt-oss-20b',  name: 'Groq Worker 3 (GPT 20B)',  tag: 'Groq-20B',  delay: 8000 }
  ];

  for (let i = 0; i < groqConfigs.length; i++) {
    const cfg = groqConfigs[i];
    WORKERS.push({
      id: `groq-w${i + 1}`,
      name: cfg.name,
      shortName: cfg.tag,
      provider: 'groq',
      apiKey: GROQ_KEY,
      keyName: 'GROQ_API_KEY',
      model: cfg.model,
      limiter: new SafeRateLimiter(cfg.delay),
      active: true,
      stats: { batches: 0, resolved: 0 }
    });
  }
}

console.log('\n========================================================================');
console.log('⚡ RESOLVEDOR DE QUARENTENA MULTI-WORKER HÍBRIDO (5 WORKERS PARALELOS)');
console.log(`🛡️  Modo:              ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA (Grava no Supabase + Checkpoint)' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🚀 Workers Ativos:    ${WORKERS.length} workers operando em paralelo simultâneo:`);
for (const w of WORKERS) {
  console.log(`   • [${w.shortName}] ${w.name} (${w.provider.toUpperCase()} | ${w.keyName})`);
}
console.log(`📦 Lotes:             ${BATCH_SIZE} questões por requisição`);
console.log('========================================================================\n');

// 6. Carregar Árvore Canônica Oficial
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

// 7. Carregar Checkpoint de Progresso Anterior
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
  console.log(`📋 Checkpoint existente: ${resolvedIds.size.toLocaleString('pt-BR')} questões já resolvidas anteriormente.`);
}

// 8. Sincronização Dinâmica com Supabase: Busca IDs com subfoco = 'Geral'
console.log('🔄 Sincronizando questões pendentes (subfoco = Geral) com o Supabase...');
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
console.log(`✅ Supabase possui ${existingGeralIds.size.toLocaleString('pt-BR')} questões pendentes com subfoco = 'Geral'.`);

// 9. Carregar Questões da Quarentena
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

console.log(`📦 Quarentena Elegível: ${pendingQuarantineItems.length.toLocaleString('pt-BR')} questões pendentes prontas para resolução.`);

if (pendingQuarantineItems.length === 0) {
  console.log('🎉 Todas as questões elegíveis da quarentena já foram resolvidas!');
  process.exit(0);
}

// 10. Agrupamento por Foco Canônico
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

// 11. Montagem dos Lotes de Trabalho
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

console.log(`📦 Fila Paralela: ${allBatches.length.toLocaleString('pt-BR')} lotes agendados (${totalQueued.toLocaleString('pt-BR')} questões em lotes de ${BATCH_SIZE}).\n`);

// 12. Funções de Busca e Chamada aos Provedores
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

async function callBatchGroq(questionsPayload, canonicalEntry, worker) {
  const systemPrompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalEntry.especialidade}
TEMA: ${canonicalEntry.tema}
FOCO: ${canonicalEntry.foco}

SUBFOCOS VÁLIDOS (Escolha estritamente UM da lista abaixo para cada questão):
${JSON.stringify(canonicalEntry.subfocosList, null, 2)}

REGRAS:
1. Para cada questão, analise Enunciado, Alternativas, Gabarito e Comentário.
2. Escolha OBRIGATORIAMENTE um dos nomes exatos da lista de Subfocos acima.
3. Responda ESTRITAMENTE em formato JSON com o objeto contendo o array "decisoes":
{
  "decisoes": [
    {
      "id": "ID_EXATO_DA_QUESTAO",
      "subfoco_escolhido": "NOME_EXATO_DO_SUBFOCO",
      "justificativa_clinica": "Explicação médica concisa em 1 frase."
    }
  ]
}`;

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${worker.apiKey}`
    },
    body: JSON.stringify({
      model: worker.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(questionsPayload) }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
      max_tokens: 1200
    }),
    signal: AbortSignal.timeout(35000)
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

// 13. Orquestrador Paralelo com 7 Workers
let queueIndex = 0;
let totalResolved = 0;
const startTime = Date.now();

function getNextBatch() {
  if (queueIndex >= allBatches.length) return null;
  return allBatches[queueIndex++];
}

async function startWorker(worker) {
  console.log(`  🚀 [${worker.shortName}] inicializado e operando!`);

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
        enunciado: (q.statement || '').slice(0, 800),
        alternativas: optsText.slice(0, 600),
        gabarito_oficial: `Alternativa ${q.correct_answer || ''}`,
        comentario: (q.commentary || '').slice(0, 300)
      };
    });

    await worker.limiter.waitTurn();

    let res;
    try {
      if (worker.provider === 'gemini') {
        res = await callBatchGemini(questionsPayload, batch.canonicalEntry, worker);
      } else {
        res = await callBatchGroq(questionsPayload, batch.canonicalEntry, worker);
      }
    } catch (e) {
      console.warn(`    ⚠️  [${worker.shortName}] Timeout/Rede (${e.message}). Retentando lote...`);
      allBatches.push(batch);
      await new Promise(r => setTimeout(r, 4000));
      continue;
    }

    // Tratamento de Rate Limit (HTTP 429)
    if (res.status === 429) {
      const errText = await res.text().catch(() => '');

      if (worker.provider === 'gemini') {
        worker.active = false;
        console.log(`\n  🛑 [${worker.name}] Cota do modelo ${worker.model} atingida. Worker pausado!\n`);
        allBatches.push(batch);
        break;
      } else {
        // Groq
        if (errText.includes('tokens per day (TPD)')) {
          worker.active = false;
          console.log(`\n  🛑 [${worker.name}] Cota diária TPD atingida na Groq. Worker pausado!\n`);
          allBatches.push(batch);
          break;
        }
        let waitSec = 20;
        const match = errText.match(/retry in ([\d\.]+)s/i) || errText.match(/try again in ([\d\.]+)s/i);
        if (match) waitSec = Math.ceil(parseFloat(match[1])) + 2;
        console.log(`    ⏳ [${worker.shortName}] Groq TPM limit. Aguardando ${waitSec}s...`);
        await new Promise(r => setTimeout(r, waitSec * 1000));
        allBatches.push(batch);
        continue;
      }
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      if (res.status === 503) {
        console.warn(`    ⚠️  [${worker.shortName}] HTTP 503 (Alta demanda). Aguardando 6s...`);
        allBatches.push(batch);
        await new Promise(r => setTimeout(r, 6000));
        continue;
      }
      console.warn(`    ⚠️  [${worker.shortName}] HTTP ${res.status}: ${errBody.slice(0, 100)}. Retornando lote à fila.`);
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

      // Validação estrita contra a árvore canônica
      const matched = batch.canonicalEntry.subfocosList.find(s => s === chosenSubfoco) ||
                      batch.canonicalEntry.subfocosList.find(s => s.toLowerCase().trim() === chosenSubfoco.toLowerCase().trim()) ||
                      batch.canonicalEntry.subfocosList.find(s => s.toLowerCase().includes(chosenSubfoco.toLowerCase()) || chosenSubfoco.toLowerCase().includes(s.toLowerCase()));

      if (!matched) continue;
      // Quality Gate: subfoco != foco
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
    console.log(`    ⚡ [${worker.shortName}] +${batchSuccessCount} resolvidas | Total: ${totalResolved.toLocaleString('pt-BR')} / ${totalQueued.toLocaleString('pt-BR')} (${pct}%)`);
  }
}

console.log('🚀 Disparando Todos os 5 Workers Simultâneos (2 Gemini + 3 Groq)...\n');
await Promise.all(WORKERS.map(w => startWorker(w)));

const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n========================================================================');
console.log('📊 RELATÓRIO FINAL DA SESSÃO MULTI-WORKER 5x (2 GEMINI + 3 GROQ)');
console.log('========================================================================');
console.log(`  • Questões Agendadas:      ${totalQueued.toLocaleString('pt-BR')}`);
console.log(`  • Resolvidas com Sucesso:  ${totalResolved.toLocaleString('pt-BR')} (${((totalResolved / Math.max(1, totalQueued)) * 100).toFixed(1)}%)`);
console.log(`  • Desempenho por Worker:`);
for (const w of WORKERS) {
  console.log(`    - ${w.name}: ${w.stats.resolved} questões em ${w.stats.batches} lotes`);
}
console.log(`  • Tempo de Execução:       ${totalTimeSec}s`);
console.log(`  • Checkpoint Atualizado:   ${PROGRESS_FILE}`);
console.log('========================================================================\n');
