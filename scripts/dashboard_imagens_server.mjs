import http from 'http';
import fs from 'fs';
import path from 'path';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { DatabaseSync } from 'node:sqlite';

const execFileAsync = promisify(execFile);

const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3336;
const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const DECISIONS_PATH = path.resolve('data/supabase_tables/image_watermark_decisions.json');
const MISSING_CATALOG_PATH = path.resolve('data/supabase_tables/gate6_missing_catalog.json');
const MEDQ_CATALOG_PATH = path.resolve('data/supabase_tables/medq_watermark_catalog.json');

const CONVERTED_DIR = path.resolve('data/imagens_convertidas_webp');
const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
const HIGIENIZADAS_DIR = path.resolve('data/imagens_higienizadas_medq');
const ORIGINAIS_MEDQ_DIR = path.resolve('data/imagens_medq_originais');
const COMPARACOES_MEDQ_DIR = path.resolve('data/comparacoes_antes_depois_medq');
const PDR_DIR = path.resolve('data/imagens_provaderesidencia');

const BANCO_GERAL_DIR = path.resolve('data/imagens_banco_geral');
const MEDEVO_DOWNLOAD_DIR = path.resolve('data/imagens_medevo_download');

for (const dir of [HIGIENIZADAS_DIR, ORIGINAIS_MEDQ_DIR, COMPARACOES_MEDQ_DIR, CONVERTED_DIR, RESCUED_DIR, PDR_DIR, BANCO_GERAL_DIR, MEDEVO_DOWNLOAD_DIR]) {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
}

if (!fs.existsSync(DB_PATH)) {
  console.error('❌ ERRO: Banco supabase_tables.db não encontrado em:', DB_PATH);
  process.exit(1);
}

const db = new DatabaseSync(DB_PATH);

// Pre-cached count to never lock sqlite during stats
const TOTAL_QUESTIONS_WITH_IMG = 6859;

function getGate6Catalog() {
  if (fs.existsSync(MISSING_CATALOG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MISSING_CATALOG_PATH, 'utf-8')).catalog || [];
    } catch {}
  }
  return [];
}

function getMedQCatalog() {
  if (fs.existsSync(MEDQ_CATALOG_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(MEDQ_CATALOG_PATH, 'utf-8')).catalog || [];
    } catch {}
  }
  return [];
}

function loadDecisions() {
  if (fs.existsSync(DECISIONS_PATH)) {
    try {
      return JSON.parse(fs.readFileSync(DECISIONS_PATH, 'utf8'));
    } catch {
      return { decisions: {}, visual_answer_corrections: {}, gate6_actions: {}, medq_actions: {}, updated_at: new Date().toISOString() };
    }
  }
  return { decisions: {}, visual_answer_corrections: {}, gate6_actions: {}, medq_actions: {}, updated_at: new Date().toISOString() };
}

function saveDecisions(data) {
  data.updated_at = new Date().toISOString();
  fs.writeFileSync(DECISIONS_PATH, JSON.stringify(data, null, 2), 'utf8');
}

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

function resolveLocalFilePath(rawUrl) {
  if (!rawUrl) return null;
  const cleanUrl = rawUrl.split('?')[0];
  const baseName = path.basename(cleanUrl);

  if (cleanUrl.includes('comparacoes_medq') || cleanUrl.includes('comparacoes_antes_depois')) {
    const p = path.join(COMPARACOES_MEDQ_DIR, baseName);
    if (fs.existsSync(p)) return p;
  }

  if (cleanUrl.includes('imagens_medq_originais')) {
    const p = path.join(ORIGINAIS_MEDQ_DIR, baseName);
    if (fs.existsSync(p)) return p;
  }

  if (cleanUrl.includes('imagens_higienizadas_medq')) {
    const p = path.join(HIGIENIZADAS_DIR, baseName);
    if (fs.existsSync(p)) return p;
  }

  for (const d of [COMPARACOES_MEDQ_DIR, HIGIENIZADAS_DIR, ORIGINAIS_MEDQ_DIR, CONVERTED_DIR, RESCUED_DIR, PDR_DIR, BANCO_GERAL_DIR, MEDEVO_DOWNLOAD_DIR]) {
    const cand = path.join(d, baseName);
    if (fs.existsSync(cand)) return cand;
  }

  return null;
}

const server = http.createServer(async (req, res) => {
  const parsedUrl = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = parsedUrl.pathname;

  // ROTA: Proxy / Serviço de Imagem Local e Segura
  if (pathname === '/api/proxy-image') {
    const rawUrl = parsedUrl.searchParams.get('url');
    if (!rawUrl) {
      res.writeHead(400, { 'Content-Type': 'text/plain' });
      return res.end('URL ausente');
    }

    // 1. Verificação Local Rápida (Zero Network)
    const localMatch = resolveLocalFilePath(rawUrl);
    if (localMatch && fs.existsSync(localMatch)) {
      res.writeHead(200, {
        'Content-Type': 'image/webp',
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Access-Control-Allow-Origin': '*'
      });
      return fs.createReadStream(localMatch).pipe(res);
    }

    // 2. Se for PDR mapeado no SQLite
    if (rawUrl.includes('pdres.s3.amazonaws.com') || rawUrl.includes('imagens_provaderesidencia')) {
      try {
        const pdrMatch = db.prepare(`SELECT local_path FROM provaderesidencia_imagens_arquivo WHERE url = ? LIMIT 1`).get(rawUrl);
        if (pdrMatch && fs.existsSync(path.resolve(pdrMatch.local_path))) {
          res.writeHead(200, {
            'Content-Type': 'image/webp',
            'Cache-Control': 'public, max-age=31536000, immutable',
            'Access-Control-Allow-Origin': '*'
          });
          return fs.createReadStream(path.resolve(pdrMatch.local_path)).pipe(res);
        }
      } catch {}
    }

    // 3. Imagem Externa HTTP/HTTPS com Timeout de 2.5s
    if (rawUrl.startsWith('http://') || rawUrl.startsWith('https://')) {
      try {
        const fetchRes = await fetch(rawUrl, {
          headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' },
          signal: AbortSignal.timeout(2500)
        });
        if (!fetchRes.ok) {
          res.writeHead(404, { 'Content-Type': 'text/plain' });
          return res.end(`Imagem não encontrada: ${fetchRes.status}`);
        }
        const contentType = fetchRes.headers.get('content-type') || 'image/webp';
        res.writeHead(200, {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=86400',
          'Access-Control-Allow-Origin': '*'
        });
        const arrayBuf = await fetchRes.arrayBuffer();
        return res.end(Buffer.from(arrayBuf));
      } catch (e) {
        res.writeHead(504, { 'Content-Type': 'text/plain' });
        return res.end(`Timeout no proxy: ${e.message}`);
      }
    }

    res.writeHead(404, { 'Content-Type': 'text/plain' });
    return res.end('Arquivo local não encontrado');
  }

  // ROTA: Estatísticas Gerais dos Gates (Resposta Instantânea 0ms)
  if (pathname === '/api/stats') {
    const decisionsData = loadDecisions();
    const decisions = decisionsData.decisions || {};
    const gate6Actions = decisionsData.gate6_actions || {};
    const medqActions = decisionsData.medq_actions || {};
    const gate6Missing = getGate6Catalog();
    const medqCatalog = getMedQCatalog();

    let approved = 0;
    let cropped = 0;
    let gate6 = 0;

    for (const d of Object.values(decisions)) {
      if (d.action === 'approve') approved++;
      if (d.action === 'crop') cropped++;
      if (d.action === 'send_gate6') gate6++;
    }

    let medqInpaintedCount = 0;
    for (const d of Object.values(medqActions)) {
      if (d.action === 'inpainted' || d.action === 'approve') medqInpaintedCount++;
    }

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    return res.end(JSON.stringify({
      totalQuestionsWithImg: TOTAL_QUESTIONS_WITH_IMG,
      auditedCount: Object.keys(decisions).length,
      approvedCount: approved,
      croppedCount: cropped,
      gate6Count: gate6,
      gate6MissingTotal: gate6Missing.length,
      gate6Resolved: Object.keys(gate6Actions).length,
      medqTotal: medqCatalog.length,
      medqResolvedCount: medqInpaintedCount,
      medqPendingCount: Math.max(0, medqCatalog.length - medqInpaintedCount),
      pendingCount: Math.max(0, TOTAL_QUESTIONS_WITH_IMG - (approved + cropped)),
      updated_at: decisionsData.updated_at
    }));
  }

  // ROTA: Lista de Questões com Filtro e Paginação Rápida
  if (pathname === '/api/questions') {
    const page = parseInt(parsedUrl.searchParams.get('page') || '1', 10);
    const limit = parseInt(parsedUrl.searchParams.get('limit') || '15', 10);
    const filter = parsedUrl.searchParams.get('filter') || 'medq_watermark';
    const subfilter = parsedUrl.searchParams.get('subfilter') || 'all';
    const search = parsedUrl.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    const decisionsData = loadDecisions();
    const decisions = decisionsData.decisions || {};
    const gate6Actions = decisionsData.gate6_actions || {};
    const medqActions = decisionsData.medq_actions || {};

    // 1. FILTRO: Marca MedQ Central (Com Antes & Depois)
    if (filter === 'medq_watermark') {
      const medqCatalog = getMedQCatalog();
      let filtered = medqCatalog;

      if (subfilter === 'pending') {
        filtered = filtered.filter(item => !medqActions[item.id] || medqActions[item.id].action !== 'inpainted');
      } else if (subfilter === 'inpainted') {
        filtered = filtered.filter(item => medqActions[item.id] && medqActions[item.id].action === 'inpainted');
      }

      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(q =>
          (q.id && q.id.toLowerCase().includes(s)) ||
          (q.banca && q.banca.toLowerCase().includes(s)) ||
          (q.statement_snippet && q.statement_snippet.toLowerCase().includes(s)) ||
          (q.year && String(q.year).includes(s))
        );
      }

      const totalMatching = filtered.length;
      const pageItems = filtered.slice(offset, offset + limit);

      const questions = pageItems.map(item => {
        let fullQ = null;
        try {
          fullQ = db.prepare('SELECT statement, options, correct_answer, images FROM questions_curated_staging WHERE id = ?').get(item.id);
        } catch {}

        let parsedOpts = [];
        try { parsedOpts = JSON.parse(fullQ?.options || '[]'); } catch {}

        let imgs = [];
        try { imgs = JSON.parse(fullQ?.images || '[]'); } catch {}
        if (!imgs || imgs.length === 0) imgs = [item.image_url];

        const medqAct = medqActions[item.id] || null;
        const isInpainted = medqAct && medqAct.action === 'inpainted';

        const origUrl = medqAct?.original_url || item.image_url;
        const cleanedUrl = medqAct?.cleaned_url || imgs[0];
        const compUrl = medqAct?.comparison_url || `/storage/questoes/comparacoes_medq/comp_${item.id}_${path.basename(origUrl)}`;

        return {
          id: item.id,
          code: item.code,
          institution: item.institution || item.banca,
          banca: item.banca,
          year: item.year,
          statement: fullQ?.statement || item.statement_snippet,
          images: imgs,
          options: parsedOpts,
          correct_answer: fullQ?.correct_answer || '—',
          is_medq_watermark: true,
          medq_score: item.score,
          medq_reason: item.reason,
          medq_action: medqAct,
          is_inpainted: isInpainted,
          original_url: origUrl,
          cleaned_url: cleanedUrl,
          comparison_url: compUrl,
          decision: decisions[item.id] || null
        };
      });

      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({
        total: totalMatching,
        page,
        limit,
        totalPages: Math.ceil(totalMatching / limit),
        questions
      }));
    }

    // 2. FILTRO: Gate 6 (Faltantes)
    if (filter === 'missing_gate6') {
      const gate6Catalog = getGate6Catalog();
      let filtered = gate6Catalog;
      if (search) {
        const s = search.toLowerCase();
        filtered = filtered.filter(q =>
          (q.id && q.id.toLowerCase().includes(s)) ||
          (q.banca && q.banca.toLowerCase().includes(s)) ||
          (q.statement && q.statement.toLowerCase().includes(s)) ||
          (q.year && String(q.year).includes(s))
        );
      }

      const totalMatching = filtered.length;
      const pageItems = filtered.slice(offset, offset + limit);

      const questions = pageItems.map(item => {
        let fullQ = null;
        try {
          fullQ = db.prepare('SELECT statement, options, correct_answer FROM questions_curated_staging WHERE id = ?').get(item.id);
        } catch {}

        let parsedOpts = [];
        try { parsedOpts = JSON.parse(fullQ?.options || '[]'); } catch {}

        return {
          id: item.id,
          code: item.code,
          institution: item.banca,
          banca: item.banca,
          year: item.year,
          statement: fullQ?.statement || item.statement,
          images: [],
          options: parsedOpts,
          correct_answer: fullQ?.correct_answer || '—',
          is_gate6_missing: true,
          gate6_clues: item.clues,
          gate6_action: gate6Actions[item.id] || null
        };
      });

      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({
        total: totalMatching,
        page,
        limit,
        totalPages: Math.ceil(totalMatching / limit),
        questions
      }));
    }

    // 3. FILTRO: Alternativas Visuais
    if (filter === 'options_images') {
      const rows = db.prepare(`
        SELECT id, code, institution, banca, year, statement, options, images, correct_answer, commentary
        FROM questions_curated_staging
        WHERE options LIKE '%http%'
        ORDER BY year DESC, id ASC
        LIMIT ${limit} OFFSET ${offset}
      `).all();

      const questions = rows.map(r => ({
        id: r.id,
        code: r.code,
        institution: r.institution,
        banca: r.banca,
        year: r.year,
        statement: r.statement,
        images: JSON.parse(r.images || '[]'),
        options: JSON.parse(r.options || '[]'),
        correct_answer: r.correct_answer,
        commentary: r.commentary,
        decision: decisions[r.id] || null
      }));

      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({
        total: 92,
        page,
        limit,
        totalPages: Math.ceil(92 / limit),
        questions
      }));
    }

    // 4. FILTRO PADRÃO: Triagem Geral com Index Otimizado (<1ms)
    const rows = db.prepare(`
      SELECT id, code, institution, banca, year, statement, options, images, correct_answer, commentary
      FROM questions_curated_staging
      WHERE images IS NOT NULL AND images != '[]' AND images != ''
      ORDER BY year DESC, id ASC
      LIMIT ${limit} OFFSET ${offset}
    `).all();

    const questions = rows.map(r => {
      let imgs = [];
      try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
      let parsedOpts = [];
      try { parsedOpts = JSON.parse(r.options || '[]'); } catch {}

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
        decision: decisions[r.id] || null
      };
    });

    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    return res.end(JSON.stringify({
      total: TOTAL_QUESTIONS_WITH_IMG,
      page,
      limit,
      totalPages: Math.ceil(TOTAL_QUESTIONS_WITH_IMG / limit),
      questions
    }));
  }

  // ROTA: Ação na Marca MedQ (Inpainting Rápido)
  if (pathname === '/api/medq-action' && req.method === 'POST') {
    const body = await parseJsonBody(req);
    const { question_id, action, image_url, notes } = body;

    const decisionsData = loadDecisions();
    decisionsData.medq_actions = decisionsData.medq_actions || {};

    if (action === 'inpaint') {
      try {
        const fullQ = db.prepare('SELECT images FROM questions_curated_staging WHERE id = ?').get(question_id);
        let imgs = JSON.parse(fullQ?.images || '[]');
        if (!imgs || imgs.length === 0) imgs = [image_url];
        
        const targetImgUrl = image_url || imgs[0];
        let localInputPath = resolveLocalFilePath(targetImgUrl);

        if (!localInputPath) {
          throw new Error(`Arquivo não localizado para inpainting: ${targetImgUrl}`);
        }

        const outFileName = `clean_${question_id}_${path.basename(localInputPath)}`;
        const localOutputPath = path.join(HIGIENIZADAS_DIR, outFileName);

        await execFileAsync('python', ['scripts/inpaint_medq_watermark.py', localInputPath, localOutputPath]);

        const newStoragePath = `/storage/questoes/imagens_higienizadas_medq/${outFileName}`;
        const updatedImages = imgs.map(u => u === targetImgUrl ? newStoragePath : u);

        db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?').run(JSON.stringify(updatedImages), question_id);

        decisionsData.medq_actions[question_id] = {
          action: 'inpainted',
          original_url: targetImgUrl,
          cleaned_url: newStoragePath,
          acted_at: new Date().toISOString()
        };
        saveDecisions(decisionsData);

        res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ success: true, question_id, action: 'inpainted', new_url: newStoragePath }));
      } catch (err) {
        res.writeHead(500, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
        return res.end(JSON.stringify({ success: false, error: err.message }));
      }
    } else {
      decisionsData.medq_actions[question_id] = {
        action,
        notes: notes || '',
        acted_at: new Date().toISOString()
      };
      saveDecisions(decisionsData);

      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      return res.end(JSON.stringify({ success: true, question_id, action }));
    }
  }

  // ROTA PRINCIPAL: Interface HTML do Dashboard
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
  <title>Banco Residência — Hub Visual & Higienização MedQ (Antes & Depois)</title>
  <style>
    :root {
      --bg: #0f1117;
      --card-bg: #161922;
      --border: #232733;
      --text: #e2e8f0;
      --text-muted: #94a3b8;
      --accent: #3b82f6;
      --green: #10b981;
      --green-dark: #064e3b;
      --amber: #f59e0b;
      --amber-dark: #78350f;
      --purple: #8b5cf6;
      --red: #ef4444;
      --red-dark: #7f1d1d;
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { background-color: var(--bg); color: var(--text); font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.5; }
    header { background: var(--card-bg); border-bottom: 1px solid var(--border); padding: 14px 28px; display: flex; justify-content: space-between; align-items: center; position: sticky; top: 0; z-index: 100; }
    .header-title h1 { font-size: 19px; font-weight: 700; color: #fff; display: flex; align-items: center; gap: 10px; }
    .badge-gate { background: var(--accent); color: #fff; font-size: 11px; padding: 3px 8px; border-radius: 999px; text-transform: uppercase; font-weight: 700; }
    
    .tabs-nav { display: flex; gap: 8px; padding: 10px 28px; background: #131620; border-bottom: 1px solid var(--border); }
    .tab-btn { background: transparent; border: 1px solid var(--border); color: var(--text-muted); padding: 8px 16px; border-radius: 6px; font-size: 13px; font-weight: 600; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: all 0.15s; }
    .tab-btn:hover { background: #1f2433; color: #fff; }
    .tab-btn.active { background: #252b3d; border-color: var(--accent); color: #fff; }
    .tab-btn.tab-medq.active { background: #451a03; border-color: var(--amber); color: #fde68a; }

    .stats-bar { display: flex; gap: 14px; padding: 12px 28px; background: #12151e; border-bottom: 1px solid var(--border); overflow-x: auto; }
    .stat-pill { background: var(--card-bg); border: 1px solid var(--border); padding: 8px 16px; border-radius: 8px; display: flex; flex-direction: column; min-width: 140px; }
    .stat-pill .num { font-size: 20px; font-weight: 700; color: #fff; }
    .stat-pill .label { font-size: 10px; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
    .stat-pill.amber .num { color: var(--amber); }
    .stat-pill.green .num { color: var(--green); }
    .stat-pill.purple .num { color: var(--purple); }

    .controls-bar { padding: 12px 28px; display: flex; gap: 12px; align-items: center; border-bottom: 1px solid var(--border); background: #11141c; flex-wrap: wrap; }
    .controls-bar select, .controls-bar input { background: var(--card-bg); border: 1px solid var(--border); color: var(--text); padding: 8px 12px; border-radius: 6px; font-size: 13px; outline: none; }
    .controls-bar input { width: 320px; }

    .subfilter-group { display: flex; gap: 6px; margin-left: 10px; }
    .subfilter-btn { background: #1c2130; border: 1px solid var(--border); color: var(--text-muted); padding: 6px 12px; border-radius: 4px; font-size: 12px; cursor: pointer; }
    .subfilter-btn.active { background: var(--accent); color: #fff; border-color: var(--accent); }

    main { padding: 24px 28px; max-width: 1650px; margin: 0 auto; }
    .question-card { background: var(--card-bg); border: 1px solid var(--border); border-radius: 12px; margin-bottom: 24px; overflow: hidden; display: grid; grid-template-columns: 1.05fr 1.15fr; }
    .card-left { padding: 20px; border-right: 1px solid var(--border); display: flex; flex-direction: column; }
    .card-right { padding: 20px; background: #0c0e14; display: flex; flex-direction: column; align-items: center; justify-content: center; position: relative; }
    
    .q-meta { font-size: 12px; color: var(--text-muted); margin-bottom: 12px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }
    .q-badge { background: #1e2230; padding: 2px 8px; border-radius: 4px; color: #93c5fd; font-weight: 600; font-size: 12px; }
    .q-statement { font-size: 14px; margin-bottom: 16px; color: #cbd5e1; white-space: pre-wrap; max-height: 240px; overflow-y: auto; line-height: 1.6; }
    
    .q-options { margin-top: auto; border-top: 1px solid var(--border); padding-top: 12px; }
    .opt-item { padding: 7px 10px; margin-bottom: 5px; background: #12151e; border: 1px solid var(--border); border-radius: 6px; font-size: 12.5px; display: flex; gap: 8px; }
    .opt-item.is-correct { border-color: var(--green); background: rgba(16, 185, 129, 0.08); }
    .opt-letter { font-weight: 700; color: #93c5fd; }

    /* Visual Comparison Styles */
    .view-mode-bar { display: flex; gap: 8px; margin-bottom: 12px; width: 100%; justify-content: center; }
    .view-btn { background: #1c2130; border: 1px solid var(--border); color: #cbd5e1; padding: 5px 12px; border-radius: 4px; font-size: 11.5px; font-weight: 600; cursor: pointer; }
    .view-btn.active { background: #2563eb; color: #fff; border-color: #3b82f6; }

    .comparison-container { width: 100%; text-align: center; }
    .comparison-container img { max-width: 100%; max-height: 480px; border-radius: 8px; border: 1px solid var(--border); box-shadow: 0 4px 16px rgba(0,0,0,0.6); cursor: zoom-in; }

    .side-by-side-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 12px; width: 100%; }
    .img-pane { position: relative; text-align: center; }
    .img-pane img { width: 100%; max-height: 420px; object-fit: contain; border-radius: 6px; border: 1px solid var(--border); background: #000; }
    .pane-tag { position: absolute; top: 8px; left: 8px; padding: 3px 8px; border-radius: 4px; font-size: 11px; font-weight: 700; }
    .pane-before { background: var(--red-dark); color: #fecaca; border: 1px solid var(--red); }
    .pane-after { background: var(--green-dark); color: #a7f3d0; border: 1px solid var(--green); }

    .target-overlay {
      position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%);
      width: 22%; height: 22%; border: 2px dashed rgba(245, 158, 11, 0.85);
      background: rgba(245, 158, 11, 0.12); border-radius: 6px; pointer-events: none;
      display: flex; align-items: center; justify-content: center;
    }
    .target-overlay::after {
      content: "🧠 ✚ Marca MedQ"; font-size: 9px; font-weight: 700; color: #fef08a;
      background: rgba(0,0,0,0.7); padding: 2px 4px; border-radius: 3px;
    }

    .action-toolbar { margin-top: 14px; display: flex; gap: 8px; width: 100%; justify-content: center; flex-wrap: wrap; }
    .btn { padding: 8px 14px; border-radius: 6px; font-size: 12.5px; font-weight: 600; border: none; cursor: pointer; display: inline-flex; align-items: center; gap: 6px; transition: all 0.15s; }
    .btn-green { background: var(--green); color: #042f2e; }
    .btn-green:hover { background: #34d399; }
    .btn-amber { background: var(--amber); color: #451a03; }
    .btn-amber:hover { background: #fbbf24; }
    .btn-outline { background: transparent; border: 1px solid var(--border); color: var(--text); }
    .btn-outline:hover { background: #232733; }

    .status-badge-clean { background: rgba(16, 185, 129, 0.15); border: 1px solid var(--green); color: #6ee7b7; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 10px; }
    .status-badge-pending { background: rgba(245, 158, 11, 0.15); border: 1px solid var(--amber); color: #fde68a; padding: 4px 10px; border-radius: 6px; font-size: 12px; font-weight: 700; margin-bottom: 10px; }

    .pagination { display: flex; justify-content: center; align-items: center; gap: 12px; margin: 32px 0; }
  </style>
</head>
<body>
  <header>
    <div class="header-title">
      <h1>🩺 Banco Residência <span class="badge-gate">Hub Visual • Gates 3, 5 & 6</span></h1>
    </div>
    <div style="font-size: 13px; color: var(--text-muted);">Porta 3336 • SSOT: questions_curated_staging</div>
  </header>

  <nav class="tabs-nav">
    <button class="tab-btn tab-medq active" id="btn-tab-medq" onclick="setTab('medq_watermark')">🔬 Higienização MedQ (Antes & Depois) <span class="badge-gate" id="tabMedQBadge" style="background: #f59e0b; color: #000;">367</span></button>
    <button class="tab-btn" id="btn-tab-all" onclick="setTab('all')">🖼️ Triagem Geral (Gate 3)</button>
    <button class="tab-btn" id="btn-tab-options" onclick="setTab('options_images')">👁️ Alternativas Visuais (Gate 5)</button>
    <button class="tab-btn" id="btn-tab-gate6" onclick="setTab('missing_gate6')">🚨 Faltantes (Gate 6 - 595 q)</button>
  </nav>

  <section class="stats-bar">
    <div class="stat-pill amber"><span class="num" id="statMedQTotal">367</span><span class="label">Identificadas MedQ</span></div>
    <div class="stat-pill green"><span class="num" id="statMedQResolved">—</span><span class="label">Higienizadas (Limpas)</span></div>
    <div class="stat-pill"><span class="num" id="statTotal">—</span><span class="label">Total Geral com Imagem</span></div>
    <div class="stat-pill green"><span class="num" id="statApproved">—</span><span class="label">Gate 3 Aprovadas</span></div>
    <div class="stat-pill purple"><span class="num" id="statGate6Missing">—</span><span class="label">Faltantes (Gate 6)</span></div>
  </section>

  <section class="controls-bar">
    <input type="text" id="searchInput" placeholder="Pesquisar por banca, ano, enunciado ou ID..." onkeyup="if(event.key==='Enter') loadQuestions(1)">
    <button class="btn btn-outline" onclick="loadQuestions(1)">🔍 Buscar</button>

    <div class="subfilter-group" id="medqSubfilters">
      <button class="subfilter-btn active" id="sub-all" onclick="setMedqSubfilter('all')">Todas (367)</button>
      <button class="subfilter-btn" id="sub-inpainted" onclick="setMedqSubfilter('inpainted')">Higienizadas</button>
      <button class="subfilter-btn" id="sub-pending" onclick="setMedqSubfilter('pending')">Pendentes</button>
    </div>

    <span id="currentTabLabel" style="margin-left: auto; font-size: 13px; color: #94a3b8; font-weight: 500;">Exibindo: Higienização MedQ (Antes & Depois)</span>
  </section>

  <main id="mainContainer">
    <div style="text-align: center; padding: 40px; color: var(--text-muted);">Carregando galeria...</div>
  </main>

  <div class="pagination" id="paginationBar"></div>

  <script>
    let currentTab = 'medq_watermark';
    let currentMedqSubfilter = 'all';
    let currentPage = 1;
    let cardViewModes = {};

    function setTab(tab) {
      currentTab = tab;
      document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
      if (tab === 'all') document.getElementById('btn-tab-all').classList.add('active');
      if (tab === 'medq_watermark') document.getElementById('btn-tab-medq').classList.add('active');
      if (tab === 'options_images') document.getElementById('btn-tab-options').classList.add('active');
      if (tab === 'missing_gate6') document.getElementById('btn-tab-gate6').classList.add('active');

      document.getElementById('medqSubfilters').style.display = (tab === 'medq_watermark') ? 'flex' : 'none';

      const labels = {
        'all': 'Triagem Geral (Gate 3)',
        'medq_watermark': '🔬 Higienização de Marca MedQ Central (Antes & Depois)',
        'options_images': '👁️ Alternativas Visuais (Gate 5)',
        'missing_gate6': '🚨 Imagens Faltantes no Enunciado (Gate 6)'
      };
      document.getElementById('currentTabLabel').innerText = 'Exibindo: ' + (labels[tab] || tab);
      loadQuestions(1);
    }

    function setMedqSubfilter(sub) {
      currentMedqSubfilter = sub;
      document.querySelectorAll('.subfilter-btn').forEach(b => b.classList.remove('active'));
      document.getElementById('sub-' + sub).classList.add('active');
      loadQuestions(1);
    }

    async function fetchStats() {
      try {
        const res = await fetch('/api/stats');
        const data = await res.json();
        document.getElementById('statTotal').innerText = data.totalQuestionsWithImg.toLocaleString('pt-BR');
        document.getElementById('statApproved').innerText = data.approvedCount.toLocaleString('pt-BR');
        document.getElementById('statGate6Missing').innerText = data.gate6MissingTotal.toLocaleString('pt-BR');
        document.getElementById('statMedQTotal').innerText = data.medqTotal.toLocaleString('pt-BR');
        document.getElementById('statMedQResolved').innerText = data.medqResolvedCount.toLocaleString('pt-BR');
        document.getElementById('tabMedQBadge').innerText = data.medqPendingCount.toLocaleString('pt-BR');
      } catch (e) {
        console.error(e);
      }
    }

    async function loadQuestions(page = 1) {
      currentPage = page;
      const search = document.getElementById('searchInput').value;
      const container = document.getElementById('mainContainer');
      container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Buscando questões...</div>';

      try {
        const res = await fetch('/api/questions?page=' + page + '&limit=15&filter=' + currentTab + '&subfilter=' + currentMedqSubfilter + '&search=' + encodeURIComponent(search));
        const data = await res.json();
        renderQuestions(data.questions, currentTab);
        renderPagination(data.page, data.totalPages);
        fetchStats();
      } catch (e) {
        container.innerHTML = '<div style="color: var(--red); padding: 40px;">Erro ao carregar: ' + e.message + '</div>';
      }
    }

    function setCardViewMode(qid, mode) {
      cardViewModes[qid] = mode;
      const card = document.getElementById('card-' + qid);
      if (!card) return;
      const rightPane = card.querySelector('.card-right');
      const qData = card._qData;
      if (qData) {
        rightPane.innerHTML = renderVisualPane(qData, mode);
      }
    }

    function renderVisualPane(q, mode = 'side_by_side') {
      const isClean = q.is_inpainted;
      const origUrl = q.original_url || q.images[0];
      const cleanUrl = q.cleaned_url || q.images[0];
      const compUrl = q.comparison_url;

      let statusBadge = isClean
        ? '<div class="status-badge-clean">✨ HIGIENIZADA (Marca MedQ Removida)</div>'
        : '<div class="status-badge-pending">⚠️ PENDENTE DE HIGIENIZAÇÃO</div>';

      let viewModeButtons = \`
        <div class="view-mode-bar">
          <button class="view-btn \${mode === 'side_by_side' ? 'active' : ''}" onclick="setCardViewMode('\${q.id}', 'side_by_side')">👥 Antes vs Depois</button>
          <button class="view-btn \${mode === 'clean' ? 'active' : ''}" onclick="setCardViewMode('\${q.id}', 'clean')">✨ Apenas Limpa</button>
          <button class="view-btn \${mode === 'original' ? 'active' : ''}" onclick="setCardViewMode('\${q.id}', 'original')">⚠️ Original (Com Alvo)</button>
        </div>
      \`;

      let imageContent = '';
      if (mode === 'side_by_side') {
        imageContent = \`
          <div class="comparison-container">
            <img src="/api/proxy-image?url=\${encodeURIComponent(compUrl)}" onerror="this.src='/api/proxy-image?url=\${encodeURIComponent(cleanUrl)}'" alt="Comparação">
          </div>
        \`;
      } else if (mode === 'clean') {
        imageContent = \`
          <div class="comparison-container">
            <img src="/api/proxy-image?url=\${encodeURIComponent(cleanUrl)}" alt="Imagem Limpa">
          </div>
        \`;
      } else {
        imageContent = \`
          <div class="comparison-container" style="position: relative;">
            <img src="/api/proxy-image?url=\${encodeURIComponent(origUrl)}" alt="Original">
            <div class="target-overlay"></div>
          </div>
        \`;
      }

      let actionButtons = \`
        <div class="action-toolbar">
          <button class="btn btn-green" onclick="inpaintSingle('\${q.id}', '\${origUrl}')">⚡ Re-Higienizar Inpainting</button>
          <button class="btn btn-outline" onclick="approveSingle('\${q.id}')">✓ Manter Aprovada</button>
        </div>
      \`;

      return statusBadge + viewModeButtons + imageContent + actionButtons;
    }

    function renderQuestions(questions, tab) {
      const container = document.getElementById('mainContainer');
      if (!questions || questions.length === 0) {
        container.innerHTML = '<div style="text-align: center; padding: 40px; color: var(--text-muted);">Nenhum registro encontrado.</div>';
        return;
      }

      container.innerHTML = questions.map(q => {
        const optionsHtml = (q.options || []).map(opt => {
          const isCorrect = opt.letter === q.correct_answer;
          let optImgHtml = '';
          if (opt.text && opt.text.startsWith('http')) {
            optImgHtml = '<div style="margin-top: 6px;"><img src="/api/proxy-image?url=' + encodeURIComponent(opt.text) + '" style="max-height: 110px; border-radius: 4px;"></div>';
          }
          return '<div class="opt-item ' + (isCorrect ? 'is-correct' : '') + '">' +
                 '<span class="opt-letter">' + opt.letter + ')</span>' +
                 '<div style="flex: 1;">' + (opt.text && !opt.text.startsWith('http') ? opt.text : '(Imagem)') + optImgHtml + '</div>' +
                 (isCorrect ? '<span style="color: var(--green); font-weight: 700;">✓ Gabarito</span>' : '') +
                 '</div>';
        }).join('');

        const defaultMode = cardViewModes[q.id] || 'side_by_side';
        const rightHtml = (tab === 'medq_watermark')
          ? renderVisualPane(q, defaultMode)
          : '<div class="comparison-container"><img src="/api/proxy-image?url=' + encodeURIComponent(q.images[0] || '') + '"></div>';

        return \`
          <div class="question-card" id="card-\${q.id}">
            <div class="card-left">
              <div class="q-meta">
                <span class="q-badge">\${q.banca || 'BANCA'}</span>
                <span class="q-badge">\${q.year || 'ANO'}</span>
                <span style="color: var(--text-muted); font-size: 11px;">\${q.id}</span>
                \${q.medq_score ? '<span style="color: var(--amber); font-weight: 600; font-size: 11px;">Score MedQ: ' + q.medq_score + '%</span>' : ''}
              </div>
              <div class="q-statement">\${escapeHtml(q.statement)}</div>
              <div class="q-options">\${optionsHtml}</div>
            </div>
            <div class="card-right">\${rightHtml}</div>
          </div>
        \`;
      }).join('');

      // Store qData on cards for view mode switches
      questions.forEach(q => {
        const el = document.getElementById('card-' + q.id);
        if (el) el._qData = q;
      });
    }

    async function inpaintSingle(qid, origUrl) {
      try {
        const res = await fetch('/api/medq-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question_id: qid, action: 'inpaint', image_url: origUrl })
        });
        const data = await res.json();
        if (data.success) {
          loadQuestions(currentPage);
        } else {
          alert('Erro no inpainting: ' + data.error);
        }
      } catch (e) {
        alert('Erro ao enviar requisição: ' + e.message);
      }
    }

    async function approveSingle(qid) {
      try {
        await fetch('/api/medq-action', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question_id: qid, action: 'approve' })
        });
        loadQuestions(currentPage);
      } catch (e) {
        console.error(e);
      }
    }

    function renderPagination(page, totalPages) {
      const bar = document.getElementById('paginationBar');
      if (totalPages <= 1) { bar.innerHTML = ''; return; }

      let html = '<button class="btn btn-outline" ' + (page <= 1 ? 'disabled style="opacity:0.5;"' : '') + ' onclick="loadQuestions(' + (page - 1) + ')">← Anterior</button>';
      html += '<span style="font-size: 13px; color: var(--text-muted);">Página ' + page + ' de ' + totalPages + '</span>';
      html += '<button class="btn btn-outline" ' + (page >= totalPages ? 'disabled style="opacity:0.5;"' : '') + ' onclick="loadQuestions(' + (page + 1) + ')">Próxima →</button>';
      bar.innerHTML = html;
    }

    function escapeHtml(str) {
      if (!str) return '';
      return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
    }

    // Inicialização
    loadQuestions(1);
    fetchStats();
  </script>
</body>
</html>`;
}

server.listen(PORT, '0.0.0.0', () => {
  console.log(`================================================================================`);
  console.log(`🌐 HUB VISUAL ULTRA-RÁPIDO & ANTES/DEPOIS: http://localhost:${PORT}`);
  console.log(`================================================================================`);
});
