import http from 'http';
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const PORT = 3333;
const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');
const DB_PATH = path.join(DATA_DIR, 'provaderesidencia_coleta_parte2.db');
const STATUS_FILE = path.join(DATA_DIR, 'coleta_provaderesidencia_parte2_status.json');
const LOG_FILE = path.join(DATA_DIR, 'coleta_provaderesidencia_parte2.log');
const IMAGES_DIR = path.join(DATA_DIR, 'imagens_provaderesidencia');

let cachedData = {
  success: true,
  timestamp: new Date().toISOString(),
  localTime: new Date().toLocaleTimeString('pt-BR'),
  stats: {
    totalProvas: 495,
    concluidas: 0,
    pendentes: 495,
    emProgresso: 0,
    erros: 0,
    pct: '0.0',
    totalQ: 0,
    comGab: 0,
    anuladas: 0,
    comFiltros: 0,
    totalWebp: 0
  },
  provaAtual: null,
  questoesProvaAtual: 0,
  ultimasProvas: [],
  ultimasImagens: [],
  liveStatus: null,
  logTail: []
};

function refreshDataFromDb() {
  if (!fs.existsSync(DB_PATH)) return;

  try {
    const db = new DatabaseSync(DB_PATH, { readOnly: true });
    db.exec('PRAGMA busy_timeout = 5000;');

    const provasRows = db.prepare('SELECT status, count(*) as count FROM provas GROUP BY status').all();
    const statusMap = {};
    for (const r of provasRows) statusMap[r.status] = r.count;

    const totalProvas = Object.values(statusMap).reduce((a, b) => a + b, 0);
    const concluidas = statusMap['concluida'] || 0;
    const pendentes = statusMap['pendente'] || 0;
    const emProgresso = statusMap['em_progresso'] || 0;
    const erros = statusMap['erro'] || 0;
    const pct = totalProvas > 0 ? ((concluidas / totalProvas) * 100).toFixed(1) : '0.0';

    const totalQ = db.prepare('SELECT count(*) as count FROM questoes').get().count;
    const comGab = db.prepare("SELECT count(*) as count FROM questoes WHERE gabarito_oficial != ''").get().count;
    const anuladas = db.prepare('SELECT count(*) as count FROM questoes WHERE is_anulada = 1').get().count;
    const comFiltros = db.prepare("SELECT count(*) as count FROM questoes WHERE filtros_json != '{}' AND filtros_json IS NOT NULL").get().count;

    const totalWebp = db.prepare('SELECT count(*) as count FROM imagens_arquivo').get().count;

    const provaAtual = db.prepare("SELECT * FROM provas WHERE status = 'em_progresso' LIMIT 1").get() || null;
    let questoesProvaAtual = 0;
    if (provaAtual) {
      questoesProvaAtual = db.prepare('SELECT count(*) as count FROM questoes WHERE prova_id = ?').get(provaAtual.id).count;
    }

    const ultimasProvas = db.prepare(`
      SELECT id, titulo, instituicao_raw, ano, modalidade, total_questoes, status, updated_at
      FROM provas
      WHERE status = 'concluida'
      ORDER BY updated_at DESC
      LIMIT 15
    `).all();

    const ultimasImagensRaw = db.prepare(`
      SELECT questao_id, url, local_path, created_at
      FROM imagens_arquivo
      ORDER BY id DESC
      LIMIT 18
    `).all();

    const ultimasImagens = ultimasImagensRaw.map(img => {
      const fileName = path.basename(img.local_path);
      return {
        ...img,
        fileName,
        webpUrl: '/images/' + fileName
      };
    });

    db.close();

    let liveStatus = null;
    if (fs.existsSync(STATUS_FILE)) {
      try {
        liveStatus = JSON.parse(fs.readFileSync(STATUS_FILE, 'utf8'));
      } catch { }
    }

    let logTail = [];
    if (fs.existsSync(LOG_FILE)) {
      try {
        const lines = fs.readFileSync(LOG_FILE, 'utf8').trim().split('\n');
        logTail = lines.slice(-25);
      } catch { }
    }

    cachedData = {
      success: true,
      timestamp: new Date().toISOString(),
      localTime: new Date().toLocaleTimeString('pt-BR'),
      stats: {
        totalProvas,
        concluidas,
        pendentes,
        emProgresso,
        erros,
        pct,
        totalQ,
        comGab,
        anuladas,
        comFiltros,
        totalWebp
      },
      provaAtual,
      questoesProvaAtual,
      ultimasProvas,
      ultimasImagens,
      liveStatus,
      logTail
    };
  } catch (err) {
    console.warn('Alerta na leitura do SQLite (cache preservado):', err.message);
  }
}

// Inicializa cache imediatamente
refreshDataFromDb();
setInterval(refreshDataFromDb, 1500);

function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function getHtml(d) {
  const s = d.stats || {};
  const currentProofTitle = d.provaAtual ? `#${d.provaAtual.id}: ${d.provaAtual.titulo}` : (d.liveStatus?.details || 'Fila em andamento');
  const currentProofQuestions = d.provaAtual ? `${d.questoesProvaAtual || 0} questões salvas` : '';

  const initialRows = (d.ultimasProvas || []).map(p => {
    const hora = p.updated_at ? p.updated_at.split(' ')[1] || p.updated_at : '-';
    return `
      <tr>
        <td>
          <div style="font-weight: 700; color: #fff; max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.titulo)}</div>
          <div style="font-size: 11px; color: var(--text-muted); max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(p.instituicao_raw || '-')}</div>
        </td>
        <td class="mono" style="color: #cbd5e1;">${p.ano || '-'}</td>
        <td class="mono" style="text-align: center; font-weight: 700; color: #34d399;">${p.total_questoes} q</td>
        <td class="mono" style="color: var(--text-muted); font-size: 11px;">${hora}</td>
        <td style="text-align: right;"><span class="tag-ok">CONCLUÍDA</span></td>
      </tr>
    `;
  }).join('');

  const initialImages = (d.ultimasImagens || []).map(img => `
    <div class="thumb-wrap" onclick="abrirModal('${img.webpUrl}', 'Questão #${img.questao_id} | ${img.fileName}')">
      <img src="${img.webpUrl}" alt="WebP" loading="lazy" onerror="this.parentElement.style.display='none'">
      <div class="thumb-caption">Q #${img.questao_id}</div>
    </div>
  `).join('');

  const initialLogs = (d.logTail || []).map(line => {
    let cls = 'log-line';
    if (line.includes('✅')) cls += ' log-success';
    else if (line.includes('⚠️')) cls += ' log-warn';
    else if (line.includes('❌') || line.includes('Erro')) cls += ' log-err';
    else if (line.includes('🚀') || line.includes('📂')) cls += ' log-info';
    return `<div class="${cls}">${escapeHtml(line)}</div>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Coletor Prova de Residência — Monitor Live</title>
  <style>
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --bg: #07090e;
      --card-bg: rgba(15, 20, 32, 0.88);
      --card-border: rgba(255, 255, 255, 0.08);
      --card-border-hover: rgba(99, 102, 241, 0.35);
      --text: #f1f5f9;
      --text-muted: #94a3b8;
      --accent-emerald: #10b981;
      --accent-cyan: #06b6d4;
      --accent-indigo: #6366f1;
      --accent-amber: #f59e0b;
      --accent-rose: #f43f5e;
      --font: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      --mono: "SFMono-Regular", Consolas, "Liberation Mono", Menlo, monospace;
    }
    body {
      background-color: var(--bg);
      color: var(--text);
      font-family: var(--font);
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      padding: 24px 32px;
      line-height: 1.5;
    }
    .mono { font-family: var(--mono); }
    .max-w { max-width: 1320px; width: 100%; margin: 0 auto; }

    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 16px;
      padding-bottom: 20px;
      border-bottom: 1px solid var(--card-border);
      margin-bottom: 24px;
    }
    .header-left { display: flex; align-items: center; gap: 16px; }
    .header-icon {
      width: 48px; height: 48px; border-radius: 14px;
      background: linear-gradient(135deg, #4f46e5, #06b6d4);
      display: flex; align-items: center; justify-content: center;
      font-size: 24px; flex-shrink: 0;
    }
    .header-titles h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
    .header-titles p { font-size: 13px; color: var(--text-muted); }
    .header-right { display: flex; align-items: center; gap: 12px; }

    .badge-live {
      display: inline-flex; align-items: center; gap: 6px;
      padding: 4px 10px; border-radius: 9999px; font-size: 11px; font-weight: 700;
      background: rgba(16, 185, 129, 0.15); color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);
    }
    .pulse-dot {
      width: 8px; height: 8px; border-radius: 50%; background: #34d399;
      animation: pulse 1.5s infinite;
    }
    @keyframes pulse { 0%, 100% { opacity: 1; transform: scale(1); } 50% { opacity: 0.4; transform: scale(1.2); } }

    .btn {
      background: rgba(30, 41, 59, 0.8); color: var(--text); border: 1px solid var(--card-border);
      padding: 6px 14px; border-radius: 10px; font-size: 12px; font-weight: 600; cursor: pointer;
      display: inline-flex; align-items: center; gap: 6px; transition: all 0.2s;
    }
    .btn:hover { background: rgba(51, 65, 85, 0.9); border-color: rgba(255, 255, 255, 0.2); }

    .card {
      background: var(--card-bg);
      border: 1px solid var(--card-border);
      border-radius: 18px;
      padding: 24px;
      backdrop-filter: blur(12px);
      transition: border-color 0.2s;
    }
    .card:hover { border-color: var(--card-border-hover); }

    .banner-top {
      display: flex; flex-direction: column; gap: 16px; margin-bottom: 24px;
    }
    .banner-header { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; }
    .pct-big {
      font-size: 52px; font-weight: 900; line-height: 1;
      background: linear-gradient(90deg, #34d399, #22d3ee);
      -webkit-background-clip: text; -webkit-text-fill-color: transparent;
    }
    .live-box {
      background: rgba(30, 27, 75, 0.5); border: 1px solid rgba(99, 102, 241, 0.3);
      padding: 12px 18px; border-radius: 14px; min-width: 300px; max-width: 480px; flex: 1;
    }
    .progress-track {
      width: 100%; height: 14px; background: rgba(30, 41, 59, 0.8);
      border-radius: 9999px; overflow: hidden; padding: 2px;
    }
    .progress-fill {
      height: 100%; border-radius: 9999px;
      background: linear-gradient(90deg, #10b981, #06b6d4, #6366f1);
      transition: width 0.6s ease;
    }

    .metrics-grid {
      display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
      gap: 16px; margin-bottom: 24px;
    }
    .metric-card {
      background: var(--card-bg); border: 1px solid var(--card-border);
      border-radius: 16px; padding: 18px 20px; border-left: 4px solid var(--accent-indigo);
    }
    .metric-card.green { border-left-color: var(--accent-emerald); }
    .metric-card.cyan { border-left-color: var(--accent-cyan); }
    .metric-card.amber { border-left-color: var(--accent-amber); }
    .metric-label { font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; color: var(--text-muted); font-weight: 600; }
    .metric-val { font-size: 32px; font-weight: 900; margin: 4px 0 2px 0; color: #fff; }
    .metric-sub { font-size: 12px; color: var(--text-muted); }

    .layout-grid {
      display: grid; grid-template-columns: 2fr 1fr; gap: 24px;
    }
    @media (max-width: 1024px) {
      .layout-grid { grid-template-columns: 1fr; }
      body { padding: 16px; }
    }

    .section-title {
      font-size: 15px; font-weight: 700; color: #fff; display: flex;
      align-items: center; justify-content: space-between; margin-bottom: 14px;
    }
    .table-container { overflow-x: auto; }
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    th {
      text-align: left; padding: 10px 12px; color: var(--text-muted);
      text-transform: uppercase; font-size: 11px; letter-spacing: 0.5px;
      border-bottom: 1px solid var(--card-border);
    }
    td { padding: 12px; border-bottom: 1px solid rgba(255, 255, 255, 0.04); }
    tr:hover td { background: rgba(255, 255, 255, 0.02); }
    .tag-ok {
      display: inline-block; padding: 2px 8px; border-radius: 6px;
      font-size: 10px; font-weight: 700; background: rgba(16, 185, 129, 0.15);
      color: #34d399; border: 1px solid rgba(16, 185, 129, 0.3);
    }

    .gallery-grid {
      display: grid; grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
      gap: 10px; margin-top: 14px;
    }
    .thumb-wrap {
      aspect-ratio: 1; border-radius: 12px; overflow: hidden;
      background: #000; border: 1px solid var(--card-border);
      position: relative; cursor: pointer; transition: transform 0.2s, border-color 0.2s;
    }
    .thumb-wrap:hover { transform: scale(1.04); border-color: var(--accent-cyan); }
    .thumb-wrap img { width: 100%; height: 100%; object-fit: cover; display: block; }
    .thumb-caption {
      position: absolute; bottom: 0; inset-x: 0; padding: 4px 6px;
      background: linear-gradient(0deg, rgba(0,0,0,0.85), transparent);
      font-size: 10px; text-align: center; color: var(--accent-cyan); font-family: var(--mono);
    }

    .terminal-box {
      background: #030712; border: 1px solid rgba(255, 255, 255, 0.06);
      border-radius: 14px; padding: 14px; font-family: var(--mono);
      font-size: 11px; color: #a7f3d0; height: 580px; overflow-y: auto;
      display: flex; flex-direction: column; gap: 6px; line-height: 1.6;
    }
    .log-line { word-break: break-all; }
    .log-success { color: #34d399; font-weight: 600; }
    .log-warn { color: #fbbf24; }
    .log-err { color: #fb7185; font-weight: 600; }
    .log-info { color: #38bdf8; }

    .modal-overlay {
      position: fixed; inset: 0; background: rgba(0, 0, 0, 0.85);
      backdrop-filter: blur(8px); display: none; align-items: center;
      justify-content: center; z-index: 100; padding: 20px;
    }
    .modal-content {
      background: #0f172a; border: 1px solid var(--card-border);
      border-radius: 18px; padding: 12px; max-width: 900px; max-height: 90vh;
      position: relative; overflow: hidden; display: flex; flex-direction: column;
    }
    .modal-content img { max-height: 80vh; width: auto; object-fit: contain; border-radius: 10px; }
    .modal-close {
      position: absolute; top: 12px; right: 12px; background: rgba(0,0,0,0.6);
      color: #fff; border: none; border-radius: 50%; width: 32px; height: 32px;
      font-size: 16px; cursor: pointer; display: flex; align-items: center; justify-content: center;
    }
    .modal-close:hover { background: #e11d48; }

    footer {
      text-align: center; margin-top: 32px; font-size: 12px; color: var(--text-muted);
      border-top: 1px solid var(--card-border); padding-top: 16px;
    }
  </style>
</head>
<body>
  <header class="max-w">
    <div class="header-left">
      <div class="header-icon">🏥</div>
      <div class="header-titles">
        <div style="display: flex; align-items: center; gap: 10px;">
          <h1>Coletor Prova de Residência</h1>
          <span id="connBadge" class="badge-live">
            <span class="pulse-dot"></span>
            AO VIVO
          </span>
        </div>
        <p>Banco: <code class="mono" style="color: #a5b4fc;">provaderesidencia_coleta_parte2.db</code> | Filtros Clínicos & Imagens WebP</p>
      </div>
    </div>

    <div class="header-right">
      <button onclick="forcarAtualizacao()" class="btn">
        🔄 Atualizar Agora
      </button>
      <div class="btn" style="cursor: default;">
        🕒 Sincronizado às <strong id="lastClock" class="mono" style="margin-left: 4px; color: #fff;">${d.localTime}</strong>
      </div>
    </div>
  </header>

  <main class="max-w">
    <!-- Progress Banner Pre-Rendered -->
    <div class="card banner-top">
      <div class="banner-header">
        <div>
          <div style="font-size: 12px; text-transform: uppercase; color: var(--text-muted); font-weight: 700; letter-spacing: 0.5px;">
            Progresso Geral da Fila (495 Provas)
          </div>
          <div style="display: flex; align-items: baseline; gap: 12px; margin-top: 4px;">
            <span id="pctVal" class="pct-big mono">${s.pct || '0.0'}%</span>
            <span style="font-size: 14px; color: var(--text-muted);">
              (<strong id="concluidasVal" style="color: #fff;">${(s.concluidas || 0).toLocaleString()}</strong> de <span id="totalProvasVal">${(s.totalProvas || 495).toLocaleString()}</span> concluídas)
            </span>
          </div>
        </div>

        <div class="live-box">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
            <span style="font-size: 10px; font-weight: 700; text-transform: uppercase; color: #a5b4fc; display: flex; align-items: center; gap: 6px;">
              <span class="pulse-dot" style="background: #818cf8;"></span>
              Extraindo Agora
            </span>
            <span id="qProofProgress" class="mono" style="font-size: 12px; font-weight: 700; color: #22d3ee;">${currentProofQuestions}</span>
          </div>
          <div id="liveProofName" style="font-size: 14px; font-weight: 700; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">
            ${escapeHtml(currentProofTitle)}
          </div>
        </div>
      </div>

      <div class="progress-track">
        <div id="progressBar" class="progress-fill" style="width: ${s.pct || 0}%;"></div>
      </div>
    </div>

    <!-- Metrics Cards Pre-Rendered -->
    <div class="metrics-grid">
      <div class="metric-card green">
        <div class="metric-label">Questões Coletadas</div>
        <div id="totalQVal" class="metric-val mono">${(s.totalQ || 0).toLocaleString()}</div>
        <div class="metric-sub" style="color: #34d399;">
          ✔ <span id="comGabVal">${(s.comGab || 0).toLocaleString()}</span> com gabarito oficial
        </div>
      </div>

      <div class="metric-card cyan">
        <div class="metric-label">Imagens WebP Integradas</div>
        <div id="totalWebpVal" class="metric-val mono" style="color: #22d3ee;">${(s.totalWebp || 0).toLocaleString()}</div>
        <div class="metric-sub">Convertidas em WebP + SQLite BLOB</div>
      </div>

      <div class="metric-card">
        <div class="metric-label">Filtros & Metadados</div>
        <div id="comFiltrosVal" class="metric-val mono" style="color: #818cf8;">${(s.comFiltros || 0).toLocaleString()}</div>
        <div class="metric-sub">Especialidades, temas e tags</div>
      </div>

      <div class="metric-card amber">
        <div class="metric-label">Pendentes na Fila</div>
        <div id="pendentesVal" class="metric-val mono" style="color: #fbbf24;">${(s.pendentes || 0).toLocaleString()}</div>
        <div style="display: flex; justify-content: space-between; align-items: center; margin-top: 4px;">
          <span class="metric-sub"><strong id="errosVal" style="color: #f43f5e;">${s.erros || 0}</strong> erros</span>
        </div>
      </div>
    </div>

    <div class="layout-grid">
      <div style="display: flex; flex-direction: column; gap: 24px;">
        <div class="card">
          <div class="section-title">
            <span>📋 Últimas Provas Concluídas</span>
            <span style="font-size: 12px; color: var(--text-muted);">
              Total: <strong id="totalConcluidasBadge" style="color: #34d399;">${(s.concluidas || 0).toLocaleString()}</strong>
            </span>
          </div>

          <div class="table-container">
            <table>
              <thead>
                <tr>
                  <th>Prova</th>
                  <th>Ano</th>
                  <th style="text-align: center;">Questões</th>
                  <th>Conclusão</th>
                  <th style="text-align: right;">Status</th>
                </tr>
              </thead>
              <tbody id="provasTableBody">
                ${initialRows || '<tr><td colspan="5" style="text-align: center; padding: 24px; color: var(--text-muted);">Nenhuma prova concluída ainda.</td></tr>'}
              </tbody>
            </table>
          </div>
        </div>

        <div class="card">
          <div class="section-title">
            <span>🖼️ Galeria de Imagens WebP Coletadas</span>
            <span style="font-size: 12px; color: var(--text-muted);">Prévia ao vivo</span>
          </div>
          <div id="imagensGrid" class="gallery-grid">
            ${initialImages || '<div style="grid-column: 1/-1; text-align: center; padding: 24px; color: var(--text-muted);">Nenhuma imagem salva ainda.</div>'}
          </div>
        </div>
      </div>

      <div>
        <div class="card" style="height: 100%; display: flex; flex-direction: column;">
          <div class="section-title">
            <span>💻 Terminal em Tempo Real</span>
            <span class="mono" style="font-size: 10px; background: rgba(255,255,255,0.06); padding: 2px 6px; border-radius: 4px;">STREAM</span>
          </div>
          <div id="logStream" class="terminal-box">
            ${initialLogs || '<div>Aguardando logs...</div>'}
          </div>
        </div>
      </div>
    </div>
  </main>

  <footer class="max-w">
    Banco Residência — Coletor Autônomo e Dashboard Integrado (Parte 2)
  </footer>

  <div id="imgModal" class="modal-overlay" onclick="fecharModal()">
    <div class="modal-content" onclick="event.stopPropagation()">
      <button class="modal-close" onclick="fecharModal()">✕</button>
      <img id="modalImg" src="" alt="Imagem Ampliada">
      <div id="modalCaption" style="padding-top: 8px; font-size: 12px; color: var(--text-muted); text-align: center; font-family: var(--mono);"></div>
    </div>
  </div>

  <script>
    function abrirModal(src, caption) {
      document.getElementById('modalImg').src = src;
      document.getElementById('modalCaption').innerText = caption;
      document.getElementById('imgModal').style.display = 'flex';
    }

    function fecharModal() {
      document.getElementById('imgModal').style.display = 'none';
    }

    function forcarAtualizacao() {
      updateDashboard();
    }

    async function updateDashboard() {
      try {
        const res = await fetch('/api/status?t=' + Date.now(), { cache: 'no-store' });
        if (!res.ok) throw new Error('HTTP ' + res.status);
        const data = await res.json();
        if (!data || !data.success) return;

        document.getElementById('lastClock').innerText = data.localTime || new Date().toLocaleTimeString('pt-BR');

        const badge = document.getElementById('connBadge');
        badge.innerHTML = '<span class="pulse-dot"></span> AO VIVO';
        badge.className = 'badge-live';

        const s = data.stats || {};
        document.getElementById('pctVal').innerText = (s.pct || '0.0') + '%';
        document.getElementById('progressBar').style.width = (s.pct || 0) + '%';
        document.getElementById('concluidasVal').innerText = (s.concluidas || 0).toLocaleString();
        document.getElementById('totalProvasVal').innerText = (s.totalProvas || 495).toLocaleString();
        document.getElementById('totalConcluidasBadge').innerText = (s.concluidas || 0).toLocaleString();

        document.getElementById('totalQVal').innerText = (s.totalQ || 0).toLocaleString();
        document.getElementById('comGabVal').innerText = (s.comGab || 0).toLocaleString();
        document.getElementById('totalWebpVal').innerText = (s.totalWebp || 0).toLocaleString();
        document.getElementById('comFiltrosVal').innerText = (s.comFiltros || 0).toLocaleString();
        document.getElementById('pendentesVal').innerText = (s.pendentes || 0).toLocaleString();
        document.getElementById('errosVal').innerText = (s.erros || 0).toLocaleString();

        if (data.provaAtual) {
          document.getElementById('liveProofName').innerText = '#' + data.provaAtual.id + ': ' + data.provaAtual.titulo;
          document.getElementById('qProofProgress').innerText = (data.questoesProvaAtual || 0) + ' questões salvas';
        } else if (data.liveStatus && data.liveStatus.details) {
          document.getElementById('liveProofName').innerText = data.liveStatus.details;
          document.getElementById('qProofProgress').innerText = 'Processando...';
        } else {
          document.getElementById('liveProofName').innerText = 'Fila em andamento';
          document.getElementById('qProofProgress').innerText = '';
        }

        const tbody = document.getElementById('provasTableBody');
        if (data.ultimasProvas && data.ultimasProvas.length > 0) {
          tbody.innerHTML = data.ultimasProvas.map(p => {
            const hora = p.updated_at ? p.updated_at.split(' ')[1] || p.updated_at : '-';
            return '<tr>' +
              '<td>' +
                '<div style="font-weight: 700; color: #fff; max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + escapeHtml(p.titulo) + '</div>' +
                '<div style="font-size: 11px; color: var(--text-muted); max-width: 280px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">' + escapeHtml(p.instituicao_raw || '-') + '</div>' +
              '</td>' +
              '<td class="mono" style="color: #cbd5e1;">' + (p.ano || '-') + '</td>' +
              '<td class="mono" style="text-align: center; font-weight: 700; color: #34d399;">' + (p.total_questoes || 0) + ' q</td>' +
              '<td class="mono" style="color: var(--text-muted); font-size: 11px;">' + hora + '</td>' +
              '<td style="text-align: right;"><span class="tag-ok">CONCLUÍDA</span></td>' +
            '</tr>';
          }).join('');
        }

        const imgGrid = document.getElementById('imagensGrid');
        if (data.ultimasImagens && data.ultimasImagens.length > 0) {
          imgGrid.innerHTML = data.ultimasImagens.map(img => {
            const webpUrl = img.webpUrl || ('/images/' + (img.fileName || ''));
            return '<div class="thumb-wrap" onclick="abrirModal(\\'' + webpUrl + '\\', \\'Questão #' + img.questao_id + '\\')">' +
              '<img src="' + webpUrl + '" alt="WebP" loading="lazy" onerror="this.parentElement.style.display=\\'none\\'">' +
              '<div class="thumb-caption">Q #' + img.questao_id + '</div>' +
            '</div>';
          }).join('');
        }

        const logBox = document.getElementById('logStream');
        if (data.logTail && data.logTail.length > 0) {
          logBox.innerHTML = data.logTail.map(line => {
            let cls = 'log-line';
            if (line.includes('✅')) cls += ' log-success';
            else if (line.includes('⚠️')) cls += ' log-warn';
            else if (line.includes('❌') || line.includes('Erro')) cls += ' log-err';
            else if (line.includes('🚀') || line.includes('📂')) cls += ' log-info';
            return '<div class="' + cls + '">' + escapeHtml(line) + '</div>';
          }).join('');
          logBox.scrollTop = logBox.scrollHeight;
        }

      } catch (err) {
        console.warn('Erro na atualização:', err);
      }
    }

    function escapeHtml(text) {
      if (!text) return '';
      return String(text)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
    }

    // Inicia polling a cada 2s
    setInterval(updateDashboard, 2000);
  </script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const parsedUrl = new URL(req.url, 'http://localhost:' + PORT);
  const pathname = parsedUrl.pathname;

  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    res.end(getHtml(cachedData));
    return;
  }

  if (pathname === '/api/status') {
    res.writeHead(200, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, no-cache, must-revalidate'
    });
    res.end(JSON.stringify(cachedData));
    return;
  }

  if (pathname.startsWith('/images/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(IMAGES_DIR, filename);

    if (fs.existsSync(filePath)) {
      res.writeHead(200, {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=86400'
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    } else {
      res.writeHead(404, { 'Content-Type': 'text/plain' });
      res.end('Imagem não encontrada');
      return;
    }
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Not found');
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n================================================================`);
  console.log(`🌐 PAINEL VISUAL DO COLETOR (SSR + PRE-RENDERIZADO) NO AR!`);
  console.log(`👉 Acesse no seu navegador: http://localhost:${PORT}`);
  console.log(`👉 Ou via IP direto: http://127.0.0.1:${PORT}`);
  console.log(`================================================================\n`);
});
