import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
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
const catalogPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');

const qId = 'questions_41af5ab1-6c90-43f5-9a37-c0f8d636244f';
const imgUrl = 'https://oslermedicina.com.br/api/images/content/residencia_FMUSP_2021_R+PED_Q21_img1.png?q=0c64ccfd-01cd-4c01-8238-7721f1ea4c1a';

console.log('Fetching Osler image...');
const imgRes = await fetch(imgUrl, {
  headers: {
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
    'Referer': 'https://oslermedicina.com.br/'
  }
});

const buf = Buffer.from(await imgRes.arrayBuffer());
console.log('Downloaded size:', buf.length);

const webpBuf = await sharp(buf).webp({ quality: 90, effort: 5 }).toBuffer();
const outName = `resgatada_${qId}_osler.webp`;
const localPath = path.join(RESCUED_DIR, outName);
fs.writeFileSync(localPath, webpBuf);
console.log('Saved local WebP:', localPath, webpBuf.length);

const storagePath = `resgatadas/${outName}`;
const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
  contentType: 'image/webp',
  upsert: true
});

if (upErr) throw upErr;
const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
const publicUrl = pubData.publicUrl;
console.log('Uploaded Supabase:', publicUrl);

// Update SQLite
db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?').run(JSON.stringify([publicUrl]), qId);

// Update Remote Supabase Table
const qRow = db.prepare('SELECT source_tables FROM questions_curated_staging WHERE id = ?').get(qId);
let sourceTable = 'questions';
if (qRow && qRow.source_tables) {
  try {
    const arr = JSON.parse(qRow.source_tables);
    if (Array.isArray(arr) && arr[0]) sourceTable = arr[0];
  } catch {}
}
const { error: remErr } = await supabase.from(sourceTable).update({ images: [publicUrl] }).eq('id', qId.replace(/^[a-z_]+_/, ''));
console.log(`Updated remote table ${sourceTable}:`, !remErr);

// Update syncStatus & medq_catalog
const syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
syncStatus.synced_questions[qId] = {
  public_urls: [publicUrl],
  synced_at: new Date().toISOString(),
  remote_table: sourceTable,
  remote_updated: !remErr
};
syncStatus.synced_images[outName] = {
  public_url: publicUrl,
  storage_path: storagePath,
  uploaded_at: new Date().toISOString(),
  size: webpBuf.length
};
fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2));

const catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));
catalogData.catalog = (catalogData.catalog || []).filter(item => item.id !== qId);
catalogData.total_items = catalogData.catalog.length;
fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2));

console.log('Catalog pruned. New catalog count:', catalogData.total_items);
await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
console.log('Dashboard notified!');
