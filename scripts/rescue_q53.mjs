import sharp from 'sharp';
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

async function processQ53() {
  const qId = 'questions_54750f61-099c-506d-a3d8-05fc1818db17';
  const u = 'https://medbrave.com.br/questions/enareenamed-2027-r1-2027/1789574943392_fvkwunr4hg_q53.png';

  console.log(`Fetching clean image for ${qId}...`);
  const res = await fetch(u, { headers: { 'Referer': 'https://www.medbrave.com.br/', 'User-Agent': 'Mozilla/5.0...' } });
  const rawBuf = Buffer.from(await res.arrayBuffer());

  const webpBuf = await sharp(rawBuf).webp({ quality: 90 }).toBuffer();
  const outName = 'resgatada_questions_54750f61_enare_q53.webp';
  const destPath = path.join(RESCUED_DIR, outName);
  fs.writeFileSync(destPath, webpBuf);

  const storagePath = `resgatadas/${outName}`;
  console.log(`Uploading to Supabase Storage: ${storagePath}...`);
  const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
    contentType: 'image/webp',
    upsert: true
  });
  if (upErr) throw upErr;

  const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
  const publicUrl = pubData.publicUrl;
  console.log('Public URL:', publicUrl);

  // 1. Update SQLite
  db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
    .run(JSON.stringify([publicUrl]), qId);

  // 2. Update Remote Supabase
  const cleanUuid = qId.replace('questions_', '');
  await supabase.from('questions').update({ images: [publicUrl] }).eq('id', cleanUuid);

  // 3. Update Watermark Catalog
  if (fs.existsSync(catPath)) {
    const catalogData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
    catalogData.catalog = (catalogData.catalog || []).filter(c => c.id !== qId);
    fs.writeFileSync(catPath, JSON.stringify(catalogData, null, 2), 'utf8');
  }

  // 4. Update syncStatus
  if (fs.existsSync(syncPath)) {
    const syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
    syncStatus.synced_questions[qId] = {
      public_urls: [publicUrl],
      synced_at: new Date().toISOString(),
      remote_table: 'questions',
      remote_updated: true
    };
    fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
  }

  console.log(`Successfully rescued ${qId}!`);
}

processQ53().catch(console.error);
