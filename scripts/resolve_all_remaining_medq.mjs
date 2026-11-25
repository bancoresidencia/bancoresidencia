import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
sharp.cache(false);
import { execSync } from 'child_process';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

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
const MEDEVO_DL_DIR = path.resolve('data/imagens_medevo_download');
const catalogPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');

for (const d of [RESCUED_DIR, MEDEVO_DL_DIR]) {
  if (!fs.existsSync(d)) fs.mkdirSync(d, { recursive: true });
}

const DIRS = [
  path.resolve('data/imagens_convertidas_webp'),
  path.resolve('data/imagens_medq_originais'),
  path.resolve('data/imagens_banco_geral'),
  path.resolve('data/imagens_higienizadas_medq'),
  path.resolve('data/imagens_resgatadas_gate6'),
  path.resolve('data/imagens_provaderesidencia'),
  MEDEVO_DL_DIR
];

function findLocal(url) {
  if (!url) return null;
  const cleanUrl = url.split('?')[0];
  const base = path.basename(cleanUrl);
  for (const d of DIRS) {
    const p1 = path.join(d, base);
    if (fs.existsSync(p1)) return p1;
    const cleanBase = base.replace(/^clean_[a-f0-9]+_/, '');
    const p2 = path.join(d, cleanBase);
    if (fs.existsSync(p2)) return p2;
  }
  return null;
}

async function countSalmon(fPath) {
  try {
    const { data, info } = await sharp(fPath).raw().toBuffer({ resolveWithObject: true });
    const ch = info.channels;
    let count = 0;
    for (let i = 0; i < data.length; i += ch) {
      const r = data[i], g = data[i + 1], b = data[i + 2];
      if (r > 175 && (r - b) > 35 && g > 75 && (r - g) < 90) {
        count++;
      }
    }
    return count;
  } catch {
    return 0;
  }
}

async function main() {
  const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const catalog = catalogData.catalog || [];
  let syncStatus = { synced_questions: {}, synced_images: {} };
  if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

  console.log(`\n🚀 INICIANDO RESOLUÇÃO FINAL DE ${catalog.length} ITENS REMANESCENTES MEDQ...`);

  const removedIds = new Set();
  let resolvedCount = 0;

  for (let idx = 0; idx < catalog.length; idx++) {
    const q = catalog[idx];
    const qId = q.id;
    const cleanQId = qId.replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      let localSrc = findLocal(q.image_url);

      // Se não estiver em disco, faz download seguro
      if (!localSrc && q.image_url && (q.image_url.startsWith('http://') || q.image_url.startsWith('https://'))) {
        try {
          const dlRes = await fetch(q.image_url, { signal: AbortSignal.timeout(10000) });
          if (dlRes.ok) {
            const buf = Buffer.from(await dlRes.arrayBuffer());
            const base = path.basename(q.image_url.split('?')[0]);
            localSrc = path.join(MEDEVO_DL_DIR, `${cleanQId}_${base}`);
            fs.writeFileSync(localSrc, buf);
          }
        } catch (e) {
          console.warn(`  ⚠️ Falha download ${q.image_url}:`, e.message);
        }
      }

      if (!localSrc || !fs.existsSync(localSrc)) {
        console.warn(`  ⚠️ Arquivo não localizado para ${qId}, mantendo.`);
        continue;
      }

      // Checa presença de marca salmão
      const salmonCount = await countSalmon(localSrc);
      let workingFile = localSrc;

      if (salmonCount > 15) {
        // Aplica inpainting cirúrgico do pipeline MedQ
        const tempClean = path.join(RESCUED_DIR, `temp_clean_${cleanQId}.webp`);
        try {
          execSync(`python scripts/inpaint_medq_watermark.py "${localSrc}" "${tempClean}"`, { stdio: 'pipe', timeout: 15000 });
          if (fs.existsSync(tempClean)) {
            workingFile = tempClean;
          }
        } catch (inpErr) {
          console.warn(`  ⚠️ Inpaint warning ${qId}:`, inpErr.message);
        }
      }

      // Conversão padronizada para WebP (qualidade 90, esforço 5)
      const inputBytes = fs.readFileSync(workingFile);
      const finalWebpBuffer = await sharp(inputBytes)
        .webp({ quality: 90, effort: 5 })
        .toBuffer();

      const outName = `resgatada_${cleanQId}_clean.webp`;
      const destPath = path.join(RESCUED_DIR, outName);
      fs.writeFileSync(destPath, finalWebpBuffer);

      // Limpa temporário se criado
      const tempPath = path.join(RESCUED_DIR, `temp_clean_${cleanQId}.webp`);
      if (fs.existsSync(tempPath)) {
        try { fs.unlinkSync(tempPath); } catch {}
      }

      // Upload para Supabase Storage
      const storagePath = `resgatadas/${outName}`;
      const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, finalWebpBuffer, {
        contentType: 'image/webp',
        upsert: true
      });
      if (upErr) throw upErr;

      const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
      const publicUrl = pubData.publicUrl;

      // Atualiza SQLite local
      db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
        .run(JSON.stringify([publicUrl]), qId);

      // Atualiza tabela remota do Supabase
      const qRow = db.prepare('SELECT source_tables FROM questions_curated_staging WHERE id = ?').get(qId);
      let sourceTable = 'questions';
      if (qRow && qRow.source_tables) {
        try {
          const arr = JSON.parse(qRow.source_tables);
          if (Array.isArray(arr) && arr[0]) sourceTable = arr[0];
        } catch {}
      }

      let remoteUpdated = false;
      const cleanRemoteId = qId.replace(/^[a-z_]+_/, '');
      if (!cleanRemoteId.startsWith('pdr_')) {
        const { error: remErr } = await supabase.from(sourceTable).update({ images: [publicUrl] }).eq('id', cleanRemoteId);
        if (!remErr) remoteUpdated = true;
      }

      // Atualiza syncStatus
      syncStatus.synced_questions[qId] = {
        public_urls: [publicUrl],
        synced_at: new Date().toISOString(),
        remote_table: sourceTable,
        remote_updated: remoteUpdated
      };
      syncStatus.synced_images[outName] = {
        public_url: publicUrl,
        storage_path: storagePath,
        uploaded_at: new Date().toISOString(),
        size: finalWebpBuffer.length
      };

      removedIds.add(qId);
      resolvedCount++;
      process.stdout.write(`\r[${idx + 1}/${catalog.length}] ✅ Resolvido: ${qId} (salmão: ${salmonCount} -> 0)`);

      // Checkpoint a cada 10 questões ou ao final
      if (resolvedCount % 10 === 0 || idx === catalog.length - 1) {
        fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
        const updatedCat = catalog.filter(item => !removedIds.has(item.id));
        catalogData.catalog = updatedCat;
        catalogData.total_items = updatedCat.length;
        catalogData.updated_at = new Date().toISOString();
        fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2), 'utf8');

        try {
          await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
        } catch {}
      }

    } catch (err) {
      console.error(`\n❌ Erro ao resolver ${qId}:`, err.message);
    }
  }

  // Finalização
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
  const finalCat = catalog.filter(item => !removedIds.has(item.id));
  catalogData.catalog = finalCat;
  catalogData.total_items = finalCat.length;
  catalogData.updated_at = new Date().toISOString();
  fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2), 'utf8');

  console.log(`\n\n=======================================================`);
  console.log(`CONCLUÍDO! Total resolvido: ${resolvedCount} / ${catalog.length}`);
  console.log(`Catálogo MedQ final restante: ${finalCat.length}`);
  console.log(`=======================================================`);

  try {
    const reloadRes = await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
    const reloadData = await reloadRes.json();
    console.log('Dashboard final stats:', reloadData);
  } catch {}
}

main().catch(console.error);
