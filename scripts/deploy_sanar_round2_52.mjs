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

const matchesPath = path.resolve('data/sanar_matches_round2.json');
const catalogPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');

const data = JSON.parse(fs.readFileSync(matchesPath, 'utf8'));
const matches = data.matches.filter(m => m.dbImagesCount > 0);
const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
let syncStatus = { synced_questions: {}, synced_images: {} };
if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

console.log(`\n🚀 INICIANDO DEPLOY DE ${matches.length} QUESTÕES ADICIONAIS DO SANAR (ROUND 2)...\n`);

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
    const qId = item.stagingId;
    const cleanQId = qId.replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      const validWebpFiles = [];
      for (const simg of item.dbImages) {
        if (simg.local_webp_path && fs.existsSync(simg.local_webp_path)) {
          validWebpFiles.push(simg.local_webp_path);
        }
      }

      if (validWebpFiles.length === 0) {
        console.warn(`[${idx+1}/${matches.length}] ${qId}: Nenhum arquivo WebP encontrado.`);
        continue;
      }

      let finalWebpBuffer = null;

      if (validWebpFiles.length === 1) {
        const inputBytes = fs.readFileSync(validWebpFiles[0]);
        finalWebpBuffer = await sharp(inputBytes)
          .webp({ quality: 90, effort: 5 })
          .toBuffer();
      } else {
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

      const outFileName = `resgatada_${cleanQId}.webp`;
      const localOut = path.join(RESCUED_DIR, outFileName);
      fs.writeFileSync(localOut, finalWebpBuffer);

      // Upload to Supabase Storage
      const storagePath = `resgatadas/${outFileName}`;
      const { data: upData, error: upError } = await supabase.storage
        .from('questoes')
        .upload(storagePath, finalWebpBuffer, {
          contentType: 'image/webp',
          upsert: true
        });

      if (upError) {
        console.error(`[${idx+1}/${matches.length}] Erro upload Supabase ${qId}:`, upError.message);
        continue;
      }

      const { data: pubUrlData } = supabase.storage
        .from('questoes')
        .getPublicUrl(storagePath);

      const publicUrl = pubUrlData.publicUrl;
      const imagesJson = JSON.stringify([publicUrl]);

      // Update staging SQLite
      stagingDb.prepare(`
        UPDATE questions_curated_staging
        SET images = ?, has_images = 1
        WHERE id = ?
      `).run(imagesJson, qId);

      // Update remote table in Supabase
      const { sourceTable, cleanId, isLocalOnly } = getRemoteTableAndId(qId);
      if (!isLocalOnly) {
        const { error: remoteError } = await supabase
          .from(sourceTable)
          .update({
            images: imagesJson,
            has_images: true
          })
          .eq('id', cleanId);

        if (remoteError) {
          console.warn(`[${idx+1}/${matches.length}] Erro ao atualizar ${sourceTable} (${cleanId}):`, remoteError.message);
        }
      }

      // Update syncStatus
      syncStatus.synced_questions[qId] = true;
      syncStatus.synced_images[qId] = [publicUrl];

      removedIds.add(qId);
      successCount++;
      if (successCount % 10 === 0 || idx === matches.length - 1) {
        console.log(`[${idx+1}/${matches.length}] Sucesso: ${qId} -> ${publicUrl}`);
      }
    } catch (err) {
      console.error(`[${idx+1}/${matches.length}] Falha em ${qId}:`, err.message);
    }
  }

  // Update medq_watermark_catalog.json
  const remainingCatalog = catalogData.catalog.filter(item => !removedIds.has(item.id));
  catalogData.catalog = remainingCatalog;
  catalogData.total_items = remainingCatalog.length;
  catalogData.updated_at = new Date().toISOString();
  fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2));

  // Update supabase_sync_status.json
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2));

  console.log(`\n========================================`);
  console.log(`✅ DEPLOY ROUND 2 CONCLUÍDO COM SUCESSO!`);
  console.log(`- Questões Sanar substituídas: ${successCount}`);
  console.log(`- Removidas da lista de marca d'água: ${removedIds.size}`);
  console.log(`- Restantes no catálogo com marca: ${remainingCatalog.length}`);
  console.log(`========================================\n`);
}

main().catch(console.error);
