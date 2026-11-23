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

const qId = 'questions_2fb64af1-6c05-4102-8593-06c8921e5606';
const cleanQId = qId.replace(/[^a-zA-Z0-9_-]/g, '_');
const outFileName = `resgatada_${cleanQId}_osler.webp`;
const destPath = path.join(RESCUED_DIR, outFileName);

const webpBuf = fs.readFileSync('temp_osler_test.webp');
fs.writeFileSync(destPath, webpBuf);

async function deploy() {
  const storagePath = `resgatadas/${outFileName}`;
  const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
    contentType: 'image/webp',
    upsert: true
  });
  if (upErr) throw upErr;

  const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
  const publicUrl = pubData.publicUrl;

  db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
    .run(JSON.stringify([publicUrl]), qId);

  const cleanUuid = qId.replace('questions_', '');
  await supabase.from('questions').update({ images: [publicUrl] }).eq('id', cleanUuid);

  // Update catalog
  const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  cat.catalog = (cat.catalog || []).filter(c => c.id !== qId);
  fs.writeFileSync(catPath, JSON.stringify(cat, null, 2), 'utf8');

  // Update sync status
  let syncStatus = { synced_questions: {}, synced_images: {} };
  if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
  syncStatus.synced_questions[qId] = {
    public_urls: [publicUrl],
    synced_at: new Date().toISOString(),
    remote_table: 'questions',
    remote_updated: true
  };
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');

  console.log(`Deployed clean Osler image for ${qId}! URL: ${publicUrl}`);
  try {
    const r = await fetch('http://localhost:3336/api/reload-catalog');
    console.log('Dashboard reload:', await r.json());
  } catch {}
}

deploy().catch(console.error);
