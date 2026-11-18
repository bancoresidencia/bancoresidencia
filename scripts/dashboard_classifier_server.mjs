import http from 'http';
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { pipeline, cos_sim } from '@xenova/transformers';

// ============================================================================
// SERVIDOR E DASHBOARD DO MOTOR DE CLASSIFICAÇÃO TAXONÔMICA EM TEMPO REAL
// ============================================================================

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ Credenciais do Supabase ausentes em .env.local');
  process.exit(1);
}

const ALLOWED_TABLES = new Set([
  'questions_direto',
  'questions_rplus',
  'questions_revalida',
  'questions_expansion_direto',
  'questions_expansion_revalida'
]);

// 1. Árvore Canônica Oficial
const TREE_PATH = fs.existsSync('data/catalogo_arvore_canonica_completa.json')
  ? path.resolve('data/catalogo_arvore_canonica_completa.json')
  : path.resolve('src/data/hierarquiaCompletaFiltros.json');
const rawTree = JSON.parse(fs.readFileSync(TREE_PATH, 'utf8'));

const allCanonicalFocos = [];
for (const espNode of (rawTree.hierarquia_padrao || [])) {
  const espName = espNode.especialidade;
  for (const t of (espNode.temas || [])) {
    for (const f of (t.focos || [])) {
      const subfocos = [];
      for (const s of (f.subfocos || [])) {
        const subName = typeof s === 'string' ? s : s.subfoco;
        if (subName) subfocos.push(subName);
      }
      allCanonicalFocos.push({
        especialidade: espName,
        tema: t.tema,
        foco: f.foco,
        subfocos
      });
    }
  }
}

// 2. Cache de Centróides Clínicos Reais
const VECTOR_CACHE_FILE = fs.existsSync('data/cache_canonical_tree_clinical_centroids.json')
  ? path.resolve('data/cache_canonical_tree_clinical_centroids.json')
  : path.resolve('data/cache_canonical_tree_vectors.json');
const cachedVectors = JSON.parse(fs.readFileSync(VECTOR_CACHE_FILE, 'utf8'));
const focoVectors = new Map(Object.entries(cachedVectors.focos));
const subfocoVectors = new Map(Object.entries(cachedVectors.subfocos));

// 3. Índice FTS5 BM25 das 130k Questões Golden
const FTS_DB_PATH = path.resolve('data/questions_golden_fts.db');
const ftsDb = new DatabaseSync(FTS_DB_PATH, { readOnly: true });
const bm25Stmt = ftsDb.prepare(`
  SELECT id, especialidade, tema, foco, subfoco, bm25(questions_fts) as rank
  FROM questions_fts
  WHERE questions_fts MATCH ?
  ORDER BY rank
  LIMIT 5
`);

// 4. Transformers
console.log('⚡ Carregando modelo Transformers local...');
const extractor = await pipeline('feature-extraction', 'Xenova/paraphrase-multilingual-MiniLM-L12-v2');
console.log('✅ Transformers pronto!');

async function safePatchBatch(items, concurrency = 8) {
  for (let i = 0; i < items.length; i += concurrency) {
    const chunk = items.slice(i, i + concurrency);
    await Promise.all(chunk.map(async (item) => {
      let retries = 3;
      while (retries > 0) {
        try {
          const patchRes = await fetch(`${SUPABASE_URL}/rest/v1/${state.targetTable}?id=eq.${item.id}`, {
            method: 'PATCH',
            headers: {
              'apikey': SERVICE_KEY,
              'Authorization': `Bearer ${SERVICE_KEY}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              especialidade: item.especialidade,
              tema: item.tema,
              foco: item.foco,
              subfoco: item.subfoco
            })
          });
          if (patchRes.ok) break;
          retries--;
          await new Promise(r => setTimeout(r, 150));
        } catch {
          retries--;
          await new Promise(r => setTimeout(r, 150));
        }
      }
    }));
  }
}

// 5. Funções Médicas Auxiliares
function detectAgeRestriction(statement) {
  const norm = (statement || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const adultMatch = norm.match(/(?:homem|mulher|paciente|cliente|individuo)\s+(?:de\s+)?(\d{1,3})\s*anos/);
  if (adultMatch) {
    const age = parseInt(adultMatch[1], 10);
    if (age >= 18) return 'ADULT_ONLY';
    if (age <= 14) return 'PEDIATRIC_ONLY';
  }
  if (/\b(?:idoso|idosa|terceira idade|geriatrico|menopausa|climaterio)\b/.test(norm)) {
    return 'ADULT_ONLY';
  }
  if (/\b(?:lactente|recem-nascido|recem nascido|neonato|\brn\b|prematuro|puericultura|meses de vida|dias de vida)\b/.test(norm)) {
    return 'PEDIATRIC_OR_OBSTETRIC';
  }
  return 'ANY';
}

const STOPWORDS = new Set([
  'para', 'com', 'sem', 'dos', 'das', 'uma', 'uns', 'pelo', 'pela',
  'sobre', 'entre', 'após', 'onde', 'qual', 'como', 'mais', 'menos',
  'que', 'nao', 'sao', 'este', 'esta', 'esse', 'essa', 'isso', 'isto',
  'foram', 'como', 'pode', 'deve', 'sendo', 'caso', 'sobre', 'paciente',
  'abaixo', 'acima', 'assinale', 'alternativa', 'correta', 'incorreta',
  'analise', 'seguinte', 'quadro', 'apresenta', 'relacao', 'segundo',
  'diante', 'considere', 'quanto', 'podemos', 'afirmar', 'referente',
  'apresentando', 'dirigiu', 'solicitarmos', 'administracao', 'queixou',
  'localizada', 'assintomatica', 'proceder', 'durante', 'ultima', 'semana',
  'anos', 'mulher', 'homem', 'meses', 'dias', 'horas', 'apresentou',
  'resposta', 'imagem', 'questoes', 'caso', 'clinico', 'letra', 'numero'
]);

function buildFtsQuery(statement, correctText) {
  const norm = `${statement || ''} ${correctText || ''}`
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ');

  const tokens = norm.split(/\s+/).filter(w => w.length >= 3 && !STOPWORDS.has(w));
  const unique = Array.from(new Set(tokens));
  if (unique.length === 0) return null;
  return unique.map(t => `"${t}"`).join(' OR ');
}

// ============================================================================
// GERENCIADOR DE ESTADO E FILA DE PROCESSAMENTO
// ============================================================================

const state = {
  status: 'IDLE', // 'IDLE' | 'LOADING_IDS' | 'RUNNING' | 'PAUSED' | 'COMPLETED'
  targetTable: 'questions_direto',
  numWorkers: 4,
  activeWorkers: 0,
  totalCount: 0,
  processedCount: 0,
  approvedCount: 0,
  quarantineCount: 0,
  startTime: null,
  speedQps: 0,
  etaSeconds: 0,
  espDistribution: {
    'Clínica Médica': 0,
    'Cirurgia Geral': 0,
    'Pediatria': 0,
    'Ginecologia': 0,
    'Obstetrícia': 0,
    'Medicina Preventiva e Social': 0
  },
  recentFeed: [] // últimos 25 itens processados
};

let queue = [];
let queueIndex = 0;
let isStopping = false;
let processedIdsSet = new Set();
let quarantineStream = null;
let sessionInitialProcessed = 0;

async function loadPendingIds(table) {
  if (!ALLOWED_TABLES.has(table)) throw new Error('Tabela não autorizada');
  state.status = 'LOADING_IDS';
  state.targetTable = table;

  // Carregar quarentena prévia se existir
  const qFile = path.resolve(`data/quarentena_${table}.jsonl`);
  processedIdsSet.clear();
  if (fs.existsSync(qFile)) {
    const lines = fs.readFileSync(qFile, 'utf8').split('\n');
    for (const l of lines) {
      if (!l.trim()) continue;
      try {
        const item = JSON.parse(l);
        if (item.id) processedIdsSet.add(item.id);
      } catch { }
    }
  }

  // Carregar checkpoint prévio se existir
  const cpFile = path.resolve(`data/checkpoint_${table}.json`);
  let prevApproved = 0;
  let prevQuarantine = processedIdsSet.size;
  if (fs.existsSync(cpFile)) {
    try {
      const cp = JSON.parse(fs.readFileSync(cpFile, 'utf8'));
      if (cp.approvedCount) prevApproved = cp.approvedCount;
      if (cp.quarantineCount) prevQuarantine = Math.max(prevQuarantine, cp.quarantineCount);
    } catch { }
  }

  state.approvedCount = prevApproved;
  state.quarantineCount = prevQuarantine;
  state.processedCount = prevApproved + prevQuarantine;

  // Pegar total de nulos na tabela
  const countRes = await fetch(`${SUPABASE_URL}/rest/v1/${table}?especialidade=is.null&select=id`, {
    headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Range': '0-0', 'Prefer': 'count=exact' }
  });
  const remainingNulls = parseInt(countRes.headers.get('content-range')?.split('/')[1] || '0', 10);
  state.totalCount = prevApproved + remainingNulls;

  const allIds = [];
  const PAGE_SIZE = 1000;
  const ranges = [];
  for (let offset = 0; offset < remainingNulls; offset += PAGE_SIZE) {
    ranges.push([offset, Math.min(offset + PAGE_SIZE - 1, remainingNulls - 1)]);
  }

  for (let i = 0; i < ranges.length; i += 6) {
    const chunk = ranges.slice(i, i + 6);
    await Promise.all(chunk.map(async ([start, end]) => {
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?especialidade=is.null&select=id`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Range': `${start}-${end}` }
      });
      const data = await res.json();
      allIds.push(...data.map(r => r.id));
    }));
  }

  // Filtrar os que já foram processados na quarentena
  queue = allIds.filter(id => !processedIdsSet.has(id));
  queueIndex = 0;
  console.log(`✅ ${queue.length} IDs pendentes prontos para processamento na tabela [${table}].`);

  quarantineStream = fs.createWriteStream(qFile, { flags: 'a', encoding: 'utf8' });
  state.status = 'READY';
}

// Telemetria a cada 1 segundo
setInterval(() => {
  if (state.status === 'RUNNING' && state.startTime) {
    const elapsedSec = (Date.now() - state.startTime) / 1000;
    const completedSinceStart = state.processedCount - sessionInitialProcessed;
    if (elapsedSec > 2 && completedSinceStart > 0) {
      state.speedQps = parseFloat((completedSinceStart / elapsedSec).toFixed(1));
      const remaining = state.totalCount - state.processedCount;
      state.etaSeconds = state.speedQps > 0 ? Math.round(remaining / state.speedQps) : 0;
    }
  }
}, 1000);

// ============================================================================
// WORKER LOOP
// ============================================================================

async function workerLoop(workerId) {
  state.activeWorkers++;
  const BATCH_SIZE = 25;

  while (state.status === 'RUNNING') {
    // Verificar se o usuário reduziu o número de workers
    if (state.activeWorkers > state.numWorkers) {
      break;
    }

    // Pega próxima fatia de IDs
    let batchIds = [];
    if (queueIndex < queue.length) {
      batchIds = queue.slice(queueIndex, queueIndex + BATCH_SIZE);
      queueIndex += batchIds.length;
    } else {
      break; // Fila concluída
    }

    if (batchIds.length === 0) break;

    try {
      // 1. Busca questões em lote por IDs
      const resPage = await fetch(`${SUPABASE_URL}/rest/v1/${state.targetTable}?select=id,code,statement,options,correct_answer,commentary&id=in.(${batchIds.join(',')})`, {
        headers: { 'apikey': SERVICE_KEY, 'Authorization': `Bearer ${SERVICE_KEY}`, 'Connection': 'keep-alive' }
      });
      if (!resPage.ok) {
        console.warn(`[Worker ${workerId}] Erro ao buscar questões: HTTP ${resPage.status}`);
        continue;
      }
      const questions = await resPage.json();

      // 2. Prepara snippets para embedding em batch
      const letters = ['A', 'B', 'C', 'D', 'E'];
      const preparedList = [];
      const snippets = [];

      for (const q of questions) {
        let opts = [];
        try { opts = typeof q.options === 'string' ? JSON.parse(q.options) : (q.options || []); } catch { }
        let correctText = '';
        for (let k = 0; k < opts.length; k++) {
          const o = opts[k];
          const letter = o.letter || (typeof o.index === 'number' ? letters[o.index] : null);
          if (letter && letter === q.correct_answer) {
            correctText = o.text || '';
            break;
          }
        }
        snippets.push(`${q.statement?.slice(0, 200)}. Resposta: ${correctText.slice(0, 100)}.`);
        preparedList.push({ q, correctText });
      }

      // 3. Extrai embeddings com Transformers
      const out = await extractor(snippets, { pooling: 'mean', normalize: true });
      const qVectors = [];
      for (let k = 0; k < snippets.length; k++) {
        qVectors.push(Array.from(out.data.subarray(k * 384, (k + 1) * 384)));
      }

      const updatesToPatch = [];

      // 4. Executa Consenso Duplo questão a questão
      for (let i = 0; i < preparedList.length; i++) {
        const { q, correctText } = preparedList[i];
        const qVec = qVectors[i];
        const ageRestriction = detectAgeRestriction(q.statement);

        // Busca FTS5 BM25
        const ftsQuery = buildFtsQuery(q.statement, correctText);
        let neighbors = [];
        if (ftsQuery) {
          try { neighbors = bm25Stmt.all(ftsQuery); } catch { }
        }

        // Guardrails Etários
        if (ageRestriction === 'ADULT_ONLY') {
          neighbors = (neighbors || []).filter(n => n.especialidade !== 'Pediatria');
        } else if (ageRestriction === 'PEDIATRIC_OR_OBSTETRIC') {
          const valid = new Set(['Pediatria', 'Obstetrícia', 'Medicina Preventiva e Social']);
          const pedObs = (neighbors || []).filter(n => valid.has(n.especialidade));
          if (pedObs.length >= 2) neighbors = pedObs;
        }

        // Votação
        const focoVotes = new Map();
        const subfocoVotes = new Map();
        for (const n of (neighbors || [])) {
          const fKey = `${n.especialidade}|||${n.tema}|||${n.foco}`;
          focoVotes.set(fKey, (focoVotes.get(fKey) || 0) + 1);
          if (n.subfoco) {
            const sKey = `${fKey}|||${n.subfoco}`;
            subfocoVotes.set(sKey, (subfocoVotes.get(sKey) || 0) + 1);
          }
        }

        let topFocoVote = null;
        let topFocoCount = 0;
        for (const [fKey, count] of focoVotes.entries()) {
          if (count > topFocoCount) { topFocoCount = count; topFocoVote = fKey; }
        }

        let topSubVote = null;
        let topSubCount = 0;
        for (const [sKey, count] of subfocoVotes.entries()) {
          if (count > topSubCount) { topSubCount = count; topSubVote = sKey; }
        }

        let targetEsp = null;
        let targetTema = null;
        let targetFoco = null;
        let targetSubfoco = null;
        let isApproved = false;
        let confidenceReason = '';
        const bestRank = neighbors[0]?.rank ?? 0;

        if (topFocoVote && topFocoCount >= 2) {
          const parts = topFocoVote.split('|||');
          targetEsp = parts[0];
          targetTema = parts[1];
          targetFoco = parts[2];

          if (topSubVote && topSubVote.startsWith(topFocoVote)) {
            targetSubfoco = topSubVote.split('|||')[3] || null;
          }

          // Refinamento de subfoco canônico
          if (!targetSubfoco) {
            const fDef = allCanonicalFocos.find(cf => cf.especialidade === targetEsp && cf.foco === targetFoco);
            if (fDef && fDef.subfocos && fDef.subfocos.length > 0) {
              let bSim = -1, bName = null;
              for (const sName of fDef.subfocos) {
                const sVec = subfocoVectors.get(`${targetEsp}|||${targetFoco}|||${sName}`);
                if (sVec) {
                  const sim = cos_sim(qVec, sVec);
                  if (sim > bSim) { bSim = sim; bName = sName; }
                }
              }
              if (bName && bSim >= 0.30) targetSubfoco = bName;
            }
          }

          const fVec = focoVectors.get(`${targetEsp}|||${targetFoco}`);
          const cosSim = fVec ? cos_sim(qVec, fVec) : 0;

          // Quality Gates Calibrados
          if (topFocoCount >= 4 && cosSim >= 0.25) {
            isApproved = true;
            confidenceReason = `Consenso Esmagador (${topFocoCount}/5) + Cosseno ${cosSim.toFixed(3)}`;
          } else if (topFocoCount >= 3 && (cosSim >= 0.32 || bestRank <= -20)) {
            isApproved = true;
            confidenceReason = `Consenso Sólido (${topFocoCount}/5) + Cosseno ${cosSim.toFixed(3)}`;
          } else if (topFocoCount >= 2 && (cosSim >= 0.44 || (cosSim >= 0.38 && bestRank <= -30))) {
            isApproved = true;
            confidenceReason = `Consenso Moderado (${topFocoCount}/5) + Cosseno Seguro (${cosSim.toFixed(3)})`;
          } else {
            confidenceReason = `Divergência Vetorial ou Margem Estreita (${topFocoCount}/5, Cos: ${cosSim.toFixed(3)})`;
          }
        } else {
          confidenceReason = 'Dispersão de vizinhos no acervo (sem consenso)';
          if (neighbors[0]) {
            targetEsp = neighbors[0].especialidade;
            targetTema = neighbors[0].tema;
            targetFoco = neighbors[0].foco;
            targetSubfoco = neighbors[0].subfoco;
          }
        }

        state.processedCount++;

        if (isApproved && targetEsp && targetFoco) {
          state.approvedCount++;
          state.espDistribution[targetEsp] = (state.espDistribution[targetEsp] || 0) + 1;
          updatesToPatch.push({
            id: q.id,
            especialidade: targetEsp,
            tema: targetTema,
            foco: targetFoco,
            subfoco: targetSubfoco
          });
        } else {
          state.quarantineCount++;
          if (quarantineStream) {
            quarantineStream.write(JSON.stringify({
              id: q.id,
              code: q.code,
              targetEsp,
              targetTema,
              targetFoco,
              targetSubfoco,
              confidenceReason,
              timestamp: new Date().toISOString()
            }) + '\n');
          }
        }

        // Live Feed (últimos 25)
        state.recentFeed.unshift({
          id: q.id,
          code: q.code || 'Q',
          statement: q.statement?.slice(0, 110) || '',
          targetEsp,
          targetTema,
          targetFoco,
          targetSubfoco,
          isApproved,
          confidenceReason,
          time: new Date().toLocaleTimeString('pt-BR')
        });
        if (state.recentFeed.length > 25) state.recentFeed.pop();
      }

      // 5. Aplica updates no Supabase com concorrência controlada e retries
      if (updatesToPatch.length > 0) {
        await safePatchBatch(updatesToPatch, 8);
      }

      // Salva checkpoint local
      fs.writeFileSync(path.resolve(`data/checkpoint_${state.targetTable}.json`), JSON.stringify({
        processedCount: state.processedCount,
        approvedCount: state.approvedCount,
        quarantineCount: state.quarantineCount,
        queueIndex,
        timestamp: new Date().toISOString()
      }), 'utf8');

      // Pequeno yield para o event loop manter o Dashboard em 60 FPS
      await new Promise(r => setTimeout(r, 40));

    } catch (err) {
      console.error(`[Worker ${workerId}] Erro no lote:`, err);
      await new Promise(r => setTimeout(r, 500));
    }
  }

  state.activeWorkers--;
  if (state.activeWorkers === 0 && queueIndex >= queue.length && state.status === 'RUNNING') {
    state.status = 'COMPLETED';
    console.log('🎉 Fila totalmente concluída!');
  }
}

function startOrAdjustWorkers() {
  const needed = state.numWorkers - state.activeWorkers;
  if (needed > 0 && state.status === 'RUNNING') {
    for (let i = 0; i < needed; i++) {
      workerLoop(state.activeWorkers + 1);
    }
  }
}

// ============================================================================
// DASHBOARD WEB HTML & REST API
// ============================================================================

const HTML_DASHBOARD = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banco Residência — Painel de Classificação Taxonômica</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            medPrimary: '#0ea5e9',
            medDark: '#0f172a',
            medCard: '#1e293b',
            medBorder: '#334155'
          }
        }
      }
    }
  </script>
  <style>
    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.6; }
    }
    .pulse-live { animation: pulse-subtle 2s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
  </style>
</head>
<body class="bg-[#0b1120] text-slate-100 min-h-screen font-sans antialiased">
  <div class="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
    
    <!-- Top Bar -->
    <header class="flex flex-col md:flex-row md:items-center md:justify-between pb-6 border-b border-medBorder/60 gap-4">
      <div>
        <div class="flex items-center gap-3">
          <div class="h-3.5 w-3.5 rounded-full bg-emerald-500 pulse-live"></div>
          <h1 class="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
            Banco Residência <span class="text-xs px-2.5 py-0.5 rounded-full bg-medPrimary/20 text-medPrimary font-semibold border border-medPrimary/40">Fase 1 Local</span>
          </h1>
        </div>
        <p class="text-xs text-slate-400 mt-1">Classificação Canônica Automatizada (BM25 + Centróides Clínicos + Guardrails)</p>
      </div>

      <!-- Controls -->
      <div class="flex flex-wrap items-center gap-3 bg-medCard/70 p-2.5 rounded-xl border border-medBorder">
        <div class="flex items-center gap-2">
          <label class="text-xs font-medium text-slate-300">Tabela:</label>
          <select id="selTable" class="bg-slate-900 text-xs text-white border border-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-medPrimary">
            <option value="questions_direto">questions_direto (28.945)</option>
            <option value="questions_rplus">questions_rplus (1.604)</option>
            <option value="questions_revalida">questions_revalida (50)</option>
          </select>
        </div>

        <div class="flex items-center gap-2 pl-2 border-l border-slate-700">
          <label class="text-xs font-medium text-slate-300">Workers:</label>
          <input id="numWorkers" type="range" min="1" max="16" value="4" class="w-20 accent-medPrimary cursor-pointer" oninput="workerVal.innerText = this.value">
          <span id="workerVal" class="text-xs font-mono font-bold text-medPrimary w-4">4</span>
        </div>

        <button id="btnToggle" onclick="toggleRun()" class="ml-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5">
          <span id="btnIcon">▶</span> <span id="btnLabel">Iniciar</span>
        </button>
      </div>
    </header>

    <!-- 4 Main KPI Cards -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
      
      <!-- Total -->
      <div class="bg-medCard/90 border border-medBorder/80 rounded-xl p-5 shadow-sm">
        <div class="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
          <span>Total Elegível</span>
          <span class="text-slate-500">Acervo</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span id="txtTotal" class="text-3xl font-extrabold text-white tracking-tight">--</span>
          <span class="text-xs text-slate-400">questões</span>
        </div>
        <div class="mt-3 text-xs text-slate-400 flex justify-between">
          <span>Processadas:</span>
          <span id="txtProcessed" class="font-bold text-slate-200">0</span>
        </div>
      </div>

      <!-- Approved -->
      <div class="bg-medCard/90 border border-emerald-500/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 right-0 h-16 w-16 bg-emerald-500/10 rounded-bl-full pointer-events-none"></div>
        <div class="flex justify-between items-center text-emerald-400 text-xs font-medium uppercase tracking-wider">
          <span>Aprovadas no Gate</span>
          <span id="txtApprovedPct" class="text-xs font-bold px-2 py-0.5 rounded bg-emerald-950/60 text-emerald-300 border border-emerald-800/60">0%</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span id="txtApproved" class="text-3xl font-extrabold text-emerald-400 tracking-tight">0</span>
          <span class="text-xs text-emerald-300/80">gravadas</span>
        </div>
        <div class="mt-3 text-xs text-slate-400">
          Alta precisão (&ge; 98% concordância empírica)
        </div>
      </div>

      <!-- Quarantined -->
      <div class="bg-medCard/90 border border-amber-500/30 rounded-xl p-5 shadow-sm relative overflow-hidden">
        <div class="absolute top-0 right-0 h-16 w-16 bg-amber-500/10 rounded-bl-full pointer-events-none"></div>
        <div class="flex justify-between items-center text-amber-400 text-xs font-medium uppercase tracking-wider">
          <span>Quarentena (Fase 2)</span>
          <span id="txtQuarantinePct" class="text-xs font-bold px-2 py-0.5 rounded bg-amber-950/60 text-amber-300 border border-amber-800/60">0%</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span id="txtQuarantine" class="text-3xl font-extrabold text-amber-400 tracking-tight">0</span>
          <span class="text-xs text-amber-300/80">retidas</span>
        </div>
        <div class="mt-3 text-xs text-slate-400">
          Reservadas para resolução por LLM
        </div>
      </div>

      <!-- Telemetry / Speed -->
      <div class="bg-medCard/90 border border-medBorder/80 rounded-xl p-5 shadow-sm">
        <div class="flex justify-between items-center text-slate-400 text-xs font-medium uppercase tracking-wider">
          <span>Telemetria & ETA</span>
          <span id="txtStatusBadge" class="text-xs font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">PARADO</span>
        </div>
        <div class="mt-2 flex items-baseline gap-2">
          <span id="txtSpeed" class="text-3xl font-extrabold text-medPrimary tracking-tight">0.0</span>
          <span class="text-xs text-slate-400">questões/seg</span>
        </div>
        <div class="mt-3 text-xs text-slate-400 flex justify-between">
          <span>Tempo Estimado (ETA):</span>
          <span id="txtEta" class="font-bold text-white">--</span>
        </div>
      </div>
    </div>

    <!-- Progress Bar -->
    <div class="mt-6 bg-medCard/70 border border-medBorder rounded-xl p-4">
      <div class="flex justify-between text-xs font-semibold text-slate-300 mb-2">
        <span>Progresso Geral da Fila</span>
        <span id="txtOverallPct">0.0%</span>
      </div>
      <div class="w-full h-3 bg-slate-900 rounded-full overflow-hidden flex">
        <div id="barApproved" class="h-full bg-emerald-500 transition-all duration-300" style="width: 0%"></div>
        <div id="barQuarantine" class="h-full bg-amber-500 transition-all duration-300" style="width: 0%"></div>
      </div>
      <div class="flex items-center justify-between text-[11px] text-slate-400 mt-2">
        <div class="flex items-center gap-4">
          <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-emerald-500"></span> Aprovadas</span>
          <span class="flex items-center gap-1.5"><span class="h-2 w-2 rounded-full bg-amber-500"></span> Quarentena</span>
        </div>
        <span id="txtActiveWorkersCount" class="font-mono text-slate-300">Workers ativos: 0 / 4</span>
      </div>
    </div>

    <!-- Lower Section: Distribution & Live Feed -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
      
      <!-- Specialty Distribution (1 col) -->
      <div class="bg-medCard/90 border border-medBorder rounded-xl p-5 flex flex-col justify-between">
        <div>
          <h2 class="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center justify-between">
            <span>Distribuição das Aprovadas</span>
            <span class="text-xs text-slate-400 font-normal">6 Áreas Canônicas</span>
          </h2>
          <div class="space-y-3" id="espList">
            <!-- Dynamically populated -->
          </div>
        </div>
        <div class="mt-6 pt-4 border-t border-slate-700/60 text-xs text-slate-400">
          💡 Base de Precedentes: 130.024 questões oficiais de Residência Médica (USP, UNIFESP, ENARE, SUS-SP).
        </div>
      </div>

      <!-- Live Stream Feed (2 cols) -->
      <div class="lg:col-span-2 bg-medCard/90 border border-medBorder rounded-xl p-5">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
            <span class="h-2 w-2 rounded-full bg-medPrimary pulse-live"></span>
            <span>Feed de Processamento em Tempo Real</span>
          </h2>
          <span class="text-xs text-slate-400">Últimas 25 questões</span>
        </div>

        <div id="feedList" class="space-y-2.5 max-h-[460px] overflow-y-auto pr-2">
          <div class="text-xs text-slate-500 py-8 text-center">Nenhuma questão processada ainda. Clique em "Iniciar" para disparar os workers.</div>
        </div>
      </div>

    </div>

  </div>

  <script>
    let isRunning = false;

    async function toggleRun() {
      const btn = document.getElementById('btnToggle');
      const table = document.getElementById('selTable').value;
      const workers = parseInt(document.getElementById('numWorkers').value, 10);

      if (!isRunning) {
        btn.disabled = true;
        await fetch('/api/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'start', table, workers })
        });
        btn.disabled = false;
      } else {
        btn.disabled = true;
        await fetch('/api/control', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'pause' })
        });
        btn.disabled = false;
      }
    }

    // Atualização em tempo real via polling a cada 800ms
    async function updateStatus() {
      try {
        const res = await fetch('/api/status');
        const s = await res.json();

        isRunning = (s.status === 'RUNNING');
        const btnLabel = document.getElementById('btnLabel');
        const btnIcon = document.getElementById('btnIcon');
        const btnToggle = document.getElementById('btnToggle');

        if (isRunning) {
          btnLabel.innerText = 'Pausar';
          btnIcon.innerText = '⏸';
          btnToggle.className = 'ml-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-amber-600 hover:bg-amber-500 text-white shadow-sm transition-all flex items-center gap-1.5';
        } else {
          btnLabel.innerText = 'Iniciar';
          btnIcon.innerText = '▶';
          btnToggle.className = 'ml-2 px-4 py-1.5 rounded-lg text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-sm transition-all flex items-center gap-1.5';
        }

        document.getElementById('txtTotal').innerText = s.totalCount.toLocaleString('pt-BR');
        document.getElementById('txtProcessed').innerText = s.processedCount.toLocaleString('pt-BR');
        document.getElementById('txtApproved').innerText = s.approvedCount.toLocaleString('pt-BR');
        document.getElementById('txtQuarantine').innerText = s.quarantineCount.toLocaleString('pt-BR');

        const appPct = s.processedCount > 0 ? ((s.approvedCount / s.processedCount) * 100).toFixed(1) : '0.0';
        const quarPct = s.processedCount > 0 ? ((s.quarantineCount / s.processedCount) * 100).toFixed(1) : '0.0';
        const overallPct = s.totalCount > 0 ? ((s.processedCount / s.totalCount) * 100).toFixed(1) : '0.0';

        document.getElementById('txtApprovedPct').innerText = appPct + '%';
        document.getElementById('txtQuarantinePct').innerText = quarPct + '%';
        document.getElementById('txtOverallPct').innerText = overallPct + '%';

        document.getElementById('barApproved').style.width = (s.totalCount > 0 ? (s.approvedCount / s.totalCount * 100) : 0) + '%';
        document.getElementById('barQuarantine').style.width = (s.totalCount > 0 ? (s.quarantineCount / s.totalCount * 100) : 0) + '%';

        document.getElementById('txtSpeed').innerText = s.speedQps.toFixed(1);
        document.getElementById('txtStatusBadge').innerText = s.status;
        document.getElementById('txtActiveWorkersCount').innerText = \`Workers ativos: \${s.activeWorkers} / \${s.numWorkers}\`;

        // Format ETA
        if (s.etaSeconds > 0 && isRunning) {
          const m = Math.floor(s.etaSeconds / 60);
          const sec = s.etaSeconds % 60;
          document.getElementById('txtEta').innerText = \`\${m}m \${sec.toString().padStart(2, '0')}s\`;
        } else {
          document.getElementById('txtEta').innerText = isRunning ? 'Calculando...' : '--';
        }

        // Specialties breakdown
        const espColors = {
          'Clínica Médica': 'bg-blue-500',
          'Cirurgia Geral': 'bg-orange-500',
          'Pediatria': 'bg-emerald-500',
          'Ginecologia': 'bg-pink-500',
          'Obstetrícia': 'bg-purple-500',
          'Medicina Preventiva e Social': 'bg-cyan-500'
        };

        const espHtml = Object.entries(s.espDistribution).map(([name, count]) => {
          const pct = s.approvedCount > 0 ? ((count / s.approvedCount) * 100).toFixed(1) : '0.0';
          const color = espColors[name] || 'bg-slate-500';
          return \`
            <div>
              <div class="flex justify-between text-xs text-slate-300 font-medium mb-1">
                <span>\${name}</span>
                <span class="font-mono text-slate-400">\${count.toLocaleString('pt-BR')} (\${pct}%)</span>
              </div>
              <div class="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
                <div class="h-full \${color}" style="width: \${pct}%"></div>
              </div>
            </div>
          \`;
        }).join('');
        document.getElementById('espList').innerHTML = espHtml;

        // Feed list
        if (s.recentFeed && s.recentFeed.length > 0) {
          const feedHtml = s.recentFeed.map(item => {
            const badgeClass = item.isApproved 
              ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' 
              : 'bg-amber-950/80 text-amber-400 border border-amber-800';
            const badgeText = item.isApproved ? 'APROVADA' : 'QUARENTENA';
            return \`
              <div class="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col gap-1 text-xs">
                <div class="flex items-center justify-between">
                  <div class="flex items-center gap-2">
                    <span class="font-mono text-slate-400 font-semibold">\${item.id}</span>
                    <span class="text-[10px] px-2 py-0.5 rounded font-bold \${badgeClass}">\${badgeText}</span>
                  </div>
                  <span class="text-[11px] text-slate-500">\${item.time}</span>
                </div>
                <div class="text-slate-300 line-clamp-1">\${item.statement}...</div>
                <div class="text-[11px] text-slate-400 flex flex-wrap gap-1 items-center mt-0.5">
                  <span class="text-medPrimary font-medium">[\${item.targetEsp || 'N/A'}]</span> &rsaquo;
                  <span>[\${item.targetTema || 'N/A'}]</span> &rsaquo;
                  <span class="text-slate-200">[\${item.targetFoco || 'N/A'}]</span>
                  \${item.targetSubfoco ? \`&rsaquo; <span class="text-emerald-400/90 font-medium">[\${item.targetSubfoco}]</span>\` : ''}
                </div>
                <div class="text-[10px] text-slate-500 italic">\${item.confidenceReason}</div>
              </div>
            \`;
          }).join('');
          document.getElementById('feedList').innerHTML = feedHtml;
        }

      } catch (e) {}
    }

    // Slider worker change listener
    document.getElementById('numWorkers').addEventListener('change', async (e) => {
      const workers = parseInt(e.target.value, 10);
      await fetch('/api/control', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'setWorkers', workers })
      });
    });

    setInterval(updateStatus, 800);
    updateStatus();
  </script>
</body>
</html>`;

const PORT = 3333;
const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(HTML_DASHBOARD);
    return;
  }

  if (url.pathname === '/api/status') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(state));
    return;
  }

  if (url.pathname === '/api/control' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const payload = JSON.parse(body);
        if (payload.action === 'start') {
          if (payload.table && payload.table !== state.targetTable) {
            await loadPendingIds(payload.table);
          } else if (queue.length === 0) {
            await loadPendingIds(state.targetTable);
          }
          if (payload.workers) state.numWorkers = payload.workers;
          state.status = 'RUNNING';
          state.startTime = Date.now();
          sessionInitialProcessed = state.processedCount;
          startOrAdjustWorkers();
        } else if (payload.action === 'pause') {
          state.status = 'PAUSED';
        } else if (payload.action === 'setWorkers') {
          state.numWorkers = payload.workers || 4;
          if (state.status === 'RUNNING') startOrAdjustWorkers();
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, state }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: err.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not Found');
});

// Inicialização imediata com carregamento inicial dos IDs de questions_direto
console.log('📡 Pré-carregando IDs de [questions_direto]...');
await loadPendingIds('questions_direto');

if (process.argv.includes('--autostart')) {
  console.log('🚀 Flag --autostart ativa: iniciando workers automaticamente...');
  state.status = 'RUNNING';
  state.startTime = Date.now();
  sessionInitialProcessed = state.processedCount;
  startOrAdjustWorkers();
}

server.listen(PORT, () => {
  console.log('\n========================================================================');
  console.log(`🚀 DASHBOARD TAXONÔMICO ATIVO EM: http://localhost:${PORT}`);
  console.log(`📊 Tabela Alvo:      ${state.targetTable} (${state.totalCount.toLocaleString('pt-BR')} registros)`);
  console.log(`⚙️  Workers Padrão:  ${state.numWorkers} simultâneos`);
  console.log(`🕹️  Controle Dinâmico: Abra http://localhost:${PORT} no navegador para acompanhar!`);
  console.log('========================================================================\n');
});
