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
const targetsPath = path.resolve('data/sanar_harvest_targets_remaining.json');

const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const remainingList = catalogData.catalog || [];
const targets = JSON.parse(fs.readFileSync(targetsPath, 'utf8'));

let syncStatus = { synced_questions: {}, synced_images: {} };
if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

console.log(`\n🚀 INICIANDO HARVEST EM TEMPO REAL NO SANAR PARA ${remainingList.length} QUESTÕES RESTANTES...`);
console.log(`Alvos priorizados: ${targets.length} instituições mapeadas no Sanar.\n`);

function cleanText(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build memory index of remaining watermarked questions
const watermarkIndex = [];
for (const item of remainingList) {
  const row = stagingDb.prepare('SELECT id, statement, options, correct_answer, banca, year FROM questions_curated_staging WHERE id = ?').get(item.id);
  if (row && row.statement) {
    const norm = cleanText(row.statement);
    if (norm.length >= 20) {
      watermarkIndex.push({
        id: row.id,
        banca: row.banca,
        year: row.year,
        norm,
        p40: norm.substring(0, 40),
        mid35: norm.length > 70 ? norm.substring(25, 60) : ''
      });
    }
  }
}

console.log(`Indexadas ${watermarkIndex.length} questões com marca na memória para cruzamento O(1).`);

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

const API_URL = "https://question-hub-bff.sanar.com.br/lunar/questions";
const TOKEN = "jMI0WGzXmML33e7cIm9D5JEf-JrTdXcH_QL4odQrgRk";

async function fetchSanarQuestions(instId, maxQuestions = 600) {
  const results = [];
  const limit = 50;
  let skip = 0;
  let total = 1;

  while (skip < total && skip < maxQuestions) {
    try {
      const payload = {
        institution: { id: instId },
        limit,
        skip,
        order: "DESC",
        filters: {}
      };

      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${TOKEN}` },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(12000)
      });

      if (!res.ok) break;
      const json = await res.json();
      total = json.pagination?.total || 0;
      const list = json.data || [];
      if (list.length === 0) break;
      results.push(...list);
      skip += list.length;
    } catch {
      break;
    }
  }
  return results;
}

async function main() {
  const removedIds = new Set();
  let totalDeployed = 0;

  for (let tIdx = 0; tIdx < targets.length; tIdx++) {
    const target = targets[tIdx];
    console.log(`\n[${tIdx + 1}/${targets.length}] 🔍 Consultando Sanar: ${target.name} (${target.questionCount} candidatas na base)...`);

    const sanarList = await fetchSanarQuestions(target.sanarId, 800);
    if (!sanarList || sanarList.length === 0) continue;

    console.log(`  -> Obtidas ${sanarList.length} questões do Sanar. Cruzando com nossa base...`);

    let instMatches = 0;

    for (const sq of sanarList) {
      if (!sq.statement) continue;

      // Extract image URLs
      const allText = [sq.statement, ...(sq.options ? sq.options.map(o => o.text || '') : [])].join(' ');
      const rawMatches = allText.match(/https:\/\/lunar\.cetrus\.sanar\.com\.br\/assets\/[a-f0-9\-]+\.(?:png|jpg|jpeg|webp)/gi) || [];
      const assetUrls = [...new Set(rawMatches)];
      if (assetUrls.length === 0) continue;

      const sqNorm = cleanText(sq.statement);
      if (sqNorm.length < 20) continue;
      const sqP40 = sqNorm.substring(0, 40);

      // Search match
      let match = watermarkIndex.find(w => !removedIds.has(w.id) && (w.norm.startsWith(sqP40) || sqNorm.startsWith(w.p40)));
      if (!match) {
        match = watermarkIndex.find(w => !removedIds.has(w.id) && (w.mid35 && sqNorm.includes(w.mid35)));
      }

      if (!match) continue;

      console.log(`  🎯 MATCH SANAR ENCONTRADO: ${match.id} (${match.banca} ${match.year}) [${assetUrls.length} imagens]`);

      try {
        const imgBuffers = [];
        for (const u of assetUrls) {
          const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) });
          if (res.ok) {
            imgBuffers.push(Buffer.from(await res.arrayBuffer()));
          }
        }

        if (imgBuffers.length === 0) continue;

        let finalWebpBuffer = null;
        if (imgBuffers.length === 1) {
          finalWebpBuffer = await sharp(imgBuffers[0]).webp({ quality: 90, effort: 5 }).toBuffer();
        } else {
          const loaded = [];
          let maxW = 0;
          let totalH = 0;
          const GAP = 16;

          for (const b of imgBuffers) {
            const meta = await sharp(b).metadata();
            loaded.push({ bytes: b, width: meta.width || 600, height: meta.height || 400 });
            if ((meta.width || 600) > maxW) maxW = meta.width || 600;
            totalH += (meta.height || 400);
          }
          totalH += (loaded.length - 1) * GAP;

          const composites = [];
          let curY = 0;
          for (const img of loaded) {
            const leftOffset = Math.floor((maxW - img.width) / 2);
            composites.push({ input: img.bytes, top: curY, left: leftOffset });
            curY += img.height + GAP;
          }

          finalWebpBuffer = await sharp({
            create: { width: maxW, height: totalH, channels: 3, background: { r: 255, g: 255, b: 255 } }
          }).composite(composites).webp({ quality: 90, effort: 5 }).toBuffer();
        }

        const cleanQId = match.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const outFileName = `resgatada_${cleanQId}.webp`;
        const destPath = path.join(RESCUED_DIR, outFileName);
        fs.writeFileSync(destPath, finalWebpBuffer);

        // Upload Supabase Storage
        const storagePath = `resgatadas/${outFileName}`;
        const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, finalWebpBuffer, {
          contentType: 'image/webp',
          upsert: true
        });
        if (upErr) {
          console.warn(`    Erro upload Supabase: ${upErr.message}`);
          continue;
        }

        const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
        const publicUrl = pubData.publicUrl;

        // Update local SQLite
        stagingDb.prepare('UPDATE questions_curated_staging SET images = ?, has_images = 1 WHERE id = ?')
          .run(JSON.stringify([publicUrl]), match.id);

        // Update remote Supabase DB
        const { sourceTable, cleanId, isLocalOnly } = getRemoteTableAndId(match.id);
        if (!isLocalOnly) {
          await supabase.from(sourceTable).update({ images: [publicUrl] }).eq('id', cleanId);
        }

        // Update syncStatus
        syncStatus.synced_questions[match.id] = { public_urls: [publicUrl], synced_at: new Date().toISOString() };
        syncStatus.synced_images[outFileName] = { public_url: publicUrl, storage_path: storagePath, uploaded_at: new Date().toISOString() };

        removedIds.add(match.id);
        totalDeployed++;
        instMatches++;
        console.log(`    ✅ Deployed Sanar: ${match.id} -> ${publicUrl}`);

      } catch (err) {
        console.warn(`    ⚠️ Falha processamento ${match.id}: ${err.message}`);
      }
    }

    if (instMatches > 0) {
      // Persist updates
      const remainingCatalog = catalogData.catalog.filter(c => !removedIds.has(c.id));
      catalogData.catalog = remainingCatalog;
      catalogData.total_items = remainingCatalog.length;
      catalogData.updated_at = new Date().toISOString();
      fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2));
      fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2));

      try {
        await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
      } catch {}
    }
  }

  // Final persist
  const remainingCatalog = catalogData.catalog.filter(c => !removedIds.has(c.id));
  catalogData.catalog = remainingCatalog;
  catalogData.total_items = remainingCatalog.length;
  catalogData.updated_at = new Date().toISOString();
  fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2));
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2));

  try {
    await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
  } catch {}

  console.log(`\n========================================`);
  console.log(`🎉 HARVEST SANAR CONCLUÍDO!`);
  console.log(`- Questões adicionais resgatadas do Sanar: ${totalDeployed}`);
  console.log(`- Total restante com marca d'água: ${remainingCatalog.length}`);
  console.log(`========================================\n`);
}

main().catch(console.error);
