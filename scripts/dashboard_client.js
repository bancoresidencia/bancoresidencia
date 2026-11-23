var currentFilter = "clean_no_watermark";
var currentPage = 1;

function setFilter(filter) {
  currentFilter = filter;
  document.querySelectorAll(".tab-btn").forEach(function (b) { b.classList.remove("active"); });

  var btnId = "tab-clean";
  if (filter === "watermarked") btnId = "tab-watermark";
  else if (filter === "broken_images") btnId = "tab-broken";
  else if (filter === "non_medq") btnId = "tab-nonmedq";
  else if (filter === "pending_upload") btnId = "tab-pending";
  else if (filter === "synced") btnId = "tab-synced";

  var activeBtn = document.getElementById(btnId);
  if (activeBtn) activeBtn.classList.add("active");

  var labels = {
    "clean_no_watermark": "🟢 Sem Marca de Água (Prontas para Supabase)",
    "watermarked": "⚠️ Com Marca de Água (MedQ/MedBrave)",
    "broken_images": "🚨 Imagens Quebradas / Arquivos Ausentes",
    "non_medq": "🏢 Não-MedQ (Prova de Residência & Geral)",
    "pending_upload": "⏳ Todas Não Upadas para o Supabase",
    "synced": "✅ Já Sincronizadas no Supabase"
  };
  document.getElementById("currentFilterLabel").innerText = "Exibindo: " + (labels[filter] || filter);
  loadQuestions(1);
}

async function fetchStats() {
  try {
    var res = await fetch("/api/stats");
    var data = await res.json();
    document.getElementById("statTotal").innerText = data.totalQuestionsWithImg.toLocaleString("pt-BR");
    document.getElementById("statClean").innerText = data.cleanCount.toLocaleString("pt-BR");
    document.getElementById("statWatermarked").innerText = data.watermarkedCount.toLocaleString("pt-BR");
    document.getElementById("statBroken").innerText = data.brokenCount.toLocaleString("pt-BR");
    document.getElementById("tabBrokenCount").innerText = data.brokenCount.toLocaleString("pt-BR");
    document.getElementById("statNonMedQ").innerText = data.nonMedqCount.toLocaleString("pt-BR");
    document.getElementById("statSynced").innerText = data.syncedCount.toLocaleString("pt-BR");
    document.getElementById("statPendingUpload").innerText = data.pendingUploadCount.toLocaleString("pt-BR");

    var engine = data.realtimeEngine;
    if (engine) {
      var total = engine.total_queue || 1;
      var processed = engine.processed || 0;
      var pct = Math.min(100, Math.round((processed / total) * 100));
      document.getElementById("syncProgressBar").style.width = pct + "%";
      document.getElementById("syncStatsDetail").innerText = "Sincronizadas: " + engine.success.toLocaleString("pt-BR") + " / " + total.toLocaleString("pt-BR") + " (" + pct + "%)";

      var pulse = document.getElementById("syncPulse");
      var btn = document.getElementById("btnToggleSync");
      if (engine.active) {
        pulse.style.background = "var(--green)";
        pulse.style.boxShadow = "0 0 10px var(--green)";
        document.getElementById("syncStatusText").innerText = "Sincronizador em Tempo Real: Ativo" + (engine.current_item ? " (" + engine.current_item + ")" : "");
        btn.innerText = "⏸ Pausar";
        btn.className = "btn btn-outline";
      } else {
        pulse.style.background = "var(--amber)";
        pulse.style.boxShadow = "none";
        document.getElementById("syncStatusText").innerText = "Sincronizador em Tempo Real: Pausado";
        btn.innerText = "▶️ Iniciar Sincronização";
        btn.className = "btn btn-primary";
      }
    }
  } catch (e) {
    console.error(e);
  }
}

async function toggleRealtimeSync() {
  try {
    await fetch("/api/sync-realtime/toggle", { method: "POST" });
    fetchStats();
  } catch (e) {
    alert("Erro ao alternar sincronizador: " + e.message);
  }
}

async function loadQuestions(page) {
  if (!page) page = 1;
  currentPage = page;
  var search = document.getElementById("searchInput").value;
  var container = document.getElementById("mainContainer");
  container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Buscando questões...</div>';

  try {
    var res = await fetch("/api/questions?page=" + page + "&limit=15&filter=" + currentFilter + "&search=" + encodeURIComponent(search));
    var data = await res.json();
    renderQuestions(data.questions);
    renderPagination(data.page, data.totalPages);
    fetchStats();
  } catch (e) {
    container.innerHTML = '<div style="color: var(--red); padding: 40px;">Erro ao carregar: ' + e.message + '</div>';
  }
}

function renderQuestions(questions) {
  var container = document.getElementById("mainContainer");
  if (!questions || questions.length === 0) {
    container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Nenhuma questão encontrada para este filtro.</div>';
    return;
  }

  var cardsHtml = questions.map(function (q) {
    var optionsHtml = (q.options || []).map(function (opt) {
      var isCorrect = opt.letter === q.correct_answer;
      var optImgHtml = "";
      if (opt.text && opt.text.startsWith("http")) {
        optImgHtml = '<div style="margin-top: 6px;"><img src="/api/proxy-image?url=' + encodeURIComponent(opt.text) + '" style="max-height: 110px; border-radius: 4px;"></div>';
      }
      return '<div class="opt-item ' + (isCorrect ? 'is-correct' : '') + '">' +
        '<span class="opt-letter">' + opt.letter + ')</span>' +
        '<div style="flex: 1;">' + (opt.text && !opt.text.startsWith("http") ? opt.text : "(Imagem)") + optImgHtml + '</div>' +
        (isCorrect ? '<span style="color: var(--green); font-weight: 700;">✓ Gabarito Oficial</span>' : '') +
        '</div>';
    }).join("");

    var firstImg = q.images && q.images[0] ? q.images[0] : "";
    var isSynced = q.is_synced;
    var isBroken = q.is_broken;

    var watermarkBadge = q.has_watermark
      ? '<span class="q-badge q-badge-watermark">⚠️ Com Marca</span>'
      : '<span class="q-badge q-badge-clean">🟢 Sem Marca</span>';

    var brokenBadge = isBroken
      ? '<span class="q-badge q-badge-broken">🚨 Imagem Quebrada</span>'
      : '';

    var syncBadge = isSynced
      ? '<span class="q-badge q-badge-synced">✅ Supabase OK</span>'
      : '<span class="q-badge" style="background:#334155; color:#cbd5e1;">⏳ Pendente de Upload</span>';

    var rightContentHtml = '';
    if (isBroken) {
      rightContentHtml = '<div class="broken-image-box">' +
        '<div style="font-size: 28px; margin-bottom: 8px;">⚠️</div>' +
        '<div style="font-weight: 700; color: #fca5a5; font-size: 13.5px; margin-bottom: 6px;">Arquivo Não Encontrado em Disco</div>' +
        '<div style="font-size: 11.5px; color: #94a3b8; word-break: break-all; margin-bottom: 10px;">' + (q.broken_reason || firstImg) + '</div>' +
        '<div style="font-size: 11px; color: #f87171;">Necessita resgate via PDF oficial da banca</div>' +
        '</div>';
    } else {
      rightContentHtml = '<div class="image-preview-container">' +
        '<img src="/api/proxy-image?url=' + encodeURIComponent(firstImg) + '" alt="Imagem da questão">' +
        '</div>' +
        '<div class="sync-action-box" id="sync-box-' + q.id + '">' +
        (isSynced
          ? '<div style="font-size: 12px; color: #6ee7b7; font-weight: 600; display: flex; align-items: center; gap: 6px;"><span>✅ Sincronizada no Supabase</span><a href="' + firstImg + '" target="_blank" style="color: #93c5fd; text-decoration: underline;">Abrir no Storage</a></div>'
          : '<button class="btn btn-primary btn-sync-single" data-qid="' + q.id + '">⚡ Sincronizar com o Supabase</button>'
        ) +
        '</div>';
    }

    return '<div class="question-card" id="card-' + q.id + '">' +
      '<div class="card-left">' +
      '<div class="q-meta">' +
      '<span class="q-badge">' + (q.banca || "BANCA") + '</span>' +
      '<span class="q-badge">' + (q.year || "ANO") + '</span>' +
      '<span style="color: var(--text-muted); font-size: 11px;">' + q.id + '</span>' +
      watermarkBadge +
      brokenBadge +
      syncBadge +
      '</div>' +
      '<div class="q-statement">' + escapeHtml(q.statement) + '</div>' +
      '<div class="q-options">' + optionsHtml + '</div>' +
      '</div>' +
      '<div class="card-right">' +
      rightContentHtml +
      '</div>' +
      '</div>';
  }).join("");

  container.innerHTML = cardsHtml;
}

document.getElementById("mainContainer").addEventListener("click", function (e) {
  var btn = e.target.closest(".btn-sync-single");
  if (btn) {
    var qid = btn.getAttribute("data-qid");
    if (qid) syncSingleQuestion(qid);
  }
});

async function syncSingleQuestion(qid) {
  var box = document.getElementById("sync-box-" + qid);
  if (box) box.innerHTML = '<span style="font-size: 12px; color: #93c5fd;">⚡ Enviando para o Supabase Storage...</span>';

  try {
    var res = await fetch("/api/sync-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question_id: qid })
    });
    var data = await res.json();
    if (data.success) {
      if (box) {
        box.innerHTML = '<div style="font-size: 12px; color: #6ee7b7; font-weight: 600;">✅ Sincronizada com sucesso!</div>';
      }
      fetchStats();
    } else {
      if (box) {
        box.innerHTML = '<div style="color: var(--red); font-size: 12px;">Erro: ' + data.error + '</div><button class="btn btn-primary btn-sync-single" style="margin-top:6px;" data-qid="' + qid + '">Tentar Novamente</button>';
      }
    }
  } catch (e) {
    if (box) {
      box.innerHTML = '<div style="color: var(--red); font-size: 12px;">Falha: ' + e.message + '</div>';
    }
  }
}

function renderPagination(page, totalPages) {
  var bar = document.getElementById("paginationBar");
  if (totalPages <= 1) { bar.innerHTML = ""; return; }

  var html = '<button class="btn btn-outline" ' + (page <= 1 ? 'disabled style="opacity:0.5;"' : '') + ' onclick="loadQuestions(' + (page - 1) + ')">← Anterior</button>';
  html += '<span style="font-size: 13px; color: var(--text-muted);">Página ' + page + ' de ' + totalPages + '</span>';
  html += '<button class="btn btn-outline" ' + (page >= totalPages ? 'disabled style="opacity:0.5;"' : '') + ' onclick="loadQuestions(' + (page + 1) + ')">Próxima →</button>';
  bar.innerHTML = html;
}

function escapeHtml(str) {
  if (!str) return "";
  return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

loadQuestions(1);
setInterval(fetchStats, 2500);
