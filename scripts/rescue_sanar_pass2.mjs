import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

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

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
if (!fs.existsSync(RESCUED_DIR)) fs.mkdirSync(RESCUED_DIR, { recursive: true });

const catPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');

const queueMatches = JSON.parse(fs.readFileSync('data/sanar_queue_matches_pass2.json', 'utf8'));

// Filter only items currently in catalog
let catalogData = { catalog: [] };
if (fs.existsSync(catPath)) {
  catalogData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
}
const catIds = new Set((catalogData.catalog || []).map(c => c.id));
const pendingItems = queueMatches.filter(m => catIds.has(m.qId));

console.log(`=======================================================`);
console.log(`SANAR PASS 2 (ENTITY SLUGS) MASS RESCUE ENGINE`);
console.log(`Total pass 2 matches: ${queueMatches.length}`);
console.log(`Pending in watermark catalog: ${pendingItems.length}`);
console.log(`Target format: 100% WebP (q:90), 0 watermarks`);
console.log(`=======================================================\n`);

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
};

const validTables = ['questions', 'questions_expansion_direto', 'questions_expansion_r_plus', 'questions_expansion_revalida', 'questions_expansion_titulo_especialista'];

function getRemoteTableAndId(fullId) {
  let sourceTable = 'questions';
  let cleanId = fullId;
  for (const vt of validTables) {
    if (cleanId.startsWith(vt + '_')) {
      cleanId = cleanId.replace(vt + '_', '');
      sourceTable = vt;
      break;
    }
  }
  if (cleanId.startsWith('questions_')) {
    cleanId = cleanId.replace('questions_', '');
    sourceTable = 'questions';
  }
  return { sourceTable, cleanId, isLocalOnly: fullId.startsWith('pdr_') };
}

let syncStatus = { synced_questions: {}, synced_images: {} };
if (fs.existsSync(syncPath)) {
  syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
}

const removedIds = new Set();
let successCount = 0;
let failCount = 0;
let noImgCount = 0;

async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    clearTimeout(id);
    return response;
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
}

async function processQuestion(item) {
  try {
    const pageRes = await fetchWithTimeout(item.sanar_url, { headers: HEADERS }, 8000);
    if (!pageRes.ok) {
      failCount++;
      return { success: false, reason: `HTTP_${pageRes.status}` };
    }

    const html = await pageRes.text();
    const matches = html.match(/https:\/\/lunar\.cetrus\.sanar\.com\.br\/assets\/[a-f0-9\-]+\.(?:png|jpg|jpeg|webp)/gi) || [];
    const assetUrls = [...new Set(matches)];

    if (assetUrls.length === 0) {
      noImgCount++;
      return { success: false, reason: 'NO_IMAGE_ON_PAGE' };
    }

    const imgBuffers = [];
    for (const u of assetUrls) {
      try {
        const res = await fetchWithTimeout(u, { headers: HEADERS }, 8000);
        if (res.ok) {
          imgBuffers.push(Buffer.from(await res.arrayBuffer()));
        }
      } catch (err) {}
    }

    if (imgBuffers.length === 0) {
      failCount++;
      return { success: false, reason: 'IMAGE_DOWNLOAD_FAILED' };
    }

    let webpBuf = null;
    if (imgBuffers.length === 1) {
      webpBuf = await sharp(imgBuffers[0]).webp({ quality: 90 }).toBuffer();
    } else {
      const metas = await Promise.all(imgBuffers.map(b => sharp(b).metadata()));
      const maxWidth = Math.max(...metas.map(m => m.width || 600));
      const totalHeight = metas.reduce((sum, m) => sum + (m.height || 400), 0) + (imgBuffers.length - 1) * 16;

      let currentTop = 0;
      const composites = [];
      for (let i = 0; i < imgBuffers.length; i++) {
        const m = metas[i];
        composites.push({
          input: imgBuffers[i],
          top: currentTop,
          left: Math.max(0, Math.floor((maxWidth - (m.width || maxWidth)) / 2))
        });
        currentTop += (m.height || 400) + 16;
      }

      webpBuf = await sharp({
        create: {
          width: maxWidth,
          height: totalHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      })
      .composite(composites)
      .webp({ quality: 90 })
      .toBuffer();
    }

    const cleanQId = item.qId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const outFileName = `resgatada_${cleanQId}_queue.webp`;
    const destPath = path.join(RESCUED_DIR, outFileName);
    fs.writeFileSync(destPath, webpBuf);

    const storagePath = `resgatadas/${outFileName}`;
    const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
      contentType: 'image/webp',
      upsert: true
    });
    if (upErr) {
      failCount++;
      return { success: false, reason: `STORAGE_UPLOAD_${upErr.message}` };
    }

    const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
    const publicUrl = pubData.publicUrl;

    // Update SQLite local staging
    db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
      .run(JSON.stringify([publicUrl]), item.qId);

    // Update Remote Supabase if applicable
    const { sourceTable, cleanId, isLocalOnly } = getRemoteTableAndId(item.qId);
    if (!isLocalOnly) {
      await supabase.from(sourceTable).update({ images: [publicUrl] }).eq('id', cleanId);
    }

    removedIds.add(item.qId);
    syncStatus.synced_questions[item.qId] = {
      public_urls: [publicUrl],
      synced_at: new Date().toISOString(),
      remote_table: sourceTable,
      remote_updated: !isLocalOnly
    };

    successCount++;
    return { success: true, qId: item.qId, publicUrl };
  } catch (err) {
    failCount++;
    return { success: false, reason: err.message };
  }
}

function persistProgress() {
  if (removedIds.size === 0) return;
  const currentCat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  currentCat.catalog = (currentCat.catalog || []).filter(c => !removedIds.has(c.id));
  fs.writeFileSync(catPath, JSON.stringify(currentCat, null, 2), 'utf8');
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
  console.log(`💾 Progress saved. Removed from catalog: ${removedIds.size}`);
}

async function runPass2() {
  const CONCURRENCY = 12;
  const startTime = Date.now();
  console.log(`Starting Pass 2 with CONCURRENCY = ${CONCURRENCY}...`);

  for (let i = 0; i < pendingItems.length; i += CONCURRENCY) {
    const chunk = pendingItems.slice(i, i + CONCURRENCY);
    const results = await Promise.all(chunk.map(processQuestion));

    const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
    const progressPct = (((i + chunk.length) / pendingItems.length) * 100).toFixed(1);

    console.log(
      `[${progressPct}% - ${i + chunk.length}/${pendingItems.length}] ` +
      `Successes: ${successCount} | NoImg: ${noImgCount} | Fails: ${failCount} | Elapsed: ${elapsedSec}s`
    );

    if ((i / CONCURRENCY) % 3 === 0) {
      persistProgress();
      try {
        await fetch('http://localhost:3336/api/reload-catalog');
      } catch {}
    }
  }

  persistProgress();
  try {
    const r = await fetch('http://localhost:3336/api/reload-catalog');
    console.log('Final dashboard reload:', await r.json());
  } catch {}

  const totalTime = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=======================================================`);
  console.log(`PASS 2 RESCUE COMPLETE in ${totalTime}s`);
  console.log(`Total successfully rescued & uploaded: ${successCount}`);
  console.log(`No images on page: ${noImgCount}`);
  console.log(`Errors / Fails: ${failCount}`);
  console.log(`=======================================================\n`);
}

runPass2().catch(console.error);
