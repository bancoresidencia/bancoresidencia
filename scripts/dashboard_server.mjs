import http from 'http';
import fs from 'fs';
import path from 'path';
import { spawn } from 'child_process';

const PORT = 3005;
const STATE_PATH = path.resolve('data/pipeline_progress_state.json');
const SIGNAL_PATH = path.resolve('data/pipeline.signal');

const SPECIALTY_MAP = {
  ginecologia: { file: 'data/ginecologia_direto_questions.json', name: 'Ginecologia', next: 'obstetricia' },
  obstetricia: { file: 'data/obstetricia_direto_questions.json', name: 'Obstetrícia', next: 'pediatria' },
  pediatria: { file: 'data/pediatria_direto_questions.json', name: 'Pediatria', next: 'clinica' },
  clinica: { file: 'data/clinica_medica_direto_questions.json', name: 'Clínica Médica', next: 'cirurgia' },
  cirurgia: { file: 'data/cirurgia_direto_questions.json', name: 'Cirurgia', next: 'preventiva' },
  preventiva: { file: 'data/medicina_preventiva_direto_questions.json', name: 'Medicina Preventiva', next: 'none' }
};

let runnerProcess = null;

function getStatus() {
  if (fs.existsSync(STATE_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    } catch {
      return { status: 'ERROR_READING_STATE' };
    }
  }
  return { status: 'IDLE' };
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

      const specKey = url.searchParams.get('specialty') || 'ginecologia';
      const spec = SPECIALTY_MAP[specKey] || SPECIALTY_MAP['ginecologia'];
      const workers = url.searchParams.get('workers') || '4';
      const nextSpec = url.searchParams.get('next') || spec.next;

      if (fs.existsSync(SIGNAL_PATH)) fs.unlinkSync(SIGNAL_PATH);

      runnerProcess = spawn('node', [
        'scripts/produce_specialty_batch.mjs',
        `--file=${spec.file}`,
        `--specialty=${spec.name}`,
        `--workers=${workers}`,
        `--next=${nextSpec}`
      ], {
        stdio: 'inherit',
        detached: true
      });
      runnerProcess.unref();

      return sendJson(res, { ok: true, message: `Produção de ${spec.name} iniciada com ${workers} workers! Próxima: ${nextSpec.toUpperCase()}` });
    }

    if (url.pathname === '/api/action/pause') {
      fs.writeFileSync(SIGNAL_PATH, 'pause', 'utf8');
      return sendJson(res, { ok: true, message: 'Sinal de pausa enviado.' });
    }

    if (url.pathname === '/api/action/resume') {
      if (fs.existsSync(SIGNAL_PATH)) fs.unlinkSync(SIGNAL_PATH);
      return sendJson(res, { ok: true, message: 'Execução retomada.' });
    }

    if (url.pathname === '/api/action/stop') {
      fs.writeFileSync(SIGNAL_PATH, 'stop', 'utf8');
      return sendJson(res, { ok: true, message: 'Sinal de parada enviado.' });
    }
  }

  // Frontend HTML do Dashboard
  if (url.pathname === '/' || url.pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(renderDashboardHtml());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not Found');
});

function renderDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <title>Banco Residência · Esteira Padrão-Ouro Ao Vivo</title>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @keyframes pulse-slow {
      0%, 100% { opacity: 1; transform: scale(1); }
      50% { opacity: 0.8; transform: scale(1.03); }
    }
    .pulse-live { animation: pulse-slow 2s infinite ease-in-out; }
    ::-webkit-scrollbar { width: 6px; height: 6px; }
    ::-webkit-scrollbar-track { background: #0B0F17; }
    ::-webkit-scrollbar-thumb { background: #1E293B; border-radius: 4px; }
    ::-webkit-scrollbar-thumb:hover { background: #334155; }
  </style>
</head>
<body class="bg-[#0B0F17] text-slate-100 font-sans antialiased min-h-screen p-4 md:p-8">

  <div class="max-w-7xl mx-auto space-y-6">

    <!-- Topbar -->
    <header class="bg-[#121826] border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col md:flex-row md:items-center md:justify-between gap-4">
      <div>
        <div class="flex items-center gap-3 mb-2">
          <span id="badgeStatus" class="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 pulse-live">
            <span class="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span id="txtStatus">ESTEIRA ATIVA</span>
          </span>
          <span class="text-xs text-slate-400 font-mono">MODELO: GEMINI 2.5 FLASH LITE</span>
          <span class="text-xs px-2.5 py-0.5 rounded-full font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">CUSTO: R$ 0,00</span>
        </div>
        <h1 class="text-2xl md:text-3xl font-extrabold text-white tracking-tight flex items-center gap-3">
          <span>Banco Residência</span>
          <span class="text-xs font-bold px-2.5 py-1 bg-amber-500/10 text-amber-400 border border-amber-500/20 rounded-lg uppercase tracking-wider">Padrão-Ouro</span>
        </h1>
        <p class="text-sm text-slate-400 mt-1">
          Orquestração Contínua de Resoluções Médicas com Âncora de Ouro · Tabela <span class="text-amber-400 font-mono">questions_direto</span>
        </p>
      </div>

      <!-- Controles Rápidos -->
      <div class="flex flex-wrap items-center gap-3">
        <select id="selSpecialty" class="bg-[#1A2234] border border-slate-700 text-xs rounded-xl px-3 py-2.5 font-medium text-slate-200 focus:outline-none focus:border-indigo-500">
          <option value="ginecologia" selected>Ginecologia ➔ Obstetrícia</option>
          <option value="obstetricia">Obstetrícia</option>
          <option value="pediatria">Pediatria</option>
          <option value="clinica">Clínica Médica</option>
          <option value="cirurgia">Cirurgia Geral</option>
          <option value="preventiva">Medicina Preventiva</option>
        </select>

        <select id="selWorkers" class="bg-[#1A2234] border border-slate-700 text-xs rounded-xl px-3 py-2.5 font-medium text-slate-200 focus:outline-none focus:border-indigo-500">
          <option value="4" selected>4 Workers</option>
          <option value="6">6 Workers</option>
        </select>

        <button onclick="triggerAction('start')" class="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5 shadow-lg shadow-indigo-600/20">
          <i class="fa-solid fa-play"></i> Iniciar
        </button>
        <button onclick="triggerAction('pause')" class="bg-amber-600/80 hover:bg-amber-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5">
          <i class="fa-solid fa-pause"></i> Pausar
        </button>
        <button onclick="triggerAction('resume')" class="bg-emerald-600/80 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5">
          <i class="fa-solid fa-rotate-right"></i> Retomar
        </button>
        <button onclick="triggerAction('stop')" class="bg-rose-600/80 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition flex items-center gap-1.5">
          <i class="fa-solid fa-stop"></i> Parar
        </button>
      </div>
    </header>

    <!-- Cards Principais de Métricas -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      <!-- Especialidade Atual -->
      <div class="bg-[#121826] border border-slate-800 p-5 rounded-2xl shadow-xl">
        <span class="text-xs font-semibold text-slate-400 block mb-1">Especialidade em Execução</span>
        <div class="flex items-baseline justify-between">
          <h2 id="cardSpecialty" class="text-xl font-extrabold text-white">Carregando...</h2>
        </div>
        <div class="mt-2 text-xs text-amber-400 flex items-center gap-1">
          <i class="fa-solid fa-arrow-right-arrow-left"></i>
          <span>Próxima: <strong id="cardNextSpecialty">Obstetrícia</strong></span>
        </div>
      </div>

      <!-- Progresso de Conclusão -->
      <div class="bg-[#121826] border border-slate-800 p-5 rounded-2xl shadow-xl">
        <span class="text-xs font-semibold text-slate-400 block mb-1">Progresso do Lote</span>
        <div class="flex items-baseline justify-between">
          <span id="cardProgressCount" class="text-2xl font-black text-white">0 / 0</span>
          <span id="cardProgressPct" class="text-sm font-bold text-indigo-400">0%</span>
        </div>
        <div class="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
          <div id="barProgress" class="bg-gradient-to-r from-indigo-500 to-emerald-400 h-full rounded-full transition-all duration-500" style="width: 0%"></div>
        </div>
      </div>

      <!-- Velocidade e ETA -->
      <div class="bg-[#121826] border border-slate-800 p-5 rounded-2xl shadow-xl">
        <span class="text-xs font-semibold text-slate-400 block mb-1">Velocidade & Estimativa</span>
        <div class="flex items-baseline justify-between">
          <span id="cardVelocity" class="text-2xl font-black text-white">0.0 <span class="text-xs font-normal text-slate-400">q/min</span></span>
          <span id="cardElapsed" class="text-xs font-mono text-slate-400">00:00</span>
        </div>
        <div class="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <i class="fa-regular fa-clock text-indigo-400"></i>
          <span>Tempo Restante: <strong id="cardETA" class="text-white">--</strong></span>
        </div>
      </div>

      <!-- Sucessos e Tokens -->
      <div class="bg-[#121826] border border-slate-800 p-5 rounded-2xl shadow-xl">
        <span class="text-xs font-semibold text-slate-400 block mb-1">Estatísticas de Geração</span>
        <div class="flex items-baseline justify-between">
          <span id="cardSuccess" class="text-2xl font-black text-emerald-400">0 <span class="text-xs font-normal text-slate-400">sucessos</span></span>
          <span id="cardErrors" class="text-xs font-bold text-rose-400">0 falhas</span>
        </div>
        <div class="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>Tokens Totais:</span>
          <strong id="cardTokens" class="text-slate-200 font-mono">0</strong>
        </div>
      </div>

    </div>

    <!-- Feed Ao Vivo e Histórico -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      
      <!-- Lista das Últimas Questões -->
      <div class="lg:col-span-2 bg-[#121826] border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div class="flex items-center justify-between mb-4">
          <h3 class="text-base font-bold text-white flex items-center gap-2">
            <i class="fa-solid fa-list-check text-indigo-400"></i>
            <span>Últimas Questões Comentadas Padrão-Ouro</span>
          </h3>
          <span class="text-xs text-slate-400">Atualização em tempo real (2s)</span>
        </div>

        <div class="overflow-x-auto">
          <table class="w-full text-left text-xs text-slate-300">
            <thead class="text-slate-400 bg-slate-800/40 border-b border-slate-800 uppercase font-semibold">
              <tr>
                <th class="py-3 px-3">Código</th>
                <th class="py-3 px-3">Tema</th>
                <th class="py-3 px-3">Tempo</th>
                <th class="py-3 px-3">Tokens</th>
                <th class="py-3 px-3">Status</th>
                <th class="py-3 px-3">Hora</th>
              </tr>
            </thead>
            <tbody id="tblRecentBody" class="divide-y divide-slate-800 font-mono">
              <tr>
                <td colspan="6" class="text-center py-8 text-slate-500 font-sans">Aguardando primeiras questões...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Resumo Estratégico & Destaques Pedagógicos -->
      <div class="bg-[#121826] border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
        <div>
          <h3 class="text-base font-bold text-white mb-4 flex items-center gap-2">
            <i class="fa-solid fa-shield-halved text-amber-400"></i>
            <span>Protocolo Padrão-Ouro Ativo</span>
          </h3>

          <ul class="space-y-3 text-xs text-slate-300">
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-emerald-400 mt-0.5"></i>
              <span><strong>Âncora de Ouro:</strong> Respeito inegociável ao gabarito homologado da banca.</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-emerald-400 mt-0.5"></i>
              <span><strong>Negrito no Erro:</strong> Trecho incorreto destacado em negrito + correção médica.</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-emerald-400 mt-0.5"></i>
              <span><strong>Take-Home Message:</strong> Síntese de alto rendimento memorável.</span>
            </li>
            <li class="flex items-start gap-2">
              <i class="fa-solid fa-check text-emerald-400 mt-0.5"></i>
              <span><strong>Sincronização Dupla:</strong> Atualização imediata em <code class="text-amber-400">questions_direto</code> e SQLite local.</span>
            </li>
          </ul>
        </div>

        <div class="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-400 space-y-2">
          <div class="flex justify-between">
            <span>Pool de Chaves:</span>
            <span class="text-emerald-400 font-bold">7 Chaves Free Ativas</span>
          </div>
          <div class="flex justify-between">
            <span>Fallback Automático:</span>
            <span class="text-slate-200">Ativado (12 retries)</span>
          </div>
        </div>
      </div>

    </div>

  </div>

  <script>
    async function updateDashboard() {
      try {
        const res = await fetch('/api/status');
        const d = await res.json();

        // Status Badge
        const bStatus = document.getElementById('badgeStatus');
        const tStatus = document.getElementById('txtStatus');
        if (d.status === 'RUNNING') {
          bStatus.className = 'inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 pulse-live';
          tStatus.textContent = 'ESTEIRA ATIVA';
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

        // Métricas
        document.getElementById('cardSpecialty').textContent = d.specialty || '--';
        document.getElementById('cardNextSpecialty').textContent = d.nextSpecialty ? d.nextSpecialty.toUpperCase() : 'NENHUM';
        document.getElementById('cardProgressCount').textContent = (d.processedCount || 0) + ' / ' + (d.totalToProcess || 0);
        document.getElementById('cardProgressPct').textContent = (d.progressPercent || 0) + '%';
        document.getElementById('barProgress').style.width = (d.progressPercent || 0) + '%';

        if (d.velocity) {
          document.getElementById('cardVelocity').innerHTML = (d.velocity.questionsPerMinute || 0) + ' <span class="text-xs font-normal text-slate-400">q/min</span>';
          document.getElementById('cardETA').textContent = d.velocity.etaFormatted || '--';
          const el = d.velocity.elapsedSeconds || 0;
          const mins = Math.floor(el / 60);
          const secs = el % 60;
          document.getElementById('cardElapsed').textContent = String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        }

        document.getElementById('cardSuccess').innerHTML = (d.successCount || 0) + ' <span class="text-xs font-normal text-slate-400">sucessos</span>';
        document.getElementById('cardErrors').textContent = (d.errorCount || 0) + ' falhas';
        document.getElementById('cardTokens').textContent = (d.tokens ? (d.tokens.totalTokens || 0).toLocaleString('pt-BR') : '0');

        // Tabela recente
        const tbody = document.getElementById('tblRecentBody');
        if (d.recentHistory && d.recentHistory.length > 0) {
          tbody.innerHTML = d.recentHistory.map(item => {
            const isOk = item.status === 'OK';
            const badge = isOk 
              ? '<span class="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">OK</span>'
              : '<span class="text-rose-400 font-bold bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">' + item.status + '</span>';
            return '<tr class="hover:bg-slate-800/30 transition">' +
              '<td class="py-2.5 px-3 font-semibold text-white">' + item.code + '</td>' +
              '<td class="py-2.5 px-3 text-slate-300 font-sans truncate max-w-[200px]">' + (item.tema || '--') + '</td>' +
              '<td class="py-2.5 px-3 text-indigo-300">' + (item.duration || 0) + 's</td>' +
              '<td class="py-2.5 px-3 text-slate-400">' + (item.tokens || 0) + '</td>' +
              '<td class="py-2.5 px-3">' + badge + '</td>' +
              '<td class="py-2.5 px-3 text-slate-400">' + item.timestamp + '</td>' +
            '</tr>';
          }).join('');
        }
      } catch (e) {
        console.error('Erro ao atualizar dashboard:', e);
      }
    }

    async function triggerAction(action) {
      const spec = document.getElementById('selSpecialty').value;
      const workers = document.getElementById('selWorkers').value;
      try {
        const res = await fetch('/api/action/' + action + '?specialty=' + spec + '&workers=' + workers, { method: 'POST' });
        const d = await res.json();
        alert(d.message);
        updateDashboard();
      } catch (err) {
        alert('Erro ao enviar ação: ' + err.message);
      }
    }

    setInterval(updateDashboard, 2000);
    updateDashboard();
  </script>
</body>
</html>`;
}

server.listen(PORT, () => {
  console.log('='.repeat(80));
  console.log(`📊 DASHBOARD DE MONITORAMENTO APERFEIÇOADO (Porta ${PORT})`);
  console.log(`🌐 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log('='.repeat(80));
});
