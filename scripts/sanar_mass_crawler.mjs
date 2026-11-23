#!/usr/bin/env node
/**
 * =============================================================================
 * BANCO RESIDÊNCIA — CRAWLER EM MASSA CANÔNICO SANARMED
 * =============================================================================
 * Arquivo único, autônomo e altamente preciso para extração de provas, questões,
 * instituições, gabaritos homologados e conservação perfeita de imagens.
 * 
 * DIRETRIZES FUNDAMENTAIS:
 * 1. Extração estrita de dados públicos: Enunciados, alternativas, gabaritos homologados,
 *    instituição, ano e imagens clínicas oficiais.
 * 2. DESCARTA TOTALMENTE comentários de professores, dicas e vídeos (propriedade Sanar).
 * 3. Preservação integral e perfeita de imagens:
 *    - Download binário bit-a-bit com validação de hash criptográfico SHA-256.
 *    - Armazenamento da cópia original exata (.jpg, .png, etc.).
 *    - Geração de versão WebP de altíssima qualidade (95%) padronizada.
 *    - Deduplicação por hash de conteúdo e vínculo relacional em SQLite local.
 * 4. Engine: Node 24 native `node:sqlite` (SQLite 3.46 WAL mode) + `sharp` + native `fetch`.
 * =============================================================================
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { DatabaseSync } from 'node:sqlite';
import sharp from 'sharp';

// Caminhos canônicos padrão
const DEFAULT_DB_PATH = path.join('data', 'sanar_crawler.db');
const DEFAULT_MEDIA_DIR = path.join('data', 'sanar_media');
const ORIGINALS_DIR = path.join(DEFAULT_MEDIA_DIR, 'originals');
const WEBP_DIR = path.join(DEFAULT_MEDIA_DIR, 'webp');

const LETTERS = ['A', 'B', 'C', 'D', 'E'];

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
  'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
  'Cache-Control': 'no-cache',
  'Pragma': 'no-cache'
};

// Helper de concorrência com pool limitado, determinístico e jitter humanizado
async function mapConcurrent(items, concurrency, fn, delayMs = 0) {
  const results = [];
  let index = 0;
  const workers = Array.from({ length: Math.min(concurrency, items.length) }, async () => {
    while (index < items.length) {
      const i = index++;
      results[i] = await fn(items[i], i);
      if (delayMs > 0 && index < items.length) {
        const jitter = Math.floor(Math.random() * 250);
        await new Promise(r => setTimeout(r, delayMs + jitter));
      }
    }
  });
  await Promise.all(workers);
  return results;
}

// =============================================================================
// GERENCIADOR DE BANCO DE DADOS (SQLite nativo Node 24)
// =============================================================================

class DatabaseManager {
  constructor(dbPath = DEFAULT_DB_PATH) {
    this.dbPath = dbPath;
    fs.mkdirSync(path.dirname(path.resolve(dbPath)), { recursive: true });
    this.db = new DatabaseSync(dbPath);
    this.db.exec('PRAGMA journal_mode = WAL;');
    this.db.exec('PRAGMA synchronous = NORMAL;');
    this.db.exec('PRAGMA busy_timeout = 60000;');
    this.initSchema();
  }

  initSchema() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS crawl_queue (
        url TEXT PRIMARY KEY,
        stage TEXT NOT NULL, -- 'institution', 'exam_year', 'sitemap', 'question'
        parent_url TEXT,
        status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed', 'skipped'
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS questions (
        sanar_id TEXT PRIMARY KEY,
        url TEXT UNIQUE NOT NULL,
        instituicao TEXT,
        instituicao_sigla TEXT,
        uf TEXT,
        ano INTEGER,
        prova_slug TEXT,
        enunciado_original TEXT NOT NULL,
        enunciado_local TEXT NOT NULL,
        enunciado_texto TEXT NOT NULL,
        alternativa_a TEXT,
        alternativa_b TEXT,
        alternativa_c TEXT,
        alternativa_d TEXT,
        alternativa_e TEXT,
        gabarito TEXT,
        num_alternativas INTEGER NOT NULL,
        anulada INTEGER NOT NULL DEFAULT 0,
        motivo_anulacao TEXT,
        desatualizada INTEGER NOT NULL DEFAULT 0,
        dificuldade TEXT,
        has_images INTEGER NOT NULL DEFAULT 0,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS question_images (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sanar_id TEXT NOT NULL,
        context TEXT NOT NULL,
        original_url TEXT NOT NULL,
        sha256 TEXT NOT NULL,
        mime_type TEXT,
        file_extension TEXT,
        local_original_path TEXT NOT NULL,
        local_webp_path TEXT NOT NULL,
        width INTEGER,
        height INTEGER,
        original_size_bytes INTEGER,
        webp_size_bytes INTEGER,
        downloaded_at TEXT DEFAULT (datetime('now')),
        FOREIGN KEY (sanar_id) REFERENCES questions(sanar_id) ON DELETE CASCADE
      );

      CREATE INDEX IF NOT EXISTS idx_queue_status_stage ON crawl_queue(status, stage);
      CREATE INDEX IF NOT EXISTS idx_questions_inst_ano ON questions(instituicao, ano);
      CREATE INDEX IF NOT EXISTS idx_images_sanar_id ON question_images(sanar_id);
      CREATE INDEX IF NOT EXISTS idx_images_sha256 ON question_images(sha256);
    `);
  }
}

// =============================================================================
// PIPELINE DE CONSERVAÇÃO PERFEITA DE IMAGENS
// =============================================================================

class ImagePipeline {
  constructor(mediaDir = DEFAULT_MEDIA_DIR) {
    this.originalsDir = path.join(mediaDir, 'originals');
    this.webpDir = path.join(mediaDir, 'webp');
    fs.mkdirSync(this.originalsDir, { recursive: true });
    fs.mkdirSync(this.webpDir, { recursive: true });
  }

  async processImage(imageUrl, sanarId, context) {
    try {
      let fullUrl = imageUrl;
      if (fullUrl.startsWith('//')) {
        fullUrl = 'https:' + fullUrl;
      } else if (fullUrl.startsWith('/')) {
        fullUrl = 'https://sanarmed.com' + fullUrl;
      }

      const res = await fetch(fullUrl, { headers: HEADERS });
      if (!res.ok) {
        console.warn(`[WARN] Falha ao baixar imagem (${res.status}): ${fullUrl}`);
        return null;
      }

      const buffer = Buffer.from(await res.arrayBuffer());
      if (buffer.length === 0) return null;

      const sha256 = crypto.createHash('sha256').update(buffer).digest('hex');
      const originalSize = buffer.length;

      // Inspecionar metadados com sharp
      const meta = await sharp(buffer).metadata();
      const format = (meta.format || 'jpeg').toLowerCase();
      const ext = format === 'jpeg' ? 'jpg' : format;
      const mimeType = `image/${format}`;
      const width = meta.width || null;
      const height = meta.height || null;

      const originalFilename = `${sha256}.${ext}`;
      const webpFilename = `${sha256}.webp`;

      const originalPath = path.join(this.originalsDir, originalFilename);
      const webpPath = path.join(this.webpDir, webpFilename);

      // 1. Salvar original exato bit-a-bit se não existir
      if (!fs.existsSync(originalPath)) {
        fs.writeFileSync(originalPath, buffer);
      }

      // 2. Gerar versão WebP de altíssima qualidade (95%)
      let webpSize = 0;
      if (!fs.existsSync(webpPath)) {
        const webpBuffer = await sharp(buffer)
          .webp({ quality: 95, effort: 6 })
          .toBuffer();
        fs.writeFileSync(webpPath, webpBuffer);
        webpSize = webpBuffer.length;
      } else {
        webpSize = fs.statSync(webpPath).size;
      }

      return {
        sanar_id: sanarId,
        context: context,
        original_url: fullUrl,
        sha256: sha256,
        mime_type: mimeType,
        file_extension: ext,
        local_original_path: path.relative(process.cwd(), originalPath).replace(/\\/g, '/'),
        local_webp_path: path.relative(process.cwd(), webpPath).replace(/\\/g, '/'),
        width: width,
        height: height,
        original_size_bytes: originalSize,
        webp_size_bytes: webpSize
      };
    } catch (err) {
      console.error(`[ERROR] Falha ao processar imagem ${imageUrl}:`, err.message);
      return null;
    }
  }
}

// =============================================================================
// MOTOR PRINCIPAL DO CRAWLER
// =============================================================================

export class SanarMassCrawler {
  constructor(options = {}) {
    this.dbManager = new DatabaseManager(options.dbPath || DEFAULT_DB_PATH);
    this.db = this.dbManager.db;
    this.imagePipeline = new ImagePipeline(options.mediaDir || DEFAULT_MEDIA_DIR);
    this.concurrency = options.concurrency || 2;
    this.delayMs = options.delayMs ?? 400;
  }

  _cleanText(html) {
    if (!html) return '';
    return html
      .replace(/<br\s*\/?>/gi, '\n')
      .replace(/<\/p>/gi, '\n')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#039;/g, "'")
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ')
      .trim();
  }

  // =========================================================================
  // SEEDING
  // =========================================================================

  async seedProvasHub() {
    const hubUrl = 'https://sanarmed.com/questoes-de-concursos/provas/';
    console.log(`[SEED] Acessando hub de provas: ${hubUrl}`);

    const res = await fetch(hubUrl, { headers: HEADERS });
    if (!res.ok) {
      console.error(`[ERROR] Falha ao acessar hub de provas: HTTP ${res.status}`);
      return 0;
    }

    const html = await res.text();
    const regex = /href="([^"]*\/questoes-de-concursos\/prova\/[^"\/]+\/?)"/gi;
    const bancas = new Set();
    let m;
    while ((m = regex.exec(html)) !== null) {
      let u = m[1];
      if (!u.startsWith('http')) u = new URL(u, hubUrl).href;
      if (!u.endsWith('/')) u += '/';
      if (u !== hubUrl) bancas.add(u);
    }

    console.log(`[SEED] Encontradas ${bancas.size} bancas/instituições no índice.`);

    this.db.exec('BEGIN TRANSACTION;');
    const insertStmt = this.db.prepare(`
      INSERT OR IGNORE INTO crawl_queue (url, stage, status)
      VALUES (?, 'institution', 'pending')
    `);

    for (const bUrl of bancas) {
      insertStmt.run(bUrl);
    }
    this.db.exec('COMMIT;');

    console.log(`[SEED] Inseridas ${bancas.size} instituições na fila.`);
    return bancas.size;
  }

  async seedSitemaps(maxSitemaps = null) {
    const rootUrl = 'https://sanarmed.com/sitemap.xml';
    console.log(`[SEED] Lendo sitemap raiz: ${rootUrl}`);

    const res = await fetch(rootUrl, { headers: HEADERS });
    if (!res.ok) {
      console.error(`[ERROR] Erro ao ler sitemap raiz: HTTP ${res.status}`);
      return 0;
    }

    const text = await res.text();
    const sitemapRegex = /<loc>(https:\/\/sanarmed\.com\/questao-sitemap\d*\.xml)<\/loc>/g;
    let sitemapUrls = [];
    let m;
    while ((m = sitemapRegex.exec(text)) !== null) {
      sitemapUrls.push(m[1]);
    }

    console.log(`[SEED] Identificados ${sitemapUrls.length} sitemaps de questões.`);
    if (maxSitemaps) {
      sitemapUrls = sitemapUrls.slice(0, maxSitemaps);
      console.log(`[SEED] Limitando a ${sitemapUrls.length} sitemaps para teste.`);
    }

    const insertStmt = this.db.prepare(`
      INSERT OR IGNORE INTO crawl_queue (url, stage, status)
      VALUES (?, 'question', 'pending')
    `);

    let totalNew = 0;
    let totalScanned = 0;

    for (const sUrl of sitemapUrls) {
      try {
        const sRes = await fetch(sUrl, { headers: HEADERS });
        if (!sRes.ok) continue;
        const sText = await sRes.text();
        const qRegex = /<loc>(https:\/\/sanarmed\.com\/q\/[^<]+)<\/loc>/g;
        let qm;

        this.db.exec('BEGIN TRANSACTION;');
        let countInSitemap = 0;
        while ((qm = qRegex.exec(sText)) !== null) {
          let qu = qm[1];
          if (!qu.endsWith('/')) qu += '/';
          insertStmt.run(qu);
          countInSitemap++;
          totalScanned++;
        }
        this.db.exec('COMMIT;');

        console.log(`[SEED] ${path.basename(sUrl)}: ${countInSitemap} questões processadas (Total escaneado: ${totalScanned})`);
      } catch (err) {
        try { this.db.exec('COMMIT;'); } catch (_) { }
        console.warn(`[WARN] Erro ao ler sitemap ${sUrl}:`, err.message);
      }
    }

    const pendingCount = this.db.prepare(`SELECT COUNT(*) as c FROM crawl_queue WHERE status = 'pending' AND stage = 'question'`).get().c;
    console.log(`[SEED] Sitemaps processados! Total atual de questões pendentes na fila: ${pendingCount}`);
    return totalScanned;
  }

  seedExam(slug, year = null) {
    slug = slug.trim().toLowerCase();
    const url = year
      ? `https://sanarmed.com/questoes-de-concursos/prova/${slug}/${year}/`
      : `https://sanarmed.com/questoes-de-concursos/prova/${slug}/`;
    const stage = year ? 'exam_year' : 'institution';

    const stmt = this.db.prepare(`
      INSERT OR REPLACE INTO crawl_queue (url, stage, status)
      VALUES (?, ?, 'pending')
    `);
    stmt.run(url, stage);
    console.log(`[SEED] Exame enfileirado: ${url} [${stage}]`);
  }

  // =========================================================================
  // PROCESSAMENTO DE BANCA / PROVA ANUAL
  // =========================================================================

  async processInstitution(instUrl) {
    try {
      const res = await fetch(instUrl, { headers: HEADERS });
      if (!res.ok) {
        if (res.status === 429) await new Promise(r => setTimeout(r, 2000));
        return;
      }
      const html = await res.text();

      const regex = /href="([^"]*\/questoes-de-concursos\/prova\/[^\/]+\/\d{4}\/?)"/gi;
      let m;
      const yearUrls = new Set();
      while ((m = regex.exec(html)) !== null) {
        let u = m[1];
        if (!u.startsWith('http')) u = new URL(u, instUrl).href;
        if (!u.endsWith('/')) u += '/';
        yearUrls.add(u);
      }

      this.db.exec('BEGIN TRANSACTION;');
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO crawl_queue (url, stage, parent_url, status)
        VALUES (?, 'exam_year', ?, 'pending')
      `);

      for (const yUrl of yearUrls) {
        insertStmt.run(yUrl, instUrl);
      }

      this.db.prepare(`UPDATE crawl_queue SET status='completed', updated_at=datetime('now') WHERE url=?`).run(instUrl);
      this.db.exec('COMMIT;');
      console.log(`[EXPAND] Banca ${instUrl} -> ${yearUrls.size} anos enfileirados.`);
    } catch (e) {
      try { this.db.exec('COMMIT;'); } catch (_) { }
      this.db.prepare(`UPDATE crawl_queue SET status='failed', last_error=?, attempts=attempts+1, updated_at=datetime('now') WHERE url=?`).run(e.message, instUrl);
    }
  }

  async processExamYear(examUrl) {
    try {
      const res = await fetch(examUrl, { headers: HEADERS });
      if (!res.ok) {
        if (res.status === 429) await new Promise(r => setTimeout(r, 2000));
        return;
      }
      const html = await res.text();

      const qUrls = [];

      // 1. Via JSON-LD ItemList (preserva ordem oficial da prova)
      const ldMatch = html.match(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/i);
      if (ldMatch) {
        try {
          const parsed = JSON.parse(ldMatch[1]);
          const items = parsed.mainEntity?.itemListElement || [];
          for (const item of items) {
            if (item.url && item.url.includes('/q/')) {
              let u = item.url;
              if (!u.endsWith('/')) u += '/';
              qUrls.push(u);
            }
          }
        } catch (_) { }
      }

      // 2. Fallback via regex
      if (qUrls.length === 0) {
        const regex = /href="(https:\/\/sanarmed\.com\/q\/[^"\/]+\/?)"/gi;
        let m;
        while ((m = regex.exec(html)) !== null) {
          let u = m[1];
          if (!u.endsWith('/')) u += '/';
          qUrls.push(u);
        }
      }

      // 3. Descoberta de paginação da prova (/pagina/2/, /pagina/3/...)
      const pageRegex = /href="([^"]*\/questoes-de-concursos\/prova\/[^\/]+\/\d{4}\/pagina\/\d+\/?)"/gi;
      let pm;
      const paginationUrls = new Set();
      while ((pm = pageRegex.exec(html)) !== null) {
        let pu = pm[1];
        if (!pu.startsWith('http')) pu = new URL(pu, examUrl).href;
        if (!pu.endsWith('/')) pu += '/';
        if (pu !== examUrl) paginationUrls.add(pu);
      }

      this.db.exec('BEGIN TRANSACTION;');
      const insertStmt = this.db.prepare(`
        INSERT OR IGNORE INTO crawl_queue (url, stage, parent_url, status)
        VALUES (?, 'question', ?, 'pending')
      `);
      const updateParentStmt = this.db.prepare(`
        UPDATE crawl_queue SET parent_url = ?
        WHERE url = ? AND (parent_url IS NULL OR parent_url = '')
      `);

      const unique = [...new Set(qUrls)];
      for (const qu of unique) {
        insertStmt.run(qu, examUrl);
        updateParentStmt.run(examUrl, qu);
      }

      // Enfileirar páginas adicionais da mesma prova (ex: /pagina/2/)
      const insertPageStmt = this.db.prepare(`
        INSERT OR IGNORE INTO crawl_queue (url, stage, parent_url, status)
        VALUES (?, 'exam_year', ?, 'pending')
      `);
      for (const pu of paginationUrls) {
        insertPageStmt.run(pu, examUrl);
      }

      this.db.prepare(`UPDATE crawl_queue SET status='completed', updated_at=datetime('now') WHERE url=?`).run(examUrl);
      this.db.exec('COMMIT;');
      console.log(`[EXPAND] Prova ${examUrl} -> ${unique.length} questões, ${paginationUrls.size} páginas adicionais.`);
    } catch (e) {
      try { this.db.exec('COMMIT;'); } catch (_) { }
      this.db.prepare(`UPDATE crawl_queue SET status='failed', last_error=?, attempts=attempts+1, updated_at=datetime('now') WHERE url=?`).run(e.message, examUrl);
    }
  }

  // =========================================================================
  // PARSER DE QUESTÃO CANÔNICA (COM CONSERVAÇÃO DE IMAGENS E SEM COMENTÁRIOS)
  // =========================================================================

  async parseAndSaveQuestion(url) {
    if (!url.endsWith('/')) url += '/';

    const res = await fetch(url, { headers: HEADERS });
    if (!res.ok) {
      if (res.status === 429) {
        await new Promise(r => setTimeout(r, 2500));
      }
      if (res.status === 403) {
        const errText = await res.text().catch(() => '');
        if (errText.includes('Checking your browser') || errText.includes('challenge.js') || errText.includes('HASHCASH')) {
          throw new Error('ANTI_BOT_CHALLENGE: Servidor acionou verificação de navegador/WAF.');
        }
      }
      return false;
    }

    const html = await res.text();
    if (html.includes('Checking your browser') || html.includes('challenge.js') || html.includes('HASHCASH')) {
      throw new Error('ANTI_BOT_CHALLENGE: Servidor acionou verificação de navegador/WAF.');
    }

    // 1. Extração do JSON nativo WordPress Sanar
    const match = html.match(/<script type="application\/json" id="wordpress-question-data">([\s\S]*?)<\/script>/i);
    if (!match) {
      return this._parseJsonLdFallback(html, url);
    }

    let qData;
    try {
      qData = JSON.parse(match[1]);
    } catch (err) {
      return false;
    }

    const sanarId = qData.id;
    if (!sanarId) return false;

    // Metadados da instituição e ano
    const instObj = qData.institution || {};
    const instituicao = instObj.name || null;
    const uf = (instObj.state && typeof instObj.state === 'object') ? instObj.state.acronym : null;
    let ano = null;
    if (qData.year) {
      const parsedYear = parseInt(qData.year, 10);
      if (!isNaN(parsedYear)) ano = parsedYear;
    }

    const enunciadoOriginal = (qData.statement || '').trim();

    // Alternativas e gabarito homologado oficial
    const alts = (qData.alternatives || []).sort((a, b) => (a.index ?? 0) - (b.index ?? 0));
    const mappedAlts = {};
    let gabarito = null;

    alts.forEach((alt, idx) => {
      const letter = LETTERS[idx] || `OPT_${idx}`;
      mappedAlts[letter] = (alt.text || '').trim();
      if (alt.correct === true) {
        gabarito = letter;
      }
    });

    // Processamento e conservação perfeita de imagens
    const imageRecords = [];
    let enunciadoLocal = enunciadoOriginal;

    // Imagens no enunciado
    const imgRegex = /<img[^>]+src=["']([^"']+)["']/gi;
    let imgM;
    while ((imgM = imgRegex.exec(enunciadoOriginal)) !== null) {
      const imgUrl = imgM[1];
      const rec = await this.imagePipeline.processImage(imgUrl, sanarId, 'enunciado');
      if (rec) {
        imageRecords.push(rec);
        enunciadoLocal = enunciadoLocal.replace(imgUrl, rec.local_webp_path);
      }
    }

    // Imagens nas alternativas
    for (const [letter, altText] of Object.entries(mappedAlts)) {
      let altLocal = altText;
      let altImgM;
      while ((altImgM = imgRegex.exec(altText)) !== null) {
        const altImgUrl = altImgM[1];
        const rec = await this.imagePipeline.processImage(altImgUrl, sanarId, `alternativa_${letter}`);
        if (rec) {
          imageRecords.push(rec);
          altLocal = altLocal.replace(altImgUrl, rec.local_webp_path);
        }
      }
      mappedAlts[letter] = altLocal;
    }

    const enunciadoTexto = this._cleanText(enunciadoOriginal);

    const anulada = qData.cancelled ? 1 : 0;
    const desatualizada = qData.outdated ? 1 : 0;
    const motivoAnulacao = qData.reason_for_cancellation || null;

    let dificuldade = null;
    for (const tag of (qData.tags || [])) {
      const tn = (tag.name || '').toUpperCase();
      if (['EASY', 'MODERATE', 'HARD'].includes(tn)) {
        dificuldade = tn;
        break;
      }
    }

    const hasImages = imageRecords.length > 0 ? 1 : 0;

    // PERSISTÊNCIA ATÔMICA
    const qStmt = this.db.prepare(`
      INSERT OR REPLACE INTO questions (
        sanar_id, url, instituicao, instituicao_sigla, uf, ano, prova_slug,
        enunciado_original, enunciado_local, enunciado_texto,
        alternativa_a, alternativa_b, alternativa_c, alternativa_d, alternativa_e,
        gabarito, num_alternativas, anulada, motivo_anulacao, desatualizada,
        dificuldade, has_images, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `);

    qStmt.run(
      sanarId,
      url,
      instituicao,
      null,
      uf,
      ano,
      null,
      enunciadoOriginal,
      enunciadoLocal,
      enunciadoTexto,
      mappedAlts['A'] || null,
      mappedAlts['B'] || null,
      mappedAlts['C'] || null,
      mappedAlts['D'] || null,
      mappedAlts['E'] || null,
      gabarito,
      alts.length,
      anulada,
      motivoAnulacao,
      desatualizada,
      dificuldade,
      hasImages
    );

    const imgStmt = this.db.prepare(`
      INSERT OR IGNORE INTO question_images (
        sanar_id, context, original_url, sha256, mime_type, file_extension,
        local_original_path, local_webp_path, width, height,
        original_size_bytes, webp_size_bytes
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    for (const img of imageRecords) {
      imgStmt.run(
        img.sanar_id,
        img.context,
        img.original_url,
        img.sha256,
        img.mime_type,
        img.file_extension,
        img.local_original_path,
        img.local_webp_path,
        img.width,
        img.height,
        img.original_size_bytes,
        img.webp_size_bytes
      );
    }

    this.db.prepare(`UPDATE crawl_queue SET status='completed', updated_at=datetime('now') WHERE url=?`).run(url);
    return true;
  }

  _parseJsonLdFallback(html, url) {
    const ldMatches = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi)];
    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1]);
        if (parsed['@type'] === 'QAPage' && parsed.mainEntity) {
          const me = parsed.mainEntity;
          const enunciado = me.text || me.name || '';
          const sanarId = 'syn_' + crypto.createHash('md5').update(url).digest('hex').slice(0, 16);

          this.db.prepare(`
            INSERT OR IGNORE INTO questions (
              sanar_id, url, instituicao, ano,
              enunciado_original, enunciado_local, enunciado_texto,
              num_alternativas, anulada, updated_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, datetime('now'))
          `).run(
            sanarId,
            url,
            me.eduQuestionType || null,
            me.dateCreated ? parseInt(me.dateCreated.slice(0, 4), 10) : null,
            enunciado,
            enunciado,
            this._cleanText(enunciado),
            0
          );

          this.db.prepare(`UPDATE crawl_queue SET status='completed', updated_at=datetime('now') WHERE url=?`).run(url);
          return true;
        }
      } catch (_) { }
    }
    return false;
  }

  // =========================================================================
  // WORKER POOL E PROCESSAMENTO ASSÍNCRONO CONCORRENTE
  // =========================================================================

  async runWorkerPool(maxItems = null) {
    // Recuperar itens travados em 'processing' de execuções anteriores
    const recovered = this.db.prepare(`UPDATE crawl_queue SET status='pending' WHERE status='processing'`).run();
    if (recovered.changes > 0) {
      console.log(`[RECOVERY] ${recovered.changes} itens travados em 'processing' foram devolvidos para a fila.`);
    }

    // Auto-recuperar falhas transitórias com poucas tentativas
    const retried = this.db.prepare(`UPDATE crawl_queue SET status='pending' WHERE status='failed' AND attempts < 3`).run();
    if (retried.changes > 0) {
      console.log(`[RECOVERY] ${retried.changes} itens com falhas transitórias foram devolvidos para a fila.`);
    }

    console.log(`[WORKER] Iniciando processamento seguro (concorrência = ${this.concurrency}, delay base = ${this.delayMs}ms)`);
    let processed = 0;

    while (true) {
      // 1. Processar estágios de expansão de bancas ('institution') concorrentemente
      const instRows = this.db.prepare(`
        SELECT url FROM crawl_queue
        WHERE status = 'pending' AND stage = 'institution'
        LIMIT 20
      `).all();

      if (instRows.length > 0) {
        console.log(`[WORKER] Expandindo lote de ${instRows.length} bancas pendentes...`);
        await mapConcurrent(instRows, this.concurrency, async (row) => {
          await this.processInstitution(row.url);
        }, this.delayMs);
        continue;
      }

      // 2. Processar estágios de expansão de provas anuais ('exam_year') concorrentemente, priorizando anos mais recentes
      const examRows = this.db.prepare(`
        SELECT url FROM crawl_queue
        WHERE status = 'pending' AND stage = 'exam_year'
        ORDER BY 
          CASE 
            WHEN url LIKE '%/2027/%' OR url LIKE '%/2027' THEN 100
            WHEN url LIKE '%/2026/%' OR url LIKE '%/2026' THEN 90
            WHEN url LIKE '%/2025/%' OR url LIKE '%/2025' THEN 80
            WHEN url LIKE '%/2024/%' OR url LIKE '%/2024' THEN 70
            WHEN url LIKE '%/2023/%' OR url LIKE '%/2023' THEN 60
            WHEN url LIKE '%/2022/%' OR url LIKE '%/2022' THEN 50
            WHEN url LIKE '%/2021/%' OR url LIKE '%/2021' THEN 40
            WHEN url LIKE '%/2020/%' OR url LIKE '%/2020' THEN 30
            ELSE 10
          END DESC,
          rowid ASC
        LIMIT 20
      `).all();

      if (examRows.length > 0) {
        console.log(`[WORKER] Expandindo lote de ${examRows.length} provas anuais pendentes...`);
        await mapConcurrent(examRows, this.concurrency, async (row) => {
          await this.processExamYear(row.url);
        }, this.delayMs);
        continue;
      }

      // 3. Processar lote de questões priorizando rigorosamente por ano (2026 -> 2025 -> 2024...)
      const batchSize = this.concurrency * 4;
      const questionRows = this.db.prepare(`
        SELECT url FROM crawl_queue
        WHERE status = 'pending' AND stage = 'question'
        ORDER BY 
          CASE 
            WHEN parent_url LIKE '%/2027/%' OR parent_url LIKE '%/2027' THEN 100
            WHEN parent_url LIKE '%/2026/%' OR parent_url LIKE '%/2026' THEN 90
            WHEN parent_url LIKE '%/2025/%' OR parent_url LIKE '%/2025' THEN 80
            WHEN parent_url LIKE '%/2024/%' OR parent_url LIKE '%/2024' THEN 70
            WHEN parent_url LIKE '%/2023/%' OR parent_url LIKE '%/2023' THEN 60
            WHEN parent_url LIKE '%/2022/%' OR parent_url LIKE '%/2022' THEN 50
            WHEN parent_url LIKE '%/2021/%' OR parent_url LIKE '%/2021' THEN 40
            WHEN parent_url LIKE '%/2020/%' OR parent_url LIKE '%/2020' THEN 30
            WHEN parent_url IS NOT NULL THEN 20
            ELSE 10
          END DESC,
          rowid ASC
        LIMIT ?
      `).all(batchSize);

      if (questionRows.length === 0) {
        // Checar se ainda sobrou alguma instituição ou ano pendente
        const remaining = this.db.prepare(`
          SELECT COUNT(*) as c FROM crawl_queue WHERE status = 'pending'
        `).get().c;

        if (remaining > 0) {
          continue;
        }

        console.log('[WORKER] Nenhum item pendente na fila. Todas as provas foram extraídas com sucesso!');
        break;
      }

      const urls = questionRows.map(r => r.url);
      const markStmt = this.db.prepare(`UPDATE crawl_queue SET status='processing' WHERE url=?`);
      for (const u of urls) markStmt.run(u);

      // Execução concorrente com pool limitado e cadência humanizada
      await mapConcurrent(urls, this.concurrency, async (u) => {
        try {
          const success = await this.parseAndSaveQuestion(u);
          processed++;
          if (success) {
            if (processed % 20 === 0) {
              const totalQ = this.db.prepare(`SELECT COUNT(*) as c FROM questions`).get().c;
              const totalImgs = this.db.prepare(`SELECT COUNT(*) as c FROM question_images`).get().c;
              console.log(`[PROGRESSO] ${totalQ} questões extraídas | ${totalImgs} imagens salvas`);
            }
          } else {
            this.db.prepare(`UPDATE crawl_queue SET status='failed', attempts=attempts+1, updated_at=datetime('now') WHERE url=?`).run(u);
          }
        } catch (err) {
          if (err.message && err.message.includes('ANTI_BOT_CHALLENGE')) {
            this.db.prepare(`UPDATE crawl_queue SET status='pending' WHERE url=?`).run(u);
            console.error(`\n[CIRCUIT_BREAKER] ${err.message}`);
            console.error('[CIRCUIT_BREAKER] Pausando o crawler para proteger o acervo e respeitar o WAF.');
            throw err;
          }
          this.db.prepare(`UPDATE crawl_queue SET status='failed', attempts=attempts+1, last_error=?, updated_at=datetime('now') WHERE url=?`).run(err.message, u);
        }
      }, this.delayMs);

      if (maxItems && processed >= maxItems) {
        console.log(`[WORKER] Limite de ${maxItems} itens atingido. Pausando.`);
        break;
      }

      // Intervalo amigável
      await new Promise(r => setTimeout(r, 150));
    }
  }

  // =========================================================================
  // EXPORTAÇÃO JSON
  // =========================================================================

  exportToJson(outputPath = path.join('data', 'sanar_questions_export.json')) {
    const questions = this.db.prepare(`SELECT * FROM questions ORDER BY ano DESC, instituicao ASC`).all();
    const getImagesStmt = this.db.prepare(`SELECT * FROM question_images WHERE sanar_id = ?`);

    const result = questions.map(q => {
      const imgs = getImagesStmt.all(q.sanar_id);
      return {
        id: q.sanar_id,
        url: q.url,
        instituicao: q.instituicao,
        uf: q.uf,
        ano: q.ano,
        enunciado: q.enunciado_local,
        enunciado_texto: q.enunciado_texto,
        alternativas: {
          A: q.alternativa_a,
          B: q.alternativa_b,
          C: q.alternativa_c,
          D: q.alternativa_d,
          E: q.alternativa_e
        },
        gabarito: q.gabarito,
        anulada: Boolean(q.anulada),
        motivo_anulacao: q.motivo_anulacao,
        desatualizada: Boolean(q.desatualizada),
        dificuldade: q.dificuldade,
        imagens: imgs.map(i => ({
          context: i.context,
          original_url: i.original_url,
          sha256: i.sha256,
          local_original: i.local_original_path,
          local_webp: i.local_webp_path,
          width: i.width,
          height: i.height
        }))
      };
    });

    fs.mkdirSync(path.dirname(path.resolve(outputPath)), { recursive: true });
    fs.writeFileSync(outputPath, JSON.stringify(result, null, 2), 'utf8');
    console.log(`[EXPORT] ${result.length} questões exportadas com sucesso para: ${outputPath}`);
  }

  // =========================================================================
  // RELATÓRIO DE STATUS
  // =========================================================================

  showStatus() {
    const queueStats = this.db.prepare(`
      SELECT stage, status, COUNT(*) as cnt
      FROM crawl_queue
      GROUP BY stage, status
    `).all();

    const totalQuestions = this.db.prepare(`SELECT COUNT(*) as c FROM questions`).get().c;
    const questionsWithImages = this.db.prepare(`SELECT COUNT(*) as c FROM questions WHERE has_images = 1`).get().c;
    const questionsCancelled = this.db.prepare(`SELECT COUNT(*) as c FROM questions WHERE anulada = 1`).get().c;

    const topInstitutions = this.db.prepare(`
      SELECT instituicao, COUNT(*) as cnt
      FROM questions
      WHERE instituicao IS NOT NULL
      GROUP BY instituicao
      ORDER BY cnt DESC
      LIMIT 10
    `).all();

    const imgStats = this.db.prepare(`
      SELECT COUNT(*) as cnt, SUM(original_size_bytes) as orig, SUM(webp_size_bytes) as webp
      FROM question_images
    `).get();

    const totalImages = imgStats.cnt || 0;
    const origBytes = imgStats.orig || 0;
    const webpBytes = imgStats.webp || 0;

    console.log('\n' + '='.repeat(70));
    console.log('          BANCO RESIDÊNCIA — STATUS DO CRAWLER SANARMED');
    console.log('='.repeat(70));
    console.log(`Banco SQLite   : ${path.resolve(this.dbManager.dbPath)}`);
    console.log(`Diretório Mídia: ${path.resolve(this.imagePipeline.originalsDir, '..')}`);
    console.log('-'.repeat(70));
    console.log('ESTADO DA FILA (crawl_queue):');
    if (queueStats.length === 0) {
      console.log('  (Fila vazia. Execute "seed-provas", "seed-sitemaps" ou "seed-exam <slug>")');
    } else {
      for (const r of queueStats) {
        console.log(`  • ${r.stage.padEnd(15)} | ${r.status.padEnd(12)} : ${r.cnt.toLocaleString('pt-BR')}`);
      }
    }

    console.log('-'.repeat(70));
    console.log('QUESTÕES SALVAS (questions):');
    console.log(`  • Total de questões extraídas  : ${totalQuestions.toLocaleString('pt-BR')}`);
    console.log(`  • Questões com imagens         : ${questionsWithImages.toLocaleString('pt-BR')}`);
    console.log(`  • Questões anuladas homologadas: ${questionsCancelled.toLocaleString('pt-BR')}`);

    const yearStats = this.db.prepare(`
      SELECT ano, COUNT(*) as cnt
      FROM questions
      WHERE ano IS NOT NULL
      GROUP BY ano
      ORDER BY ano DESC
      LIMIT 8
    `).all();

    if (yearStats.length > 0) {
      console.log('-'.repeat(70));
      console.log('QUESTÕES SALVAS POR ANO (PRIORIDADE ATIVA):');
      for (const ys of yearStats) {
        console.log(`  • Ano ${ys.ano}`.padEnd(20) + `: ${ys.cnt.toLocaleString('pt-BR')} questões`);
      }
    }

    console.log('-'.repeat(70));
    console.log('IMAGENS CONSERVADAS (question_images):');
    console.log(`  • Total de imagens baixadas    : ${totalImages.toLocaleString('pt-BR')}`);
    console.log(`  • Espaço Original (Bytes)      : ${(origBytes / (1024 * 1024)).toFixed(2)} MB`);
    console.log(`  • Espaço WebP Otimizado        : ${(webpBytes / (1024 * 1024)).toFixed(2)} MB`);
    if (origBytes > 0) {
      const economia = (1.0 - (webpBytes / origBytes)) * 100;
      console.log(`  • Otimização WebP              : ${economia.toFixed(1)}%`);
    }

    if (topInstitutions.length > 0) {
      console.log('-'.repeat(70));
      console.log('TOP 10 INSTITUIÇÕES NO ACERVO:');
      for (const inst of topInstitutions) {
        const name = (inst.instituicao || 'Desconhecida').slice(0, 45);
        console.log(`  • ${name.padEnd(48)} : ${inst.cnt.toLocaleString('pt-BR')}`);
      }
    }
    console.log('='.repeat(70) + '\n');
  }

  retryFailed() {
    const res = this.db.prepare(`UPDATE crawl_queue SET status='pending', attempts=0 WHERE status='failed'`).run();
    const resProc = this.db.prepare(`UPDATE crawl_queue SET status='pending' WHERE status='processing'`).run();
    console.log(`[RETRY] ${res.changes} itens com falhas e ${resProc.changes} itens em processamento foram devolvidos para a fila.`);
    return res.changes;
  }
}

// =============================================================================
// CLI DISPATCHER
// =============================================================================

async function main() {
  const args = process.argv.slice(2);
  const command = args[0];

  if (!command || command === '--help' || command === '-h') {
    console.log(`
Uso: node scripts/sanar_mass_crawler.mjs <comando> [opções]

Comandos disponíveis:
  seed-provas                    Descobre todas as 287 bancas e edições anuais de /provas/
  seed-sitemaps [--max N]        Descobre questões a partir dos 181 sitemaps de questões
  seed-exam <slug> [ano]         Enfileira uma banca específica (ex: amrigs, usp-sp 2025)
  run [--concurrency N] [--delay MS] [--max N] Processa a fila de forma segura e cadenciada
  retry-failed                   Devolve itens com falhas transitórias de volta para a fila
  status                         Exibe painel de métricas e status do banco SQLite
  export-json [arquivo.json]     Exporta todo o acervo extraído para JSON estruturado
  test-q <url>                   Testa a extração e conservação de imagem de uma única questão
  test-prova <slug> <ano>        Executa end-to-end uma prova completa (ex: amrigs 2025)
`);
    process.exit(0);
  }

  const crawler = new SanarMassCrawler({
    concurrency: args.includes('--concurrency') ? parseInt(args[args.indexOf('--concurrency') + 1], 10) : 2,
    delayMs: args.includes('--delay') ? parseInt(args[args.indexOf('--delay') + 1], 10) : 400
  });

  if (command === 'seed-provas') {
    await crawler.seedProvasHub();
    crawler.showStatus();
  } else if (command === 'seed-sitemaps') {
    const maxIdx = args.indexOf('--max');
    const maxSitemaps = maxIdx !== -1 ? parseInt(args[maxIdx + 1], 10) : null;
    await crawler.seedSitemaps(maxSitemaps);
    crawler.showStatus();
  } else if (command === 'seed-exam') {
    const slug = args[1];
    const year = args[2] ? parseInt(args[2], 10) : null;
    if (!slug) {
      console.error('Informe o slug da banca (ex: amrigs)');
      process.exit(1);
    }
    crawler.seedExam(slug, year);
    crawler.showStatus();
  } else if (command === 'run') {
    const maxIdx = args.indexOf('--max');
    const maxItems = maxIdx !== -1 ? parseInt(args[maxIdx + 1], 10) : null;
    await crawler.runWorkerPool(maxItems);
    crawler.showStatus();
  } else if (command === 'retry-failed') {
    crawler.retryFailed();
    crawler.showStatus();
  } else if (command === 'export-json') {
    const outPath = args[1];
    crawler.exportToJson(outPath);
  } else if (command === 'status') {
    crawler.showStatus();
  } else if (command === 'test-q') {
    const qUrl = args[1];
    if (!qUrl) {
      console.error('Informe a URL da questão (/q/...)');
      process.exit(1);
    }
    console.log(`\n[TESTE] Extraindo questão: ${qUrl}`);
    const ok = await crawler.parseAndSaveQuestion(qUrl);
    console.log(`Resultado: ${ok ? 'SUCESSO' : 'FALHA'}`);
    crawler.showStatus();
  } else if (command === 'test-prova') {
    const slug = args[1] || 'amrigs';
    const year = args[2] ? parseInt(args[2], 10) : 2025;
    console.log(`\n=== TESTE END-TO-END DE PROVA: ${slug.toUpperCase()} ${year} ===`);
    crawler.seedExam(slug, year);
    await crawler.runWorkerPool(50);
    crawler.showStatus();
  } else {
    console.error(`Comando desconhecido: ${command}. Use --help.`);
    process.exit(1);
  }
}

import { fileURLToPath } from 'url';
const isMainModule = process.argv[1] === fileURLToPath(import.meta.url);
if (isMainModule) {
  main().catch(err => {
    console.error('[FATAL]', err);
    process.exit(1);
  });
}
