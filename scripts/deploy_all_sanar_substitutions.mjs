import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
sharp.cache(false);
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

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

const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
if (!fs.existsSync(RESCUED_DIR)) fs.mkdirSync(RESCUED_DIR, { recursive: true });

const matchesPath = path.resolve('data/sanar_all_matches_complete.json');
const catalogPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');
const decisionsPath = path.resolve('data/supabase_tables/image_watermark_decisions.json');

const matches = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
let catalogData = { catalog: [], total_items: 0 };
if (fs.existsSync(catalogPath)) catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

let syncStatus = { synced_questions: {}, synced_images: {} };
if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

let decisions = { medq_actions: {} };
if (fs.existsSync(decisionsPath)) decisions = JSON.parse(fs.readFileSync(decisionsPath, 'utf8'));

console.log(`\n🚀 INICIANDO DEPLOY EM MASSA DE TODAS AS ${matches.length} SUBSTITUIÇÕES AUTÊNTICAS DO SANAR...\n`);

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

async function processItem(item) {
  const qId = item.question_id;
  const cleanQId = qId.replace(/[^a-zA-Z0-9_-]/g, '_');
  const outFileName = `resgatada_${cleanQId}_sanar.webp`;
  const localDest = path.join(RESCUED_DIR, outFileName);

  // Check if current row in DB already points to this exact sanar file and file exists
  const currentRow = stagingDb.prepare('SELECT images FROM questions_curated_staging WHERE id = ?').get(qId);
  const currentImgs = currentRow ? (currentRow.images || '') : '';
  if (currentImgs.includes(outFileName) && fs.existsSync(localDest) && syncStatus.synced_images[outFileName]) {
    return { status: 'already_deployed', qId };
  }

  const validWebpFiles = [];
  for (const simg of item.sanar_images) {
    let p = simg.local_webp;
    if (p && !fs.existsSync(p)) {
      const altP = path.join('data/sanar_media/webp', path.basename(p));
      if (fs.existsSync(altP)) p = altP;
    }
    if (p && fs.existsSync(p)) {
      validWebpFiles.push(p);
    }
  }

  if (validWebpFiles.length === 0) {
    return { status: 'missing_files', qId };
  }

  let finalWebpBuffer = null;

  if (validWebpFiles.length === 1) {
    const inputBytes = fs.readFileSync(validWebpFiles[0]);
    finalWebpBuffer = await sharp(inputBytes)
      .webp({ quality: 90, effort: 5 })
      .toBuffer();
  } else {
    // Multi-image composite vertically
    const loaded = [];
    let maxW = 0;
    let totalH = 0;
    const GAP = 16;

    for (const f of validWebpFiles) {
      const imgBytes = fs.readFileSync(f);
      const meta = await sharp(imgBytes).metadata();
      const w = meta.width || 600;
      const h = meta.height || 400;
      loaded.push({ bytes: imgBytes, width: w, height: h });
      if (w > maxW) maxW = w;
      totalH += h;
    }
    totalH += (loaded.length - 1) * GAP;

    const composites = [];
    let curY = 0;
    for (const img of loaded) {
      const leftOffset = Math.floor((maxW - img.width) / 2);
      composites.push({
        input: img.bytes,
        top: curY,
        left: leftOffset
      });
      curY += img.height + GAP;
    }

    finalWebpBuffer = await sharp({
      create: {
        width: maxW,
        height: totalH,
        channels: 3,
        background: { r: 255, g: 255, b: 255 }
      }
    })
    .composite(composites)
    .webp({ quality: 90, effort: 5 })
    .toBuffer();
  }

  fs.writeFileSync(localDest, finalWebpBuffer);

  // Upload to Supabase Storage
  const storagePath = `resgatadas/${outFileName}`;
  const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, finalWebpBuffer, {
    contentType: 'image/webp',
    upsert: true
  });
  if (upErr) throw upErr;

  const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
  const publicUrl = pubData.publicUrl;

  // Update SQLite local SSOT
  stagingDb.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
    .run(JSON.stringify([publicUrl]), qId);

  // Update Remote Supabase DB
  const { sourceTable, cleanId, isLocalOnly } = getRemoteTableAndId(qId);
  let remoteUpdated = false;
  if (!isLocalOnly) {
    const { error: remErr } = await supabase.from(sourceTable).update({ images: [publicUrl] }).eq('id', cleanId);
    if (!remErr) remoteUpdated = true;
  }

  syncStatus.synced_questions[qId] = {
    public_urls: [publicUrl],
    synced_at: new Date().toISOString(),
    remote_table: sourceTable,
    remote_updated: remoteUpdated
  };
  syncStatus.synced_images[outFileName] = {
    public_url: publicUrl,
    storage_path: storagePath,
    uploaded_at: new Date().toISOString(),
    size: finalWebpBuffer.length
  };

  decisions.medq_actions[qId] = {
    action: 'substituted_sanar',
    substituted_url: publicUrl,
    timestamp: new Date().toISOString()
  };

  return { status: 'deployed', qId, publicUrl };
}

async function main() {
  const CONCURRENCY = 10;
  let deployedCount = 0;
  let alreadyDeployedCount = 0;
  let errorCount = 0;
  const removedIds = new Set();

  for (let i = 0; i < matches.length; i += CONCURRENCY) {
    const slice = matches.slice(i, i + CONCURRENCY);
    const results = await Promise.all(
      slice.map(item => processItem(item).catch(err => ({ status: 'error', qId: item.question_id, error: err.message })))
    );

    for (const r of results) {
      if (r.status === 'deployed') {
        deployedCount++;
        removedIds.add(r.qId);
      } else if (r.status === 'already_deployed') {
        alreadyDeployedCount++;
        removedIds.add(r.qId);
      } else if (r.status === 'error') {
        errorCount++;
        console.warn(`\n⚠️ Erro em ${r.qId}: ${r.error}`);
      }
    }

    const processed = Math.min(i + CONCURRENCY, matches.length);
    process.stdout.write(`\r[${processed}/${matches.length}] Concluídos: ${deployedCount} novos | ${alreadyDeployedCount} existentes | ${errorCount} erros`);

    if (i % 50 === 0 || processed === matches.length) {
      fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
      fs.writeFileSync(decisionsPath, JSON.stringify(decisions, null, 2), 'utf8');
      if (catalogData.catalog && catalogData.catalog.length > 0) {
        catalogData.catalog = catalogData.catalog.filter(c => !removedIds.has(c.id));
        catalogData.total_items = catalogData.catalog.length;
        catalogData.updated_at = new Date().toISOString();
        fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2), 'utf8');
      }
    }
  }

  // Final persist
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
  fs.writeFileSync(decisionsPath, JSON.stringify(decisions, null, 2), 'utf8');
  if (catalogData.catalog && catalogData.catalog.length > 0) {
    catalogData.catalog = catalogData.catalog.filter(c => !removedIds.has(c.id));
    catalogData.total_items = catalogData.catalog.length;
    catalogData.updated_at = new Date().toISOString();
    fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2), 'utf8');
  }

  console.log(`\n\n======================================================`);
  console.log(`DEPLOY DE SUBSTITUIÇÕES CONCLUÍDO!`);
  console.log(`Novos deploys executados: ${deployedCount}`);
  console.log(`Já estavam implantados: ${alreadyDeployedCount}`);
  console.log(`Erros: ${errorCount}`);
  console.log(`Total Sanar ativos: ${deployedCount + alreadyDeployedCount} / ${matches.length}`);
  console.log(`Catálogo de marcas d'água restante: ${catalogData.total_items}`);
  console.log(`======================================================\n`);

  try {
    await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
    console.log('Dashboard catalog reloaded.');
  } catch {}
}

main().catch(err => {
  console.error('Fatal deployment error:', err);
  process.exit(1);
});
