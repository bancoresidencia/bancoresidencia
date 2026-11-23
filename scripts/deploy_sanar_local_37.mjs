import fs from 'fs';
import path from 'path';
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

const matches = JSON.parse(fs.readFileSync('data/sanar_local_new_matches.json', 'utf8'));

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

async function deploy() {
  const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  let syncStatus = { synced_questions: {}, synced_images: {} };
  if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

  let deployedCount = 0;
  const removedIds = new Set();

  for (const item of matches) {
    if (!fs.existsSync(item.local_webp)) {
      console.warn(`Local file missing: ${item.local_webp}`);
      continue;
    }

    const cleanQId = item.qId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const outFileName = `resgatada_${cleanQId}_sanarlocal.webp`;
    const destPath = path.join(RESCUED_DIR, outFileName);

    const buf = fs.readFileSync(item.local_webp);
    fs.writeFileSync(destPath, buf);

    const storagePath = `resgatadas/${outFileName}`;
    const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, buf, {
      contentType: 'image/webp',
      upsert: true
    });
    if (upErr) {
      console.error(`Upload error on ${item.qId}:`, upErr.message);
      continue;
    }

    const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
    const publicUrl = pubData.publicUrl;

    // Update SQLite local staging
    db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
      .run(JSON.stringify([publicUrl]), item.qId);

    // Update remote Supabase if not local pdr
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

    deployedCount++;
    console.log(`[${deployedCount}/${matches.length}] Deployed ${item.qId} -> ${publicUrl}`);
  }

  cat.catalog = (cat.catalog || []).filter(c => !removedIds.has(c.id));
  fs.writeFileSync(catPath, JSON.stringify(cat, null, 2), 'utf8');
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');

  console.log(`\nSuccessfully deployed ${deployedCount} local Sanar images!`);

  try {
    const r = await fetch('http://localhost:3336/api/reload-catalog');
    console.log('Dashboard reload response:', await r.json());
  } catch {}
}

deploy().catch(console.error);
