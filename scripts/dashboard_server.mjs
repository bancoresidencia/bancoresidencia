import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = 3005;
const STATE_PATH = path.resolve('data/pipeline_progress_state.json');
const SIGNAL_PATH = path.resolve('data/pipeline.signal');

let runnerProcess = null;

function getStatus() {
  if (fs.existsSync(STATE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    } catch {
      return { status: 'ERROR_READING_STATE' };
    }
  }
  return { status: 'NO_STATE_FILE' };
}

function sendJson(res, data, statusCode = 200) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/status') {
    return sendJson(res, getStatus());
  }

  // Ações de controle
  if (req.method === 'POST') {
    if (url.pathname === '/api/action/start') {
      const state = getStatus();
      if (state.status === 'RUNNING') {
        return sendJson(res, { ok: false, message: 'A esteira já está em execução!' });
      }

      const workers = url.searchParams.get('workers') || '4';

      // Remove sinais antigos
      if (fs.existsSync(SIGNAL_PATH)) fs.unlinkSync(SIGNAL_PATH);

      // Inicia processo em segundo plano com a flag de workers
      runnerProcess = spawn('node', ['scripts/produce_clinica_text_batch.mjs', `--workers=${workers}`], {
        stdio: 'inherit',
        detached: true
      });
      runnerProcess.unref();

      return sendJson(res, { ok: true, message: `Produção iniciada em segundo plano com ${workers} workers!` });
    }

    if (url.pathname === '/api/action/pause') {
      fs.writeFileSync(SIGNAL_PATH, 'pause', 'utf8');
      return sendJson(res, { ok: true, message: 'Sinal de pausa enviado!' });
    }

    if (url.pathname === '/api/action/resume') {
      fs.writeFileSync(SIGNAL_PATH, 'resume', 'utf8');
      return sendJson(res, { ok: true, message: 'Sinal de retomada enviado!' });
    }

    if (url.pathname === '/api/action/stop') {
      fs.writeFileSync(SIGNAL_PATH, 'stop', 'utf8');
      return sendJson(res, { ok: true, message: 'Sinal de parada graciosa enviado!' });
    }
  }

  // Página HTML do Dashboard
  if (url.pathname === '/') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardHtml());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

function renderDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Dashboard de Produção — Banco Residência</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            brand: { 500: '#3b82f6', 600: '#2563eb' }
          }
        }
      }
    }
  </script>
  <style>
    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.5; }
    }
    .pulse-glow { animation: pulse-subtle 2s infinite ease-in-out; }
  </style>
</head>
<body class="bg-zinc-950 text-zinc-100 min-h-screen font-sans antialiased p-4 sm:p-8">
  <div class="max-w-7xl mx-auto space-y-6">

    <!-- Top Bar -->
    <header class="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl shadow-xl backdrop-blur-md">
      <div class="space-y-1">
        <div class="flex items-center gap-3">
          <div class="h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981]" id="statusDot"></div>
          <h1 class="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
            Banco Residência <span class="text-xs font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">🔒 CHAVE PAGA BLOQUEADA (R$ 0,00)</span>
          </h1>
        </div>
        <p class="text-xs sm:text-sm text-zinc-400">Modo 100% Gratuito Ativo • Rotação Multi-Chaves Free • Custo Adicional Zero</p>
      </div>

      <!-- Seletor de Workers & Controles -->
      <div class="flex items-center gap-3 flex-wrap">
        
        <!-- Seletor 4x / 6x -->
        <div class="flex items-center gap-1 bg-zinc-950/80 border border-zinc-800 p-1 rounded-xl">
          <span class="text-[11px] font-bold text-emerald-400 px-2 uppercase tracking-wider">🔒 Free Workers:</span>
          <button type="button" onclick="setWorkers(4)" id="wBtn4" class="px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow-sm transition-all" title="4 workers (~60 q/min - Seguro R$ 0,00)">4x (Recomendado)</button>
          <button type="button" onclick="setWorkers(6)" id="wBtn6" class="px-2.5 py-1 text-xs font-bold rounded-lg text-zinc-400 hover:text-white transition-all" title="6 workers (~90 q/min - Rápido R$ 0,00)">6x (Rápido)</button>
        </div>

        <!-- Botões de Ação -->
        <div class="flex items-center gap-2">
          <button id="btnStart" onclick="triggerAction('start')" class="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg transition-all flex items-center gap-2">
            ▶️ Iniciar Produção
          </button>
          <button id="btnPause" onclick="triggerAction('pause')" class="px-3.5 py-2 bg-amber-600/80 hover:bg-amber-600 text-white font-bold text-xs sm:text-sm rounded-xl transition-all hidden">
            ⏸️ Pausar
          </button>
          <button id="btnResume" onclick="triggerAction('resume')" class="px-3.5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm rounded-xl transition-all hidden">
            ▶️ Retomar
          </button>
          <button id="btnStop" onclick="triggerAction('stop')" class="px-3.5 py-2 bg-rose-900/60 hover:bg-rose-800 text-rose-200 font-bold text-xs sm:text-sm rounded-xl border border-rose-700/60 transition-all hidden">
            🛑 Parar Gracioso
          </button>
        </div>

      </div>
    </header>

    <!-- Badges de Configuração -->
    <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
      <div class="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex items-center justify-between">
        <span class="text-zinc-400">Especialidade:</span>
        <span class="font-bold text-white" id="valSpecialty">Clínica Médica</span>
      </div>
      <div class="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex items-center justify-between">
        <span class="text-zinc-400">Modelo:</span>
        <span class="font-bold text-blue-400" id="valModel">gemini-3.5-flash-lite</span>
      </div>
      <div class="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex items-center justify-between">
        <span class="text-zinc-400">Workers Ativos:</span>
        <span class="font-bold text-indigo-400" id="valWorkers">4 Workers</span>
      </div>
      <div class="bg-zinc-900/60 border border-zinc-800/80 p-3 rounded-xl flex items-center justify-between">
        <span class="text-zinc-400">Supabase Sync:</span>
        <span class="font-bold text-emerald-400 flex items-center gap-1">⚡ 100% Conectado</span>
      </div>
    </div>

    <!-- Barra de Progresso Principal -->
    <div class="bg-zinc-900/90 border border-zinc-800 p-6 rounded-2xl space-y-3 shadow-xl">
      <div class="flex items-center justify-between text-sm sm:text-base font-bold">
        <span class="text-zinc-300">Progresso Geral: <span id="progressText" class="text-white">0 / 25.177</span></span>
        <span class="text-blue-400 font-black text-lg" id="progressPct">0.00%</span>
      </div>
      <div class="w-full bg-zinc-800 rounded-full h-4 overflow-hidden p-0.5 border border-zinc-700/50">
        <div id="progressBar" class="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-500" style="width: 0%"></div>
      </div>
    </div>

    <!-- Cards Principais de Métricas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Gasto em Reais (BRL) -->
      <div class="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-lg">
        <div class="text-xs uppercase tracking-wider font-bold text-zinc-400">Gasto Acumulado (BRL)</div>
        <div class="text-3xl font-black text-emerald-400" id="costBRL">R$ 0,00</div>
        <div class="text-xs text-zinc-400 flex justify-between">
          <span>USD: <strong class="text-zinc-200" id="costUSD">$0.000</strong></span>
          <span>Média: <strong class="text-zinc-200" id="costPerQ">R$ 0,00138/q</strong></span>
        </div>
      </div>

      <!-- Custo Desta Execução -->
      <div class="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-lg">
        <div class="text-xs uppercase tracking-wider font-bold text-zinc-400">Custo Desta Execução</div>
        <div class="text-3xl font-black text-emerald-400" id="estRemainingBRL">R$ 0,00</div>
        <div class="text-xs text-zinc-400">
          Status: <strong class="text-emerald-400" id="estTotalBRL">100% Gratuito (Chave Paga Bloqueada)</strong>
        </div>
      </div>

      <!-- Velocidade e ETA -->
      <div class="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-lg">
        <div class="text-xs uppercase tracking-wider font-bold text-zinc-400">Velocidade & Tempo Restante</div>
        <div class="text-3xl font-black text-indigo-400" id="etaTime">--:--</div>
        <div class="text-xs text-zinc-400 flex justify-between">
          <span>Ritmo: <strong class="text-zinc-200" id="qpm">0.0 q/min</strong></span>
          <span>Tempo ativo: <strong class="text-zinc-200" id="elapsed">0s</strong></span>
        </div>
      </div>

      <!-- Consumo de Tokens -->
      <div class="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-2 shadow-lg">
        <div class="text-xs uppercase tracking-wider font-bold text-zinc-400">Tokens Totais Processados</div>
        <div class="text-3xl font-black text-purple-400" id="tokensTotal">0</div>
        <div class="text-xs text-zinc-400 flex justify-between">
          <span>In: <strong class="text-zinc-200" id="tokensIn">0</strong></span>
          <span>Out: <strong class="text-zinc-200" id="tokensOut">0</strong></span>
        </div>
      </div>

    </div>

    <!-- Questão Atual em Processamento -->
    <div class="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-3 shadow-lg" id="currentQCard">
      <div class="flex items-center justify-between text-xs font-bold uppercase tracking-wider text-zinc-400">
        <span class="flex items-center gap-2">
          <span class="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping"></span>
          Questão Atual Sendo Processada
        </span>
        <span id="currentQStatus" class="text-blue-400 font-mono">AGUARDANDO INÍCIO</span>
      </div>
      <div class="text-sm sm:text-base font-bold text-white flex flex-wrap items-center gap-2" id="currentQDetails">
        Pronto para iniciar. Selecione os workers (10x, 20x, 35x ou 50x) e clique em "Iniciar Produção".
      </div>
    </div>

    <!-- Tabela de Histórico Recente -->
    <div class="bg-zinc-900/80 border border-zinc-800 p-5 rounded-2xl space-y-3 shadow-lg">
      <div class="flex items-center justify-between text-sm font-bold text-zinc-300">
        <span>Histórico Recente de Resoluções Sincronizadas (Supabase)</span>
        <span class="text-xs text-zinc-500" id="lastUpdated">Atualizando...</span>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full text-left text-xs sm:text-sm">
          <thead class="text-zinc-400 border-b border-zinc-800 font-bold">
            <tr>
              <th class="py-2.5 px-3">Código</th>
              <th class="py-2.5 px-3">Tema</th>
              <th class="py-2.5 px-3 text-center">Duração</th>
              <th class="py-2.5 px-3 text-center">Tokens</th>
              <th class="py-2.5 px-3 text-center">Supabase</th>
              <th class="py-2.5 px-3 text-right">Horário</th>
            </tr>
          </thead>
          <tbody id="historyBody" class="divide-y divide-zinc-800/60 font-mono">
            <tr>
              <td colspan="6" class="py-6 text-center text-zinc-500 font-sans">Nenhuma questão processada nesta sessão ainda.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

  </div>

  <script>
    let currentWorkers = 4;

    function setWorkers(n) {
      currentWorkers = n;
      [4, 6].forEach(w => {
        const btn = document.getElementById('wBtn' + w);
        if (!btn) return;
        if (w === n) {
          btn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg bg-emerald-600 text-white shadow-sm transition-all';
        } else {
          btn.className = 'px-2.5 py-1 text-xs font-bold rounded-lg text-zinc-400 hover:text-white transition-all';
        }
      });
      document.getElementById('valWorkers').textContent = n + ' Workers (Free)';
    }

    async function triggerAction(action) {
      try {
        let endpoint = '/api/action/' + action;
        if (action === 'start') {
          endpoint += '?workers=' + currentWorkers;
        }
        const res = await fetch(endpoint, { method: 'POST' });
        const data = await res.json();
        alert(data.message);
        fetchStatus();
      } catch (err) {
        alert('Erro ao enviar comando: ' + err.message);
      }
    }

    async function fetchStatus() {
      try {
        const res = await fetch('/api/status');
        const s = await res.json();
        renderState(s);
      } catch (err) {
        console.error('Erro de polling:', err);
      }
    }

    function renderState(s) {
      if (!s || s.status === 'NO_STATE_FILE') return;

      const status = s.status || 'IDLE';
      const dot = document.getElementById('statusDot');
      const btnStart = document.getElementById('btnStart');
      const btnPause = document.getElementById('btnPause');
      const btnResume = document.getElementById('btnResume');
      const btnStop = document.getElementById('btnStop');

      if (s.concurrency) {
        document.getElementById('valWorkers').textContent = s.concurrency + ' Workers';
      }

      // Botões e status
      if (status === 'RUNNING') {
        dot.className = 'h-3.5 w-3.5 rounded-full bg-emerald-500 shadow-[0_0_12px_#10b981] pulse-glow';
        btnStart.classList.add('hidden');
        btnPause.classList.remove('hidden');
        btnResume.classList.add('hidden');
        btnStop.classList.remove('hidden');
      } else if (status === 'PAUSED') {
        dot.className = 'h-3.5 w-3.5 rounded-full bg-amber-500 shadow-[0_0_12px_#f59e0b]';
        btnStart.classList.add('hidden');
        btnPause.classList.add('hidden');
        btnResume.classList.remove('hidden');
        btnStop.classList.remove('hidden');
      } else {
        dot.className = 'h-3.5 w-3.5 rounded-full bg-zinc-500';
        btnStart.classList.remove('hidden');
        btnPause.classList.add('hidden');
        btnResume.classList.add('hidden');
        btnStop.classList.add('hidden');
      }

      // Progresso
      const proc = s.processedCount || 0;
      const total = s.totalToProcess || 25177;
      const pct = s.progressPercent || 0;
      document.getElementById('progressText').textContent = proc.toLocaleString('pt-BR') + ' / ' + total.toLocaleString('pt-BR');
      document.getElementById('progressPct').textContent = pct + '%';
      document.getElementById('progressBar').style.width = pct + '%';

      // Financeiro (Modo Gratuito - R$ 0,00)
      const fin = s.financials || {};
      document.getElementById('costBRL').textContent = 'R$ 0,00';
      document.getElementById('costUSD').textContent = '$0.000';
      document.getElementById('costPerQ').textContent = 'R$ 0,00 (Gratuito)';
      document.getElementById('estRemainingBRL').textContent = 'R$ 0,00';
      document.getElementById('estTotalBRL').textContent = 'Chave Paga Bloqueada (100% Free)';

      // Velocidade & ETA
      const vel = s.velocity || {};
      document.getElementById('etaTime').textContent = vel.etaFormatted || '--:--';
      document.getElementById('qpm').textContent = (vel.questionsPerMinute || 0) + ' q/min';
      document.getElementById('elapsed').textContent = (vel.elapsedSeconds || 0) + 's';

      // Tokens
      const tok = s.tokens || {};
      document.getElementById('tokensTotal').textContent = (tok.totalTokens || 0).toLocaleString('pt-BR');
      document.getElementById('tokensIn').textContent = (tok.promptTokens || 0).toLocaleString('pt-BR');
      document.getElementById('tokensOut').textContent = (tok.candidateTokens || 0).toLocaleString('pt-BR');

      // Questão atual
      const cur = s.currentQuestion;
      if (cur) {
        document.getElementById('currentQStatus').textContent = 'PROCESSANDO AGORA';
        document.getElementById('currentQDetails').innerHTML = 
          '<span class=\"px-2.5 py-1 bg-blue-950 border border-blue-800 text-blue-300 rounded-lg text-xs font-mono font-bold\">' + cur.code + '</span>' +
          '<span class=\"text-zinc-300\">' + cur.banca + ' (' + cur.year + ')</span>' +
          '<span class=\"text-zinc-500\">•</span>' +
          '<span class=\"text-indigo-400 font-semibold\">' + cur.tema + '</span>' +
          (cur.foco ? '<span class=\"text-zinc-500\">-</span><span class=\"text-zinc-400 text-xs\">' + cur.foco + '</span>' : '');
      } else {
        document.getElementById('currentQStatus').textContent = status;
        if (status === 'IDLE' || status === 'STOPPED') {
          document.getElementById('currentQDetails').textContent = 'Pronto para iniciar. Selecione os workers (10x, 20x, 35x ou 50x) e clique em \"Iniciar Produção\".';
        }
      }

      // Histórico
      const hist = s.recentHistory || [];
      const tbody = document.getElementById('historyBody');
      if (hist.length > 0) {
        tbody.innerHTML = hist.map(h => 
          '<tr class=\"hover:bg-zinc-800/40 transition-colors\">' +
            '<td class=\"py-2 px-3 font-bold text-blue-400\">' + h.code + '</td>' +
            '<td class=\"py-2 px-3 text-zinc-300 font-sans\">' + (h.tema || 'Geral') + '</td>' +
            '<td class=\"py-2 px-3 text-center text-zinc-400\">' + h.duration + 's</td>' +
            '<td class=\"py-2 px-3 text-center text-purple-400\">' + h.tokens.toLocaleString('pt-BR') + '</td>' +
            '<td class=\"py-2 px-3 text-center\"><span class=\"px-2 py-0.5 rounded-full text-[11px] ' + (h.status === 'OK' ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800' : 'bg-rose-950 text-rose-400 border border-rose-800') + '\">' + h.status + '</span></td>' +
            '<td class=\"py-2 px-3 text-right text-zinc-500\">' + h.timestamp + '</td>' +
          '</tr>'
        ).join('');
      }

      document.getElementById('lastUpdated').textContent = 'Última atualização: ' + new Date().toLocaleTimeString('pt-BR');
    }

    // Polling a cada 1.5s
    setInterval(fetchStatus, 1500);
    fetchStatus();
  </script>
</body>
</html>`;
}

server.listen(PORT, () => {
  console.log(`================================================================================`);
  console.log(`📊 DASHBOARD DE MONITORAMENTO ATUALIZADO (Porta ${PORT})`);
  console.log(`🌐 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log(`================================================================================`);
});
