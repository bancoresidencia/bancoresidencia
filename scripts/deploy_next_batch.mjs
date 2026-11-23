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

const items = [
  {
    qId: 'questions_88ec4797-fa68-5c04-ad4a-31c374667cff',
    url: 'https://medbrave.com.br/questions/enareenamed-2027-r1-2027/1789574954049_hx2l6h5lei_q89.png',
    headers: { 'Referer': 'https://www.medbrave.com.br/', 'User-Agent': 'Mozilla/5.0...' },
    outName: 'resgatada_questions_88ec4797_enare_q89.webp'
  },
  {
    qId: 'questions_951de5a3-531e-561e-9656-87e13c492c2e',
    url: 'https://lunar.cetrus.sanar.com.br/assets/dbb747cb-0cdc-4a18-a1e1-5b67083f464c.png',
    headers: { 'User-Agent': 'Mozilla/5.0...' },
    outName: 'resgatada_questions_951de5a3_impetigo.webp'
  }
];

async function run() {
  let catalogData = { catalog: [] };
  if (fs.existsSync(catPath)) {
    catalogData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  }

  let syncStatus = { synced_questions: {}, synced_images: {} };
  if (fs.existsSync(syncPath)) {
    syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
  }

  for (const item of items) {
    console.log(`Processing ${item.qId}...`);
    const res = await fetch(item.url, { headers: item.headers });
    const buf = Buffer.from(await res.arrayBuffer());

    const webpBuf = await sharp(buf).webp({ quality: 90 }).toBuffer();
    const destPath = path.join(RESCUED_DIR, item.outName);
    fs.writeFileSync(destPath, webpBuf);

    const storagePath = `resgatadas/${item.outName}`;
    const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
      contentType: 'image/webp',
      upsert: true
    });
    if (upErr) {
      console.error('Upload err:', upErr.message);
      continue;
    }

    const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
    const publicUrl = pubData.publicUrl;

    // Update SQLite
    db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
      .run(JSON.stringify([publicUrl]), item.qId);

    // Update Remote Supabase
    const cleanUuid = item.qId.replace('questions_', '');
    await supabase.from('questions').update({ images: [publicUrl] }).eq('id', cleanUuid);

    // Remove from catalog
    catalogData.catalog = (catalogData.catalog || []).filter(c => c.id !== item.qId);

    // Update syncStatus
    syncStatus.synced_questions[item.qId] = {
      public_urls: [publicUrl],
      synced_at: new Date().toISOString(),
      remote_table: 'questions',
      remote_updated: true
    };

    console.log(`Successfully rescued & deployed clean image for ${item.qId}! URL: ${publicUrl}`);
  }

  fs.writeFileSync(catPath, JSON.stringify(catalogData, null, 2), 'utf8');
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
  console.log('Saved catalog and sync status!');
}

run().catch(console.error);
