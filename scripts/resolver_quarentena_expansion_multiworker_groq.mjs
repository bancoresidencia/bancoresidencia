import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * RESOLVEDOR DE QUARENTENA MULTI-WORKER GROQ CLOUD (UM WORKER POR MODELO)
 * ============================================================================
 * 
 * Arquitetura de 3 Workers Simultâneos (1 por modelo na Groq Cloud):
 *   - Worker 1: openai/gpt-oss-120b (Groq 120B - altíssimo raciocínio clínico)
 *   - Worker 2: qwen/qwen3.8-27b    (Groq 27B  - ultrarrápido)
 *   - Worker 3: openai/gpt-oss-20b  (Groq 20B  - leve e veloz)
 * 
 * Lógica:
 *   - Pré-sincroniza com o Supabase: busca IDs reais com subfoco = 'Geral'
 *   - Mapeia com data/quarentena_questions_expansion_direto.jsonl (foco_sugerido)
 *   - Pula as questões já resolvidas no checkpoint (PROGRESS_FILE)
 *   - Lotes de 5 questões agrupadas por Foco Canônico
 *   - Cada worker possui seu próprio modelo e rate-limiter independente
 *   - Gravação atômica no Supabase e checkpoint em PROGRESS_FILE
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

const GROQ_API_KEY = env.GROQ_API_KEY || process.env.GROQ_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY  = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!GROQ_API_KEY) {
  console.error('❌ GROQ_API_KEY ausente em .env.local');
  process.exit(1);
}
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
  constructor(minDelayMs = 7000) {
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

// 4. Definição dos 3 Workers (1 por Modelo)
const WORKERS = [
  {
    id: 'groq-120b',
    name: 'Groq 120B (gpt-oss-120b)',
    shortName: 'Groq120B',
    model: 'openai/gpt-oss-120b',
    limiter: new SafeRateLimiter(10000), // ~6 req/min seguro
    active: true,
    stats: { batches: 0, resolved: 0 }
  },
  {
    id: 'groq-27b',
    name: 'Groq 27B (qwen3.8-27b)',
    shortName: 'Groq27B',
    model: 'qwen/qwen3.8-27b',
    limiter: new SafeRateLimiter(6000), // ~10 req/min seguro
    active: true,
    stats: { batches: 0, resolved: 0 }
  },
  {
    id: 'groq-20b',
    name: 'Groq 20B (gpt-oss-20b)',
    shortName: 'Groq20B',
    model: 'openai/gpt-oss-20b',
    limiter: new SafeRateLimiter(6000), // ~10 req/min seguro
    active: true,
    stats: { batches: 0, resolved: 0 }
  }
];

console.log('========================================================================');
console.log('⚡ RESOLVEDOR DE QUARENTENA MULTI-WORKER GROQ (1 WORKER POR MODELO)');
console.log(`🛡️  Modo:              ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA (Grava no Supabase + Checkpoint)' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🚀 Workers Simultâneos: ${WORKERS.length} modelos operando em paralelo`);
console.log(`   • ${WORKERS.map(w => w.name).join('\n   • ')}`);
console.log(`📦 Lotes:             ${BATCH_SIZE} questões por requisição`);
console.log('========================================================================\n');

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

// 6. Carregar Checkpoint de Progresso Anterior (Preserva o que o Gemini já fez!)
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

// 7. Sincronização Dinâmica com Supabase: Busca IDs com subfoco = 'Geral'
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
    console.error(`❌ Falha na sincronização inicial com Supabase: ${err.message}`);
    break;
  }
}
console.log(`✅ Supabase possui ${existingGeralIds.size.toLocaleString('pt-BR')} questões com subfoco = 'Geral'.`);

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
    // Só inclui se existe no Supabase (subfoco=Geral) E ainda não foi resolvida
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

console.log(`📦 Fila Paralela: ${allBatches.length.toLocaleString('pt-BR')} lotes agendados (${totalQueued.toLocaleString('pt-BR')} questões em lotes de ${BATCH_SIZE}).\n`);

// 11. Funções de Busca e Chamada Groq
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
      'Authorization': `Bearer ${GROQ_API_KEY}`
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

// 12. Orquestrador Paralelo Multi-Worker
let queueIndex = 0;
let totalResolved = 0;
const startTime = Date.now();

function getNextBatch() {
  if (queueIndex >= allBatches.length) return null;
  return allBatches[queueIndex++];
}

async function startWorker(worker) {
  console.log(`  🚀 Worker [${worker.name}] inicializado e pronto!`);

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
      res = await callBatchGroq(questionsPayload, batch.canonicalEntry, worker);
    } catch (e) {
      console.warn(`    ⚠️  [${worker.shortName}] Timeout/Rede (${e.message}). Retentando lote...`);
      allBatches.push(batch);
      await new Promise(r => setTimeout(r, 6000));
      continue;
    }

    if (res.status === 429) {
      const errText = await res.text();
      if (errText.includes('tokens per day (TPD)')) {
        worker.active = false;
        console.log(`\n  🛑 [${worker.name}] Cota diária TPD atingida. Worker desativado; os demais continuam!\n`);
        allBatches.push(batch);
        break;
      }

      let waitSec = 15;
      const match = errText.match(/retry in ([\d\.]+)s/i) || errText.match(/try again in ([\d\.]+)s/i);
      if (match) waitSec = Math.ceil(parseFloat(match[1])) + 2;
      console.log(`    ⏳ [${worker.shortName}] Rate limit transitório. Aguardando ${waitSec}s...`);
      await new Promise(r => setTimeout(r, waitSec * 1000));
      allBatches.push(batch);
      continue;
    }

    if (!res.ok) {
      const errBody = await res.text().catch(() => '');
      console.warn(`    ⚠️  [${worker.shortName}] HTTP ${res.status}: ${errBody.slice(0, 100)}. Retornando lote à fila.`);
      allBatches.push(batch);
      await new Promise(r => setTimeout(r, 3000));
      continue;
    }

    let jsonRes;
    try {
      jsonRes = await res.json();
    } catch {
      allBatches.push(batch);
      continue;
    }

    const content = jsonRes?.choices?.[0]?.message?.content;
    if (!content) {
      allBatches.push(batch);
      continue;
    }

    let parsed;
    try {
      const cleanContent = content.replace(/```json\s*|\s*```/g, '').trim();
      parsed = JSON.parse(cleanContent);
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
      // Casamento por UUID exato, por code ou por índice posicional
      const matchingItem = batch.items.find(it => String(it.id).trim() === String(dec.id).trim()) ||
                           batch.items.find(it => it.code && dec.id && it.code.trim().toLowerCase() === String(dec.id).trim().toLowerCase()) ||
                           batch.items[decIdx];

      if (!matchingItem || !dec.subfoco_escolhido) continue;

      let chosenSubfoco = String(dec.subfoco_escolhido).replace(/^["']|["']$/g, '').trim();
      if (chosenSubfoco.includes(': Diagnóstico e Conduta')) {
        chosenSubfoco = chosenSubfoco.replace(': Diagnóstico e Conduta', '').trim();
      }

      // Validação estrita na lista canônica oficial
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

console.log('🚀 Disparando os 3 Workers em Paralelo Simultâneo...\n');
await Promise.all(WORKERS.map(w => startWorker(w)));

const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n========================================================================');
console.log('📊 RELATÓRIO DA SESSÃO MULTI-WORKER GROQ');
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
