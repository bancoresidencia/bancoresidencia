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
const catPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');

const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
const remainingList = cat.catalog || cat;
console.log(`Remaining watermarked questions in catalog: ${remainingList.length}`);

// Load remaining questions from staging DB
const remainingMap = new Map();
for (const item of remainingList) {
  const row = db.prepare('SELECT id, statement, options, correct_answer, institution, year FROM questions_curated_staging WHERE id = ?').get(item.id);
  if (row && row.statement) {
    remainingMap.set(row.id, row);
  }
}
console.log(`Loaded ${remainingMap.size} statements from staging DB.`);

function cleanText(str) {
  if (!str) return '';
  return str.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[^a-z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// Build index of our watermarked questions
const watermarkIndex = [];
for (const [id, q] of remainingMap.entries()) {
  const norm = cleanText(q.statement);
  if (norm.length < 25) continue;
  watermarkIndex.push({
    id: q.id,
    institution: q.institution,
    year: q.year,
    norm,
    p40: norm.substring(0, 40),
    p55: norm.substring(0, 55)
  });
}

const API_URL = "https://question-hub-bff.sanar.com.br/lunar/questions";
const TOKEN = "jMI0WGzXmML33e7cIm9D5JEf-JrTdXcH_QL4odQrgRk";

async function fetchQuestionsForInstitution(instId, instName) {
  console.log(`\nFetching questions for institution: ${instName} (${instId})...`);
  const results = [];
  const limit = 50;
  let skip = 0;
  let total = 1;

  while (skip < total && skip < 500) {
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
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${TOKEN}`
        },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        console.warn(`  API error ${res.status}`);
        break;
      }

      const json = await res.json();
      total = json.pagination?.total || 0;
      const list = json.data || [];
      if (list.length === 0) break;

      results.push(...list);
      skip += list.length;
    } catch (err) {
      console.error(`  Fetch error:`, err.message);
      break;
    }
  }

  console.log(`  Fetched ${results.length} / ${total} questions for ${instName}`);
  return results;
}

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

async function runHarvest() {
  // Fetch institutions
  const instRes = await fetch('https://sanarmed.com/wp-content/plugins/sanar-questoes1.0.20/public/data/institutions.json');
  const instData = (await instRes.json()).data || [];

  // Find institutions matching top clusters: USP, UNICAMP, UNESP, UFRN, HCOR, SIRIO, etc.
  const targetKeywords = ['usp', 'unicamp', 'unesp', 'ufrn', 'hcor', 'sírio', 'sirio', 'santa casa', 'surce', 'uft', 'revalida', 'enare'];
  const matchedInstitutions = instData.filter(i => {
    const name = (i.name || '').toLowerCase();
    return targetKeywords.some(kw => name.includes(kw));
  });

  console.log(`Matched ${matchedInstitutions.length} top institutions in Sanar:`);
  matchedInstitutions.forEach(i => console.log(`  - [${i.id}] ${i.name}`));

  let syncStatus = { synced_questions: {}, synced_images: {} };
  if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

  const removedIds = new Set();
  let totalRescued = 0;

  for (const inst of matchedInstitutions) {
    const questions = await fetchQuestionsForInstitution(inst.id, inst.name);

    for (const sq of questions) {
      if (!sq.statement) continue;

      // Extract image URLs from statement and options
      const allText = [sq.statement, ...(sq.options ? sq.options.map(o => o.text || '') : [])].join(' ');
      const imgMatches = allText.match(/https:\/\/lunar\.cetrus\.sanar\.com\.br\/assets\/[a-f0-9\-]+\.(?:png|jpg|jpeg|webp)/gi) || [];
      const assetUrls = [...new Set(imgMatches)];
      if (assetUrls.length === 0) continue;

      const sqNorm = cleanText(sq.statement);
      if (sqNorm.length < 25) continue;
      const p40 = sqNorm.substring(0, 40);

      // Find match in our watermarked list
      const match = watermarkIndex.find(w => !removedIds.has(w.id) && (w.norm.startsWith(p40) || sqNorm.startsWith(w.p40)));
      if (!match) continue;

      console.log(`\n🎯 FOUND MATCH: ${match.id} (${match.institution} ${match.year})`);
      console.log(`   Our stmt: ${match.norm.substring(0, 60)}`);
      console.log(`   Sanar stmt: ${sqNorm.substring(0, 60)}`);
      console.log(`   Assets (${assetUrls.length}):`, assetUrls);

      // Download and convert images
      try {
        const imgBuffers = [];
        for (const u of assetUrls) {
          const res = await fetch(u, { headers: { 'User-Agent': 'Mozilla/5.0' } });
          if (res.ok) imgBuffers.push(Buffer.from(await res.arrayBuffer()));
        }

        if (imgBuffers.length === 0) continue;

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
            composites.push({
              input: imgBuffers[i],
              top: currentTop,
              left: Math.max(0, Math.floor((maxWidth - (metas[i].width || maxWidth)) / 2))
            });
            currentTop += (metas[i].height || 400) + 16;
          }
          webpBuf = await sharp({
            create: { width: maxWidth, height: totalHeight, channels: 4, background: { r: 255, g: 255, b: 255, alpha: 1 } }
          }).composite(composites).webp({ quality: 90 }).toBuffer();
        }

        const cleanQId = match.id.replace(/[^a-zA-Z0-9_-]/g, '_');
        const outFileName = `resgatada_${cleanQId}_bff.webp`;
        const destPath = path.join(RESCUED_DIR, outFileName);
        fs.writeFileSync(destPath, webpBuf);

        const storagePath = `resgatadas/${outFileName}`;
        const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
          contentType: 'image/webp',
          upsert: true
        });
        if (upErr) {
          console.error(`Upload error:`, upErr.message);
          continue;
        }

        const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
        const publicUrl = pubData.publicUrl;

        // Update local staging
        db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
          .run(JSON.stringify([publicUrl]), match.id);

        // Update remote Supabase
        const { sourceTable, cleanId, isLocalOnly } = getRemoteTableAndId(match.id);
        if (!isLocalOnly) {
          await supabase.from(sourceTable).update({ images: [publicUrl] }).eq('id', cleanId);
        }

        removedIds.add(match.id);
        syncStatus.synced_questions[match.id] = {
          public_urls: [publicUrl],
          synced_at: new Date().toISOString(),
          remote_table: sourceTable,
          remote_updated: !isLocalOnly
        };

        totalRescued++;
        console.log(`✅ [${totalRescued}] Deployed clean image for ${match.id} -> ${publicUrl}`);
      } catch (err) {
        console.error(`Error processing images for ${match.id}:`, err.message);
      }
    }
  }

  // Prune catalog and save
  const updatedCat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  updatedCat.catalog = (updatedCat.catalog || []).filter(c => !removedIds.has(c.id));
  fs.writeFileSync(catPath, JSON.stringify(updatedCat, null, 2), 'utf8');
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');

  console.log(`\n=======================================================`);
  console.log(`HARVEST COMPLETE! Total rescued & deployed: ${totalRescued}`);
  console.log(`=======================================================\n`);

  try {
    const r = await fetch('http://localhost:3336/api/reload-catalog');
    console.log('Dashboard reload response:', await r.json());
  } catch {}
}

runHarvest().catch(console.error);
