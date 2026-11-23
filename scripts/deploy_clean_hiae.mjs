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

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

const qId = 'questions_66a08e3e-6c58-41bd-8375-c97250110c13';
const cleanFile = path.resolve('data/sample_hiae_clean.webp');
const destFile = path.resolve('data/imagens_resgatadas_gate6/resgatada_questions_66a08e3e_hiae_2026.webp');

fs.copyFileSync(cleanFile, destFile);

const storagePath = 'resgatadas/resgatada_questions_66a08e3e_hiae_2026.webp';
const fileBuf = fs.readFileSync(destFile);

async function deploy() {
  console.log(`Uploading clean image for ${qId}...`);
  const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, fileBuf, {
    contentType: 'image/webp',
    upsert: true
  });
  if (upErr) throw upErr;

  const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
  const publicUrl = pubData.publicUrl;
  console.log('Public URL:', publicUrl);

  // 1. Update SQLite staging
  db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
    .run(JSON.stringify([publicUrl]), qId);
  console.log('Updated questions_curated_staging in SQLite');

  // 2. Update remote Supabase questions table
  const cleanUuid = qId.replace('questions_', '');
  const { error: dbErr } = await supabase.from('questions')
    .update({ images: [publicUrl] })
    .eq('id', cleanUuid);
  if (dbErr) {
    console.error('Remote update error:', dbErr.message);
  } else {
    console.log('Updated remote Supabase questions table successfully!');
  }

  // 3. Remove from medq_watermark_catalog.json
  const catPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
  if (fs.existsSync(catPath)) {
    const catalogData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
    catalogData.catalog = (catalogData.catalog || []).filter(c => c.id !== qId);
    fs.writeFileSync(catPath, JSON.stringify(catalogData, null, 2), 'utf8');
    console.log('Removed from medq_watermark_catalog.json');
  }

  // 4. Update syncStatus.json
  const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');
  if (fs.existsSync(syncPath)) {
    const syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
    syncStatus.synced_questions[qId] = {
      public_urls: [publicUrl],
      synced_at: new Date().toISOString(),
      remote_table: 'questions',
      remote_updated: true
    };
    fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
    console.log('Updated syncStatus.json');
  }

  console.log('Done!');
}

deploy().catch(console.error);
