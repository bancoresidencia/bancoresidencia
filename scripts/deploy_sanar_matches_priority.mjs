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

const matchesPath = path.resolve('data/sanar_direct_matches_watermarked.json');
const catalogPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');

const matches = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
let syncStatus = { synced_questions: {}, synced_images: {} };
if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

console.log(`\n🚀 INICIANDO DEPLOY DE ${matches.length} QUESTÕES DO SANAR (PREFERÊNCIA DO USUÁRIO)...\n`);

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

async function main() {
  const removedIds = new Set();
  let successCount = 0;

  for (let idx = 0; idx < matches.length; idx++) {
    const item = matches[idx];
    const qId = item.question_id;
    const cleanQId = qId.replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      const validWebpFiles = [];
      for (const simg of item.sanar_images) {
        if (simg.local_webp && fs.existsSync(simg.local_webp)) {
          validWebpFiles.push(simg.local_webp);
        }
      }

      if (validWebpFiles.length === 0) continue;

      let finalWebpBuffer = null;

      if (validWebpFiles.length === 1) {
        // Single image: read and normalize
        const inputBytes = fs.readFileSync(validWebpFiles[0]);
        finalWebpBuffer = await sharp(inputBytes)
          .webp({ quality: 90, effort: 5 })
          .toBuffer();
      } else {
        // Multi-image: composite vertically with 16px white separator
        const loaded = [];
        let maxW = 0;
        let totalH = 0;
        const GAP = 16;

        for (const f of validWebpFiles) {
          const imgBytes = fs.readFileSync(f);
          const meta = await sharp(imgBytes).metadata();
          loaded.push({ bytes: imgBytes, width: meta.width || 600, height: meta.height || 400 });
          if ((meta.width || 600) > maxW) maxW = meta.width || 600;
          totalH += (meta.height || 400);
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

      const outFileName = `resgatada_${cleanQId}_sanar.webp`;
      const localDest = path.join(RESCUED_DIR, outFileName);
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

      removedIds.add(qId);
      successCount++;
      process.stdout.write(`\r[${idx + 1}/${matches.length}] ✅ Sanar Deploy: ${qId} (${item.banca} ${item.year})`);

      if (successCount % 25 === 0 || idx === matches.length - 1) {
        fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
        const remainingCatalog = catalogData.catalog.filter(c => !removedIds.has(c.id));
        catalogData.catalog = remainingCatalog;
        catalogData.total_items = remainingCatalog.length;
        catalogData.updated_at = new Date().toISOString();
        fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2), 'utf8');

        try {
          await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
        } catch {}
      }

    } catch (err) {
      console.warn(`\n⚠️ Erro em ${qId}:`, err.message);
    }
  }

  // Final persist
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
  const remainingCatalog = catalogData.catalog.filter(c => !removedIds.has(c.id));
  catalogData.catalog = remainingCatalog;
  catalogData.total_items = remainingCatalog.length;
  catalogData.updated_at = new Date().toISOString();
  fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2), 'utf8');

  console.log(`\n\n======================================================`);
  console.log(`CONCLUÍDO! Total de questões atualizadas com Sanar: ${successCount} / ${matches.length}`);
  console.log(`Catálogo de marcas restante agora: ${remainingCatalog.length}`);
  console.log(`======================================================\n`);

  try {
    const reloadRes = await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
    const stats = await reloadRes.json();
    console.log('Dashboard após substituição com Sanar:', stats);
  } catch {}
}

main().catch(console.error);
