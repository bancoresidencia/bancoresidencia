import fs from 'fs';
import path from 'path';

/**
 * ============================================================================
 * RESOLVEDOR DE QUARENTENA VIA OLLAMA LOCAL 100% EM VRAM (NVIDIA GTX 1650)
 * ============================================================================
 * 
 * Hardware & Modelo:
 *   - GPU: NVIDIA GeForce GTX 1650 (4 GB VRAM)
 *   - Modelo: qwen2.5:3b (carregado 100% em VRAM ~2.1 GB)
 *   - Servidor: Ollama HTTP API (http://127.0.0.1:11434)
 *   - Latência média: ~500ms - 1.5s por lote de 5 questões
 *   - Zero rate limit, zero custo de API, 100% autônomo e ilimitado.
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
const BATCH_SIZE      = getArg('--batch') ? Math.max(1, parseInt(getArg('--batch'), 10)) : 2;
const RUN_LIMIT       = getArg('--limit') ? parseInt(getArg('--limit'), 10) : null;
const MODEL_NAME      = getArg('--model', 'qwen2.5:3b');
const OLLAMA_HOST     = getArg('--host', 'http://127.0.0.1:11434');
const TREE_PATH       = path.resolve('data/catalogo_arvore_canonica_completa.json');
const QUARANTINE_FILE = path.resolve('data/quarentena_questions_expansion_direto.jsonl');
const PROGRESS_FILE   = path.resolve('data/resolucao_quarentena_expansion_progresso.jsonl');

console.log('========================================================================');
console.log('⚡ RESOLVEDOR DE QUARENTENA VIA OLLAMA LOCAL (100% VRAM GPU)');
console.log(`🛡️  Modo:              ${IS_EXECUTE ? '⚡ EXECUÇÃO ATIVA (Grava no Supabase + Checkpoint)' : '🧪 SIMULAÇÃO AUDITADA (--dry-run)'}`);
console.log(`🤖 Modelo Local:      ${MODEL_NAME} (Ollama @ ${OLLAMA_HOST})`);
console.log(`📦 Lotes:             ${BATCH_SIZE} questões por requisição local`);
console.log('========================================================================\n');

// 3. Teste de Conexão com o Ollama
try {
  const resPing = await fetch(`${OLLAMA_HOST}/api/tags`, { signal: AbortSignal.timeout(5000) });
  if (!resPing.ok) throw new Error(`HTTP ${resPing.status}`);
  const tags = await resPing.json();
  const found = (tags.models || []).find(m => m.name.includes(MODEL_NAME.split(':')[0]));
  if (!found) {
    console.warn(`⚠️ Modelo '${MODEL_NAME}' não encontrado na lista do Ollama:`, tags.models?.map(m => m.name));
  } else {
    console.log(`✅ Ollama online e modelo '${found.name}' pronto na VRAM!`);
  }
} catch (e) {
  console.error(`❌ Não foi possível conectar ao Ollama em ${OLLAMA_HOST}: ${e.message}`);
  process.exit(1);
}

// 4. Carregar Árvore Canônica Oficial
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

// 5. Carregar Checkpoint de Progresso Anterior
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

// 6. Sincronização Dinâmica com Supabase: Busca IDs com subfoco = 'Geral'
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

// 7. Carregar Questões da Quarentena
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

// 8. Agrupamento por Foco Canônico
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

// 9. Montagem dos Lotes de Trabalho
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

console.log(`📦 Fila Montada: ${allBatches.length.toLocaleString('pt-BR')} lotes agendados (${totalQueued.toLocaleString('pt-BR')} questões em lotes de ${BATCH_SIZE}).\n`);

// 10. Funções de Busca e Chamada Ollama Local
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

async function callBatchOllama(questionsPayload, canonicalEntry) {
  const systemPrompt = `Você é um Professor e Preceptor Médico de Residência Médica da plataforma Banco Residência.
Classifique o LOTE DE QUESTÕES na árvore taxonômica oficial.

ESPECIALIDADE: ${canonicalEntry.especialidade}
TEMA: ${canonicalEntry.tema}
FOCO: ${canonicalEntry.foco}

SUBFOCOS VÁLIDOS (Escolha estritamente UM da lista abaixo para cada questão):
${JSON.stringify(canonicalEntry.subfocosList, null, 2)}

REGRAS:
1. Para cada questão, analise Enunciado, Alternativas e Gabarito.
2. Escolha OBRIGATORIAMENTE um dos nomes exatos da lista de Subfocos acima.
3. Responda ESTRITAMENTE em formato JSON com o objeto contendo o array "decisoes":
{
  "decisoes": [
    {
      "id": "ID_EXATO_DA_QUESTAO",
      "subfoco_escolhido": "NOME_EXATO_DO_SUBFOCO",
      "justificativa_clinica": "Explicação médica concisa."
    }
  ]
}`;

  const res = await fetch(`${OLLAMA_HOST}/api/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: MODEL_NAME,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: JSON.stringify(questionsPayload) }
      ],
      format: 'json',
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 1200
      }
    }),
    signal: AbortSignal.timeout(60000)
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

// 11. Loop Principal de Processamento Local
let totalResolved = 0;
const startTime = Date.now();

console.log('🚀 Iniciando Processamento Local via VRAM GPU...\n');

for (let bIdx = 0; bIdx < allBatches.length; bIdx++) {
  const batch = allBatches[bIdx];
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

  const t0 = Date.now();
  let res;
  try {
    res = await callBatchOllama(questionsPayload, batch.canonicalEntry);
  } catch (e) {
    console.warn(`    ⚠️  Falha/Timeout no Ollama local (${e.message}). Retentando lote...`);
    allBatches.push(batch);
    await new Promise(r => setTimeout(r, 2000));
    continue;
  }

  if (!res.ok) {
    console.warn(`    ⚠️  Ollama HTTP ${res.status}. Retornando lote à fila.`);
    allBatches.push(batch);
    await new Promise(r => setTimeout(r, 2000));
    continue;
  }

  let jsonRes;
  try {
    jsonRes = await res.json();
  } catch {
    allBatches.push(batch);
    continue;
  }

  const content = jsonRes?.message?.content || '';
  if (!content) {
    allBatches.push(batch);
    continue;
  }

  let parsed;
  try {
    parsed = JSON.parse(content.replace(/```json\s*|\s*```/g, '').trim());
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
        model: `ollama/${MODEL_NAME}`,
        worker: 'Ollama Local (GTX 1650 VRAM)',
        timestamp: new Date().toISOString()
      });
      fs.appendFileSync(PROGRESS_FILE, logLine + '\n', 'utf8');
    }

    totalResolved++;
    batchSuccessCount++;
  }

  const durationMs = Date.now() - t0;
  const pct = ((totalResolved / totalQueued) * 100).toFixed(1);
  console.log(`    ⚡ [VRAM Ollama] +${batchSuccessCount} resolvidas em ${durationMs}ms | Total: ${totalResolved.toLocaleString('pt-BR')} / ${totalQueued.toLocaleString('pt-BR')} (${pct}%)`);
}

const totalTimeSec = ((Date.now() - startTime) / 1000).toFixed(1);

console.log('\n========================================================================');
console.log('📊 RELATÓRIO FINAL DA SESSÃO OLLAMA LOCAL');
console.log('========================================================================');
console.log(`  • Questões Agendadas:      ${totalQueued.toLocaleString('pt-BR')}`);
console.log(`  • Resolvidas com Sucesso:  ${totalResolved.toLocaleString('pt-BR')} (${((totalResolved / Math.max(1, totalQueued)) * 100).toFixed(1)}%)`);
console.log(`  • Tempo de Execução:       ${totalTimeSec}s`);
console.log(`  • Checkpoint Atualizado:   ${PROGRESS_FILE}`);
console.log('========================================================================\n');
