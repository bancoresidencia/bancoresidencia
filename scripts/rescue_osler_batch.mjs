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

const itemsToRescue = [
  {
    id: 'questions_expansion_r_plus_6c575ae0-f1d4-5f89-b4a6-25b6689f5d98',
    redirect: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQG2-UFQvjwwgNY-hr5y8kpw8ZO_7UvUqSYwdYbxHBzcef3tcIGnG-QeRr3pzzK6n5PUV51a8SuaBTsYgwAEyVtowFjOl55KjZgiI0fXIZcfyiEgvKMcfOs_PD8JVWcMT2W0pOIQlEVlCeBiiDgt0BbzK42iSskPqHB06EnPIsEgXUD39hQVhg3deTs='
  },
  {
    id: 'questions_expansion_r_plus_7727be3c-cfce-5f96-b7d1-7377a85ffade',
    redirect: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQH71LkfDCmzQEBQgeoiz6FcvsaHeHvOpmoroRw18sRdPx9vaVip_EZjotvWPtT5mge9tqJ4ZzJsS9vbpYbbdNstvbqXFWvcZs7EdOKl27_av06mSktJqEgLUinrQ-Qz3LLaj-6uojJp5HilnOqfWOdwTHZt1x_S4aA5-BCT_laVXJSRjFpb9L9Rs_c='
  },
  {
    id: 'questions_expansion_r_plus_b696b567-5ea3-50b2-9ba4-1cf0d5708238',
    redirect: 'https://vertexaisearch.cloud.google.com/grounding-api-redirect/AUZIYQHGtm7GR7u8hv6CiYmgSFtntxqPhwMPNHF4LeSXEGqgeNXr9aFbsXY7upHjKclFJh2P9eGs7pPtEIp0wY0GZs7D1I7-G8dnU-euGTWLWlneRrY3Ut91PlxGBEHJej1gJpNvG7b4eZmEhd4oTUrhtSaJg9YkpOoFmI8d3ZF3THYh2g7qWPRPcZHmcz78'
  }
];

let syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
let catalogData = JSON.parse(fs.readFileSync(catalogPath, 'utf8'));

for (const item of itemsToRescue) {
  try {
    console.log(`\nResolving redirect for ${item.id}...`);
    const headRes = await fetch(item.redirect, { redirect: 'manual' });
    const targetUrl = headRes.headers.get('location');
    console.log('Target URL:', targetUrl);
    if (!targetUrl || !targetUrl.includes('oslermedicina.com.br')) {
      console.log('Not an Osler URL, skipping.');
      continue;
    }

    const pageRes = await fetch(targetUrl, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
    });
    const html = await pageRes.text();

    const cdnMatches = [...html.matchAll(/\/api\/images\/content\/[^\s"'>]+/gi)];
    if (cdnMatches.length === 0) {
      console.log('No /api/images/content/ found in page');
      continue;
    }

    const cdnRelPath = cdnMatches[0][0];
    const fullImgUrl = `https://oslermedicina.com.br${cdnRelPath}`;
    console.log('Found image:', fullImgUrl);

    const imgRes = await fetch(fullImgUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Referer': 'https://oslermedicina.com.br/'
      }
    });

    const buf = Buffer.from(await imgRes.arrayBuffer());
    const webpBuf = await sharp(buf).webp({ quality: 90, effort: 5 }).toBuffer();
    const outName = `resgatada_${item.id}_osler.webp`;
    const localPath = path.join(RESCUED_DIR, outName);
    fs.writeFileSync(localPath, webpBuf);

    const storagePath = `resgatadas/${outName}`;
    const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
      contentType: 'image/webp',
      upsert: true
    });
    if (upErr) throw upErr;

    const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
    const publicUrl = pubData.publicUrl;

    // Update SQLite
    db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?').run(JSON.stringify([publicUrl]), item.id);

    // Update Remote Supabase Table
    const qRow = db.prepare('SELECT source_tables FROM questions_curated_staging WHERE id = ?').get(item.id);
    let sourceTable = 'questions_expansion_r_plus';
    if (qRow && qRow.source_tables) {
      try {
        const arr = JSON.parse(qRow.source_tables);
        if (Array.isArray(arr) && arr[0]) sourceTable = arr[0];
      } catch {}
    }
    const cleanRemoteId = item.id.replace(/^[a-z_]+_/, '');
    const { error: remErr } = await supabase.from(sourceTable).update({ images: [publicUrl] }).eq('id', cleanRemoteId);

    // Update syncStatus & medq_catalog
    syncStatus.synced_questions[item.id] = {
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

    catalogData.catalog = (catalogData.catalog || []).filter(c => c.id !== item.id);
    console.log(`✅ Rescued ${item.id} -> ${publicUrl} (Remote: ${!remErr})`);
  } catch (err) {
    console.error(`❌ Error on ${item.id}:`, err.message);
  }
}

fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2));
catalogData.total_items = catalogData.catalog.length;
fs.writeFileSync(catalogPath, JSON.stringify(catalogData, null, 2));
console.log(`Finished Osler batch. Catalog total: ${catalogData.total_items}`);

try {
  await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
} catch {}
