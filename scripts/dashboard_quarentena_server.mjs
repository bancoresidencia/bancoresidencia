import http from 'http';
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const PORT = 3334;
const BASE_DIR = process.cwd();
const DATA_DIR = path.join(BASE_DIR, 'data');
const STAGING_DIR = path.join(DATA_DIR, 'bancos_organizados_staging');
const DB_PATH = path.join(STAGING_DIR, 'questoes_quarentena_pendencia_imagens.db');
const WEBP_DIR = path.join(DATA_DIR, 'extracted_images_webp');

if (!fs.existsSync(DB_PATH)) {
  console.error('ERRO: Banco de dados de quarentena não encontrado em:', DB_PATH);
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

// Helper para ler body JSON
function parseJsonBody(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = urlObj.pathname;

  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. Servir imagens WebP locais
  if (pathname.startsWith('/images/')) {
    const filename = path.basename(pathname);
    const filePath = path.join(WEBP_DIR, filename);
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

  // 2. API /api/stats
  if (pathname === '/api/stats') {
    try {
      const total = db.prepare('SELECT count(*) as c FROM questoes_quarentena').get().c;
      const porCategoria = db.prepare('SELECT categoria_pendencia, count(*) as count FROM questoes_quarentena GROUP BY categoria_pendencia').all();
      const porStatus = db.prepare('SELECT status_extracao, count(*) as count FROM questoes_quarentena GROUP BY status_extracao').all();
      const porTabela = db.prepare('SELECT tabela_origem, count(*) as count FROM questoes_quarentena GROUP BY tabela_origem').all();
      const topBancas = db.prepare("SELECT banca, count(*) as count FROM questoes_quarentena WHERE banca IS NOT NULL AND banca != '' GROUP BY banca ORDER BY count DESC LIMIT 10").all();
      const topEspecialidades = db.prepare("SELECT especialidade, count(*) as count FROM questoes_quarentena WHERE especialidade IS NOT NULL AND especialidade != '' GROUP BY especialidade ORDER BY count DESC LIMIT 10").all();

      const stats = {
        total,
        porCategoria: Object.fromEntries(porCategoria.map(r => [r.categoria_pendencia, r.count])),
        porStatus: Object.fromEntries(porStatus.map(r => [r.status_extracao, r.count])),
        porTabela: Object.fromEntries(porTabela.map(r => [r.tabela_origem, r.count])),
        topBancas,
        topEspecialidades
      };

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(stats));
      return;
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
      return;
    }
  }

  // 3. API /api/questoes
  if (pathname === '/api/questoes') {
    try {
      const page = parseInt(urlObj.searchParams.get('page') || '1', 10);
      const limit = parseInt(urlObj.searchParams.get('limit') || '10', 10);
      const offset = (page - 1) * limit;

      const search = (urlObj.searchParams.get('search') || '').trim();
      const categoria = urlObj.searchParams.get('categoria') || '';
      const status = urlObj.searchParams.get('status') || '';
      const tabela = urlObj.searchParams.get('tabela') || '';
      const banca = urlObj.searchParams.get('banca') || '';
      const especialidade = urlObj.searchParams.get('especialidade') || '';

      const whereClauses = [];
      const params = [];

      if (search) {
        whereClauses.push('(enunciado LIKE ? OR banca LIKE ? OR instituicao LIKE ? OR tema LIKE ? OR id_staging = ?)');
        const sTerm = `%${search}%`;
        const qidNum = parseInt(search, 10) || -1;
        params.push(sTerm, sTerm, sTerm, sTerm, qidNum);
      }

      if (categoria) {
        whereClauses.push('categoria_pendencia = ?');
        params.push(categoria);
      }

      if (status) {
        whereClauses.push('status_extracao = ?');
        params.push(status);
      }

      if (tabela) {
        whereClauses.push('tabela_origem = ?');
        params.push(tabela);
      }

      if (banca) {
        whereClauses.push('banca = ?');
        params.push(banca);
      }

      if (especialidade) {
        whereClauses.push('especialidade = ?');
        params.push(especialidade);
      }

      const whereSql = whereClauses.length > 0 ? `WHERE ${whereClauses.join(' AND ')}` : '';

      // Total filtrado
      const countStmt = db.prepare(`SELECT count(*) as c FROM questoes_quarentena ${whereSql}`);
      const filteredTotal = countStmt.get(...params).c;

      // Itens paginados
      const selectSql = `
        SELECT id_staging, tabela_origem, anchor_source, anchor_original_id, enunciado,
               opcoes_json, gabarito, is_anulada, ano, instituicao, banca, uf, modalidade,
               especialidade, tema, foco, subfoco, dificuldade, comentarios,
               categoria_pendencia, urls_originais, imagens_webp_locais, status_extracao,
               notas_curadoria
        FROM questoes_quarentena
        ${whereSql}
        ORDER BY 
          CASE WHEN categoria_pendencia = 'webp_extraido_sucesso' THEN 0 ELSE 1 END,
          ano DESC, id_staging ASC
        LIMIT ? OFFSET ?
      `;
      const rows = db.prepare(selectSql).all(...params, limit, offset);

      const items = rows.map(r => {
        let opcoes = [];
        try {
          const raw = JSON.parse(r.opcoes_json || '[]');
          if (Array.isArray(raw)) {
            opcoes = raw.map(o => ({
              letra: o.letter || o.letra || '',
              texto: o.text || o.texto || ''
            }));
          }
        } catch (e) { }

        let webps = [];
        try {
          const raw = JSON.parse(r.imagens_webp_locais || '[]');
          webps = raw.map(p => {
            const fname = path.basename(p);
            return `/images/${fname}`;
          });
        } catch (e) { }

        let urlsOriginais = [];
        try { urlsOriginais = JSON.parse(r.urls_originais || '[]'); } catch (e) { }

        return {
          id: r.id_staging,
          tabela: r.tabela_origem,
          banca: r.banca || '—',
          instituicao: r.instituicao || '—',
          ano: r.ano || '—',
          especialidade: r.especialidade || 'Geral',
          tema: r.tema || '',
          foco: r.foco || '',
          enunciado: r.enunciado || '',
          opcoes,
          gabarito: r.gabarito || '',
          categoria: r.categoria_pendencia,
          status: r.status_extracao,
          notas: r.notas_curadoria || '',
          webps,
          urlsOriginais,
          comentarios: r.comentarios || ''
        };
      });

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        total: filteredTotal,
        page,
        limit,
        totalPages: Math.ceil(filteredTotal / limit),
        items
      }));
      return;
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
      return;
    }
  }

  // 4. API /api/avaliar
  if (pathname === '/api/avaliar' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { id, tabela, status, notas } = body;

      if (!id || !tabela || !status) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Parâmetros id, tabela e status são obrigatórios.' }));
        return;
      }

      db.prepare(`
        UPDATE questoes_quarentena
        SET status_extracao = ?, notas_curadoria = ?
        WHERE id_staging = ? AND tabela_origem = ?
      `).run(status, notas || '', id, tabela);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, id, status, notas }));
      return;
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
      return;
    }
  }

  // 5. Interface HTML Principal do Dashboard
  if (pathname === '/' || pathname === '/dashboard') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getDashboardHtml());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Página não encontrada');
});

function getDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Avaliação de Questões com Imagens — Banco Residência</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;600&display=swap" rel="stylesheet">
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          fontFamily: {
            sans: ['"Plus Jakarta Sans"', 'sans-serif'],
            mono: ['"JetBrains Mono"', 'monospace'],
          }
        }
      }
    }
  </script>
  <style>
    .mark-term {
      background-color: #fef08a;
      color: #713f12;
      font-weight: 700;
      padding: 1px 4px;
      border-radius: 4px;
      border-bottom: 2px solid #ca8a04;
    }
    .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
    .custom-scrollbar::-webkit-scrollbar-track { background: #090d16; }
    .custom-scrollbar::-webkit-scrollbar-thumb { background: #1e293b; border-radius: 4px; }
    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #334155; }
  </style>
</head>
<body class="bg-[#07090e] text-slate-100 min-h-screen font-sans flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">

  <!-- Header -->
  <header class="sticky top-0 z-40 bg-[#07090e]/95 backdrop-blur border-b border-slate-800/80 px-6 py-4">
    <div class="max-w-[1600px] mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div class="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-emerald-500/20">
          BR
        </div>
        <div>
          <div class="flex items-center gap-2">
            <h1 class="text-xl font-extrabold text-white tracking-tight">Curadoria e Auditoria de Imagens</h1>
            <span class="px-2 py-0.5 text-[11px] font-bold rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">Localhost :3334</span>
          </div>
          <p class="text-xs text-slate-400">Banco de Expansão • Avaliação de Questões em Quarentena e Extração WebP</p>
        </div>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="refreshData()" class="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold text-slate-300 transition-all flex items-center gap-1.5">
          <svg class="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path></svg>
          Atualizar
        </button>
      </div>
    </div>
  </header>

  <!-- KPI Banner -->
  <section class="border-b border-slate-800/60 bg-[#0b0f19] px-6 py-5">
    <div class="max-w-[1600px] mx-auto grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3" id="kpiContainer">
      <!-- Inserido dinamicamente via JS -->
      <div class="bg-slate-900/60 border border-slate-800/70 rounded-xl p-3 animate-pulse h-20"></div>
      <div class="bg-slate-900/60 border border-slate-800/70 rounded-xl p-3 animate-pulse h-20"></div>
      <div class="bg-slate-900/60 border border-slate-800/70 rounded-xl p-3 animate-pulse h-20"></div>
      <div class="bg-slate-900/60 border border-slate-800/70 rounded-xl p-3 animate-pulse h-20"></div>
      <div class="bg-slate-900/60 border border-slate-800/70 rounded-xl p-3 animate-pulse h-20"></div>
      <div class="bg-slate-900/60 border border-slate-800/70 rounded-xl p-3 animate-pulse h-20"></div>
    </div>
  </section>

  <!-- Filtros e Controles -->
  <section class="px-6 py-4 border-b border-slate-800/50 bg-[#07090e]">
    <div class="max-w-[1600px] mx-auto flex flex-wrap items-center gap-3">
      <!-- Busca Textual -->
      <div class="relative flex-1 min-w-[260px]">
        <input 
          type="text" 
          id="searchInput" 
          placeholder="Buscar no enunciado, ID, banca, tema..." 
          class="w-full bg-[#0d121f] border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 transition-colors"
        >
        <svg class="w-4 h-4 text-slate-500 absolute left-3 top-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
      </div>

      <!-- Filtro Categoria -->
      <select id="filterCategoria" class="bg-[#0d121f] border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500">
        <option value="">Todas Categorias</option>
        <option value="webp_extraido_sucesso">🟢 WebP Extraído e Salvo (331)</option>
        <option value="marcador_ver_imagem">🟡 Marcador (VER IMAGEM) (1.459)</option>
        <option value="mencao_obrigatoria_sem_anexo">🔵 Menção Deítica a Exame (1.063)</option>
        <option value="url_bloqueada_s3">🔴 URL S3 Bloqueada (1)</option>
      </select>

      <!-- Filtro Status Curadoria -->
      <select id="filterStatus" class="bg-[#0d121f] border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500">
        <option value="">Todos os Status</option>
        <option value="recuperada_webp">Recuperada com WebP</option>
        <option value="pendente_recorte_pdf">Pendente Recorte PDF</option>
        <option value="aprovada">Aprovada para Supabase</option>
        <option value="autossuficiente">Autossuficiente (Sem Imagem)</option>
        <option value="descartada">Descartada</option>
      </select>

      <!-- Filtro Tabela -->
      <select id="filterTabela" class="bg-[#0d121f] border border-slate-800 rounded-xl px-3 py-2 text-xs font-medium text-slate-300 focus:outline-none focus:border-emerald-500">
        <option value="">Todas as Tabelas</option>
        <option value="questions_expansion_direto">Acesso Direto</option>
        <option value="questions_expansion_r_plus">R+ Especialidades</option>
        <option value="questions_expansion_revalida">Revalida</option>
        <option value="questions_expansion_titulo_especialista">Título Especialista</option>
      </select>

      <button onclick="resetFilters()" class="text-xs text-slate-400 hover:text-slate-200 underline px-2">Limpar</button>
    </div>
  </section>

  <!-- Lista de Questões -->
  <main class="flex-1 px-6 py-6 max-w-[1600px] w-full mx-auto">
    <!-- Header de Contagem e Paginação -->
    <div class="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 text-xs text-slate-400">
      <div id="resultsCount">Carregando questões...</div>
      <div class="flex items-center gap-2" id="paginationTop"></div>
    </div>

    <!-- Cards Container -->
    <div class="space-y-6" id="questionsContainer">
      <!-- Inserido dinamicamente via JS -->
    </div>

    <!-- Paginação Inferior -->
    <div class="mt-8 flex justify-center items-center gap-2" id="paginationBottom"></div>
  </main>

  <!-- Modal Lightbox para Zoom da Imagem -->
  <div id="imageModal" class="fixed inset-0 z-50 bg-black/90 hidden backdrop-blur-sm flex items-center justify-center p-4" onclick="closeImageModal()">
    <div class="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
      <button onclick="closeImageModal()" class="absolute -top-10 right-0 text-white hover:text-slate-300 font-bold text-sm bg-slate-800/80 px-3 py-1 rounded-full">Fechar (ESC)</button>
      <img id="modalImg" src="" alt="Zoom Imagem Médica" class="max-w-full max-h-[85vh] rounded-2xl object-contain border border-slate-700 shadow-2xl">
    </div>
  </div>

  <script>
    let state = {
      page: 1,
      limit: 10,
      total: 0,
      totalPages: 1,
      items: [],
      stats: null,
      filters: {
        search: '',
        categoria: '',
        status: '',
        tabela: ''
      }
    };

    const HIGHLIGHT_REGEX = /(VER IMAGEM!?|radiografia|tomografia|eletrocardiograma|ECG|raio-x|figura|imagem|foto|gráfico|ressonância|ultrassonografia|USG|RM|TC|lâmina|biópsia|aspecto|lesão|traçado)/gi;

    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        state.stats = data;
        renderKpis(data);
      } catch (e) {
        console.error('Erro ao carregar stats:', e);
      }
    }

    function renderKpis(stats) {
      const c = stats.porCategoria || {};
      const s = stats.porStatus || {};
      const container = document.getElementById('kpiContainer');

      container.innerHTML = \`
        <div class="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 hover:border-slate-700 transition-all cursor-pointer" onclick="filterBy('categoria', '')">
          <div class="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Quarentena</div>
          <div class="text-2xl font-black text-amber-400 mt-1">\${stats.total.toLocaleString('pt-BR')}</div>
          <div class="text-[10px] text-slate-500 mt-0.5">Isoladas do Supabase</div>
        </div>

        <div class="bg-slate-900/80 border border-emerald-900/40 rounded-xl p-3.5 hover:border-emerald-600 transition-all cursor-pointer" onclick="filterBy('categoria', 'webp_extraido_sucesso')">
          <div class="text-[11px] font-bold uppercase tracking-wider text-emerald-400">WebPs Salvos</div>
          <div class="text-2xl font-black text-emerald-400 mt-1">\${(c['webp_extraido_sucesso'] || 0).toLocaleString('pt-BR')}</div>
          <div class="text-[10px] text-emerald-500 mt-0.5">Offline • Sem Link Externo</div>
        </div>

        <div class="bg-slate-900/80 border border-amber-900/40 rounded-xl p-3.5 hover:border-amber-600 transition-all cursor-pointer" onclick="filterBy('categoria', 'marcador_ver_imagem')">
          <div class="text-[11px] font-bold uppercase tracking-wider text-amber-400">VER IMAGEM</div>
          <div class="text-2xl font-black text-amber-400 mt-1">\${(c['marcador_ver_imagem'] || 0).toLocaleString('pt-BR')}</div>
          <div class="text-[10px] text-amber-500 mt-0.5">Anexo omitido na fonte</div>
        </div>

        <div class="bg-slate-900/80 border border-sky-900/40 rounded-xl p-3.5 hover:border-sky-600 transition-all cursor-pointer" onclick="filterBy('categoria', 'mencao_obrigatoria_sem_anexo')">
          <div class="text-[11px] font-bold uppercase tracking-wider text-sky-400">Menção a Exame</div>
          <div class="text-2xl font-black text-sky-400 mt-1">\${(c['mencao_obrigatoria_sem_anexo'] || 0).toLocaleString('pt-BR')}</div>
          <div class="text-[10px] text-sky-500 mt-0.5">"Observe o RX/TC abaixo"</div>
        </div>

        <div class="bg-slate-900/80 border border-rose-900/40 rounded-xl p-3.5 hover:border-rose-600 transition-all cursor-pointer" onclick="filterBy('categoria', 'url_bloqueada_s3')">
          <div class="text-[11px] font-bold uppercase tracking-wider text-rose-400">S3 Bloqueado</div>
          <div class="text-2xl font-black text-rose-400 mt-1">\${(c['url_bloqueada_s3'] || 0).toLocaleString('pt-BR')}</div>
          <div class="text-[10px] text-rose-500 mt-0.5">HTTP 403 Forbidden</div>
        </div>

        <div class="bg-slate-900/80 border border-teal-900/40 rounded-xl p-3.5 hover:border-teal-600 transition-all cursor-pointer" onclick="filterBy('status', 'aprovada')">
          <div class="text-[11px] font-bold uppercase tracking-wider text-teal-400">Aprovadas</div>
          <div class="text-2xl font-black text-teal-400 mt-1">\${(s['aprovada'] || 0).toLocaleString('pt-BR')}</div>
          <div class="text-[10px] text-teal-500 mt-0.5">Prontas para reingestão</div>
        </div>
      \`;
    }

    async function loadQuestions() {
      const container = document.getElementById('questionsContainer');
      container.innerHTML = '<div class="p-12 text-center text-slate-500 text-sm">Carregando questões...</div>';

      const params = new URLSearchParams({
        page: state.page,
        limit: state.limit,
        search: state.filters.search,
        categoria: state.filters.categoria,
        status: state.filters.status,
        tabela: state.filters.tabela
      });

      try {
        const res = await fetch(\`/api/questoes?\${params.toString()}\`);
        const data = await res.json();
        state.items = data.items;
        state.total = data.total;
        state.totalPages = data.totalPages;

        renderQuestions();
        renderPagination();
      } catch (e) {
        container.innerHTML = \`<div class="p-8 text-center text-rose-400 text-sm">Erro ao carregar: \${e.message}</div>\`;
      }
    }

    function renderQuestions() {
      const container = document.getElementById('questionsContainer');
      const countEl = document.getElementById('resultsCount');

      countEl.innerHTML = \`Mostrando <b>\${state.items.length}</b> de <b>\${state.total.toLocaleString('pt-BR')}</b> questões encontradas\`;

      if (state.items.length === 0) {
        container.innerHTML = \`
          <div class="bg-slate-900/40 border border-slate-800 rounded-2xl p-12 text-center text-slate-500">
            Nenhuma questão encontrada com os filtros selecionados.
          </div>
        \`;
        return;
      }

      container.innerHTML = state.items.map(q => {
        // Badges
        let catBadge = '';
        if (q.categoria === 'webp_extraido_sucesso') {
          catBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>WebP Extraído e Salvo (Sem Link Externo)</span>';
        } else if (q.categoria === 'marcador_ver_imagem') {
          catBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">Marcador (VER IMAGEM)</span>';
        } else if (q.categoria === 'mencao_obrigatoria_sem_anexo') {
          catBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-sky-500/20 text-sky-400 border border-sky-500/30">Menção Obrigatória a Exame</span>';
        } else {
          catBadge = '<span class="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">URL S3 Bloqueada (403)</span>';
        }

        let statusBadge = '';
        if (q.status === 'aprovada') {
          statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/30 text-emerald-300 border border-emerald-500/40">✔ Aprovada</span>';
        } else if (q.status === 'autossuficiente') {
          statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-purple-500/30 text-purple-300 border border-purple-500/40">Autossuficiente</span>';
        } else if (q.status === 'descartada') {
          statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40">✖ Descartada</span>';
        } else if (q.status === 'pendente_recorte_pdf') {
          statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/30">Pendente Recorte PDF</span>';
        } else {
          statusBadge = '<span class="px-2 py-0.5 rounded text-[11px] font-bold bg-slate-800 text-slate-300">Em Quarentena</span>';
        }

        // Tabela label
        let tblLabel = q.tabela.replace('questions_expansion_', '').toUpperCase();

        // Enunciado com destaque
        const highlightedStatement = q.enunciado.replace(HIGHLIGHT_REGEX, '<span class="mark-term">$1</span>');

        // Imagens WebP
        let webpHtml = '';
        if (q.webps && q.webps.length > 0) {
          webpHtml = \`
            <div class="mt-4 p-4 rounded-xl bg-slate-950/70 border border-slate-800">
              <div class="text-xs font-bold uppercase tracking-wider text-emerald-400 mb-2 flex items-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                Imagens Extraídas em WebP (Arquivo Local)
              </div>
              <div class="flex flex-wrap gap-4">
                \${q.webps.map((src, i) => \`
                  <div class="relative group cursor-zoom-in rounded-lg overflow-hidden border border-slate-700 max-w-sm bg-slate-900" onclick="openImageModal('\${src}')">
                    <img src="\${src}" alt="Imagem \${i+1}" class="max-h-60 w-auto object-contain transition-transform group-hover:scale-[1.02]">
                    <div class="absolute bottom-2 right-2 bg-black/80 px-2 py-1 rounded text-[10px] text-white flex items-center gap-1 font-mono">
                      <span>Ampliar WebP</span>
                    </div>
                  </div>
                \`).join('')}
              </div>
            </div>
          \`;
        }

        // Alternativas
        let optionsHtml = '';
        if (q.opcoes && q.opcoes.length > 0) {
          optionsHtml = \`
            <div class="mt-4 space-y-2">
              \${q.opcoes.map(opt => {
                const optLetter = opt.letra || opt.letter || '';
                const optText = opt.texto || opt.text || '';
                const isCorrect = (optLetter || '').toUpperCase() === (q.gabarito || '').toUpperCase();
                return \`
                  <div class="p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-3 \${
                    isCorrect 
                      ? 'bg-emerald-950/30 border-emerald-600/50 text-emerald-200 font-medium' 
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-300'
                  }">
                    <span class="w-6 h-6 rounded-lg flex items-center justify-center font-bold font-mono text-xs \${
                      isCorrect ? 'bg-emerald-500 text-black' : 'bg-slate-800 text-slate-400'
                    }">\${optLetter}</span>
                    <span class="flex-1 pt-0.5 leading-relaxed">\${optText}</span>
                    \${isCorrect ? '<span class="text-xs font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded">Gabarito Oficial</span>' : ''}
                  </div>
                \`;
              }).join('')}
            </div>
          \`;
        }

        // Card Final
        return \`
          <div class="bg-[#0b0f19] border border-slate-800/90 rounded-2xl p-5 sm:p-6 shadow-md transition-all hover:border-slate-700/80" id="card-\${q.id}">
            <!-- Header do Card -->
            <div class="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-800/70">
              <div class="flex flex-wrap items-center gap-2">
                <span class="font-mono text-xs font-bold text-slate-400">#\${q.id}</span>
                <span class="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300 uppercase">\${tblLabel}</span>
                <span class="text-slate-300 font-bold text-xs sm:text-sm">\${q.banca} • \${q.ano}</span>
                <span class="text-slate-400 text-xs">• \${q.especialidade}</span>
                \${q.tema ? \`<span class="text-slate-500 text-xs">/ \${q.tema}</span>\` : ''}
              </div>
              <div class="flex items-center gap-2">
                \${catBadge}
                \${statusBadge}
              </div>
            </div>

            <!-- Imagem WebP (se houver) -->
            \${webpHtml}

            <!-- Enunciado -->
            <div class="mt-4 text-slate-200 text-sm sm:text-base leading-relaxed whitespace-pre-line font-normal">
              \${highlightedStatement}
            </div>

            <!-- Alternativas -->
            \${optionsHtml}

            <!-- Barra de Ações de Avaliação / Curadoria -->
            <div class="mt-5 pt-4 border-t border-slate-800/70 flex flex-wrap items-center justify-between gap-3">
              <div class="flex flex-wrap items-center gap-2">
                <span class="text-xs text-slate-400 font-semibold mr-1">Avaliar Questão:</span>
                
                <button onclick="setEvaluation(\${q.id}, '\${q.tabela}', 'aprovada')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 transition-all flex items-center gap-1">
                  ✔ Aprovar (Pronta)
                </button>

                <button onclick="setEvaluation(\${q.id}, '\${q.tabela}', 'pendente_recorte_pdf')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-sky-600/20 hover:bg-sky-600/40 text-sky-300 border border-sky-500/30 transition-all flex items-center gap-1">
                  📄 Recorte PDF Oficial
                </button>

                <button onclick="setEvaluation(\${q.id}, '\${q.tabela}', 'autossuficiente')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-purple-600/20 hover:bg-purple-600/40 text-purple-300 border border-purple-500/30 transition-all flex items-center gap-1">
                  👁 Imagem Dispensável
                </button>

                <button onclick="setEvaluation(\${q.id}, '\${q.tabela}', 'descartada')" class="px-3 py-1.5 rounded-lg text-xs font-bold bg-rose-600/20 hover:bg-rose-600/40 text-rose-300 border border-rose-500/30 transition-all flex items-center gap-1">
                  ✖ Descartar
                </button>
              </div>

              <!-- Campo de Nota Rápida -->
              <div class="flex items-center gap-2 flex-1 sm:max-w-xs">
                <input 
                  type="text" 
                  id="note-\${q.id}" 
                  value="\${q.notas || ''}" 
                  placeholder="Nota de curadoria..." 
                  class="w-full bg-[#07090e] border border-slate-800 rounded-lg px-3 py-1 text-xs text-slate-300 focus:outline-none focus:border-slate-600"
                  onchange="saveNote(\${q.id}, '\${q.tabela}')"
                >
              </div>
            </div>
          </div>
        \`;
      }).join('');
    }

    function renderPagination() {
      const top = document.getElementById('paginationTop');
      const btm = document.getElementById('paginationBottom');

      if (state.totalPages <= 1) {
        top.innerHTML = '';
        btm.innerHTML = '';
        return;
      }

      const html = \`
        <button onclick="goToPage(\${state.page - 1})" \${state.page === 1 ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="hover:bg-slate-800"'} class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
          Anterior
        </button>
        <span class="text-xs text-slate-400 px-2 font-mono">Página \${state.page} de \${state.totalPages}</span>
        <button onclick="goToPage(\${state.page + 1})" \${state.page >= state.totalPages ? 'disabled class="opacity-40 cursor-not-allowed"' : 'class="hover:bg-slate-800"'} class="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs font-medium text-slate-300">
          Próxima
        </button>
      \`;

      top.innerHTML = html;
      btm.innerHTML = html;
    }

    async function setEvaluation(id, tabela, status) {
      const noteInput = document.getElementById(\`note-\${id}\`);
      const notas = noteInput ? noteInput.value : '';

      try {
        const res = await fetch('/api/avaliar', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, tabela, status, notas })
        });
        const data = await res.json();
        if (data.success) {
          // Atualiza item no state local e recarrega stats
          const item = state.items.find(i => i.id === id && i.tabela === tabela);
          if (item) item.status = status;
          renderQuestions();
          loadStats();
        }
      } catch (e) {
        alert('Erro ao salvar avaliação: ' + e.message);
      }
    }

    async function saveNote(id, tabela) {
      const noteInput = document.getElementById(\`note-\${id}\`);
      const notas = noteInput ? noteInput.value : '';
      const item = state.items.find(i => i.id === id && i.tabela === tabela);
      const status = item ? item.status : 'recuperada_webp';

      await fetch('/api/avaliar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, tabela, status, notas })
      });
    }

    function goToPage(p) {
      if (p < 1 || p > state.totalPages) return;
      state.page = p;
      loadQuestions();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function filterBy(key, value) {
      state.filters[key] = value;
      if (key === 'categoria') document.getElementById('filterCategoria').value = value;
      if (key === 'status') document.getElementById('filterStatus').value = value;
      state.page = 1;
      loadQuestions();
    }

    function resetFilters() {
      document.getElementById('searchInput').value = '';
      document.getElementById('filterCategoria').value = '';
      document.getElementById('filterStatus').value = '';
      document.getElementById('filterTabela').value = '';
      state.filters = { search: '', categoria: '', status: '', tabela: '' };
      state.page = 1;
      loadQuestions();
    }

    function refreshData() {
      loadStats();
      loadQuestions();
    }

    function openImageModal(src) {
      document.getElementById('modalImg').src = src;
      document.getElementById('imageModal').classList.remove('hidden');
    }

    function closeImageModal() {
      document.getElementById('imageModal').classList.add('hidden');
    }

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeImageModal();
    });

    // Listeners de Filtro
    let searchTimeout = null;
    document.getElementById('searchInput').addEventListener('input', (e) => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        state.filters.search = e.target.value.trim();
        state.page = 1;
        loadQuestions();
      }, 300);
    });

    document.getElementById('filterCategoria').addEventListener('change', (e) => {
      state.filters.categoria = e.target.value;
      state.page = 1;
      loadQuestions();
    });

    document.getElementById('filterStatus').addEventListener('change', (e) => {
      state.filters.status = e.target.value;
      state.page = 1;
      loadQuestions();
    });

    document.getElementById('filterTabela').addEventListener('change', (e) => {
      state.filters.tabela = e.target.value;
      state.page = 1;
      loadQuestions();
    });

    // Inicialização
    loadStats();
    loadQuestions();
  </script>
</body>
</html>`;
}

server.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 DASHBOARD DE CURADORIA DE IMAGENS ATIVO NO LOCALHOST`);
  console.log(`======================================================`);
  console.log(`Acesse no navegador: http://localhost:${PORT}`);
  console.log(`Pressione Ctrl+C para encerrar o servidor.\n`);
});
