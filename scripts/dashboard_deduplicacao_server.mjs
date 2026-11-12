import http from 'http';
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3335;
const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const DECISIONS_PATH = path.resolve('data/supabase_tables/deduplication_decisions.json');

if (!fs.existsSync(DB_PATH)) {
  console.error('❌ ERRO: Banco supabase_tables.db não encontrado em:', DB_PATH);
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

// Carrega ou inicializa decisões
function loadDecisions() {
  if (fs.existsSync(DECISIONS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(DECISIONS_PATH, 'utf8'));
    } catch {
      return { decisions: {}, updated_at: new Date().toISOString() };
    }
  }
  return { decisions: {}, updated_at: new Date().toISOString() };
}

function saveDecisions(data) {
  data.updated_at = new Date().toISOString();
  fs.writeFileSync(DECISIONS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

// Parse body JSON
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

// Helper para buscar dados completos de uma questão
function fetchFullQuestion(sourceTable, originalId) {
  try {
    if (sourceTable === 'provaderesidencia_questoes') {
      const q = db.prepare(`
        SELECT q.id, q.numero, q.enunciado as statement, q.opcoes_json as options,
               q.gabarito_oficial as correct_answer, q.texto_gabarito as commentary,
               q.is_anulada, q.especialidade, q.tema, q.subtema as foco,
               q.imagens_locais_json, q.imagens_json,
               p.titulo as prova_titulo, p.instituicao_raw, p.instituicao_banco, p.ano, p.modalidade, p.uf
        FROM "provaderesidencia_questoes" q
        LEFT JOIN "provaderesidencia_provas" p ON q.prova_id = p.id
        WHERE q.id = ?
      `).get(originalId);
      
      if (!q) return null;
      let opts = [];
      try { opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch {}
      return {
        id: `pdr_${q.id}`,
        original_id: q.id,
        code: `PDR-Q${q.numero || q.id}`,
        source_table: sourceTable,
        institution: q.instituicao_banco || q.instituicao_raw || 'Não informada',
        banca: q.instituicao_banco || q.instituicao_raw || 'Não informada',
        year: q.ano || '—',
        modalidade: q.modalidade || 'Acesso Direto (R1)',
        prova_titulo: q.prova_titulo || 'Caderno Oficial',
        numero: q.numero,
        especialidade: q.especialidade || 'Pendente de classificação',
        tema: q.tema || '—',
        foco: q.foco || '—',
        difficulty: '—',
        is_anulada: q.is_anulada === 1 || q.is_anulada === true,
        statement: q.statement || '',
        options: opts,
        correct_answer: q.correct_answer || '',
        commentary: q.commentary || '',
        images: q.imagens_json || q.imagens_locais_json || '[]'
      };
    } else {
      const q = db.prepare(`SELECT * FROM "${sourceTable}" WHERE id = ?`).get(originalId);
      if (!q) return null;
      let opts = [];
      try { opts = typeof q.options === 'string' ? JSON.parse(q.options) : q.options; } catch {}
      return {
        id: `${sourceTable}_${q.id}`,
        original_id: q.id,
        code: q.code || 'Sem código',
        source_table: sourceTable,
        institution: q.institution || 'Não informada',
        banca: q.banca || 'Não informada',
        year: q.year || '—',
        modalidade: q.modalidade || (sourceTable.includes('r_plus') ? 'R+' : sourceTable.includes('revalida') ? 'Revalida' : sourceTable.includes('titulo') ? 'Título de Especialista' : 'Acesso Direto'),
        prova_titulo: q.tipo_prova || 'Prova Padrão',
        numero: null,
        especialidade: q.especialidade || 'Não informada',
        tema: q.tema || '—',
        foco: q.foco || '—',
        difficulty: q.difficulty || 'Média',
        is_anulada: q.is_anulada === 1 || q.is_anulada === true || q.is_anulada === 'true',
        statement: q.statement || '',
        options: opts,
        correct_answer: q.correct_answer || '',
        commentary: q.commentary || '',
        images: q.images || '[]'
      };
    }
  } catch (err) {
    console.error('Erro ao buscar questão:', err);
    return null;
  }
}

const server = http.createServer(async (req, res) => {
  const urlObj = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = urlObj.pathname;

  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // 1. API /api/stats
  if (pathname === '/api/stats') {
    const decisionsData = loadDecisions();
    const decidedCount = Object.keys(decisionsData.decisions).length;

    const stats = {
      total_analisadas: 263197,
      indiscutivelmente_iguais: {
        grupos: 23098,
        questoes: 46976,
        excedentes_para_fusao: 23878
      },
      quarentena: {
        total: 17330,
        gabarito_divergente_grupos: 1148,
        gabarito_divergente_questoes: 2418,
        assertivas_variantes_grupos: 5176,
        assertivas_variantes_questoes: 14912
      },
      distintas: 198891,
      acervo_pos_fusao: 239319,
      decisoes_tomadas: decidedCount,
      modalidades: {
        acesso_direto: { count: 215228, pct: "81.77%" },
        r_plus: { count: 45790, pct: "17.40%" },
        revalida: { count: 1487, pct: "0.56%" },
        titulo_especialista: { count: 692, pct: "0.26%" }
      }
    };

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(stats));
    return;
  }

  // 2. API /api/groups
  if (pathname === '/api/groups') {
    const type = urlObj.searchParams.get('type') || 'gabarito_divergente';
    const page = Math.max(1, parseInt(urlObj.searchParams.get('page') || '1', 10));
    const offset = page - 1;

    let groupRow = null;
    let totalGroups = 0;

    if (type === 'gabarito_divergente') {
      const countRes = db.prepare(`
        SELECT COUNT(*) as c FROM (
          SELECT composite_fingerprint FROM "audit_question_normalized"
          GROUP BY composite_fingerprint
          HAVING COUNT(*) >= 2 AND COUNT(DISTINCT correct_answer) > 1
        )
      `).get();
      totalGroups = countRes.c;

      groupRow = db.prepare(`
        SELECT composite_fingerprint as group_key, COUNT(*) as cnt
        FROM "audit_question_normalized"
        GROUP BY composite_fingerprint
        HAVING COUNT(*) >= 2 AND COUNT(DISTINCT correct_answer) > 1
        LIMIT 1 OFFSET ?
      `).get(offset);
    } else if (type === 'assertivas_variantes') {
      const countRes = db.prepare(`
        SELECT COUNT(*) as c FROM (
          SELECT norm_statement_hash FROM "audit_question_normalized"
          GROUP BY norm_statement_hash
          HAVING COUNT(DISTINCT composite_fingerprint) >= 2
        )
      `).get();
      totalGroups = countRes.c;

      groupRow = db.prepare(`
        SELECT norm_statement_hash as group_key, COUNT(*) as cnt
        FROM "audit_question_normalized"
        GROUP BY norm_statement_hash
        HAVING COUNT(DISTINCT composite_fingerprint) >= 2
        LIMIT 1 OFFSET ?
      `).get(offset);
    } else {
      // Amostra indiscutivel
      const countRes = db.prepare(`
        SELECT COUNT(*) as c FROM (
          SELECT composite_fingerprint FROM "audit_question_normalized"
          GROUP BY composite_fingerprint
          HAVING COUNT(*) >= 2 AND COUNT(DISTINCT correct_answer) = 1
        )
      `).get();
      totalGroups = countRes.c;

      groupRow = db.prepare(`
        SELECT composite_fingerprint as group_key, COUNT(*) as cnt
        FROM "audit_question_normalized"
        GROUP BY composite_fingerprint
        HAVING COUNT(*) >= 2 AND COUNT(DISTINCT correct_answer) = 1
        LIMIT 1 OFFSET ?
      `).get(offset);
    }

    if (!groupRow) {
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ group: null, totalGroups: 0, page, hasMore: false }));
      return;
    }

    let members = [];
    if (type === 'assertivas_variantes') {
      members = db.prepare(`
        SELECT * FROM "audit_question_normalized"
        WHERE norm_statement_hash = ?
        LIMIT 4
      `).all(groupRow.group_key);
    } else {
      members = db.prepare(`
        SELECT * FROM "audit_question_normalized"
        WHERE composite_fingerprint = ?
        LIMIT 4
      `).all(groupRow.group_key);
    }

    const fullMembers = members.map(m => fetchFullQuestion(m.source_table, m.original_id)).filter(Boolean);
    const decisionsData = loadDecisions();
    const existingDecision = decisionsData.decisions[groupRow.group_key] || null;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      type,
      page,
      totalGroups,
      hasMore: page < totalGroups,
      group_key: groupRow.group_key,
      members: fullMembers,
      existingDecision
    }));
    return;
  }

  // 3. API /api/decision (POST)
  if (pathname === '/api/decision' && req.method === 'POST') {
    try {
      const body = await parseJsonBody(req);
      const { group_key, action, canonical_id, chosen_gabarito, notes } = body;

      if (!group_key || !action) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Parâmetros group_key e action obrigatórios' }));
        return;
      }

      const decisionsData = loadDecisions();
      decisionsData.decisions[group_key] = {
        action,
        canonical_id: canonical_id || null,
        chosen_gabarito: chosen_gabarito || null,
        notes: notes || '',
        decided_at: new Date().toISOString()
      };

      saveDecisions(decisionsData);

      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, count: Object.keys(decisionsData.decisions).length }));
      return;
    } catch (e) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: e.message }));
      return;
    }
  }

  // 4. HTML Frontend SPA
  if (pathname === '/' || pathname === '/index.html' || pathname === '/admin/auditoria/deduplicacao') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(getHtmlContent());
    return;
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Rota não encontrada');
});

function getHtmlContent() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banco Residência — Auditoria & Quarentena de Deduplicação</title>
  <script src="https://cdn.tailwindcss.com"></script>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
    body { font-family: 'Inter', sans-serif; }
    .diff-match { background-color: transparent; }
    .diff-diff { background-color: #fef08a; color: #854d0e; padding: 1px 3px; border-radius: 3px; }
    .dark .diff-diff { background-color: #78350f; color: #fef08a; }
  </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen flex flex-col">

  <!-- TOPBAR -->
  <header class="border-b border-slate-800 bg-slate-900/90 backdrop-blur sticky top-0 z-50 px-6 py-3.5 flex flex-wrap items-center justify-between gap-4">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-lg bg-blue-600/20 text-blue-400 flex items-center justify-center border border-blue-500/30">
        <i class="fa-solid fa-code-compare text-lg"></i>
      </div>
      <div>
        <h1 class="text-base font-bold tracking-tight text-white flex items-center gap-2">
          Banco Residência <span class="text-xs px-2 py-0.5 rounded bg-blue-900/50 text-blue-300 border border-blue-700/50 font-medium">Frente 1: Deduplicação</span>
        </h1>
        <p class="text-xs text-slate-400">Auditoria & Quarentena de Cruzamento de Questões</p>
      </div>
    </div>

    <!-- STATS PILLS -->
    <div class="flex items-center gap-2 text-xs flex-wrap">
      <div class="px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 flex items-center gap-2">
        <span class="text-slate-400">Acervo Total:</span>
        <span class="font-bold text-white" id="statTotal">263.197</span>
      </div>
      <div class="px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-800/60 text-emerald-300 flex items-center gap-1.5">
        <i class="fa-solid fa-check-double text-xs"></i>
        <span>Indiscutíveis:</span>
        <span class="font-bold">46.976</span>
      </div>
      <div class="px-3 py-1.5 rounded-lg bg-amber-950/60 border border-amber-800/60 text-amber-300 flex items-center gap-1.5">
        <i class="fa-solid fa-triangle-exclamation text-xs"></i>
        <span>Quarentena:</span>
        <span class="font-bold" id="statQuarentena">17.330</span>
      </div>
      <div class="px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-800/60 text-blue-300 flex items-center gap-1.5">
        <i class="fa-solid fa-gavel text-xs"></i>
        <span>Arbitradas:</span>
        <span class="font-bold" id="statDecididas">0</span>
      </div>
      <button onclick="openModalidadeModal()" class="px-3 py-1.5 rounded-lg bg-purple-950/60 border border-purple-800/60 text-purple-300 hover:bg-purple-900/60 flex items-center gap-1.5 transition">
        <i class="fa-solid fa-chart-pie text-xs"></i>
        <span>Modalidades</span>
      </button>
    </div>
  </header>

  <!-- NAVIGATION TABS -->
  <div class="border-b border-slate-800 bg-slate-900/50 px-6 py-2.5 flex items-center justify-between gap-4">
    <div class="flex items-center gap-2">
      <button id="tabGabarito" onclick="setTab('gabarito_divergente')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition bg-amber-600 text-white shadow-sm">
        <i class="fa-solid fa-scale-unbalanced text-xs"></i>
        <span>Gabarito Divergente</span>
        <span class="px-1.5 py-0.2 text-[10px] rounded-full bg-black/30 font-bold">1.148 grupos</span>
      </button>

      <button id="tabAssertivas" onclick="setTab('assertivas_variantes')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition bg-slate-800 text-slate-300 hover:bg-slate-700">
        <i class="fa-solid fa-list-check text-xs"></i>
        <span>Assertivas Variantes</span>
        <span class="px-1.5 py-0.2 text-[10px] rounded-full bg-black/30 font-bold">5.176 grupos</span>
      </button>

      <button id="tabIndiscutivel" onclick="setTab('amostra_indiscutivel')" class="px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition bg-slate-800 text-slate-300 hover:bg-slate-700">
        <i class="fa-solid fa-circle-check text-xs"></i>
        <span>Amostra Indiscutíveis</span>
        <span class="px-1.5 py-0.2 text-[10px] rounded-full bg-black/30 font-bold">23.098 grupos</span>
      </button>
    </div>

    <!-- PAGINATION CONTROLS -->
    <div class="flex items-center gap-2 text-xs">
      <span class="text-slate-400">Grupo <b id="currentPage" class="text-white">1</b> de <b id="totalPages" class="text-white">...</b></span>
      <button onclick="prevPage()" class="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition disabled:opacity-30" id="btnPrev">
        <i class="fa-solid fa-chevron-left text-xs"></i>
      </button>
      <input type="number" id="inputJump" min="1" class="w-16 px-2 py-1 bg-slate-800 border border-slate-700 rounded text-center text-xs text-white" placeholder="Ir...">
      <button onclick="jumpToPage()" class="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300">Ir</button>
      <button onclick="nextPage()" class="w-7 h-7 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition disabled:opacity-30" id="btnNext">
        <i class="fa-solid fa-chevron-right text-xs"></i>
      </button>
    </div>
  </div>

  <!-- MAIN COMPARISON WORKSPACE -->
  <main class="flex-1 p-6 flex flex-col gap-6 max-w-7xl mx-auto w-full">

    <!-- ALERT BANNER FOR DECISION / CONFLICT -->
    <div id="conflictAlert" class="hidden p-4 rounded-xl border flex items-center justify-between gap-4">
      <div class="flex items-center gap-3">
        <div id="conflictIcon" class="w-8 h-8 rounded-full flex items-center justify-center text-base"></div>
        <div>
          <h2 id="conflictTitle" class="text-sm font-bold"></h2>
          <p id="conflictDesc" class="text-xs opacity-90"></p>
        </div>
      </div>
      <div id="conflictBadge" class="text-xs px-2.5 py-1 rounded font-semibold"></div>
    </div>

    <!-- DUAL SIDE-BY-SIDE CARDS -->
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6 flex-1 items-stretch" id="cardsGrid">
      
      <!-- CARD A -->
      <section id="cardA" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-lg relative">
        <div class="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span id="badgeTableA" class="px-2.5 py-0.5 rounded text-[11px] font-bold"></span>
              <span id="codeA" class="text-xs font-mono text-slate-400"></span>
              <span id="yearA" class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"></span>
            </div>
            <h3 id="instA" class="text-sm font-semibold text-white mt-1"></h3>
            <p id="taxoA" class="text-xs text-blue-400 font-medium"></p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="text-[10px] uppercase font-bold text-slate-400">Gabarito Oficial</span>
            <div id="gabBadgeA" class="text-lg font-black px-3 py-1 rounded-lg"></div>
          </div>
        </div>

        <!-- ENUNCIADO A -->
        <div class="flex-1 flex flex-col gap-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-file-lines text-xs text-blue-400"></i> Enunciado Clínico
          </span>
          <div id="statementA" class="text-sm text-slate-200 bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed max-h-72 overflow-y-auto"></div>
        </div>

        <!-- ALTERNATIVAS A -->
        <div class="flex flex-col gap-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-list-ol text-xs text-emerald-400"></i> Alternativas de Resposta
          </span>
          <div id="optionsA" class="flex flex-col gap-2"></div>
        </div>

        <!-- COMENTÁRIO A -->
        <div class="flex flex-col gap-2 border-t border-slate-800 pt-3">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <i class="fa-solid fa-comment-medical text-xs text-purple-400"></i> Comentário Médico
            </span>
            <span id="commLenA" class="text-[10px] text-slate-500 font-normal"></span>
          </span>
          <div id="commentaryA" class="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 max-h-36 overflow-y-auto italic"></div>
        </div>
      </section>

      <!-- CARD B -->
      <section id="cardB" class="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col gap-4 shadow-lg relative">
        <div class="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
          <div class="flex flex-col gap-1">
            <div class="flex items-center gap-2 flex-wrap">
              <span id="badgeTableB" class="px-2.5 py-0.5 rounded text-[11px] font-bold"></span>
              <span id="codeB" class="text-xs font-mono text-slate-400"></span>
              <span id="yearB" class="text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300 font-medium"></span>
            </div>
            <h3 id="instB" class="text-sm font-semibold text-white mt-1"></h3>
            <p id="taxoB" class="text-xs text-blue-400 font-medium"></p>
          </div>
          <div class="flex flex-col items-end gap-1">
            <span class="text-[10px] uppercase font-bold text-slate-400">Gabarito Oficial</span>
            <div id="gabBadgeB" class="text-lg font-black px-3 py-1 rounded-lg"></div>
          </div>
        </div>

        <!-- ENUNCIADO B -->
        <div class="flex-1 flex flex-col gap-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-file-lines text-xs text-blue-400"></i> Enunciado Clínico
          </span>
          <div id="statementB" class="text-sm text-slate-200 bg-slate-950/60 p-4 rounded-xl border border-slate-800 leading-relaxed max-h-72 overflow-y-auto"></div>
        </div>

        <!-- ALTERNATIVAS B -->
        <div class="flex flex-col gap-2">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
            <i class="fa-solid fa-list-ol text-xs text-emerald-400"></i> Alternativas de Resposta
          </span>
          <div id="optionsB" class="flex flex-col gap-2"></div>
        </div>

        <!-- COMENTÁRIO B -->
        <div class="flex flex-col gap-2 border-t border-slate-800 pt-3">
          <span class="text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center justify-between">
            <span class="flex items-center gap-1.5">
              <i class="fa-solid fa-comment-medical text-xs text-purple-400"></i> Comentário Médico
            </span>
            <span id="commLenB" class="text-[10px] text-slate-500 font-normal"></span>
          </span>
          <div id="commentaryB" class="text-xs text-slate-300 bg-slate-950/40 p-3 rounded-lg border border-slate-800/80 max-h-36 overflow-y-auto italic"></div>
        </div>
      </section>

    </div>
  </main>

  <!-- STICKY ACTION BAR -->
  <footer class="border-t border-slate-800 bg-slate-900/95 backdrop-blur p-4 sticky bottom-0 z-40">
    <div class="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4">
      
      <div class="flex items-center gap-2">
        <span class="text-xs text-slate-400 font-medium">Ações de Decisão:</span>
        <button onclick="makeDecision('merge_a')" class="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition">
          <i class="fa-solid fa-arrow-left"></i>
          <span>Mesclar (Canônica: A)</span>
          <kbd class="px-1.5 py-0.5 bg-blue-800 rounded text-[10px]">1</kbd>
        </button>

        <button onclick="makeDecision('merge_b')" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition">
          <span>Mesclar (Canônica: B)</span>
          <i class="fa-solid fa-arrow-right"></i>
          <kbd class="px-1.5 py-0.5 bg-indigo-800 rounded text-[10px]">2</kbd>
        </button>

        <button onclick="makeDecision('distinct')" class="px-4 py-2 bg-emerald-700 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-sm transition">
          <i class="fa-solid fa-split"></i>
          <span>Manter como Distintas</span>
          <kbd class="px-1.5 py-0.5 bg-emerald-900 rounded text-[10px]">D</kbd>
        </button>
      </div>

      <div class="flex items-center gap-2">
        <button onclick="openGabaritoOverrideModal()" class="px-3.5 py-2 bg-amber-600/30 hover:bg-amber-600/50 text-amber-300 border border-amber-500/40 rounded-xl text-xs font-semibold flex items-center gap-2 transition">
          <i class="fa-solid fa-pen-to-square"></i>
          <span>Homologar Gabarito</span>
          <kbd class="px-1.5 py-0.5 bg-amber-950 rounded text-[10px]">G</kbd>
        </button>

        <button onclick="nextPage()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold flex items-center gap-2 transition">
          <span>Pular / Próximo</span>
          <kbd class="px-1.5 py-0.5 bg-slate-900 rounded text-[10px]">P</kbd>
        </button>
      </div>

    </div>
  </footer>

  <!-- MODAL: DISTRIBUIÇÃO DAS MODALIDADES -->
  <div id="modalidadeModal" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-6 flex flex-col gap-4 shadow-2xl">
      <div class="flex items-center justify-between border-b border-slate-800 pb-3">
        <h3 class="text-base font-bold text-white flex items-center gap-2">
          <i class="fa-solid fa-chart-pie text-purple-400"></i>
          Distribuição Canônica das Modalidades
        </h3>
        <button onclick="closeModalidadeModal()" class="text-slate-400 hover:text-white">
          <i class="fa-solid fa-xmark text-lg"></i>
        </button>
      </div>

      <div class="flex flex-col gap-3 text-xs">
        <p class="text-slate-300">
          Auditoria exaustiva das <b>263.197 questões</b> consolidada nas 4 modalidades oficiais do Banco Residência:
        </p>

        <div class="space-y-2 mt-2">
          <!-- Acesso Direto -->
          <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-full bg-blue-500"></span>
              <div>
                <b class="text-white text-sm">Acesso Direto (R1)</b>
                <p class="text-slate-400 text-[11px]">questions (130k) + expansion_direto (47.8k) + provaderesidencia R1 (37.3k)</p>
              </div>
            </div>
            <div class="text-right">
              <b class="text-white text-sm">215.228</b>
              <p class="text-blue-400 font-bold">81,77%</p>
            </div>
          </div>

          <!-- R+ -->
          <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-full bg-purple-500"></span>
              <div>
                <b class="text-white text-sm">R+ (Especialidades / Pré-Requisito)</b>
                <p class="text-slate-400 text-[11px]">questions_expansion_r_plus (43.9k) + provaderesidencia R3/R4 (1.8k)</p>
              </div>
            </div>
            <div class="text-right">
              <b class="text-white text-sm">45.790</b>
              <p class="text-purple-400 font-bold">17,40%</p>
            </div>
          </div>

          <!-- Revalida -->
          <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-full bg-emerald-500"></span>
              <div>
                <b class="text-white text-sm">Revalida (INEP / Revalidação Médica)</b>
                <p class="text-slate-400 text-[11px]">questions_expansion_revalida (1.4k) + provas Revalida (50)</p>
              </div>
            </div>
            <div class="text-right">
              <b class="text-white text-sm">1.487</b>
              <p class="text-emerald-400 font-bold">0,56%</p>
            </div>
          </div>

          <!-- Título de Especialista -->
          <div class="p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
            <div class="flex items-center gap-2.5">
              <span class="w-3 h-3 rounded-full bg-amber-500"></span>
              <div>
                <b class="text-white text-sm">Título de Especialista</b>
                <p class="text-slate-400 text-[11px]">questions_expansion_titulo_especialista (TEOT, TEMI, etc.)</p>
              </div>
            </div>
            <div class="text-right">
              <b class="text-white text-sm">692</b>
              <p class="text-amber-400 font-bold">0,26%</p>
            </div>
          </div>
        </div>

        <div class="p-3 rounded-lg bg-blue-950/40 border border-blue-900/60 text-blue-200 mt-2 text-[11px] leading-relaxed">
          <i class="fa-solid fa-circle-info text-blue-400 mr-1"></i>
          <b>Comportamento na Fusão:</b> Se duas questões com modalidades complementares colidirem (ex: questão de Acesso Direto reaproveitada em prova de R+), a modalidade canônica é mantida de acordo com a prova original, preservando tags secundárias no cadastro.
        </div>
      </div>

      <div class="flex justify-end pt-2">
        <button onclick="closeModalidadeModal()" class="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-bold">Fechar</button>
      </div>
    </div>
  </div>

  <!-- SCRIPT FRONTEND -->
  <script>
    let currentTab = 'gabarito_divergente';
    let currentPageNum = 1;
    let currentGroupData = null;

    async function loadStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('statTotal').innerText = data.total_analisadas.toLocaleString('pt-BR');
        document.getElementById('statQuarentena').innerText = data.quarentena.total.toLocaleString('pt-BR');
        document.getElementById('statDecididas').innerText = data.decisoes_tomadas.toLocaleString('pt-BR');
      } catch (e) {
        console.error(e);
      }
    }

    function setTab(tab) {
      currentTab = tab;
      currentPageNum = 1;
      
      const tabs = [
        { id: 'tabGabarito', key: 'gabarito_divergente' },
        { id: 'tabAssertivas', key: 'assertivas_variantes' },
        { id: 'tabIndiscutivel', key: 'amostra_indiscutivel' }
      ];

      tabs.forEach(t => {
        const el = document.getElementById(t.id);
        if (t.key === tab) {
          el.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition bg-blue-600 text-white shadow-sm';
        } else {
          el.className = 'px-3.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-2 transition bg-slate-800 text-slate-300 hover:bg-slate-700';
        }
      });

      loadGroup();
    }

    async function loadGroup() {
      try {
        const res = await fetch('/api/groups?type=' + currentTab + '&page=' + currentPageNum);
        const data = await res.json();
        currentGroupData = data;

        document.getElementById('currentPage').innerText = data.page;
        document.getElementById('totalPages').innerText = data.totalGroups;
        document.getElementById('btnPrev').disabled = (data.page <= 1);
        document.getElementById('btnNext').disabled = (!data.hasMore);

        if (!data.members || data.members.length < 2) {
          showEmptyState();
          return;
        }

        renderPair(data.members[0], data.members[1], data.existingDecision);
      } catch (err) {
        console.error(err);
      }
    }

    function renderPair(qA, qB, decision) {
      renderCard('A', qA);
      renderCard('B', qB);

      // Conflito de Gabarito
      const alertBox = document.getElementById('conflictAlert');
      const icon = document.getElementById('conflictIcon');
      const title = document.getElementById('conflictTitle');
      const desc = document.getElementById('conflictDesc');
      const badge = document.getElementById('conflictBadge');

      alertBox.className = 'p-4 rounded-xl border flex items-center justify-between gap-4 ';

      if (decision) {
        alertBox.classList.remove('hidden');
        alertBox.classList.add('bg-blue-950/40', 'border-blue-700/60', 'text-blue-200');
        icon.className = 'w-8 h-8 rounded-full bg-blue-600/30 text-blue-300 flex items-center justify-center';
        icon.innerHTML = '<i class="fa-solid fa-check"></i>';
        title.innerText = 'Decisão Já Registrada: ' + decision.action.toUpperCase();
        desc.innerText = 'Registrada em: ' + new Date(decision.decided_at).toLocaleString('pt-BR');
        badge.className = 'text-xs px-2.5 py-1 rounded font-semibold bg-blue-900 text-blue-300';
        badge.innerText = decision.action;
      } else if (qA.correct_answer !== qB.correct_answer) {
        alertBox.classList.remove('hidden');
        alertBox.classList.add('bg-amber-950/50', 'border-amber-700/60', 'text-amber-200');
        icon.className = 'w-8 h-8 rounded-full bg-amber-600/30 text-amber-300 flex items-center justify-center';
        icon.innerHTML = '<i class="fa-solid fa-triangle-exclamation"></i>';
        title.innerText = 'Divergência Crítica de Gabarito entre as Provas';
        desc.innerText = 'Questão A aponta gabarito [' + qA.correct_answer + '] enquanto Questão B aponta [' + qB.correct_answer + ']. Verifique anulação ou recurso de banca!';
        badge.className = 'text-xs px-2.5 py-1 rounded font-semibold bg-amber-900 text-amber-300';
        badge.innerText = 'Quarentena Obrigatória';
      } else {
        alertBox.classList.remove('hidden');
        alertBox.classList.add('bg-slate-900', 'border-slate-800', 'text-slate-300');
        icon.className = 'w-8 h-8 rounded-full bg-slate-800 text-slate-400 flex items-center justify-center';
        icon.innerHTML = '<i class="fa-solid fa-circle-info"></i>';
        title.innerText = 'Gabaritos Compatíveis (' + qA.correct_answer + ')';
        desc.innerText = 'Enunciados idênticos com assertivas ordenadas correspondentes.';
        badge.className = 'text-xs px-2.5 py-1 rounded font-semibold bg-slate-800 text-slate-400';
        badge.innerText = 'Verificação';
      }
    }

    function renderCard(side, q) {
      // Badges
      const tableBadge = document.getElementById('badgeTable' + side);
      if (q.source_table.includes('provaderesidencia')) {
        tableBadge.className = 'px-2.5 py-0.5 rounded text-[11px] font-bold bg-emerald-950 text-emerald-400 border border-emerald-800';
        tableBadge.innerText = 'Coleta: Caderno Oficial';
      } else if (q.source_table === 'questions') {
        tableBadge.className = 'px-2.5 py-0.5 rounded text-[11px] font-bold bg-blue-950 text-blue-400 border border-blue-800';
        tableBadge.innerText = 'Supabase: Principal';
      } else {
        tableBadge.className = 'px-2.5 py-0.5 rounded text-[11px] font-bold bg-purple-950 text-purple-400 border border-purple-800';
        tableBadge.innerText = 'Supabase: ' + q.source_table.replace('questions_expansion_', '');
      }

      document.getElementById('code' + side).innerText = q.code;
      document.getElementById('year' + side).innerText = q.year;
      document.getElementById('inst' + side).innerText = q.institution + (q.banca && q.banca !== q.institution ? ' (' + q.banca + ')' : '');
      document.getElementById('taxoA'.slice(0, 4) + side).innerText = q.especialidade + ' ▸ ' + q.tema + ' ▸ ' + q.foco;

      // Gabarito
      const gabEl = document.getElementById('gabBadge' + side);
      gabEl.innerText = q.correct_answer || 'N/A';
      if (q.is_anulada || q.correct_answer === 'ANULADA') {
        gabEl.className = 'text-xs font-black px-2.5 py-1 rounded-lg bg-rose-950 text-rose-300 border border-rose-800';
      } else {
        gabEl.className = 'text-lg font-black px-3 py-1 rounded-lg bg-emerald-950 text-emerald-300 border border-emerald-800';
      }

      // Statement
      document.getElementById('statement' + side).innerText = q.statement;

      // Options
      const optsContainer = document.getElementById('options' + side);
      optsContainer.innerHTML = '';
      if (Array.isArray(q.options) && q.options.length > 0) {
        q.options.forEach(opt => {
          const isCorrect = (opt.letter && opt.letter.toUpperCase() === q.correct_answer.toUpperCase());
          const row = document.createElement('div');
          row.className = 'p-2.5 rounded-xl border text-xs flex items-start gap-2.5 ' + 
            (isCorrect ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200' : 'bg-slate-950/40 border-slate-800 text-slate-300');
          
          row.innerHTML = '<span class="font-bold px-2 py-0.5 rounded ' + 
            (isCorrect ? 'bg-emerald-600 text-white' : 'bg-slate-800 text-slate-400') + '">' + 
            (opt.letter || '•') + '</span><span class="flex-1">' + (opt.text || '') + '</span>';
          optsContainer.appendChild(row);
        });
      } else {
        optsContainer.innerHTML = '<div class="text-xs text-slate-500 italic p-2">Sem alternativas estruturadas (Discursiva / Anulada).</div>';
      }

      // Commentary
      const commEl = document.getElementById('commentary' + side);
      const commLenEl = document.getElementById('commLen' + side);
      if (q.commentary && q.commentary.trim().length > 0) {
        commEl.innerText = q.commentary;
        commLenEl.innerText = q.commentary.length + ' caracteres';
        commEl.classList.remove('italic', 'text-slate-500');
      } else {
        commEl.innerText = 'Nenhum comentário cadastrado.';
        commLenEl.innerText = '0 caracteres';
        commEl.classList.add('italic', 'text-slate-500');
      }
    }

    async function makeDecision(actionType) {
      if (!currentGroupData || !currentGroupData.members || currentGroupData.members.length < 2) return;
      
      const qA = currentGroupData.members[0];
      const qB = currentGroupData.members[1];
      let canonicalId = null;

      if (actionType === 'merge_a') {
        canonicalId = qA.id;
      } else if (actionType === 'merge_b') {
        canonicalId = qB.id;
      }

      try {
        const res = await fetch('/api/decision', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            group_key: currentGroupData.group_key,
            action: actionType,
            canonical_id: canonicalId
          })
        });

        const result = await res.json();
        if (result.success) {
          loadStats();
          nextPage();
        }
      } catch (err) {
        alert('Erro ao salvar decisão: ' + err.message);
      }
    }

    function prevPage() {
      if (currentPageNum > 1) {
        currentPageNum--;
        loadGroup();
      }
    }

    function nextPage() {
      currentPageNum++;
      loadGroup();
    }

    function jumpToPage() {
      const val = parseInt(document.getElementById('inputJump').value, 10);
      if (val && val >= 1) {
        currentPageNum = val;
        loadGroup();
      }
    }

    function openModalidadeModal() {
      document.getElementById('modalidadeModal').classList.remove('hidden');
    }

    function closeModalidadeModal() {
      document.getElementById('modalidadeModal').classList.add('hidden');
    }

    function openGabaritoOverrideModal() {
      const resp = prompt("Digite o gabarito oficial definitivo para homologação deste par (A, B, C, D, E ou ANULADA):");
      if (resp && resp.trim()) {
        makeDecision('homologar_gabarito_' + resp.trim().toUpperCase());
      }
    }

    // Keyboard shortcuts
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === '1') makeDecision('merge_a');
      if (e.key === '2') makeDecision('merge_b');
      if (e.key === 'd' || e.key === 'D') makeDecision('distinct');
      if (e.key === 'p' || e.key === 'P' || e.key === 'ArrowRight') nextPage();
      if (e.key === 'ArrowLeft') prevPage();
      if (e.key === 'g' || e.key === 'G') openGabaritoOverrideModal();
    });

    loadStats();
    loadGroup();
  </script>
</body>
</html>`;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 SERVIDOR DE AUDITORIA & QUARENTENA DE DEDUPLICAÇÃO ATIVO!`);
  console.log(`🌐 Rota Visual: http://localhost:${PORT}/admin/auditoria/deduplicacao`);
  console.log(`🌐 Acesso Direto: http://localhost:${PORT}`);
  console.log(`💾 Decisões persistidas em: ${DECISIONS_PATH}\n`);
});

