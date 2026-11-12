import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * RESOLVEDOR FINAL DE QUARENTENA EXPANSION (4.552 QUESTÕES RESTANTES)
 * ============================================================================
 * 
 * Classificação direta e canônica do saldo remanescente da tabela
 * questions_expansion_direto onde subfoco = 'Geral'.
 * 
 * Workers Multi-Cloud em Paralelo (Lotes de 10):
 *   - Gemini Chave 1: gemini-3.1-flash-lite
 *   - Gemini Chave 2: gemini-3.1-flash-lite
 *   - Groq Cloud: openai/gpt-oss-120b (120B Flagship)
 *   - Groq Cloud: qwen/qwen3.8-27b (27B Fast)
 * 
 * Gravação atômica no Supabase, log em tempo real e checkpoint auditado.
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
const GROQ_KEY     = env.GROQ_API_KEY;
const GEMINI_KEY_1 = env.GEMINI_API_KEY;
const GEMINI_KEY_2 = env.GEMINI_API_KEY_1;

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

const IS_EXECUTE    = hasFlag('--execute');
const BATCH_SIZE    = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 10;
const RUN_LIMIT     = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const INPUT_FILE    = path.resolve('data/quarentena_remanescentes_4552.jsonl');
const TREE_PATH     = path.resolve('data/catalogo_arvore_canonica_completa.json');
const PROGRESS_FILE = path.resolve('data/resolucao_quarentena_expansion_progresso.jsonl');
const LIVE_LOG_FILE = path.resolve('data/quarentena_workers_live.log');

function logLive(msg) {
  console.log(msg);
  try {
    fs.appendFileSync(LIVE_LOG_FILE, msg + '\n', 'utf8');
  } catch {}
}

// 3. Rate Limiter Seguro
class SafeRateLimiter {
  constructor(minDelayMs = 4000) {
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

// 4. Configuração dos Workers
const WORKERS = [];

if (GEMINI_KEY_1) {
  WORKERS.push({
    id: 'gemini-k1',
    name: 'Google Gemini 3.1 Flash (Chave 1)',
    shortName: 'Gemini-K1',
    provider: 'gemini',
    apiKey: GEMINI_KEY_1,
    model: 'gemini-3.1-flash-lite',
    limiter: new SafeRateLimiter(4000),
    active: true,
    stats: { batches: 0, resolved: 0 }
  });
}

if (GEMINI_KEY_2) {
  WORKERS.push({
    id: 'gemini-k2',
    name: 'Google Gemini 3.1 Flash (Chave 2)',
    shortName: 'Gemini-K2',
    provider: 'gemini',
    apiKey: GEMINI_KEY_2,
    model: 'gemini-3.1-flash-lite',
    limiter: new SafeRateLimiter(4000),
    active: true,
    stats: { batches: 0, resolved: 0 }
  });
}

if (GROQ_KEY) {
  WORKERS.push({
    id: 'groq-120b',
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
    id: 'groq-27b',
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

logLive('\n========================================================================');
logLive('🚀 RESOLVEDOR FINAL DE QUARENTENA (4.552 QUESTÕES REMANESCENTES)');
logLive('========================================================================');
logLive(`🛡️  Modo:              ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA (Grava no Supabase + Checkpoint)' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
logLive(`🚀 Workers Ativos:    ${WORKERS.length} workers paralelos:`);
for (const w of WORKERS) {
  logLive(`   • [${w.shortName}] ${w.name} | Provedor: ${w.provider.toUpperCase()} | Modelo: ${w.model}`);
}
logLive(`📦 Lotes:             ${BATCH_SIZE} questões por requisição`);
logLive('========================================================================\n');

// 5. Carregar Árvore Canônica e Estruturar por Especialidade
if (!fs.existsSync(TREE_PATH)) {
  console.error(`❌ Árvore canônica não encontrada: ${TREE_PATH}`);
  process.exit(1);
}

const rawTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));
const specialtyTaxonomy = new Map();
const allCanonicalFocoMap = new Map();

for (const espNode of (rawTree.hierarquia_padrao || [])) {
  const espName = espNode.especialidade;
  const list = [];

  for (const t of (espNode.temas || [])) {
    for (const f of (t.focos || [])) {
      const focoName = f.foco;
      const subfocosList = (f.subfocos || []).map(s => typeof s === 'string' ? s : s.subfoco).filter(Boolean);
      
      const item = {
        tema: t.tema,
        foco: focoName,
        subfocos: subfocosList
      };
      list.push(item);

      const canonicalEntry = {
        especialidade: espName,
        tema: t.tema,
        foco: focoName,
        subfocosList
      };
      allCanonicalFocoMap.set(`${espName.toLowerCase().trim()}|||${focoName.toLowerCase().trim()}`, canonicalEntry);
      allCanonicalFocoMap.set(focoName.toLowerCase().trim(), canonicalEntry);
    }
  }

  specialtyTaxonomy.set(espName, list);
}

// 6. Carregar Checkpoint de Questões Já Resolvidas
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

// 7. Carregar Questões Remanescentes do Arquivo Local
if (!fs.existsSync(INPUT_FILE)) {
  console.error(`❌ Arquivo de questões remanescentes não encontrado: ${INPUT_FILE}`);
  process.exit(1);
}

const rawInputLines = fs.readFileSync(INPUT_FILE, 'utf8').trim().split('\n');
const pendingItems = [];

for (const l of rawInputLines) {
  if (!l.trim()) continue;
  try {
    const item = JSON.parse(l);
    if (!resolvedIds.has(item.id)) {
      pendingItems.push(item);
    }
  } catch {}
}

logLive(`📦 Questões Elegíveis Pendentes: ${pendingItems.length.toLocaleString('pt-BR')} questões prontas para classificação.`);

if (pendingItems.length === 0) {
  logLive('🎉 Todas as questões remanescentes já foram resolvidas com sucesso!');
  process.exit(0);
}

// 8. Agrupamento por Especialidade Médica
const bySpecialty = new Map();
for (const item of pendingItems) {
  const esp = item.especialidade || 'Clínica Médica';
  if (!bySpecialty.has(esp)) bySpecialty.set(esp, []);
  bySpecialty.get(esp).push(item);
}

// 9. Montagem dos Lotes de Trabalho
const allBatches = [];
let totalQueued = 0;
const effectiveLimit = RUN_LIMIT ? Math.min(RUN_LIMIT, pendingItems.length) : pendingItems.length;

for (const [esp, items] of bySpecialty.entries()) {
  if (totalQueued >= effectiveLimit) break;
  const taxonomy = specialtyTaxonomy.get(esp) || [];

  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    if (totalQueued >= effectiveLimit) break;
    const chunk = items.slice(i, Math.min(items.length, i + BATCH_SIZE, i + (effectiveLimit - totalQueued)));
    
    allBatches.push({
      especialidade: esp,
      taxonomy,
      items: chunk
    });
    totalQueued += chunk.length;
  }
}

logLive(`📦 Fila Paralela: ${allBatches.length.toLocaleString('pt-BR')} lotes agendados (${totalQueued.toLocaleString('pt-BR')} questões em lotes de ${BATCH_SIZE}).\n`);

// 10. Chamada Multi-Cloud (Gemini ou OpenAI-compatible)
async function callLLM(batch, worker) {
  const questionsPayload = batch.items.map(q => {
    let optsText = '';
    try {
      const opts = Array.isArray(q.options) ? q.options : JSON.parse(q.options || '[]');
      optsText = opts.map(o => `${o.letter || o.index}) ${o.text}`).join(' | ');
    } catch {
      optsText = typeof q.options === 'string' ? q.options : '';
    }

    return {
      id: q.id,
      enunciado: (q.statement || '').slice(0, 700),
      alternativas: optsText.slice(0, 450),
      gabarito: `Alternativa ${q.correct_answer || ''}`,
      comentario: (q.commentary || '').slice(0, 300)
    };
  });

  const prompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES DE ${batch.especialidade.toUpperCase()} na árvore taxonômica oficial.

OPÇÕES TAXONÔMICAS VÁLIDAS DE ${batch.especialidade.toUpperCase()}:
${JSON.stringify(batch.taxonomy, null, 2)}

QUESTÕES PARA CLASSIFICAR:
${JSON.stringify(questionsPayload, null, 2)}

REGRAS:
1. Para cada questão, escolha estritamente um "tema", "foco" e "subfoco" válidos da lista oficial acima.
2. O subfoco DEVE ser diferente do foco.
3. Forneça uma justificativa médica concisa de 1 frase.

RESPONDA ESTRITAMENTE EM FORMATO JSON COMO UM ARRAY DE OBJETOS:
[
  {
    "id": "ID_EXATO_DA_QUESTAO",
    "tema": "NOME_EXATO_DO_TEMA",
    "foco": "NOME_EXATO_DO_FOCO",
    "subfoco": "NOME_EXATO_DO_SUBFOCO",
    "justificativa_clinica": "Justificativa médica concisa."
  }
]`;

  if (worker.provider === 'gemini') {
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
      signal: AbortSignal.timeout(50000)
    });
    return res;
  }

  // OpenAI-compatible (Groq)
  const url = 'https://api.groq.com/openai/v1/chat/completions';
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${worker.apiKey}`
    },
    body: JSON.stringify({
      model: worker.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      max_tokens: 3500
    }),
    signal: AbortSignal.timeout(50000)
  });
  return res;
}

// 11. Gravação no Supabase
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
  logLive(`  🚀 [${worker.shortName}] inicializado e operando!`);

  while (worker.active) {
    const batch = getNextBatch();
    if (!batch) break;

    await worker.limiter.waitTurn();

    let res;
    try {
      res = await callLLM(batch, worker);
    } catch (e) {
      logLive(`    ⚠️  [${worker.shortName}] Timeout/Rede (${e.message}). Retentando lote...`);
      allBatches.push(batch);
      await new Promise(r => setTimeout(r, 4000));
      continue;
    }

    if (res.status === 429) {
      const errText = await res.text().catch(() => '');
      if (worker.provider === 'groq') {
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
        if (errText.includes('requests per day') || errText.includes('RESOURCE_EXHAUSTED')) {
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

    if (res.status === 413) {
      worker.active = false;
      logLive(`\n  🛑 [${worker.name}] Prompt excede limite de contexto do modelo (HTTP 413). Worker pausado com segurança!\n`);
      allBatches.push(batch);
      break;
    }

    if (res.status === 503) {
      logLive(`    ⏳ [${worker.shortName}] 503 temporário. Backoff 8s...`);
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

    // Parsing da Resposta
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

      if (!matchingItem || !dec.foco || !dec.subfoco) continue;

      // Validação Canônica
      const focoStr = String(dec.foco).trim();
      const subfocoStr = String(dec.subfoco).trim();

      const canonEntry = allCanonicalFocoMap.get(`${batch.especialidade.toLowerCase().trim()}|||${focoStr.toLowerCase().trim()}`) ||
                         allCanonicalFocoMap.get(focoStr.toLowerCase().trim());

      let validatedTema = dec.tema || batch.especialidade;
      let validatedFoco = focoStr;
      let validatedSubfoco = subfocoStr;

      if (canonEntry) {
        validatedTema = canonEntry.tema;
        validatedFoco = canonEntry.foco;

        const matchedSub = canonEntry.subfocosList.find(s => s.toLowerCase().trim() === subfocoStr.toLowerCase().trim()) ||
                           canonEntry.subfocosList.find(s => s.toLowerCase().includes(subfocoStr.toLowerCase()) || subfocoStr.toLowerCase().includes(s.toLowerCase())) ||
                           canonEntry.subfocosList[0];

        if (matchedSub) validatedSubfoco = matchedSub;
      }

      if (validatedSubfoco.toLowerCase().trim() === validatedFoco.toLowerCase().trim()) {
        continue;
      }

      if (IS_EXECUTE) {
        await applyUpdateToSupabase(matchingItem.id, validatedTema, validatedFoco, validatedSubfoco);

        const logLine = JSON.stringify({
          id: matchingItem.id,
          code: matchingItem.code,
          especialidade: batch.especialidade,
          tema: validatedTema,
          foco: validatedFoco,
          subfoco: validatedSubfoco,
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

logLive('🚀 Disparando Todos os Workers Simultâneos para o Lote Final...\n');
await Promise.all(WORKERS.map(w => startWorker(w)));

const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);

logLive('\n========================================================================');
logLive('📊 RELATÓRIO FINAL DA SESSÃO REMANESCENTE (4.552 QUESTÕES)');
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

