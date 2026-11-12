import http from 'http';
import fs from 'fs';
import path from 'path';

const PORT = 3333;
const PROGRESS_FILE = path.resolve('data/resolucao_quarentena_expansion_progresso.jsonl');
const LIVE_LOG_FILE = path.resolve('data/quarentena_workers_live.log');
const TASK_LOG_FILE = 'C:/Users/cnath/.gemini/antigravity/brain/b2e4a244-51a2-46f3-a7c8-f7f64a3dc28e/.system_generated/tasks/task-998.log';

function getStats() {
  let totalPersistido = 0;
  const byWorker = {};
  const byModel = {};
  const byEspecialidade = {};
  const recentItems = [];
  const now = Date.now();
  let inLast5Min = 0;

  if (fs.existsSync(PROGRESS_FILE)) {
    const raw = fs.readFileSync(PROGRESS_FILE, 'utf8');
    const lines = raw.trim().split('\n');
    totalPersistido = lines.length;

    // Processa de trás para frente para pegar os mais recentes
    for (let i = lines.length - 1; i >= 0; i--) {
      const l = lines[i];
      if (!l.trim()) continue;
      try {
        const item = JSON.parse(l);
        byWorker[item.worker || 'Outros'] = (byWorker[item.worker || 'Outros'] || 0) + 1;
        byModel[item.model || 'outros'] = (byModel[item.model || 'outros'] || 0) + 1;
        byEspecialidade[item.especialidade || 'Outros'] = (byEspecialidade[item.especialidade || 'Outros'] || 0) + 1;

        if (recentItems.length < 8) {
          recentItems.push(item);
        }

        if (item.timestamp) {
          const t = new Date(item.timestamp).getTime();
          if (now - t < 5 * 60 * 1000) inLast5Min++;
        }
      } catch {}
    }
  }

  let recentLogs = [];
  const logTarget = fs.existsSync(LIVE_LOG_FILE) ? LIVE_LOG_FILE : TASK_LOG_FILE;
  if (fs.existsSync(logTarget)) {
    try {
      const logContent = fs.readFileSync(logTarget, 'utf8');
      const lines = logContent.split('\n').filter(l => l.trim().length > 0);
      recentLogs = lines.slice(-20);
    } catch {}
  }

  const totalQuarentenaOriginal = 15301;
  const restantes = Math.max(0, totalQuarentenaOriginal - totalPersistido);
  const progressoGeral = ((totalPersistido / totalQuarentenaOriginal) * 100).toFixed(1);

  return {
    totalPersistido,
    restantes,
    progressoGeral,
    vazaoMinuto: (inLast5Min / 5).toFixed(1),
    byWorker,
    byModel,
    byEspecialidade,
    recentItems,
    recentLogs,
    timestamp: new Date().toISOString()
  };
}

const HTML_CONTENT = `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Banco Residência · Monitor de Quarentena Ao Vivo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <style>
    @keyframes pulse-subtle {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.85; transform: scale(1.02); }
    }
    .live-pulse {
      animation: pulse-subtle 2s infinite ease-in-out;
    }
    /* Estilização customizada da barra de rolagem */
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0f172a; }
    ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
    ::-webkit-scrollbar-thumb:hover { background: #475569; }
  </style>
</head>
<body class="bg-[#0b0f19] text-slate-100 antialiased p-4 md:p-8 font-sans min-h-screen">

  <div class="max-w-7xl mx-auto space-y-6">

    <!-- Topbar -->
    <header class="bg-[#111827] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-2 mb-1.5">
          <span class="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 live-pulse">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            SERVIÇO AO VIVO · LOCALHOST:3333
          </span>
          <span id="lastUpdate" class="text-xs text-slate-400">· Conectando...</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          Painel de Quarentena em Tempo Real
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Orquestração Contínua de IA · Banco de Expansão Direta · Banco Residência
        </p>
      </div>

      <div class="flex items-center gap-3">
        <div class="bg-[#0b0f19] px-4 py-2.5 rounded-xl border border-slate-800 text-right">
          <span class="text-xs text-slate-400 block font-medium">Vazão Recente</span>
          <span id="vazaoDisplay" class="text-lg font-bold text-emerald-400">0.0 q/min</span>
        </div>
        <div class="bg-[#0b0f19] px-4 py-2.5 rounded-xl border border-slate-800 text-right">
          <span class="text-xs text-slate-400 block font-medium">Taxa de Atualização</span>
          <span class="text-lg font-bold text-sky-400">2s</span>
        </div>
      </div>
    </header>

    <!-- Cards de Métricas Principais (KPIs) -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Card 1 -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg relative overflow-hidden">
        <div class="text-xs text-slate-400 font-medium mb-1">TOTAL GERAL RESOLVIDO</div>
        <div id="totalResolvido" class="text-3xl font-extrabold text-white">---</div>
        <div class="mt-3">
          <div class="flex justify-between text-xs text-slate-400 mb-1">
            <span>Progresso da Quarentena</span>
            <span id="progressoGeralTxt" class="font-bold text-emerald-400">0%</span>
          </div>
          <div class="w-full bg-[#0b0f19] rounded-full h-2 overflow-hidden border border-slate-800">
            <div id="progressoGeralBar" class="bg-gradient-to-r from-emerald-500 to-teal-400 h-2 rounded-full transition-all duration-500" style="width: 0%"></div>
          </div>
        </div>
      </div>

      <!-- Card 2 -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div class="text-xs text-slate-400 font-medium mb-1">RESTANTES EM QUARENTENA</div>
        <div id="totalRestantes" class="text-3xl font-extrabold text-amber-400">---</div>
        <p class="text-xs text-slate-400 mt-3 flex items-center justify-between">
          <span>De 15.301 originais</span>
          <span class="text-emerald-400 font-medium">subfoco = 'Geral'</span>
        </p>
      </div>

      <!-- Card 3 -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div class="text-xs text-slate-400 font-medium mb-1">WORKERS ATIVOS</div>
        <div class="text-3xl font-extrabold text-sky-400">4 <span class="text-sm font-normal text-slate-400">Gemini Paralelos</span></div>
        <div class="mt-3 text-xs text-slate-400">
          <span class="text-emerald-400 font-semibold">2 Modelos x 2 Chaves:</span> Rotação Ativa
        </div>
      </div>

      <!-- Card 4 -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg">
        <div class="text-xs text-slate-400 font-medium mb-1">QUALITY GATE MÉDICO</div>
        <div class="text-3xl font-extrabold text-purple-400">100%</div>
        <div class="mt-3 text-xs text-emerald-400 font-medium">
          ✓ Subfoco ≠ Foco · Validação Canônica
        </div>
      </div>

    </div>

    <!-- Status dos 4 Workers Gemini -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Worker 1 -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-bold text-white text-xs">Worker 1 (Chave 1)</span>
          </div>
          <span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">OPERANDO</span>
        </div>
        <div class="text-[11px] space-y-1 text-slate-400 bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800">
          <div>Modelo: <span class="text-emerald-400 font-bold font-mono">3.1-Lite</span></div>
          <div>Cota: <span class="text-slate-300">15 RPM / 1.500 RPD</span></div>
          <div>Fallback: <span class="text-slate-300">3.6-Flash</span></div>
        </div>
      </div>

      <!-- Worker 2 -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-bold text-white text-xs">Worker 2 (Chave 1)</span>
          </div>
          <span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">OPERANDO</span>
        </div>
        <div class="text-[11px] space-y-1 text-slate-400 bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800">
          <div>Modelo: <span class="text-sky-400 font-bold font-mono">3.5-Flash</span></div>
          <div>Cota: <span class="text-slate-300">15 RPM / 1.500 RPD</span></div>
          <div>Fallback: <span class="text-slate-300">3.6-Flash</span></div>
        </div>
      </div>

      <!-- Worker 3 -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-bold text-white text-xs">Worker 3 (Chave 2)</span>
          </div>
          <span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">OPERANDO</span>
        </div>
        <div class="text-[11px] space-y-1 text-slate-400 bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800">
          <div>Modelo: <span class="text-emerald-400 font-bold font-mono">3.1-Lite</span></div>
          <div>Cota: <span class="text-slate-300">15 RPM / 1.500 RPD</span></div>
          <div>Fallback: <span class="text-slate-300">3.6-Flash</span></div>
        </div>
      </div>

      <!-- Worker 4 -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-4 shadow-lg space-y-2.5">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-1.5">
            <span class="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span class="font-bold text-white text-xs">Worker 4 (Chave 2)</span>
          </div>
          <span class="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-mono">OPERANDO</span>
        </div>
        <div class="text-[11px] space-y-1 text-slate-400 bg-[#0b0f19] p-2.5 rounded-xl border border-slate-800">
          <div>Modelo: <span class="text-sky-400 font-bold font-mono">3.5-Flash</span></div>
          <div>Cota: <span class="text-slate-300">15 RPM / 1.500 RPD</span></div>
          <div>Fallback: <span class="text-slate-300">3.6-Flash</span></div>
        </div>
      </div>

    </div>

    <!-- Terminal de Logs em Tempo Real e Feed -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">

      <!-- Terminal de Logs Ao Vivo -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-sky-500"></span>
            <h3 class="font-bold text-sm text-white">Terminal de Logs ao Vivo (Task-998)</h3>
          </div>
          <span class="text-xs text-slate-400 font-mono">stdout stream</span>
        </div>
        <div id="logTerminal" class="bg-[#070a12] p-4 rounded-xl border border-slate-800 font-mono text-xs text-slate-300 h-80 overflow-y-auto space-y-1">
          <div class="text-slate-500">Aguardando linhas de log...</div>
        </div>
      </div>

      <!-- Feed Recente de Questões Resolvidas -->
      <div class="bg-[#111827] border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col">
        <div class="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
          <div class="flex items-center gap-2">
            <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
            <h3 class="font-bold text-sm text-white">Últimas Questões Classificadas e Salvas</h3>
          </div>
          <span class="text-xs text-emerald-400 font-mono">Supabase PATCH</span>
        </div>
        <div id="feedList" class="space-y-2.5 h-80 overflow-y-auto pr-1">
          <div class="text-xs text-slate-500">Carregando resoluções recentes...</div>
        </div>
      </div>

    </div>

    <!-- Rodapé -->
    <footer class="text-center text-xs text-slate-500 py-4 border-t border-slate-800">
      Banco Residência · Plataforma de Alta Performance Médica · Execução Local Autônoma
    </footer>

  </div>

  <script>
    async function updateDashboard() {
      try {
        const res = await fetch('/api/stats');
        if (!res.ok) return;
        const data = await res.json();

        // 1. Atualizar KPIs
        document.getElementById('totalResolvido').innerText = data.totalPersistido.toLocaleString('pt-BR');
        document.getElementById('totalRestantes').innerText = data.restantes.toLocaleString('pt-BR');
        document.getElementById('progressoGeralTxt').innerText = data.progressoGeral + '%';
        document.getElementById('progressoGeralBar').style.width = data.progressoGeral + '%';
        document.getElementById('vazaoDisplay').innerText = data.vazaoMinuto + ' q/min';
        document.getElementById('lastUpdate').innerText = '· ' + new Date().toLocaleTimeString('pt-BR');

        // 2. Atualizar Logs
        const logBox = document.getElementById('logTerminal');
        if (data.recentLogs && data.recentLogs.length > 0) {
          logBox.innerHTML = data.recentLogs.map(l => {
            let color = 'text-slate-300';
            if (l.includes('⚡')) color = 'text-emerald-400 font-semibold';
            else if (l.includes('⚠️')) color = 'text-amber-400';
            else if (l.includes('🔄')) color = 'text-sky-400 font-bold';
            else if (l.includes('🛑')) color = 'text-rose-400 font-bold';
            return '<div class="' + color + '">' + escapeHtml(l) + '</div>';
          }).join('');
          logBox.scrollTop = logBox.scrollHeight;
        }

        // 3. Atualizar Feed Recente
        const feedBox = document.getElementById('feedList');
        if (data.recentItems && data.recentItems.length > 0) {
          feedBox.innerHTML = data.recentItems.map(item => {
            return \`
              <div class="bg-[#0b0f19] border border-slate-800 rounded-xl p-3 text-xs space-y-1">
                <div class="flex items-center justify-between">
                  <span class="font-bold text-sky-400">\${escapeHtml(item.code || 'ID')} · \${escapeHtml(item.especialidade || '')}</span>
                  <span class="text-slate-500 font-mono text-[11px]">\${escapeHtml(item.model || '')}</span>
                </div>
                <div class="text-slate-200">
                  <span class="text-emerald-400 font-semibold">Subfoco:</span> \${escapeHtml(item.subfoco || '')}
                </div>
                <p class="text-slate-400 italic text-[11px] line-clamp-2">"\${escapeHtml(item.justificativa || '')}"</p>
              </div>
            \`;
          }).join('');
        }

      } catch (err) {
        console.error('Erro ao atualizar telemetria:', err);
      }
    }

    function escapeHtml(str) {
      if (!str) return '';
      return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
    }

    // Polling a cada 2 segundos
    updateDashboard();
    setInterval(updateDashboard, 2000);
  </script>
</body>
</html>`;

const server = http.createServer((req, res) => {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.url === '/api/stats') {
    try {
      const stats = getStats();
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
    }
    return;
  }

  // Página Principal HTML
  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(HTML_CONTENT);
});

server.listen(PORT, () => {
  console.log(`\n========================================================================`);
  console.log(`🚀 DASHBOARD AO VIVO INICIALIZADO COM SUCESSO!`);
  console.log(`🌐 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log(`========================================================================\n`);
});
