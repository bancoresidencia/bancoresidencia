import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
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
if (!fs.existsSync(RESCUED_DIR)) fs.mkdirSync(RESCUED_DIR, { recursive: true });

const catalogPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');

const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
const remainingList = catalogData.catalog || [];

function cleanText(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

const remainingMap = new Map();
for (const item of remainingList) {
  const row = db.prepare('SELECT id, statement, options, correct_answer, institution, year, source_tables FROM questions_curated_staging WHERE id = ?').get(item.id);
  if (row && row.statement) {
    const norm = cleanText(row.statement);
    if (norm.length >= 25) {
      remainingMap.set(row.id, {
        ...row,
        norm,
        p30: norm.substring(0, 30),
        p50: norm.substring(0, 50),
        mid30: norm.length > 50 ? norm.substring(20, 50) : norm.substring(0, 30)
      });
    }
  }
}

console.log(`Remaining watermarked in memory: ${remainingMap.size}`);

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

async function harvestInstitution(sanarId, name) {
  console.log(`\n=== Harvesting ${name} (${sanarId}) ===`);
  const results = [];
  const limit = 50;
  let skip = 0;
  let total = 1;

  while (skip < total) {
    try {
      const payload = { institution: { id: sanarId }, limit, skip, order: "DESC", filters: {} };
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${TOKEN}` },
        body: JSON.stringify(payload),
        signal: AbortSignal.timeout(10000)
      });
      if (!res.ok) {
        console.error(`HTTP error ${res.status} at skip ${skip}`);
        break;
      }
      const json = await res.json();
      total = json.pagination?.total || 0;
      const list = json.data || [];
      if (list.length === 0) break;
      results.push(...list);
      skip += list.length;
      process.stdout.write(`\r  Fetched ${results.length}/${total} questions...`);
    } catch (e) {
      console.error(`Fetch error at skip ${skip}:`, e.message);
      break;
    }
  }
  console.log(`\n  Total questions downloaded for ${name}: ${results.length}`);
  return results;
}

async function processInstitutionQuestions(questions, removedIds, syncStatus) {
  let rescuedCount = 0;

  for (const sq of questions) {
    if (!sq.statement) continue;

    // Extrair URLs de imagem do HTML
    const fullHtml = (sq.statement || '') + ' ' + (sq.study_case || '');
    const rawUrls = [];
    const imgMatches = fullHtml.matchAll(/https:\/\/lunar\.cetrus\.sanar\.com\.br\/assets\/([a-f0-9\-]+)\.(png|jpg|jpeg|webp)/gi);
    for (const m of imgMatches) {
      rawUrls.push(`https://lunar.cetrus.sanar.com.br/assets/${m[1]}.${m[2]}`);
    }
    const assetUrls = [...new Set(rawUrls)];
    if (assetUrls.length === 0) continue;

    const sqNorm = cleanText(sq.statement);
    if (sqNorm.length < 25) continue;

    // Buscar match entre os remainingMap
    let matchedId = null;
    let matchObj = null;

    for (const [id, ourQ] of remainingMap.entries()) {
      if (removedIds.has(id)) continue;

      if (sqNorm.includes(ourQ.p30) || sqNorm.includes(ourQ.mid30) || ourQ.norm.includes(sqNorm.substring(0, 30))) {
        matchedId = id;
        matchObj = ourQ;
        break;
      }
    }

    if (!matchedId || !matchObj) continue;

    console.log(`\n  🎯 MATCH: ${matchedId} (${matchObj.institution} ${matchObj.year})`);
    console.log(`     Statement: ${matchObj.statement.substring(0, 70).replace(/\n/g, ' ')}...`);
    console.log(`     Assets to download (${assetUrls.length}):`, assetUrls);

    try {
      const imgBuffers = [];
      for (const u of assetUrls) {
        const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' }, signal: AbortSignal.timeout(10000) });
        if (res.ok) {
          imgBuffers.push(Buffer.from(await res.arrayBuffer()));
        }
      }

      if (imgBuffers.length === 0) {
        console.log(`     ❌ Could not download images`);
        continue;
      }

      let finalWebpBuffer = null;
      if (imgBuffers.length === 1) {
        finalWebpBuffer = await sharp(imgBuffers[0]).webp({ quality: 90 }).toBuffer();
      } else {
        const metaList = await Promise.all(imgBuffers.map(b => sharp(b).metadata()));
        const maxWidth = Math.max(...metaList.map(m => m.width || 800));
        const spacing = 16;
        let totalHeight = 0;
        const resizedBuffers = [];

        for (let idx = 0; idx < imgBuffers.length; idx++) {
          const buf = imgBuffers[idx];
          const m = metaList[idx];
          let resized = buf;
          let h = m.height || 600;
          if (m.width !== maxWidth) {
            h = Math.round((h * maxWidth) / (m.width || maxWidth));
            resized = await sharp(buf).resize(maxWidth, h).toBuffer();
          }
          resizedBuffers.push({ buffer: resized, top: totalHeight, height: h });
          totalHeight += h + (idx < imgBuffers.length - 1 ? spacing : 0);
        }

        const composites = resizedBuffers.map(item => ({ input: item.buffer, top: item.top, left: 0 }));
        finalWebpBuffer = await sharp({
          create: { width: maxWidth, height: totalHeight, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
        }).composite(composites).webp({ quality: 90 }).toBuffer();
      }

      const outFileName = `resgatada_${matchedId}_deep.webp`;
      const localFilePath = path.join(RESCUED_DIR, outFileName);
      fs.writeFileSync(localFilePath, finalWebpBuffer);

      const storagePath = `resgatadas/${outFileName}`;
      const { error: uploadError } = await supabase.storage.from('questoes').upload(storagePath, finalWebpBuffer, {
        contentType: 'image/webp',
        upsert: true
      });

      if (uploadError) {
        console.error(`     ❌ Supabase upload failed: ${uploadError.message}`);
        continue;
      }

      const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
      const publicUrl = pubData.publicUrl;

      // Atualizar local SQLite
      const updatedImagesJson = JSON.stringify([publicUrl]);
      db.prepare(`UPDATE questions_curated_staging SET images = ? WHERE id = ?`).run(updatedImagesJson, matchedId);

      // Atualizar Supabase Remoto
      const { sourceTable, cleanId, isLocalOnly } = getRemoteTableAndId(matchedId);
      let remoteSuccess = false;
      if (!isLocalOnly) {
        const { error: remoteErr } = await supabase.from(sourceTable).update({ images: [publicUrl] }).eq('id', cleanId);
        if (!remoteErr) remoteSuccess = true;
      }

      // Atualizar syncStatus
      syncStatus.synced_questions[matchedId] = {
        public_urls: [publicUrl],
        synced_at: new Date().toISOString(),
        remote_table: sourceTable,
        remote_updated: remoteSuccess
      };
      syncStatus.synced_images[outFileName] = {
        public_url: publicUrl,
        storage_path: storagePath,
        uploaded_at: new Date().toISOString(),
        size: finalWebpBuffer.length
      };

      removedIds.add(matchedId);
      rescuedCount++;
      console.log(`     ✅ [${rescuedCount}] Deployed ${matchedId} -> ${publicUrl} (Remote: ${remoteSuccess})`);

    } catch (e) {
      console.error(`     ❌ Error processing ${matchedId}:`, e.message);
    }
  }

  return rescuedCount;
}

async function main() {
  let syncStatus = { synced_questions: {}, synced_images: {} };
  if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

  const removedIds = new Set();
  const matchedBancas = JSON.parse(fs.readFileSync('data/sanar_matched_bancas.json', 'utf8'));

  // Priorizar USP-SP, USP-RP, UNICAMP, SURCE, FMABC, UNESP
  const priorityList = [
    { our: 'USP-SP', sanarId: '438e2592-cecd-4b9c-8c66-701f0464b120', sanarName: 'USP - SP' },
    { our: 'USP-RP', sanarId: 'a2153355-9681-48dd-8e71-108709f62709', sanarName: 'USP - RP' },
    { our: 'UNICAMP', sanarId: '98d5789f-d31e-42ef-bb7a-c187513ae910', sanarName: 'UNICAMP' },
    { our: 'SURCE', sanarId: '7629b389-1383-4a11-b552-320c242c3882', sanarName: 'SURCE' },
    { our: 'FMABC', sanarId: 'e499d345-0ea0-47b7-9572-c2cb7e0a2944', sanarName: 'FMABC' }
  ];

  let totalRescued = 0;
  for (const p of priorityList) {
    const questions = await harvestInstitution(p.sanarId, p.sanarName);
    const count = await processInstitutionQuestions(questions, removedIds, syncStatus);
    totalRescued += count;
  }

  console.log(`\n========================================`);
  console.log(`TOTAL RESCUED & DEPLOYED IN THIS PASS: ${totalRescued}`);
  console.log(`========================================`);

  if (removedIds.size > 0) {
    fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2));

    const updatedCatalog = remainingList.filter(item => !removedIds.has(item.id));
    catalogData.catalog = updatedCatalog;
    catalogData.total_items = updatedCatalog.length;
    catalogData.updated_at = new Date().toISOString();
    fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2));
    console.log(`Pruned catalog: ${remainingList.length} -> ${updatedCatalog.length} (-${removedIds.size})`);

    // Reload dashboard
    try {
      const reloadRes = await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
      const reloadData = await reloadRes.json();
      console.log('Dashboard reload response:', reloadData);
    } catch (e) {
      console.log('Dashboard reload skipped:', e.message);
    }
  }
}

main().catch(console.error);
