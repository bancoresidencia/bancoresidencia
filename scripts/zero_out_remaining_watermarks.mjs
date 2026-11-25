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

const catalogPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');

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

function isSalmonPixel(r, g, b) {
  return r > 165 && (r - b) > 25 && g > 70 && (r - g) < 95;
}

async function cleanWatermarkFromImageBuffer(buffer) {
  const { data, info } = await sharp(buffer)
    .raw()
    .toBuffer({ resolveWithObject: true });

  const { width, height, channels } = info;
  const pixels = new Uint8Array(data);

  // 1. Amostragem de bordas para detectar escala de cinza anatômica (Raio-X, TC, RM, USG)
  let chromaSum = 0;
  let chromaCount = 0;
  for (let y = 0; y < height; y += 4) {
    for (let x = 0; x < width; x += 4) {
      if (x < width * 0.15 || x > width * 0.85 || y < height * 0.15 || y > height * 0.85) {
        const idx = (y * width + x) * channels;
        const r = pixels[idx], g = pixels[idx + 1], b = pixels[idx + 2];
        if (!isSalmonPixel(r, g, b)) {
          chromaSum += Math.abs(r - g) + Math.abs(g - b);
          chromaCount++;
        }
      }
    }
  }
  const avgChroma = chromaCount > 0 ? chromaSum / chromaCount : 0;
  const isGrayscaleAnatomy = avgChroma < 14.0;

  // 2. Fundo branco (documentos, esquemas, tabelas)
  let whiteBorderCount = 0;
  let sampleBorderCount = 0;
  for (let x = 0; x < width; x += 8) {
    const idxTop = x * channels;
    const idxBot = ((height - 1) * width + x) * channels;
    if (pixels[idxTop] > 220 && pixels[idxTop+1] > 220 && pixels[idxTop+2] > 220) whiteBorderCount++;
    if (pixels[idxBot] > 220 && pixels[idxBot+1] > 220 && pixels[idxBot+2] > 220) whiteBorderCount++;
    sampleBorderCount += 2;
  }
  const isWhiteBackground = (whiteBorderCount / (sampleBorderCount || 1)) > 0.6;

  let salmonCount = 0;
  const cx = width / 2;
  const cy = height / 2;
  const maxDistX = width * 0.35;
  const maxDistY = height * 0.35;

  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = pixels[idx];
      const g = pixels[idx + 1];
      const b = pixels[idx + 2];

      if (isSalmonPixel(r, g, b)) {
        salmonCount++;
        const inCenter = Math.abs(x - cx) < maxDistX && Math.abs(y - cy) < maxDistY;

        if (isGrayscaleAnatomy) {
          // Converte para pura luminância anatômica (elimina 100% da tinta salmão sem distorção)
          const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
          pixels[idx] = lum;
          pixels[idx + 1] = lum;
          pixels[idx + 2] = lum;
        } else if (isWhiteBackground) {
          pixels[idx] = 255;
          pixels[idx + 1] = 255;
          pixels[idx + 2] = 255;
        } else if (inCenter) {
          // Foto clínica colorida: interpolação por vizinhança local limpa
          let nr = 0, ng = 0, nb = 0, count = 0;
          for (let dy = -4; dy <= 4; dy += 2) {
            for (let dx = -4; dx <= 4; dx += 2) {
              const nx = x + dx;
              const ny = y + dy;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const nIdx = (ny * width + nx) * channels;
                const pr = pixels[nIdx], pg = pixels[nIdx+1], pb = pixels[nIdx+2];
                if (!isSalmonPixel(pr, pg, pb)) {
                  nr += pr; ng += pg; nb += pb; count++;
                }
              }
            }
          }
          if (count > 0) {
            pixels[idx] = Math.round(nr / count);
            pixels[idx + 1] = Math.round(ng / count);
            pixels[idx + 2] = Math.round(nb / count);
          } else {
            const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            pixels[idx] = lum; pixels[idx + 1] = lum; pixels[idx + 2] = lum;
          }
        }
      }
    }
  }

  // Gera o buffer WebP limpo em qualidade 90 (esforço 5)
  const cleanWebp = await sharp(pixels, {
    raw: { width, height, channels }
  })
  .webp({ quality: 90, effort: 5 })
  .toBuffer();

  return { cleanWebp, salmonCount, isGrayscaleAnatomy, isWhiteBackground };
}

async function zeroOut() {
  const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
  const remaining = catalogData.catalog || [];
  let syncStatus = { synced_questions: {}, synced_images: {} };
  if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

  console.log(`\n============================================================`);
  console.log(`🎯 EXECUTANDO HIGIENIZAÇÃO CIRÚRGICA DE TODAS AS ${remaining.length} RESTANTES`);
  console.log(`============================================================\n`);

  const removedIds = new Set();
  let processed = 0;

  for (let i = 0; i < remaining.length; i++) {
    const item = remaining[i];
    const qId = item.id;
    const cleanQId = qId.replace(/[^a-zA-Z0-9_-]/g, '_');

    try {
      // Localiza a melhor imagem disponível
      let sourceBuffer = null;
      const resgatadaLocal = path.join(RESCUED_DIR, `resgatada_${cleanQId}.webp`);
      const higienizadaLocal = path.resolve(`data/imagens_higienizadas_medq/higienizada_${cleanQId}.webp`);

      if (fs.existsSync(resgatadaLocal)) {
        sourceBuffer = fs.readFileSync(resgatadaLocal);
      } else if (fs.existsSync(higienizadaLocal)) {
        sourceBuffer = fs.readFileSync(higienizadaLocal);
      } else {
        // Busca do staging ou Supabase
        const row = stagingDb.prepare('SELECT images FROM questions_curated_staging WHERE id = ?').get(qId);
        let imgUrl = null;
        if (row && row.images) {
          try {
            const parsed = JSON.parse(row.images);
            imgUrl = Array.isArray(parsed) ? parsed[0] : parsed;
          } catch {}
        }
        if (imgUrl) {
          const res = await fetch(imgUrl);
          if (res.ok) sourceBuffer = Buffer.from(await res.arrayBuffer());
        }
      }

      if (!sourceBuffer) {
        console.warn(`[${i+1}/${remaining.length}] Não foi possível obter imagem para ${qId}`);
        continue;
      }

      // Limpeza cirúrgica
      const { cleanWebp, salmonCount, isGrayscaleAnatomy } = await cleanWatermarkFromImageBuffer(sourceBuffer);

      const outFileName = `resgatada_${cleanQId}.webp`;
      const localOut = path.join(RESCUED_DIR, outFileName);
      fs.writeFileSync(localOut, cleanWebp);

      // Upload para Supabase Storage
      const storagePath = `resgatadas/${outFileName}`;
      const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, cleanWebp, {
        contentType: 'image/webp',
        upsert: true
      });

      if (upErr) {
        console.warn(`[${i+1}/${remaining.length}] Erro upload ${qId}: ${upErr.message}`);
        continue;
      }

      const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
      const publicUrl = pubData.publicUrl;

      // Update SQLite local SSOT
      stagingDb.prepare('UPDATE questions_curated_staging SET images = ?, has_images = 1 WHERE id = ?')
        .run(JSON.stringify([publicUrl]), qId);

      // Update remote table in Supabase
      const { sourceTable, cleanId, isLocalOnly } = getRemoteTableAndId(qId);
      if (!isLocalOnly) {
        await supabase.from(sourceTable).update({ images: [publicUrl] }).eq('id', cleanId);
      }

      // Update syncStatus
      syncStatus.synced_questions[qId] = { public_urls: [publicUrl], synced_at: new Date().toISOString() };
      syncStatus.synced_images[outFileName] = { public_url: publicUrl, storage_path: storagePath, uploaded_at: new Date().toISOString() };

      removedIds.add(qId);
      processed++;

      if (processed % 20 === 0 || i === remaining.length - 1) {
        process.stdout.write(`\r[${i+1}/${remaining.length}] Higienizada: ${qId} (${salmonCount} px salmão eliminados, anatômico=${isGrayscaleAnatomy})`);
      }
    } catch (err) {
      console.warn(`\n[${i+1}/${remaining.length}] Falha em ${qId}:`, err.message);
    }
  }

  // Remove todas do catálogo
  const finalCatalog = catalogData.catalog.filter(c => !removedIds.has(c.id));
  catalogData.catalog = finalCatalog;
  catalogData.total_items = finalCatalog.length;
  catalogData.updated_at = new Date().toISOString();
  fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2));
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2));

  // Notifica o dashboard para recarregar
  try {
    await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
  } catch {}

  console.log(`\n\n============================================================`);
  console.log(`✨ HIGIENIZAÇÃO COMPLETA CONCLUÍDA!`);
  console.log(`- Questões processadas e limpas: ${processed}`);
  console.log(`- Itens restantes no catálogo com marca: ${finalCatalog.length}`);
  console.log(`============================================================\n`);
}

zeroOut().catch(console.error);
