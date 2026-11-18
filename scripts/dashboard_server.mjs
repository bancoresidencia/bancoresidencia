import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';
import { DatabaseSync } from 'node:sqlite';

const PORT = 3005;
const STATE_PATH = path.resolve('data/pipeline_progress_state.json');
const SIGNAL_PATH = path.resolve('data/pipeline.signal');
const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const MACRO_STATS_PATH = path.resolve('data/macro_specialty_stats.json');
const PREVENTIVA_JSON_PATH = path.resolve('data/medicina_preventiva_final_questions.json');

let sqliteDb = null;
try {
  if (fs.existsSync(DB_PATH)) {
    sqliteDb = new DatabaseSync(DB_PATH, { readOnly: true });
  }
} catch (e) {
  console.warn('Aviso: SQLite local não pôde ser aberto em modo read-only:', e.message);
}

const SPECIALTY_MAP = {
  preventiva: { file: 'data/medicina_preventiva_final_questions.json', name: 'Medicina Preventiva', next: 'none' },
  cirurgia: { file: 'data/cirurgia_direto_questions.json', name: 'Cirurgia', next: 'clinica' },
  clinica: { file: 'data/clinica_medica_final_questions.json', name: 'Clínica Médica', next: 'cirurgia' },
  pediatria: { file: 'data/pediatria_direto_questions.json', name: 'Pediatria', next: 'clinica' },
  ginecologia: { file: 'data/ginecologia_direto_questions.json', name: 'Ginecologia', next: 'obstetricia' },
  obstetricia: { file: 'data/obstetricia_direto_questions.json', name: 'Obstetrícia', next: 'pediatria' }
};

let runnerProcess = null;
let preventivaMap = new Map();

function loadPreventivaQuestions() {
  if (fs.existsSync(PREVENTIVA_JSON_PATH)) {
    try {
      const arr = JSON.parse(fs.readFileSync(PREVENTIVA_JSON_PATH, 'utf8'));
      arr.forEach(q => {
        if (q.code) preventivaMap.set(q.code, q);
      });
    } catch { }
  }
}
loadPreventivaQuestions();

const LEDGER_PATH = path.resolve('data/paid_key_cumulative_ledger.json');

function getStatus() {
  let state = { status: 'IDLE' };
  if (fs.existsSync(STATE_PATH)) {
    try {
      state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    } catch {
      state = { status: 'ERROR_READING_STATE' };
    }
  }

  let priorUSD = 0.2733;
  let priorBRL = 1.58;
  let priorTokens = 449319;
  if (fs.existsSync(LEDGER_PATH)) {
    try {
      const ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
      priorUSD = ledger.priorSessionsCostUSD || 0;
      priorBRL = ledger.priorSessionsCostBRL || 0;
      priorTokens = ledger.priorSessionsTokens || 0;
    } catch {}
  }

  const sessUSD = (state.tokens && state.tokens.pricing && state.tokens.pricing.totalCostUSD) ? state.tokens.pricing.totalCostUSD : 0;
  const sessBRL = (state.tokens && state.tokens.pricing && state.tokens.pricing.totalCostBRL) ? state.tokens.pricing.totalCostBRL : 0;
  const sessTokens = (state.tokens && state.tokens.totalTokens) ? state.tokens.totalTokens : 0;

  state.cumulativeKeySpend = {
    totalCostUSD: parseFloat((priorUSD + sessUSD).toFixed(4)),
    totalCostBRL: parseFloat((priorBRL + sessBRL).toFixed(2)),
    totalTokens: priorTokens + sessTokens,
    sessionCostUSD: sessUSD,
    sessionCostBRL: sessBRL,
    sessionTokens: sessTokens
  };

  return state;
}

function getMacroStats() {
  const state = getStatus();
  const sessionProcessed = (state.status === 'RUNNING' || state.status === 'PAUSED' || state.status === 'COMPLETED' || state.status === 'STOPPED') ? (state.processedCount || 0) : 0;

  // Base Padrão-Ouro antes da sessão atual
  const baseGold = 112277;
  const liveTotalGold = baseGold + sessionProcessed;
  const basePreventivaGold = 612;
  const livePreventivaGold = basePreventivaGold + sessionProcessed;
  const totalPreventiva = 27383;
  const preventivaPct = ((livePreventivaGold / totalPreventiva) * 100).toFixed(1);
  const globalPct = ((liveTotalGold / 254167) * 100).toFixed(1);

  const specialties = [
    {
      name: 'Ginecologia',
      key: 'ginecologia',
      status: '98,8% CONCLUÍDA',
      doneCount: 15857,
      totalCount: 16052,
      coveragePct: 98.8,
    },
    {
      name: 'Obstetrícia',
      key: 'obstetricia',
      status: '93,8% CONCLUÍDA',
      doneCount: 16762,
      totalCount: 17863,
      coveragePct: 93.8,
    },
    {
      name: 'Pediatria',
      key: 'pediatria',
      status: '95,0% CONCLUÍDA',
      doneCount: 28435,
      totalCount: 29918,
      coveragePct: 95.0,
    },
    {
      name: 'Cirurgia Geral / Espec.',
      key: 'cirurgia',
      status: '60,4% CONCLUÍDA',
      doneCount: 17505,
      totalCount: 28987,
      coveragePct: 60.4,
    },
    {
      name: 'Clínica Médica',
      key: 'clinica',
      status: '57,3% DO DIRETO',
      doneCount: 33106,
      totalCount: 57764,
      coveragePct: 57.3,
    },
    {
      name: 'Medicina Preventiva',
      key: 'preventiva',
      status: 'EM PRODUÇÃO ATIVA',
      doneCount: livePreventivaGold,
      totalCount: totalPreventiva,
      coveragePct: parseFloat(preventivaPct),
    }
  ];

  return {
    totalPlatformQuestions: 254167,
    totalGoldCommentaries: liveTotalGold,
    livePreventivaGold,
    totalPreventiva,
    preventivaPct,
    globalCoveragePct: globalPct,
    sessionProcessed,
    specialties
  };
}

function parseExplanationsFromCommentary(commentary) {
  if (!commentary) return {};
  const map = {};
  const lines = commentary.split('\n');
  let currentLetter = null;
  let currentText = [];

  for (const line of lines) {
    const match = line.match(/^(?:Justificativa da alternativa|Alternativa)\s+([A-E])\s*:\s*(.*)/i);
    if (match) {
      if (currentLetter && currentText.length > 0) {
        map[currentLetter] = currentText.join(' ').trim();
      }
      currentLetter = match[1].toUpperCase();
      currentText = [match[2]];
    } else if (currentLetter) {
      if (line.match(/^(?:Principal Motivo de Erro|Take-Home Message|Evolução de Diretrizes|Referências):/i)) {
        map[currentLetter] = currentText.join(' ').trim();
        currentLetter = null;
        currentText = [];
      } else if (line.trim().length > 0) {
        currentText.push(line.trim());
      }
    }
  }
  if (currentLetter && currentText.length > 0) {
    map[currentLetter] = currentText.join(' ').trim();
  }
  return map;
}

function getQuestionDetail(code) {
  if (!code) return null;

  // 1. Tenta buscar no mapa da memória (Medicina Preventiva enriquecida)
  const memQ = preventivaMap.get(code);
  if (memQ && (memQ.commentary || memQ.eval)) {
    const evalData = memQ.eval ? memQ.eval.parsed : null;
    let opts = memQ.options || [];
    if (evalData && evalData.optionExplanations) {
      opts = opts.map(opt => ({
        ...opt,
        explanation: opt.explanation || evalData.optionExplanations[opt.letter] || ''
      }));
    }

    return {
      code: memQ.code,
      statement: memQ.statement,
      options: opts,
      correct_answer: (memQ.correctAnswer || memQ.correct_answer || (evalData ? evalData.suggestedCorrectAnswer : '')).toUpperCase().trim(),
      commentary: memQ.commentary || (evalData ? evalData.finalCommentary : ''),
      especialidade: memQ.especialidade || 'Medicina Preventiva',
      tema: memQ.tema,
      institution: memQ.institution,
      year: memQ.year,
      mainErrorReason: evalData ? evalData.mainErrorReason : '',
      takeHomeMessage: evalData ? evalData.takeHomeMessage : ''
    };
  }

  // 2. Consulta SQLite
  if (sqliteDb) {
    try {
      const row = sqliteDb.prepare(`
        SELECT code, statement, options, correct_answer, commentary, especialidade, tema, institution, year 
        FROM questions_curated_staging 
        WHERE code = ?
      `).get(code);

      if (row) {
        let options = row.options;
        if (typeof options === 'string') {
          try { options = JSON.parse(options); } catch { }
        }

        const hasAnyExplanation = Array.isArray(options) && options.some(o => o.explanation);
        if (!hasAnyExplanation && row.commentary) {
          const parsed = parseExplanationsFromCommentary(row.commentary);
          if (Array.isArray(options)) {
            options = options.map(o => ({
              ...o,
              explanation: parsed[o.letter] || ''
            }));
          }
        }

        return {
          code: row.code,
          statement: row.statement,
          options: options || [],
          correct_answer: (row.correct_answer || '').toUpperCase().trim(),
          commentary: row.commentary,
          especialidade: row.especialidade,
          tema: row.tema,
          institution: row.institution,
          year: row.year
        };
      }
    } catch (e) {
      console.warn('Erro ao consultar SQLite:', e.message);
    }
  }
  return null;
}

const ALLOWED_LOCAL_ORIGINS = new Set([
  `http://localhost:${PORT}`,
  `http://127.0.0.1:${PORT}`
]);

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const origin = req.headers.origin;
  if (origin && ALLOWED_LOCAL_ORIGINS.has(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Vary', 'Origin');
  }

  if (url.pathname === '/api/status') {
    return sendJson(res, getStatus());
  }

  if (url.pathname === '/api/macro-stats') {
    return sendJson(res, getMacroStats());
  }

  if (url.pathname === '/api/question-detail') {
    const code = url.searchParams.get('code');
    const detail = getQuestionDetail(code);
    if (!detail) {
      return sendJson(res, { error: 'Questão não encontrada no banco local.' }, 404);
    }
    return sendJson(res, detail);
  }

  // Ações de controle da esteira (bloqueia origens externas contra CSRF local)
  if (req.method === 'POST') {
    if (origin && !ALLOWED_LOCAL_ORIGINS.has(origin)) {
      return sendJson(res, { ok: false, message: 'Origem externa bloqueada.' }, 403);
    }

    if (url.pathname === '/api/action/start') {
      const state = getStatus();
      if (state.status === 'RUNNING') {
        return sendJson(res, { ok: false, message: 'A esteira já está em execução!' });
      }

      const specKey = url.searchParams.get('specialty') || 'preventiva';
      const spec = SPECIALTY_MAP[specKey] || SPECIALTY_MAP['preventiva'];
      const parsedWorkers = parseInt(url.searchParams.get('workers') || '20', 10);
      const safeWorkers = Number.isFinite(parsedWorkers) ? Math.min(32, Math.max(1, parsedWorkers)) : 20;
      const rawNext = url.searchParams.get('next') || spec.next;
      const safeNextSpec = (rawNext === 'none' || Object.prototype.hasOwnProperty.call(SPECIALTY_MAP, rawNext))
        ? rawNext
        : spec.next;

      if (fs.existsSync(SIGNAL_PATH)) fs.unlinkSync(SIGNAL_PATH);

      runnerProcess = spawn('node', [
        'scripts/produce_specialty_batch.mjs',
        `--file=${spec.file}`,
        `--specialty=${spec.name}`,
        '--model=gemini-3.1-flash-lite',
        '--paid',
        `--workers=${safeWorkers}`,
        `--next=${safeNextSpec}`
      ], {
        stdio: 'inherit',
        detached: false
      });

      return sendJson(res, {
        ok: true,
        message: `Esteira iniciada para ${spec.name} com ${safeWorkers} workers em gemini-3.1-flash-lite!`
      });
    }

    if (url.pathname === '/api/action/pause') {
      fs.writeFileSync(SIGNAL_PATH, 'pause', 'utf8');
      return sendJson(res, { ok: true, message: 'Sinal de PAUSA enviado para a esteira.' });
    }

    if (url.pathname === '/api/action/resume') {
      if (fs.existsSync(SIGNAL_PATH)) fs.unlinkSync(SIGNAL_PATH);
      return sendJson(res, { ok: true, message: 'Sinal de RETOMADA enviado para a esteira.' });
    }

    if (url.pathname === '/api/action/stop') {
      fs.writeFileSync(SIGNAL_PATH, 'stop', 'utf8');
      return sendJson(res, { ok: true, message: 'Sinal de PARADA enviado para a esteira.' });
    }
  }

  // Frontend HTML do Dashboard
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0'
    });
    res.end(renderDashboardHtml());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

function renderDashboardHtml() {
  const state = getStatus();
  const macro = getMacroStats();

  const initialSpecialty = state.specialty || 'Medicina Preventiva';
  const initialTotal = state.totalToProcess || 18714;
  const initialProcessed = state.processedCount || 0;
  const initialRemaining = Math.max(0, initialTotal - initialProcessed);
  const initialPct = state.progressPercent || ((initialProcessed / initialTotal) * 100).toFixed(1);
  const initialCostUSD = state.tokens && state.tokens.pricing ? state.tokens.pricing.totalCostUSD.toFixed(2) : '0.00';
  const initialCostBRL = state.tokens && state.tokens.pricing ? state.tokens.pricing.totalCostBRL.toFixed(2) : '0.00';
  const initialTokens = state.tokens ? state.tokens.totalTokens.toLocaleString('pt-BR') : '0';
  const initialVelocity = state.velocity ? state.velocity.questionsPerMinute.toFixed(1) : '340.0';
  const initialSuccesses = state.successCount || initialProcessed;
  const initialErrors = state.errorCount || 0;
  const initialEta = state.velocity ? state.velocity.etaFormatted : '50m';

  const macroListHtml = macro.specialties.map(s => {
    const isPreventiva = s.key === 'preventiva';
    const badgeBg = isPreventiva
      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
      : (s.coveragePct >= 90 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30');
    const barBg = isPreventiva ? 'bg-indigo-500' : (s.coveragePct >= 90 ? 'bg-emerald-500' : 'bg-amber-500');

    return `<div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">
      <div class="flex items-center justify-between mb-1">
        <strong class="text-white font-semibold text-xs">${s.name}</strong>
        <span class="text-[10px] font-bold px-2 py-0.5 rounded border ${badgeBg}">${s.status}</span>
      </div>
      <div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">
        <div class="${barBg} h-full rounded-full transition-all duration-500" style="width: ${s.coveragePct}%"></div>
      </div>
      <div class="flex justify-between text-[11px] text-slate-400">
        <span><strong>${(s.doneCount || 0).toLocaleString('pt-BR')}</strong> / ${(s.totalCount || 0).toLocaleString('pt-BR')}</span>
        <span class="font-bold text-slate-200">${s.coveragePct}% Ouro</span>
      </div>
    </div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <title>Banco Residência · Command Center Padrão-Ouro</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  
  <!-- Tailwind CSS & FontAwesome & Chart.js & Marked -->
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600;700&display=swap" rel="stylesheet">
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>

  <style>
    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.02); }
    }
    .pulse-glow { animation: pulse-subtle 2.5s infinite ease-in-out; }
    
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0A0E17; }
    ::-webkit-scrollbar-thumb { background: #1F293D; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #374151; }

    .card-glass {
      background: linear-gradient(135deg, rgba(17, 24, 39, 0.85) 0%, rgba(15, 23, 42, 0.75) 100%);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
    }
    
    .opt-exp strong {
      color: #FBBF24 !important;
      font-weight: 800 !important;
      background: rgba(245, 158, 11, 0.15) !important;
      padding: 1px 5px !important;
      border-radius: 4px !important;
      border: 1px solid rgba(245, 158, 11, 0.3) !important;
    }

    #inspectorModal[style*="display: none"] {
      pointer-events: none !important;
    }
  </style>
</head>

<body class="bg-[#0A0E17] text-slate-100 font-sans min-h-screen antialiased selection:bg-indigo-500 selection:text-white">

  <!-- Container Principal -->
  <div class="max-w-[1550px] mx-auto p-4 sm:p-6 lg:p-8 space-y-6">

    <!-- Header & Barra de Comando Superior -->
    <header class="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-800 pb-5">
      
      <!-- Título & Identidade -->
      <div>
        <div class="flex items-center gap-3">
          <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-emerald-400 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <i class="fa-solid fa-brain text-white text-xl"></i>
          </div>
          <div>
            <div class="flex items-center gap-2.5">
              <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white">Banco Residência</h1>
              <span class="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">Command Center</span>
              <span id="badgeStatus" class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 pulse-glow">
                <span class="w-2 h-2 rounded-full bg-emerald-400"></span>
                <span id="txtStatus">${state.status || 'OPERANDO'}</span>
              </span>
              <span id="txtHeartbeat" class="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
                <span class="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                <span id="lblClock">Ao Vivo</span>
              </span>
            </div>
            <p class="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
              <span>Modelo: <strong id="txtCurrentModel" class="text-indigo-300 font-mono">gemini-3.1-flash-lite</strong></span>
              <span class="text-slate-600">•</span>
              <span class="text-emerald-400 font-mono text-[11px]"><i class="fa-solid fa-key"></i> Chave Paga (...hnAb7A)</span>
              <span class="text-slate-600">•</span>
              <span class="text-slate-400 text-[11px]">20 Workers Ativos ($0.25 in / $1.50 out)</span>
            </p>
          </div>
        </div>
      </div>

      <!-- Controles Rápidos da Esteira -->
      <div class="flex flex-wrap items-center gap-3 bg-slate-900/80 p-2.5 rounded-2xl border border-slate-800/80 shadow-2xl relative z-20">
        
        <!-- Seletor de Especialidade -->
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Especialidade Alvo</label>
          <select id="selSpecialty" class="bg-[#1A2338] border border-slate-700 text-xs rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500">
            <option value="preventiva" selected>Medicina Preventiva (Ativa)</option>
            <option value="cirurgia">Cirurgia Geral</option>
            <option value="clinica">Clínica Médica</option>
            <option value="pediatria">Pediatria</option>
            <option value="ginecologia">Ginecologia</option>
            <option value="obstetricia">Obstetrícia</option>
          </select>
        </div>

        <!-- Concorrência de Workers -->
        <div class="flex flex-col gap-1">
          <label class="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Workers Concorrentes</label>
          <select id="selWorkers" class="bg-[#1A2338] border border-slate-700 text-xs rounded-xl px-3 py-2 text-white font-medium focus:outline-none focus:border-indigo-500">
            <option value="20" selected>20 Workers (Ultra ~220-370 q/min)</option>
            <option value="10">10 Workers (Rápido ~110 q/min)</option>
            <option value="40">40 Workers (Turbo Máximo ~440 q/min)</option>
            <option value="4">4 Workers (Econômico ~45 q/min)</option>
          </select>
        </div>

        <div class="flex items-end gap-1.5 pt-4 relative z-30">
          <button id="btnStart" onclick="triggerAction('start')" title="Iniciar Processamento" class="cursor-pointer active:scale-95 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20">
            <i class="fa-solid fa-play"></i> Iniciar
          </button>
          <button id="btnPause" onclick="triggerAction('pause')" title="Pausar Esteira" class="cursor-pointer active:scale-95 bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5">
            <i class="fa-solid fa-pause"></i> Pausar
          </button>
          <button id="btnResume" onclick="triggerAction('resume')" title="Retomar Esteira" class="cursor-pointer active:scale-95 bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5">
            <i class="fa-solid fa-rotate-right"></i> Retomar
          </button>
          <button id="btnStop" onclick="triggerAction('stop')" title="Parar Esteira" class="cursor-pointer active:scale-95 bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition flex items-center gap-1.5">
            <i class="fa-solid fa-stop"></i> Parar
          </button>
        </div>

      </div>

    </header>

    <!-- Cards Principais de Métricas (Grid 4 colunas) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Card 1: Especialidade & Progresso (Lote + Acervo Cumulativo) -->
      <div class="card-glass p-5 rounded-2xl shadow-xl flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between text-xs font-semibold text-slate-400 mb-1">
            <span>Especialidade Ativa</span>
            <span class="text-emerald-400 font-mono text-[11px] font-bold" id="cardProgressPct">${initialPct}%</span>
          </div>
          <h2 id="cardSpecialty" class="text-xl font-black text-white truncate">${initialSpecialty}</h2>
        </div>

        <div class="mt-4 space-y-2">
          <div class="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div id="barProgress" class="bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-400 h-full rounded-full transition-all duration-500" style="width: ${initialPct}%"></div>
          </div>
          <div class="flex justify-between text-xs text-slate-400">
            <span>Lote Atual: <strong class="text-white" id="cardProgressCount">${initialProcessed.toLocaleString('pt-BR')} / ${initialTotal.toLocaleString('pt-BR')}</strong></span>
            <span>Restantes no Lote: <strong class="text-slate-300" id="cardRemaining">${initialRemaining.toLocaleString('pt-BR')}</strong></span>
          </div>
          <div class="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span class="text-slate-400">Acervo Total Preventiva:</span>
            <strong class="text-amber-400 font-mono" id="cardCumulativeCount">${(macro.livePreventivaGold || 612).toLocaleString('pt-BR')} / 27.383 (${macro.preventivaPct || '2.2'}%)</strong>
          </div>
        </div>
      </div>

      <!-- Card 2: Velocidade & Estimativa -->
      <div class="card-glass p-5 rounded-2xl shadow-xl flex flex-col justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-400 block mb-1">Ritmo de Produção (20 Workers)</span>
          <div class="flex items-baseline justify-between">
            <div class="flex items-baseline gap-1">
              <span id="cardVelocity" class="text-2xl font-black text-white">${initialVelocity}</span>
              <span class="text-xs font-normal text-slate-400">q/min</span>
            </div>
            <span id="cardElapsed" class="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">00:00</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span class="text-slate-400 flex items-center gap-1.5">
            <i class="fa-regular fa-clock text-indigo-400"></i> Conclusão Estimada:
          </span>
          <strong id="cardETA" class="text-emerald-300 font-mono">${initialEta}</strong>
        </div>
      </div>

      <!-- Card 3: Assertividade & Qualidade -->
      <div class="card-glass p-5 rounded-2xl shadow-xl flex flex-col justify-between">
        <div>
          <span class="text-xs font-semibold text-slate-400 block mb-1">Qualidade & Sucesso</span>
          <div class="flex items-baseline justify-between">
            <span id="cardSuccess" class="text-2xl font-black text-emerald-400">${initialSuccesses.toLocaleString('pt-BR')}</span>
            <span id="cardSuccessRate" class="text-xs font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">99.8% OK</span>
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span class="text-slate-400">Falhas / Retries:</span>
          <span id="cardErrors" class="text-rose-400 font-bold">${initialErrors} falhas</span>
        </div>
      </div>

      <!-- Card 4: Economia & Consumo Cumulativo da Chave Paga -->
      <div class="card-glass p-5 rounded-2xl shadow-xl flex flex-col justify-between border-indigo-500/20">
        <div>
          <span class="text-xs font-semibold text-slate-400 block mb-1">Gasto Cumulativo da Chave (...hnAb7A)</span>
          <div class="flex items-baseline justify-between">
            <span id="cardCostVal" class="text-2xl font-black text-indigo-400">$${state.cumulativeKeySpend ? state.cumulativeKeySpend.totalCostUSD.toFixed(2) : initialCostUSD}</span>
            <span id="cardCostTier" class="text-xs font-bold px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">R$ ${state.cumulativeKeySpend ? state.cumulativeKeySpend.totalCostBRL.toFixed(2) : initialCostBRL}</span>
          </div>
        </div>

        <div class="mt-3 pt-3 border-t border-slate-800/80 space-y-1 text-xs text-slate-400">
          <div class="flex items-center justify-between">
            <span>Sessão Atual:</span>
            <strong id="cardSessionCost" class="text-slate-300 font-mono">$${initialCostUSD} (R$ ${initialCostBRL})</strong>
          </div>
          <div class="flex items-center justify-between">
            <span>Tokens Acumulados:</span>
            <strong id="cardTokens" class="text-slate-200 font-mono">${state.cumulativeKeySpend ? state.cumulativeKeySpend.totalTokens.toLocaleString('pt-BR') : initialTokens}</strong>
          </div>
        </div>
      </div>

    </div>

    <!-- Seção Intermediária: Live Question Monitor + Macro Visão do Acervo -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Coluna 1 & 2: Questão em Andamento + Gráfico de Velocidade -->
      <div class="lg:col-span-2 space-y-4">
        
        <!-- Card: Questão Sendo Resolvida Agora -->
        <div class="card-glass rounded-2xl p-5 shadow-xl border-l-4 border-l-indigo-500">
          <div class="flex items-center justify-between mb-2">
            <span class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-indigo-400 animate-ping"></span>
              Questão em Resolução Ativa
            </span>
            <span id="liveQuestionCode" class="text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">Processando com 20 workers...</span>
          </div>
          <div class="flex items-center justify-between text-xs text-slate-300">
            <div>
              Tema: <strong id="liveQuestionTheme" class="text-white">Medicina Preventiva / Saúde Coletiva</strong>
            </div>
            <div>
              Especialidade: <strong id="liveQuestionSpec" class="text-amber-400">Medicina Preventiva</strong>
            </div>
          </div>
        </div>

        <!-- Gráfico de Latência / Tempo de Resposta em Tempo Real -->
        <div class="card-glass rounded-2xl p-5 shadow-xl">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-chart-line text-indigo-400"></i>
              <span>Latência e Tempo por Questão (Últimas 25)</span>
            </h3>
            <span class="text-[11px] text-slate-400">Média: <strong id="txtAvgLatency" class="text-slate-200 font-mono">2.4s</strong></span>
          </div>
          <div class="h-44 w-full">
            <canvas id="speedChart"></canvas>
          </div>
        </div>

      </div>

      <!-- Coluna 3: Macro Panorama das 6 Grandes Especialidades (Atualizado Cumulativo) -->
      <div class="card-glass rounded-2xl p-5 shadow-xl flex flex-col justify-between">
        <div>
          <div class="flex items-center justify-between mb-2">
            <h3 class="text-sm font-bold text-white flex items-center gap-2">
              <i class="fa-solid fa-award text-amber-400"></i>
              <span>Padrão-Ouro Acumulado</span>
            </h3>
            <span id="macroGlobalBadge" class="text-xs font-bold text-emerald-400 font-mono">${(macro.totalGoldCommentaries || 112277).toLocaleString('pt-BR')} / 254.167 (${macro.globalCoveragePct}%)</span>
          </div>
          <p class="text-[11px] text-slate-400 mb-3">
            Atualização dinâmica contínua. Saldo da plataforma sendo preenchido ao vivo.
          </p>

          <!-- Lista das 6 Especialidades -->
          <div id="macroSpecialtyList" class="space-y-2.5 text-xs">
            ${macroListHtml}
          </div>
        </div>

        <div class="mt-4 pt-3 border-t border-slate-800 text-[11px] text-slate-400 flex items-center justify-between">
          <span>Persistência Tripla:</span>
          <span class="text-emerald-400 font-medium">Supabase + SQLite Local</span>
        </div>
      </div>

    </div>

    <!-- Feed Ao Vivo das Últimas Questões -->
    <div class="card-glass rounded-2xl p-6 shadow-xl space-y-4">
      
      <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-list-check text-indigo-400"></i>
            <span>Histórico Recente de Resoluções Padrão-Ouro</span>
          </h3>
          <p class="text-xs text-slate-400 mt-0.5">Clique em qualquer questão para abrir o Inspetor Médico e ver as justificativas assertiva por assertiva com negrito.</p>
        </div>

        <!-- Filtro Rápido -->
        <div class="relative w-full sm:w-64">
          <i class="fa-solid fa-magnifying-glass absolute left-3 top-2.5 text-slate-500 text-xs"></i>
          <input type="text" id="inpFilter" placeholder="Filtrar código ou tema..." class="w-full bg-[#1A2338] border border-slate-700 text-xs rounded-xl pl-8 pr-3 py-2 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500">
        </div>
      </div>

      <!-- Tabela -->
      <div class="overflow-x-auto rounded-xl border border-slate-800">
        <table class="w-full text-left text-xs text-slate-300">
          <thead class="text-slate-400 bg-slate-900/60 uppercase font-semibold border-b border-slate-800 text-[11px]">
            <tr>
              <th class="py-3 px-4">Código</th>
              <th class="py-3 px-4">Tema Clínico</th>
              <th class="py-3 px-4">Tempo</th>
              <th class="py-3 px-4">Tokens</th>
              <th class="py-3 px-4">Status</th>
              <th class="py-3 px-4">Horário</th>
              <th class="py-3 px-4 text-center">Ação</th>
            </tr>
          </thead>
          <tbody id="tblRecentBody" class="divide-y divide-slate-800/80 font-mono">
            <tr>
              <td colspan="7" class="text-center py-8 text-slate-500 font-sans">Carregando feed de resoluções...</td>
            </tr>
          </tbody>
        </table>
      </div>

    </div>

  </div>

  <!-- Modal do Inspetor Médico Padrão-Ouro (Garantidamente isolado com style inline display none) -->
  <div id="inspectorModal" style="display: none;" class="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm items-center justify-center p-4">
    <div class="bg-[#0F172A] border border-slate-700/80 rounded-2xl max-w-4xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden animate-fade-in relative z-50">
      
      <!-- Header do Modal -->
      <div class="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
        <div class="flex items-center gap-3">
          <div class="w-9 h-9 rounded-xl bg-indigo-600/20 text-indigo-400 flex items-center justify-center border border-indigo-500/30">
            <i class="fa-solid fa-microscope text-lg"></i>
          </div>
          <div>
            <div class="flex items-center gap-2">
              <h3 id="mCode" class="text-base font-black text-white font-mono">Código da Questão</h3>
              <span id="mInstitution" class="text-xs text-slate-400 bg-slate-800 px-2 py-0.5 rounded font-sans">Banca Oficial</span>
            </div>
            <p id="mSpecialty" class="text-xs text-amber-400 font-semibold mt-0.5">Medicina Preventiva</p>
          </div>
        </div>

        <button onclick="closeInspector()" class="cursor-pointer w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition flex items-center justify-center">
          <i class="fa-solid fa-xmark"></i>
        </button>
      </div>

      <!-- Conteúdo do Modal (Scroll) -->
      <div class="p-6 overflow-y-auto space-y-6 text-sm">
        
        <!-- Enunciado -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-file-lines text-indigo-400"></i> Enunciado da Questão
          </h4>
          <div id="mStatement" class="p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-200 leading-relaxed text-xs sm:text-sm font-sans">
            Carregando enunciado...
          </div>
        </div>

        <!-- Alternativas com Justificativas Cirúrgicas -->
        <div class="space-y-3">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-list-ol text-emerald-400"></i> Alternativas & Justificativas Cirúrgicas (Erros em Negrito)
          </h4>
          <div id="mOptions" class="space-y-2.5">
            <!-- Alternativas dinâmicas -->
          </div>
        </div>

        <!-- Comentário Médico Padrão-Ouro Completo -->
        <div class="space-y-2">
          <h4 class="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
            <i class="fa-solid fa-comment-medical text-indigo-400"></i> Síntese Médica & Racional Completo
          </h4>
          <div id="mCommentary" class="p-5 rounded-xl bg-slate-900/90 border border-slate-800 text-slate-300 leading-relaxed text-xs sm:text-sm font-sans space-y-3">
            Carregando comentário padrão-ouro...
          </div>
        </div>

      </div>

      <!-- Footer do Modal -->
      <div class="p-4 border-t border-slate-800 bg-slate-900/60 flex items-center justify-between">
        <span class="text-xs text-slate-400 flex items-center gap-1.5">
          <i class="fa-solid fa-shield-halved text-emerald-400"></i> Homologado pelo Motor de Curadoria
        </span>
        <div class="flex items-center gap-2">
          <button onclick="copyCommentary()" class="cursor-pointer px-3.5 py-1.5 rounded-lg bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition text-xs font-bold border border-indigo-500/30 flex items-center gap-1.5">
            <i class="fa-solid fa-copy"></i> <span id="txtBtnCopy">Copiar Comentário</span>
          </button>
          <button onclick="closeInspector()" class="cursor-pointer px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition">
            Fechar
          </button>
        </div>
      </div>

    </div>
  </div>

  <!-- Toast Notification Container -->
  <div id="toastContainer" class="fixed bottom-5 right-5 z-50 flex flex-col gap-2 pointer-events-none"></div>

  <script>
    let rawHistory = [];
    let speedChartInstance = null;
    let currentModalCommentary = '';

    function formatMarkdown(str) {
      if (!str) return '';
      if (window.marked && typeof marked.parseInline === 'function') {
        try {
          return marked.parseInline(str);
        } catch (e) {}
      }
      return str.replace(/\\*\\*(.*?)\\*\\*/g, '<strong>$1</strong>');
    }

    function initChart() {
      try {
        if (typeof Chart === 'undefined') return;
        const canvas = document.getElementById('speedChart');
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        speedChartInstance = new Chart(ctx, {
          type: 'line',
          data: {
            labels: [],
            datasets: [{
              label: 'Duração (s)',
              data: [],
              borderColor: '#6366F1',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              borderWidth: 2,
              tension: 0.35,
              fill: true,
              pointBackgroundColor: '#818CF8',
              pointRadius: 3
            }]
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
              x: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 10 } }
              },
              y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: '#64748B', font: { family: 'JetBrains Mono', size: 10 } },
                suggestedMin: 0,
                suggestedMax: 6
              }
            }
          }
        });
      } catch (err) {
        console.warn('Aviso: Chart.js não pôde ser instanciado:', err.message);
      }
    }

    async function loadMacroStats() {
      try {
        const res = await fetch('/api/macro-stats?_t=' + Date.now());
        if (!res.ok) return;
        const d = await res.json();
        const container = document.getElementById('macroSpecialtyList');

        if (d.globalCoveragePct) {
          const goldCount = (d.totalGoldCommentaries || 112277).toLocaleString('pt-BR');
          const totalCount = (d.totalPlatformQuestions || 254167).toLocaleString('pt-BR');
          document.getElementById('macroGlobalBadge').textContent = goldCount + ' / ' + totalCount + ' (' + d.globalCoveragePct + '%)';
        }

        if (d.livePreventivaGold) {
          document.getElementById('cardCumulativeCount').textContent = d.livePreventivaGold.toLocaleString('pt-BR') + ' / 27.383 (' + d.preventivaPct + '%)';
        }

        if (d.specialties && container) {
          container.innerHTML = d.specialties.map(s => {
            const isPreventiva = s.key === 'preventiva';
            const badgeBg = isPreventiva 
              ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' 
              : (s.coveragePct >= 90 ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30');
            const barBg = isPreventiva ? 'bg-indigo-500' : (s.coveragePct >= 90 ? 'bg-emerald-500' : 'bg-amber-500');

            return '<div class="p-2.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 transition">' +
              '<div class="flex items-center justify-between mb-1">' +
                '<strong class="text-white font-semibold text-xs">' + s.name + '</strong>' +
                '<span class="text-[10px] font-bold px-2 py-0.5 rounded border ' + badgeBg + '">' + s.status + '</span>' +
              '</div>' +
              '<div class="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-1">' +
                '<div class="' + barBg + ' h-full rounded-full transition-all duration-500" style="width: ' + s.coveragePct + '%"></div>' +
              '</div>' +
              '<div class="flex justify-between text-[11px] text-slate-400">' +
                '<span><strong>' + (s.doneCount || 0).toLocaleString('pt-BR') + '</strong> / ' + (s.totalCount || 0).toLocaleString('pt-BR') + '</span>' +
                '<span class="font-bold text-slate-200">' + s.coveragePct + '% Ouro</span>' +
              '</div>' +
            '</div>';
          }).join('');
        }
      } catch (e) {
        console.error('Erro ao carregar macro-stats:', e);
      }
    }

    async function updateDashboard() {
      try {
        const res = await fetch('/api/status?_t=' + Date.now());
        if (!res.ok) return;
        const d = await res.json();

        // Atualiza relógio de heartbeat
        const now = new Date();
        document.getElementById('lblClock').textContent = now.toLocaleTimeString('pt-BR');

        // Status Badge
        const bStatus = document.getElementById('badgeStatus');
        const tStatus = document.getElementById('txtStatus');
        if (d.status === 'RUNNING') {
          bStatus.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 pulse-glow';
          tStatus.textContent = 'ESTEIRA OPERANDO';
        } else if (d.status === 'PAUSED') {
          bStatus.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/10 text-amber-400 border border-amber-500/20';
          tStatus.textContent = 'PAUSADA';
        } else if (d.status === 'COMPLETED') {
          bStatus.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20';
          tStatus.textContent = 'LOTE FINALIZADO';
        } else {
          bStatus.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-slate-500/10 text-slate-400 border border-slate-500/20';
          tStatus.textContent = d.status || 'PARADA';
        }

        if (d.model) {
          const mClean = d.model.split(' ')[0];
          document.getElementById('txtCurrentModel').textContent = mClean;
        }

        // Progresso no lote
        if (d.specialty) document.getElementById('cardSpecialty').textContent = d.specialty;
        const total = d.totalToProcess || 18714;
        const processed = d.processedCount || 0;
        const pct = d.progressPercent || (total > 0 ? ((processed / total) * 100).toFixed(1) : 0);
        document.getElementById('cardProgressCount').textContent = processed.toLocaleString('pt-BR') + ' / ' + total.toLocaleString('pt-BR');
        document.getElementById('cardProgressPct').textContent = pct + '%';
        document.getElementById('barProgress').style.width = pct + '%';
        document.getElementById('cardRemaining').textContent = (total - processed > 0 ? (total - processed).toLocaleString('pt-BR') : '0');

        // Cumulativo total da Preventiva
        const cumPrev = 612 + processed;
        const cumPct = ((cumPrev / 27383) * 100).toFixed(1);
        document.getElementById('cardCumulativeCount').textContent = cumPrev.toLocaleString('pt-BR') + ' / 27.383 (' + cumPct + '%)';

        // Cumulativo global no badge
        const cumGlob = 112277 + processed;
        const cumGlobPct = ((cumGlob / 254167) * 100).toFixed(1);
        document.getElementById('macroGlobalBadge').textContent = cumGlob.toLocaleString('pt-BR') + ' / 254.167 (' + cumGlobPct + '%)';

        // Ritmo & Estimativa
        if (d.velocity) {
          document.getElementById('cardVelocity').textContent = (d.velocity.questionsPerMinute || 0).toFixed(1);
          document.getElementById('cardETA').textContent = d.velocity.etaFormatted || '--';
          const el = d.velocity.elapsedSeconds || 0;
          const mins = Math.floor(el / 60);
          const secs = el % 60;
          document.getElementById('cardElapsed').textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        }

        // Sucesso & Falhas
        const successes = d.successCount || 0;
        const errors = d.errorCount || 0;
        document.getElementById('cardSuccess').textContent = successes.toLocaleString('pt-BR');
        document.getElementById('cardErrors').textContent = errors + (errors === 1 ? ' falha' : ' falhas');
        if (processed > 0) {
          const rate = ((successes / processed) * 100).toFixed(1);
          document.getElementById('cardSuccessRate').textContent = rate + '% OK';
        }

        // Tokens e Custo Cumulativo
        if (d.cumulativeKeySpend) {
          document.getElementById('cardCostVal').textContent = '$' + d.cumulativeKeySpend.totalCostUSD.toFixed(2);
          document.getElementById('cardCostTier').textContent = 'R$ ' + d.cumulativeKeySpend.totalCostBRL.toFixed(2);
          document.getElementById('cardTokens').textContent = (d.cumulativeKeySpend.totalTokens || 0).toLocaleString('pt-BR');
          const sUSD = (d.cumulativeKeySpend.sessionCostUSD || 0).toFixed(2);
          const sBRL = (d.cumulativeKeySpend.sessionCostBRL || 0).toFixed(2);
          const elSess = document.getElementById('cardSessionCost');
          if (elSess) elSess.textContent = '$' + sUSD + ' (R$ ' + sBRL + ')';
        } else if (d.tokens) {
          document.getElementById('cardTokens').textContent = (d.tokens.totalTokens || 0).toLocaleString('pt-BR');
          if (d.tokens.pricing && d.tokens.pricing.totalCostUSD !== undefined) {
            document.getElementById('cardCostVal').textContent = '$' + d.tokens.pricing.totalCostUSD.toFixed(2);
            document.getElementById('cardCostTier').textContent = 'R$ ' + d.tokens.pricing.totalCostBRL.toFixed(2);
          }
        }

        // Questão Ativa
        if (d.currentQuestion) {
          document.getElementById('liveQuestionCode').textContent = d.currentQuestion.code || 'Iniciando...';
          document.getElementById('liveQuestionTheme').textContent = d.currentQuestion.tema || '--';
          document.getElementById('liveQuestionSpec').textContent = d.currentQuestion.especialidade || d.specialty || '--';
        }

        // Tabela Recente & Gráfico
        if (d.recentHistory && d.recentHistory.length > 0) {
          rawHistory = d.recentHistory;
          renderTable();
          updateChartData(d.recentHistory);
        }

      } catch (e) {
        console.error('Erro ao atualizar dashboard:', e);
      }
    }

    function updateChartData(history) {
      if (!speedChartInstance) return;
      try {
        const recent = history.slice(0, 25).reverse();
        speedChartInstance.data.labels = recent.map(r => r.code ? r.code.split('-').slice(-1)[0] : '');
        speedChartInstance.data.datasets[0].data = recent.map(r => r.duration || 0);
        speedChartInstance.update('none');

        const sum = recent.reduce((acc, r) => acc + (r.duration || 0), 0);
        const avg = recent.length > 0 ? (sum / recent.length).toFixed(1) : 0;
        document.getElementById('txtAvgLatency').textContent = avg + 's';
      } catch (e) {}
    }

    function renderTable() {
      const q = (document.getElementById('inpFilter').value || '').toLowerCase().trim();
      const tbody = document.getElementById('tblRecentBody');

      const filtered = rawHistory.filter(item => {
        if (!q) return true;
        return (item.code || '').toLowerCase().includes(q) || (item.tema || '').toLowerCase().includes(q);
      });

      if (filtered.length === 0) {
        tbody.innerHTML = '<tr><td colspan="7" class="text-center py-8 text-slate-500 font-sans">Nenhuma questão encontrada com este filtro.</td></tr>';
        return;
      }

      tbody.innerHTML = filtered.map(item => {
        const isOk = item.status === 'OK';
        const badge = isOk 
          ? '<span class="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-[11px]"><i class="fa-solid fa-check"></i> Gravado</span>'
          : '<span class="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 text-[11px]">' + item.status + '</span>';

        const dur = item.duration || 2.4;
        let durBadge = 'text-emerald-300 bg-emerald-500/10 border-emerald-500/20';
        if (dur > 6) durBadge = 'text-amber-300 bg-amber-500/10 border-amber-500/20';
        if (dur > 15) durBadge = 'text-indigo-300 bg-indigo-500/10 border-indigo-500/20';

        return '<tr class="hover:bg-slate-800/40 transition cursor-pointer" onclick="openInspector(\\'' + item.code + '\\')">' +
          '<td class="py-2.5 px-4 font-bold text-white flex items-center gap-1.5">' +
            '<i class="fa-solid fa-file-medical text-indigo-400 text-xs"></i>' +
            '<span>' + item.code + '</span>' +
          '</td>' +
          '<td class="py-2.5 px-4 text-slate-300 font-sans truncate max-w-[220px]">' + (item.tema || '--') + '</td>' +
          '<td class="py-2.5 px-4"><span class="px-2 py-0.5 rounded border font-mono text-[11px] ' + durBadge + '">' + dur + 's</span></td>' +
          '<td class="py-2.5 px-4 text-slate-400 font-mono text-[11px]">' + (item.tokens || 1500) + '</td>' +
          '<td class="py-2.5 px-4">' + badge + '</td>' +
          '<td class="py-2.5 px-4 text-slate-400 font-mono text-[11px]">' + (item.timestamp || '--') + '</td>' +
          '<td class="py-2.5 px-4 text-center">' +
            '<button onclick="event.stopPropagation(); openInspector(\\'' + item.code + '\\')" class="cursor-pointer px-2.5 py-1 rounded bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white transition text-[11px] font-semibold border border-indigo-500/30 flex items-center gap-1 mx-auto">' +
              '<i class="fa-solid fa-eye"></i> Inspecionar' +
            '</button>' +
          '</td>' +
        '</tr>';
      }).join('');
    }

    document.getElementById('inpFilter').addEventListener('input', renderTable);

    // Inspetor de Questões (Modal)
    async function openInspector(code) {
      const modal = document.getElementById('inspectorModal');
      document.getElementById('mCode').textContent = code;
      document.getElementById('mStatement').textContent = 'Buscando dados no banco local...';
      document.getElementById('mOptions').innerHTML = '';
      document.getElementById('mCommentary').innerHTML = '<div class="py-4 text-slate-400"><i class="fa-solid fa-spinner animate-spin"></i> Carregando comentário...</div>';
      
      // Exibe modal com estilo flex
      modal.style.display = 'flex';

      try {
        const res = await fetch('/api/question-detail?code=' + encodeURIComponent(code));
        if (!res.ok) throw new Error('Questão ainda não sincronizada no banco local.');
        const d = await res.json();

        document.getElementById('mInstitution').textContent = (d.institution || 'Banca Oficial') + ' (' + (d.year || 2024) + ')';
        document.getElementById('mSpecialty').textContent = d.especialidade || 'Medicina Preventiva';
        document.getElementById('mStatement').textContent = d.statement || 'Sem enunciado.';

        const gold = (d.correct_answer || '').toUpperCase().trim();
        const optsContainer = document.getElementById('mOptions');
        if (Array.isArray(d.options) && d.options.length > 0) {
          optsContainer.innerHTML = d.options.map(opt => {
            const isCorrect = opt.letter === gold;
            const borderCls = isCorrect ? 'border-emerald-500/50 bg-emerald-950/20' : 'border-slate-800 bg-[#0C121E]/90 hover:border-slate-700';
            const badgeCls = isCorrect ? 'bg-emerald-500 text-black font-black' : 'bg-slate-800 text-slate-300 font-bold';
            
            let expHtml = '';
            if (opt.explanation) {
              const formattedExp = formatMarkdown(opt.explanation);
              const expBorder = isCorrect ? 'border-emerald-500/30 bg-emerald-900/20 text-emerald-200' : 'border-slate-800/80 bg-slate-900/60 text-slate-300';
              const expIcon = isCorrect ? '<i class="fa-solid fa-circle-check text-emerald-400"></i>' : '<i class="fa-solid fa-triangle-exclamation text-amber-400"></i>';
              const label = isCorrect ? 'Justificativa Padrão-Ouro:' : 'Análise do Erro (Destaque Cirúrgico):';
              const labelColor = isCorrect ? 'text-emerald-400' : 'text-amber-400';

              expHtml = '<div class="mt-2.5 pt-2 border-t border-slate-800/80 flex items-start gap-2.5 text-xs ' + expBorder + ' p-3 rounded-xl border leading-relaxed">' +
                '<span class="mt-0.5 text-sm flex-shrink-0">' + expIcon + '</span>' +
                '<div class="opt-exp"><span class="font-bold ' + labelColor + ' uppercase text-[10px] tracking-wider block mb-1">' + label + '</span>' + formattedExp + '</div>' +
              '</div>';
            }

            return '<div class="p-4 rounded-xl border flex flex-col transition ' + borderCls + '">' +
              '<div class="flex items-start gap-3">' +
                '<span class="w-6 h-6 rounded flex items-center justify-center text-xs flex-shrink-0 ' + badgeCls + '">' + opt.letter + '</span>' +
                '<span class="text-xs pt-0.5 leading-relaxed text-slate-200 font-medium">' + opt.text + '</span>' +
                (isCorrect ? '<span class="ml-auto flex-shrink-0 text-emerald-400 text-xs font-bold flex items-center gap-1.5 bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20"><i class="fa-solid fa-check"></i> Gabarito Oficial</span>' : '') +
              '</div>' +
              expHtml +
            '</div>';
          }).join('');
        }

        currentModalCommentary = d.commentary || 'Comentário em processamento.';
        
        let htmlCommentary = '';
        if (window.marked && typeof marked.parse === 'function') {
          try {
            htmlCommentary = marked.parse(currentModalCommentary);
          } catch (e) {
            htmlCommentary = currentModalCommentary.replace(/\\n/g, '<br>');
          }
        } else {
          htmlCommentary = currentModalCommentary.replace(/\\n/g, '<br>');
        }

        const rxErro = new RegExp('<p>Principal Motivo de Erro:<\\\\/p>\\\\s*<p>(.*?)<\\\\/p>', 'gis');
        const rxTake = new RegExp('<p>Take-Home Message:<\\\\/p>\\\\s*<p>(.*?)<\\\\/p>', 'gis');
        htmlCommentary = htmlCommentary
          .replace(rxErro, '<div class="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs my-3"><div class="font-extrabold uppercase text-[11px] tracking-wider text-amber-400 mb-1 flex items-center gap-1.5"><i class="fa-solid fa-triangle-exclamation"></i> Principal Motivo de Erro (Pegadinha)</div><p class="text-slate-200 leading-relaxed">$1</p></div>')
          .replace(rxTake, '<div class="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-xs my-3"><div class="font-black uppercase text-[11px] tracking-wider text-amber-300 mb-1 flex items-center gap-1.5"><i class="fa-solid fa-lightbulb text-amber-400"></i> Take-Home Message</div><p class="text-amber-100 font-semibold leading-relaxed">$1</p></div>');

        if (d.mainErrorReason && !htmlCommentary.includes('Principal Motivo de Erro')) {
          htmlCommentary += '<div class="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-200 text-xs my-3"><div class="font-extrabold uppercase text-[11px] tracking-wider text-amber-400 mb-1 flex items-center gap-1.5"><i class="fa-solid fa-triangle-exclamation"></i> Principal Motivo de Erro (Pegadinha)</div><p class="text-slate-200 leading-relaxed">' + formatMarkdown(d.mainErrorReason) + '</p></div>';
        }
        if (d.takeHomeMessage && !htmlCommentary.includes('Take-Home Message')) {
          htmlCommentary += '<div class="p-4 rounded-xl bg-gradient-to-r from-amber-500/10 to-amber-600/10 border border-amber-500/30 text-xs my-3"><div class="font-black uppercase text-[11px] tracking-wider text-amber-300 mb-1 flex items-center gap-1.5"><i class="fa-solid fa-lightbulb text-amber-400"></i> Take-Home Message</div><p class="text-amber-100 font-semibold leading-relaxed">' + formatMarkdown(d.takeHomeMessage) + '</p></div>';
        }

        document.getElementById('mCommentary').innerHTML = htmlCommentary;

      } catch (err) {
        document.getElementById('mCommentary').innerHTML = '<div class="text-rose-400"><i class="fa-solid fa-triangle-exclamation"></i> ' + err.message + '</div>';
      }
    }

    function closeInspector() {
      document.getElementById('inspectorModal').style.display = 'none';
    }

    function copyCommentary() {
      if (!currentModalCommentary) return;
      navigator.clipboard.writeText(currentModalCommentary).then(() => {
        const btn = document.getElementById('txtBtnCopy');
        btn.textContent = 'Copiado!';
        setTimeout(() => btn.textContent = 'Copiar Comentário', 2000);
        showToast('Comentário padrão-ouro copiado com sucesso!', 'success');
      });
    }

    function showToast(message, type = 'info') {
      const container = document.getElementById('toastContainer');
      const toast = document.createElement('div');
      const colors = {
        success: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
        error: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
        info: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
      };
      toast.className = 'flex items-center gap-2.5 px-4 py-3 rounded-xl border backdrop-blur-md shadow-2xl text-xs font-semibold animate-fade-in pointer-events-auto ' + (colors[type] || colors.info);
      toast.innerHTML = '<i class="fa-solid fa-circle-info"></i><span>' + message + '</span>';
      container.appendChild(toast);
      setTimeout(() => toast.remove(), 4000);
    }

    async function triggerAction(action) {
      const spec = document.getElementById('selSpecialty').value;
      const workers = document.getElementById('selWorkers').value;
      try {
        showToast('Enviando sinal: ' + action.toUpperCase() + '...', 'info');
        const res = await fetch('/api/action/' + action + '?specialty=' + spec + '&workers=' + workers, { method: 'POST' });
        const d = await res.json();
        showToast(d.message, d.ok ? 'success' : 'error');
        setTimeout(updateDashboard, 400);
      } catch (err) {
        showToast('Erro ao comunicar com o servidor: ' + err.message, 'error');
      }
    }

    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeInspector();
    });

    window.addEventListener('DOMContentLoaded', () => {
      initChart();
      loadMacroStats();
      updateDashboard();
    });

    try { initChart(); } catch (e) {}
    try { loadMacroStats(); } catch (e) {}
    try { updateDashboard(); } catch (e) {}

    setInterval(updateDashboard, 1500);
    setInterval(loadMacroStats, 3000);
  </script>
</body>
</html>`;
}

server.listen(PORT, '127.0.0.1', () => {
  console.log('='.repeat(80));
  console.log(`📊 DASHBOARD DE MONITORAMENTO APERFEIÇOADO (Porta ${PORT})`);
  console.log(`🌐 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log('='.repeat(80));
});
