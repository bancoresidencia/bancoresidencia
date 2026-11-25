import fs from 'fs';
import path from 'path';
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

const BANCO_GERAL_DIR = path.resolve('data/imagens_banco_geral');
const PDR_DIR = path.resolve('data/imagens_provaderesidencia');
const CONVERTED_DIR = path.resolve('data/imagens_convertidas_webp');
const ORIG_MEDQ_DIR = path.resolve('data/imagens_medq_originais');

const bgFiles = new Set(fs.readdirSync(BANCO_GERAL_DIR));
const pdrFiles = new Set(fs.readdirSync(PDR_DIR));
const convertedFiles = new Set(fs.readdirSync(CONVERTED_DIR));
const origMedqFiles = fs.readdirSync(ORIG_MEDQ_DIR);

const decisionsPath = path.resolve('data/supabase_tables/image_watermark_decisions.json');
let decisions = { medq_actions: {} };
if (fs.existsSync(decisionsPath)) decisions = JSON.parse(fs.readFileSync(decisionsPath, 'utf8'));

const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');
let syncStatus = { synced_questions: {}, synced_images: {} };
if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

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

function resolveCrispOriginal(qId, currentUrl) {
  const cleanUrl = currentUrl.split('?')[0];
  const baseName = path.basename(cleanUrl);

  // 1. From decisions medq_actions
  if (decisions.medq_actions && decisions.medq_actions[qId]) {
    const act = decisions.medq_actions[qId];
    if (act.cleaned_url) {
      const cBase = path.basename(act.cleaned_url);
      const strippedClean = cBase.replace(/^clean_/, '');
      if (bgFiles.has(strippedClean)) return { dir: BANCO_GERAL_DIR, filename: strippedClean, sub: 'banco_geral' };
      if (pdrFiles.has(strippedClean)) return { dir: PDR_DIR, filename: strippedClean, sub: 'provaderesidencia' };
      if (convertedFiles.has(strippedClean)) return { dir: CONVERTED_DIR, filename: strippedClean, sub: 'imagens_convertidas' };
    }
  }

  // 2. From orig_medq
  const origMedqMatch = origMedqFiles.find(f => f.includes(qId) || f === `orig_${qId}_${baseName}` || f === `orig_${baseName}`);
  if (origMedqMatch) {
    return { dir: ORIG_MEDQ_DIR, filename: origMedqMatch, sub: 'medq_originais' };
  }

  // 3. Candidate base names
  const candidateBases = [
    baseName,
    baseName.replace(/_clean\.webp$/, '.webp'),
    baseName.replace(/^resgatada_/, ''),
    baseName.replace(/^clean_/, ''),
    baseName.replace(/^clean_questions_[a-zA-Z0-9_-]+_/, ''),
    baseName.replace(/^clean_[a-zA-Z0-9_-]+_/, '')
  ];

  for (const b of candidateBases) {
    if (bgFiles.has(b)) return { dir: BANCO_GERAL_DIR, filename: b, sub: 'banco_geral' };
    if (pdrFiles.has(b)) return { dir: PDR_DIR, filename: b, sub: 'provaderesidencia' };
    if (convertedFiles.has(b)) return { dir: CONVERTED_DIR, filename: b, sub: 'imagens_convertidas' };
  }

  // 4. Slug matching in banco_geral
  const slug = baseName.replace(/^[a-f0-9]+_/, '').replace(/\.webp$/, '').slice(0, 40);
  if (slug.length > 10) {
    for (const f of bgFiles) {
      if (f.includes(slug)) return { dir: BANCO_GERAL_DIR, filename: f, sub: 'banco_geral' };
    }
  }

  return null;
}

async function uploadToStorage(resolved) {
  const { dir, filename, sub } = resolved;
  const storagePath = `${sub}/${filename}`;

  if (syncStatus.synced_images[filename]) {
    return syncStatus.synced_images[filename].public_url;
  }

  const localPath = path.join(dir, filename);
  const fileBytes = fs.readFileSync(localPath);

  const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, fileBytes, {
    contentType: 'image/webp',
    upsert: true
  });
  if (upErr) throw upErr;

  const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
  const publicUrl = pubData.publicUrl;

  syncStatus.synced_images[filename] = {
    public_url: publicUrl,
    storage_path: storagePath,
    uploaded_at: new Date().toISOString(),
    size: fileBytes.length
  };

  return publicUrl;
}

async function run() {
  console.log(`\n======================================================`);
  console.log(`INICIANDO REVERSÃO DE TODAS AS IMAGENS COM INPAINTING/BLUR`);
  console.log(`(Garante ZERO quadrados borrados e restaura imagens anatômicas nítidas)`);
  console.log(`======================================================\n`);

  const rows = stagingDb.prepare(`
    SELECT id, images, institution, year 
    FROM questions_curated_staging 
    WHERE images IS NOT NULL AND images != '[]' AND images != ''
  `).all();

  let revertedCount = 0;
  let alreadyCleanOrSanarCount = 0;
  let unresolvedCount = 0;

  for (const q of rows) {
    const imgsStr = q.images || '';
    // Skip if already a clean Sanar substitution
    if (imgsStr.includes('_sanar.webp')) {
      alreadyCleanOrSanarCount++;
      continue;
    }

    const isBlurredOrInpainted = imgsStr.includes('_clean.webp') || imgsStr.includes('clean_') || imgsStr.includes('higienizada');
    if (!isBlurredOrInpainted) {
      alreadyCleanOrSanarCount++;
      continue;
    }

    let urls = [];
    try {
      urls = JSON.parse(imgsStr);
    } catch {
      urls = [imgsStr];
    }

    const newUrls = [];
    let allOk = true;

    for (const u of urls) {
      const resolved = resolveCrispOriginal(q.id, u);
      if (resolved) {
        try {
          const publicUrl = await uploadToStorage(resolved);
          newUrls.push(publicUrl);
        } catch (err) {
          console.warn(`Erro upload ${q.id}:`, err.message);
          allOk = false;
        }
      } else {
        allOk = false;
        console.warn(`Original não localizado para ${q.id}: ${u}`);
      }
    }

    if (allOk && newUrls.length > 0) {
      // Update SQLite local SSOT
      stagingDb.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
        .run(JSON.stringify(newUrls), q.id);

      // Update remote Supabase DB
      const { sourceTable, cleanId, isLocalOnly } = getRemoteTableAndId(q.id);
      if (!isLocalOnly) {
        await supabase.from(sourceTable).update({ images: newUrls }).eq('id', cleanId);
      }

      decisions.medq_actions[q.id] = {
        action: 'reverted_to_crisp_original',
        reverted_urls: newUrls,
        timestamp: new Date().toISOString()
      };

      revertedCount++;
      if (revertedCount % 20 === 0) {
        process.stdout.write(`\rRevertidos para originais nítidos: ${revertedCount}...`);
        fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
        fs.writeFileSync(decisionsPath, JSON.stringify(decisions, null, 2), 'utf8');
      }
    } else {
      unresolvedCount++;
    }
  }

  // Final persist
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
  fs.writeFileSync(decisionsPath, JSON.stringify(decisions, null, 2), 'utf8');

  console.log(`\n\n======================================================`);
  console.log(`REVERSÃO CONCLUÍDA!`);
  console.log(`Questões revertidas para originais nítidos (sem blur): ${revertedCount}`);
  console.log(`Questões já limpas ou substituídas por Sanar: ${alreadyCleanOrSanarCount}`);
  console.log(`Não resolvidas: ${unresolvedCount}`);
  console.log(`======================================================\n`);
}

run().catch(err => {
  console.error('Fatal error during reversion:', err);
  process.exit(1);
});
