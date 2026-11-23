import http from 'http';
import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3336;
const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const MEDQ_CATALOG_PATH = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const SYNC_STATUS_PATH = path.resolve('data/supabase_tables/supabase_sync_status.json');
const CLIENT_JS_PATH = path.resolve('scripts/dashboard_client.js');

// Diretórios locais de imagens
const HIGIENIZADAS_DIR = path.resolve('data/imagens_higienizadas_medq');
const ORIGINAIS_MEDQ_DIR = path.resolve('data/imagens_medq_originais');
const COMPARACOES_MEDQ_DIR = path.resolve('data/comparacoes_antes_depois_medq');
const CONVERTED_DIR = path.resolve('data/imagens_convertidas_webp');
const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
const PDR_DIR = path.resolve('data/imagens_provaderesidencia');
const BANCO_GERAL_DIR = path.resolve('data/imagens_banco_geral');
const MEDEVO_DOWNLOAD_DIR = path.resolve('data/imagens_medevo_download');
const EXTRACTED_DIR = path.resolve('data/extracted_images_webp');

for (const dir of [HIGIENIZADAS_DIR, ORIGINAIS_MEDQ_DIR, COMPARACOES_MEDQ_DIR, CONVERTED_DIR, RESCUED_DIR, PDR_DIR, BANCO_GERAL_DIR, MEDEVO_DOWNLOAD_DIR, EXTRACTED_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

if (!fs.existsSync(DB_PATH)) {
  console.error('❌ ERRO: Banco supabase_tables.db não encontrado em:', DB_PATH);
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

// Configuração Supabase
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Catálogo de marcas d'água catalogadas
const medqWatermarkSet = new Set();
if (fs.existsSync(MEDQ_CATALOG_PATH)) {
  try {
    const cat = JSON.parse(fs.readFileSync(MEDQ_CATALOG_PATH, 'utf-8')).catalog || [];
    cat.forEach(item => medqWatermarkSet.add(item.id));
  } catch (e) {
    console.error('Erro ao ler medq_watermark_catalog:', e.message);
  }
}

// Adiciona questão relatada pelo usuário ao conjunto de marcas d'água conhecidas
medqWatermarkSet.add('questions_66a08e3e-6c58-41bd-8375-c97250110c13');

// Carregamento e persistência debounced do status de sincronização
function loadSyncStatus() {
  if (fs.existsSync(SYNC_STATUS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(SYNC_STATUS_PATH, 'utf8'));
    } catch { }
  }
  return { synced_questions: {}, synced_images: {}, updated_at: new Date().toISOString() };
}

let syncStatus = loadSyncStatus();
let syncStatusDirty = false;

function markSyncStatusDirty() {
  syncStatusDirty = true;
}

// Persistência em lote a cada 3 segundos
setInterval(() => {
  if (syncStatusDirty) {
    try {
      syncStatus.updated_at = new Date().toISOString();
      fs.writeFileSync(SYNC_STATUS_PATH, JSON.stringify(syncStatus, null, 2), 'utf8');
      syncStatusDirty = false;
    } catch (e) {
      console.error('Erro ao salvar syncStatus:', e.message);
    }
  }
}, 3000);

// Resolução de arquivos locais em disco
function resolveLocalFile(rawUrl) {
  if (!rawUrl) return null;
  const cleanUrl = rawUrl.split('?')[0];
  const baseName = path.basename(cleanUrl);

  const candidates = [
    { dir: HIGIENIZADAS_DIR, sub: 'imagens_higienizadas_medq' },
    { dir: PDR_DIR, sub: 'provaderesidencia' },
    { dir: BANCO_GERAL_DIR, sub: 'banco_geral' },
    { dir: CONVERTED_DIR, sub: 'imagens_convertidas' },
    { dir: RESCUED_DIR, sub: 'resgatadas' },
    { dir: EXTRACTED_DIR, sub: 'extracted' },
    { dir: MEDEVO_DOWNLOAD_DIR, sub: 'medevo' },
    { dir: ORIGINAIS_MEDQ_DIR, sub: 'medq_originais' },
    { dir: COMPARACOES_MEDQ_DIR, sub: 'comparacoes_medq' }
  ];

  for (const c of candidates) {
    const fPath = path.join(c.dir, baseName);
    if (fs.existsSync(fPath)) {
      return { fullPath: fPath, baseName, subFolder: c.sub };
    }
  }

  const cleanBase = baseName.replace(/^clean_[a-f0-9]+_/, '');
  for (const c of candidates) {
    const fPath = path.join(c.dir, cleanBase);
    if (fs.existsSync(fPath)) {
      return { fullPath: fPath, baseName: cleanBase, subFolder: c.sub };
    }
  }

  return null;
}

// Upload individual de arquivo para Supabase Storage
async function uploadImageToSupabase(localResolved) {
  const { fullPath, baseName, subFolder } = localResolved;
  const storagePath = `${subFolder}/${baseName}`;

  if (syncStatus.synced_images[baseName]) {
    return syncStatus.synced_images[baseName].public_url;
  }

  const fileBuffer = fs.readFileSync(fullPath);
  const { error } = await supabase.storage.from('questoes').upload(storagePath, fileBuffer, {
    contentType: 'image/webp',
    upsert: true
  });

  if (error) {
    throw new Error(`Falha no Storage: ${error.message}`);
  }

  const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
  const publicUrl = pubData.publicUrl;

  syncStatus.synced_images[baseName] = {
    public_url: publicUrl,
    storage_path: storagePath,
    uploaded_at: new Date().toISOString(),
    size: fileBuffer.length
  };
  markSyncStatusDirty();

  return publicUrl;
}

// Sincronização de uma questão (Storage + DB Remoto + DB Local)
async function syncQuestionWithSupabase(questionId) {
  const q = db.prepare('SELECT id, images, source_tables FROM questions_curated_staging WHERE id = ?').get(questionId);
  if (!q) throw new Error('Questão não encontrada');

  let rawImages = [];
  try {
    rawImages = JSON.parse(q.images || '[]');
  } catch {
    rawImages = [q.images];
  }

  if (!rawImages || rawImages.length === 0) {
    throw new Error('Questão sem imagens');
  }

  const newPublicUrls = [];
  for (const imgUrl of rawImages) {
    if (typeof imgUrl !== 'string') continue;
    if (imgUrl.includes('supabase.co/storage/v1/object/public/questoes/')) {
      newPublicUrls.push(imgUrl);
      continue;
    }

    const localResolved = resolveLocalFile(imgUrl);
    if (!localResolved) {
      throw new Error(`Arquivo local não encontrado: ${imgUrl}`);
    }

    const publicUrl = await uploadImageToSupabase(localResolved);
    newPublicUrls.push(publicUrl);
  }

  // Atualiza banco local SSOT
  db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?').run(JSON.stringify(newPublicUrls), questionId);

  // Atualiza cache em memória
  if (CACHE_MAP.has(questionId)) {
    const item = CACHE_MAP.get(questionId);
    item.images = newPublicUrls;
    item.is_synced = true;
  }

  // Atualiza Supabase Remoto
  let sourceTable = 'questions';
  try {
    const st = JSON.parse(q.source_tables || '[]');
    if (Array.isArray(st) && st.length > 0) sourceTable = st[0];
  } catch { }

  let cleanId = questionId;
  const validTables = ['questions', 'questions_expansion_direto', 'questions_expansion_r_plus', 'questions_expansion_revalida', 'questions_expansion_titulo_especialista'];
  for (const vt of validTables) {
    if (cleanId.startsWith(vt + '_')) {
      cleanId = cleanId.replace(vt + '_', '');
      sourceTable = vt;
      break;
    }
  }

  let remoteUpdated = false;
  if (validTables.includes(sourceTable) && !cleanId.startsWith('pdr_')) {
    const { error: remoteErr } = await supabase.from(sourceTable).update({ images: newPublicUrls }).eq('id', cleanId);
    if (!remoteErr) remoteUpdated = true;
  }

  syncStatus.synced_questions[questionId] = {
    public_urls: newPublicUrls,
    synced_at: new Date().toISOString(),
    remote_table: sourceTable,
    remote_updated: remoteUpdated
  };
  markSyncStatusDirty();

  return { success: true, question_id: questionId, public_urls: newPublicUrls, remote_updated: remoteUpdated };
}

// CACHE EM MEMÓRIA DAS QUESTÕES COM IMAGEM & DETECÇÃO DE IMAGENS QUEBRADAS
console.log('⚡ Carregando questões e auditando arquivos em disco...');
const rawRows = db.prepare(`
  SELECT id, code, institution, banca, year, statement, options, images, correct_answer, commentary, source_tables
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
  ORDER BY year DESC, id ASC
`).all();

let brokenTotal = 0;

const ALL_QUESTIONS_WITH_IMG = rawRows.map(r => {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  let parsedOpts = [];
  try { parsedOpts = JSON.parse(r.options || '[]'); } catch { }

  const hasWatermark = medqWatermarkSet.has(r.id) || (imgs.length > 0 && imgs.some(u => typeof u === 'string' && u.includes('imagens_medq_originais')));
  const isSynced = Boolean(syncStatus.synced_questions[r.id] || (imgs.length > 0 && imgs.some(u => typeof u === 'string' && u.includes(SUPABASE_URL))));

  // Verificação determinística se a imagem está quebrada
  let isBroken = false;
  let brokenReason = '';
  if (!imgs || imgs.length === 0) {
    isBroken = true;
    brokenReason = 'Nenhum caminho de imagem registrado';
  } else {
    for (const img of imgs) {
      if (typeof img !== 'string') continue;
      // Se não for URL do Supabase já online
      if (!img.includes('supabase.co/storage/v1/object/public/questoes/')) {
        const local = resolveLocalFile(img);
        if (!local) {
          isBroken = true;
          brokenReason = `Arquivo físico não encontrado: ${img}`;
          break;
        } else {
          try {
            const stat = fs.statSync(local.fullPath);
            if (stat.size === 0) {
              isBroken = true;
              brokenReason = 'Arquivo com tamanho 0 bytes';
              break;
            }
          } catch {
            isBroken = true;
            brokenReason = 'Erro de I/O no arquivo';
            break;
          }
        }
      }
    }
  }

  if (isBroken) brokenTotal++;

  return {
    id: r.id,
    code: r.code,
    institution: r.institution,
    banca: r.banca,
    year: r.year,
    statement: r.statement,
    images: imgs,
    options: parsedOpts,
    correct_answer: r.correct_answer,
    commentary: r.commentary,
    source_tables: r.source_tables,
    has_watermark: hasWatermark,
    is_synced: isSynced,
    is_broken: isBroken,
    broken_reason: brokenReason
  };
});

const CACHE_MAP = new Map(ALL_QUESTIONS_WITH_IMG.map(q => [q.id, q]));
console.log(`✅ ${ALL_QUESTIONS_WITH_IMG.length} questões indexadas. Imagens quebradas identificadas: ${brokenTotal}`);

// MOTOR DE SINCRONIZAÇÃO EM TEMPO REAL EM BACKGROUND (INICIA PAUSADO PARA SEGURANÇA)
const realtimeEngine = {
  active: false,
  processed: 0,
  success: 0,
  failed: 0,
  current_item: null,
  total_queue: 0,
  last_error: null
};

async function runRealtimeSyncWorker() {
  if (realtimeEngine.active) return;
  realtimeEngine.active = true;

  console.log('🚀 [Realtime Sync Engine] Iniciando sincronização em lote...');

  const queue = ALL_QUESTIONS_WITH_IMG.filter(q => {
    const isWatermarked = q.has_watermark;
    const isAlreadySynced = syncStatus.synced_questions[q.id] || q.images.some(u => typeof u === 'string' && u.includes(SUPABASE_URL));
    return !isWatermarked && !isAlreadySynced && !q.is_broken;
  });

  realtimeEngine.total_queue = queue.length;
  console.log(`📋 [Realtime Sync Engine] Fila de sincronização: ${queue.length} questões limpas e válidas.`);

  for (const item of queue) {
    if (!realtimeEngine.active) {
      console.log('⏹️ [Realtime Sync Engine] Sincronização pausada.');
      break;
    }

    realtimeEngine.current_item = item.id;
    try {
      await syncQuestionWithSupabase(item.id);
      realtimeEngine.success++;
      item.is_synced = true;
    } catch (err) {
      realtimeEngine.failed++;
      realtimeEngine.last_error = `${item.id}: ${err.message}`;
    }
    realtimeEngine.processed++;

    await new Promise(r => setTimeout(r, 60));
  }

  realtimeEngine.active = false;
  realtimeEngine.current_item = null;
  markSyncStatusDirty();
  console.log(`✅ [Realtime Sync Engine] Concluído. Sucessos: ${realtimeEngine.success}, Falhas: ${realtimeEngine.failed}`);
}

// SERVIDOR HTTP
const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    return res.end();
  }

  // CLIENT JS SCRIPT SEPARADO
  if (pathname === '/dashboard_client.js') {
    res.writeHead(200, { 'Content-Type': 'application/javascript; charset=utf-8' });
    return fs.createReadStream(CLIENT_JS_PATH).pipe(res);
  }

  // PROXY DE IMAGEM LOCAL (Zero Lag)
  if (pathname === '/api/proxy-image') {
    const rawUrl = parsedUrl.searchParams.get('url');
    if (!rawUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('URL ausente');
    }

    const localResolved = resolveLocalFile(rawUrl);
    if (localResolved && fs.existsSync(localResolved.fullPath)) {
      res.writeHead(200, {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable'
      });
      return fs.createReadStream(localResolved.fullPath).pipe(res);
    }

    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      try {
        const fetchRes = await fetch(rawUrl, { signal: AbortSignal.timeout(3000) });
        if (fetchRes.ok) {
          res.writeHead(200, { 'Content-Type': fetchRes.headers.get('content-type') || 'image/webp' });
          const buf = await fetchRes.arrayBuffer();
          return res.end(Buffer.from(buf));
        }
      } catch { }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Imagem não encontrada');
  }

  // ROTA: Estatísticas Gerais
  if (pathname === '/api/stats') {
    const totalQuestionsWithImg = ALL_QUESTIONS_WITH_IMG.length;
    const syncedCount = Object.keys(syncStatus.synced_questions || {}).length;
    const watermarkedCount = ALL_QUESTIONS_WITH_IMG.filter(q => q.has_watermark).length;
    const brokenCount = ALL_QUESTIONS_WITH_IMG.filter(q => q.is_broken).length;
    const cleanCount = totalQuestionsWithImg - watermarkedCount - brokenCount;

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      totalQuestionsWithImg,
      cleanCount,
      watermarkedCount,
      brokenCount,
      nonMedqCount: cleanCount,
      syncedCount,
      pendingUploadCount: Math.max(0, totalQuestionsWithImg - syncedCount),
      realtimeEngine
    }));
  }

  // ROTA: Status do Motor em Tempo Real
  if (pathname === '/api/sync-realtime/status') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify(realtimeEngine));
  }

  // ROTA: Alternar Motor em Tempo Real (Pausar / Retomar)
  if (pathname === '/api/sync-realtime/toggle' && req.method === 'POST') {
    if (realtimeEngine.active) {
      realtimeEngine.active = false;
    } else {
      runRealtimeSyncWorker().catch(e => console.error(e));
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({ active: realtimeEngine.active }));
  }

  // ROTA: Sincronização de Questão Individual
  if (pathname === '/api/sync-question' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', async () => {
      try {
        const { question_id } = JSON.parse(body || '{}');
        if (!question_id) throw new Error('question_id é obrigatório');

        const result = await syncQuestionWithSupabase(question_id);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify(result));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  // ROTA: Consulta Paginada de Questões Filtradas
  if (pathname === '/api/questions') {
    const page = parseInt(parsedUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(parsedUrl.searchParams.get('limit') || '15', 10);
    const filter = parsedUrl.searchParams.get('filter') || 'clean_no_watermark';
    const search = (parsedUrl.searchParams.get('search') || '').toLowerCase().trim();
    const offset = (page - 1) * limit;

    let filtered = ALL_QUESTIONS_WITH_IMG.filter(q => {
      const isSynced = Boolean(syncStatus.synced_questions[q.id] || q.is_synced);

      if (filter === 'clean_no_watermark') return !q.has_watermark && !q.is_broken;
      if (filter === 'watermarked') return q.has_watermark;
      if (filter === 'broken_images') return q.is_broken;
      if (filter === 'non_medq') return !q.has_watermark && !q.is_broken && (q.id.startsWith('pdr_') || (q.source_tables && !q.source_tables.includes('medevo')));
      if (filter === 'pending_upload') return !isSynced && !q.is_broken;
      if (filter === 'synced') return isSynced;
      return true;
    });

    if (search) {
      filtered = filtered.filter(q =>
        (q.id && q.id.toLowerCase().includes(search)) ||
        (q.banca && q.banca.toLowerCase().includes(search)) ||
        (q.statement && q.statement.toLowerCase().includes(search)) ||
        (q.year && String(q.year).includes(search))
      );
    }

    const totalMatching = filtered.length;
    const pageItems = filtered.slice(offset, offset + limit);

    const questions = pageItems.map(r => {
      const isSynced = Boolean(syncStatus.synced_questions[r.id] || r.is_synced);
      const syncInfo = syncStatus.synced_questions[r.id] || null;

      return {
        id: r.id,
        code: r.code,
        institution: r.institution,
        banca: r.banca,
        year: r.year,
        statement: r.statement,
        images: r.images,
        options: r.options,
        correct_answer: r.correct_answer,
        commentary: r.commentary,
        has_watermark: r.has_watermark,
        is_synced: isSynced,
        is_broken: r.is_broken,
        broken_reason: r.broken_reason,
        sync_info: syncInfo
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json' });
    return res.end(JSON.stringify({
      total: totalMatching,
      page,
      limit,
      totalPages: Math.ceil(totalMatching / limit),
      questions
    }));
  }

  // INTERFACE HTML DO DASHBOARD
  if (pathname === '/' || pathname === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    return res.end(renderDashboardHtml());
  }

  res.writeHead(404, { 'Content-Type': 'text/plain' });
  res.end('Rota não encontrada.');
});

function renderDashboardHtml() {
  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Banco Residência — Saneamento de Imagens WebP & Sincronização Supabase</title>
  <style>
    :root {
      --bg: #090b10;
      --card-bg: #12151f;
      --border: #1e2433;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --accent: #2563eb;
      --green: #10b981;
      --amber: #f59e0b;
      --red: #ef4444;
      --purple: #8b5cf6;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; }
    header { background: var(--card-bg); border-bottom: 1px solid var(--border); padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
    .header-title h1 { font-size: 19px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; }
    .badge-gate { background: var(--accent); color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 999px; text-transform: uppercase; font-weight: 700; }
    
    .sync-banner { background: #0c1527; border-bottom: 1px solid #1e3a8a; padding: 12px 28px; display: flex; align-items: center; justify-content: space-between; gap: 20px; }
    .sync-status-indicator { display: flex; align-items: center; gap: 10px; font-size: 13.5px; font-weight: 600; }
    .pulse-dot { width: 10px; height: 10px; border-radius: 50%; background: var(--amber); }
    .progress-track { flex: 1; max-width: 450px; height: 8px; background: #1e293b; border-radius: 999px; overflow: hidden; position: relative; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #3b82f6, #10b981); width: 0%; transition: width 0.3s; }

    .tabs-nav { display: flex; gap: 8px; padding: 10px 28px; background: #0f121c; border-bottom: 1px solid var(--border); overflow-x: auto; }
    .tab-btn { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.15s; white-space: nowrap; }
    .tab-btn:hover { background: #1f2433; color: #fff; }
    .tab-btn.active { background: #1e293b; border-color: var(--accent); color: #fff; }
    .tab-btn.tab-clean.active { border-color: var(--green); background: rgba(16, 185, 129, 0.15); color: #6ee7b7; }
    .tab-btn.tab-watermark.active { border-color: var(--amber); background: rgba(245, 158, 11, 0.15); color: #fde68a; }
    .tab-btn.tab-broken.active { border-color: var(--red); background: rgba(239, 68, 68, 0.15); color: #fca5a5; }

    .stats-bar { display: flex; gap: 14px; padding: 12px 28px; background: #0c0e17; border-bottom: 1px solid var(--border); overflow-x: auto; }
    .stat-pill { background: var(--card-bg); border: 1px solid var(--border); padding: 8px 16px; border-radius: 8px; display: flex; flex-direction: column; min-width: 140px; }
    .stat-pill .num { font-size: 19px; font-weight: 700; color: #fff; }
    .stat-pill .label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-pill.green .num { color: var(--green); }
    .stat-pill.amber .num { color: var(--amber); }
    .stat-pill.red .num { color: var(--red); }

    .controls-bar { padding: 12px 28px; display: flex; gap: 12px; align-items: center; border-bottom: 1px solid var(--border); background: #0e111a; flex-wrap: wrap; }
    .controls-bar input { background: var(--card-bg); border: 1px solid var(--border); color: var(--text); padding: 8px 14px; border-radius: 6px; font-size: 13px; outline: none; width: 340px; }
    .btn { padding: 8px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
    .btn-primary { background: var(--accent); color: #fff; }
    .btn-primary:hover { background: #1d4ed8; }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: #1e2433; }

    main { padding: 24px 28px; max-width: 1650px; margin: 0 auto; }
    .question-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 24px; overflow: hidden; display: grid; grid-template-columns: 1.15fr 0.95fr; }
    .card-left { padding: 20px; border-right: 1px solid var(--border); display: flex; flex-direction: column; }
    .card-right { padding: 20px; background: #07090e; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
    
    .q-meta { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .q-badge { background: #1e2433; padding: 2px 8px; border-radius: 4px; color: #93c5fd; font-weight: 600; font-size: 12px; }
    .q-badge-clean { background: rgba(16, 185, 129, 0.2); color: #6ee7b7; border: 1px solid var(--green); }
    .q-badge-watermark { background: rgba(245, 158, 11, 0.2); color: #fde68a; border: 1px solid var(--amber); }
    .q-badge-broken { background: rgba(239, 68, 68, 0.2); color: #fca5a5; border: 1px solid var(--red); }
    .q-badge-synced { background: rgba(37, 99, 235, 0.2); color: #bfdbfe; border: 1px solid var(--accent); }

    .q-statement { font-size: 14px; margin-bottom: 16px; color: #cbd5e1; white-space: pre-wrap; max-height: 250px; overflow-y: auto; line-height: 1.6; }
    .q-options { margin-top: auto; border-top: 1px solid var(--border); padding-top: 12px; }
    .opt-item { padding: 7px 10px; margin-bottom: 5px; background: #0d1017; border: 1px solid var(--border); border-radius: 6px; font-size: 12.5px; display: flex; gap: 8px; }
    .opt-item.is-correct { border-color: var(--green); background: rgba(16, 185, 129, 0.08); }
    .opt-letter { font-weight: 700; color: #93c5fd; }

    .image-preview-container { width: 100%; text-align: center; }
    .image-preview-container img { max-width: 100%; max-height: 420px; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(0,0,0,0.6); }

    .broken-image-box { padding: 30px; text-align: center; background: rgba(239, 68, 68, 0.06); border: 1px dashed var(--red); border-radius: 8px; width: 90%; }
    .sync-action-box { margin-top: 16px; width: 100%; display: flex; flex-direction: column; align-items: center; gap: 8px; }
    .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin: 32px 0; }
  </style>
</head>
<body>
  <header>
    <div class="header-title">
      <h1>🩺 Banco Residência <span class="badge-gate">Padronização 100% WebP & Sincronizador Supabase</span></h1>
    </div>
    <div style="font-size: 13px; color: var(--text-muted);">Porta 3336 • SSOT: questions_curated_staging</div>
  </header>

  <!-- Banner do Motor de Sincronização em Tempo Real -->
  <section class="sync-banner">
    <div class="sync-status-indicator">
      <span class="pulse-dot" id="syncPulse"></span>
      <span id="syncStatusText">Sincronizador em Tempo Real: Pausado</span>
    </div>
    <div class="progress-track">
      <div class="progress-fill" id="syncProgressBar"></div>
    </div>
    <div style="font-size: 12.5px; color: var(--text-muted); display: flex; align-items: center; gap: 12px;">
      <span id="syncStatsDetail">Sincronizadas: 0 / 0</span>
      <button class="btn btn-primary" style="padding: 4px 12px; font-size: 11.5px;" onclick="toggleRealtimeSync()" id="btnToggleSync">▶️ Iniciar Sincronização</button>
    </div>
  </section>

  <!-- Navegação por Abas com os Filtros Solicitados -->
  <nav class="tabs-nav">
    <button class="tab-btn tab-clean active" id="tab-clean" onclick="setFilter('clean_no_watermark')">🟢 Sem Marca de Água (Prontas)</button>
    <button class="tab-btn tab-watermark" id="tab-watermark" onclick="setFilter('watermarked')">⚠️ Com Marca de Água (MedQ/MedBrave)</button>
    <button class="tab-btn tab-broken" id="tab-broken" onclick="setFilter('broken_images')">🚨 Imagens Quebradas / Ausentes (<span id="tabBrokenCount">—</span>)</button>
    <button class="tab-btn tab-nonmedq" id="tab-nonmedq" onclick="setFilter('non_medq')">🏢 Não-MedQ (Prova de Residência & Geral)</button>
    <button class="tab-btn" id="tab-pending" onclick="setFilter('pending_upload')">⏳ Todas Não Upadas</button>
    <button class="tab-btn" id="tab-synced" onclick="setFilter('synced')">✅ Já Sincronizadas no Supabase</button>
  </nav>

  <!-- Barra de Estatísticas em Tempo Real -->
  <section class="stats-bar">
    <div class="stat-pill"><span class="num" id="statTotal">6.856</span><span class="label">Total com Imagem</span></div>
    <div class="stat-pill green"><span class="num" id="statClean">—</span><span class="label">Sem Marca de Água</span></div>
    <div class="stat-pill amber"><span class="num" id="statWatermarked">—</span><span class="label">Com Marca de Água</span></div>
    <div class="stat-pill red"><span class="num" id="statBroken">—</span><span class="label">Imagens Quebradas</span></div>
    <div class="stat-pill green"><span class="num" id="statSynced">—</span><span class="label">Sincronizadas no Supabase</span></div>
    <div class="stat-pill amber"><span class="num" id="statPendingUpload">—</span><span class="label">Pendentes de Upload</span></div>
  </section>

  <!-- Controles e Busca -->
  <section class="controls-bar">
    <input type="text" id="searchInput" placeholder="Pesquisar por enunciado, banca, ano ou ID..." onkeyup="if(event.key==='Enter') loadQuestions(1)">
    <button class="btn btn-outline" onclick="loadQuestions(1)">🔍 Buscar</button>
    <span id="currentFilterLabel" style="margin-left: auto; font-size: 13px; color: var(--text-muted); font-weight: 500;">Exibindo: Sem Marca de Água</span>
  </section>

  <!-- Lista de Questões -->
  <main id="mainContainer">
    <div style="text-align: center; padding: 40px; color: var(--text-muted);">Carregando galeria de questões...</div>
  </main>

  <div class="pagination" id="paginationBar"></div>

  <script src="/dashboard_client.js"></script>
</body>
</html>`;
}

server.listen(PORT, '127.0.0.1', () => {
  console.log(`================================================================================`);
  console.log(`🌐 DASHBOARD DE IMAGENS & SINCRONIZAÇÃO SUPABASE ATIVO: http://localhost:${PORT}`);
  console.log(`================================================================================`);
});
