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

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
};

const itemsToDeploy = [
  {
    qId: 'questions_fa8be022-55fa-4c2a-92cf-b9690003c2c5',
    imgUrls: [
      'https://lunar.cetrus.sanar.com.br/assets/a07575c4-c106-4fc1-b4d5-92f70df064f0.png'
    ]
  },
  {
    qId: 'questions_e68df009-f60a-4b02-ab84-c95ee3f79171',
    imgUrls: [
      'https://oslermedicina.com.br/api/images/content/residencia_FMUSP_2026_R1_Q55_img1.png?q=56c6e954-a9ac-4733-b003-a49603b53eb7'
    ]
  }
];

async function run() {
  const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  let syncStatus = { synced_questions: {}, synced_images: {} };
  if (fs.existsSync(syncPath)) syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));

  for (const item of itemsToDeploy) {
    console.log(`Processing ${item.qId}...`);
    const buffers = [];
    for (const u of item.imgUrls) {
      const res = await fetch(u, { headers: HEADERS });
      if (res.ok) buffers.push(Buffer.from(await res.arrayBuffer()));
    }

    if (buffers.length === 0) {
      console.error(`Failed to fetch images for ${item.qId}`);
      continue;
    }

    let webpBuf = null;
    if (buffers.length === 1) {
      webpBuf = await sharp(buffers[0]).webp({ quality: 90 }).toBuffer();
    } else {
      const metas = await Promise.all(buffers.map(b => sharp(b).metadata()));
      const maxWidth = Math.max(...metas.map(m => m.width));
      const totalHeight = metas.reduce((sum, m) => sum + m.height, 0) + (buffers.length - 1) * 16;
      let currentTop = 0;
      const composites = [];
      for (let i = 0; i < buffers.length; i++) {
        composites.push({
          input: buffers[i],
          top: currentTop,
          left: Math.floor((maxWidth - metas[i].width) / 2)
        });
        currentTop += metas[i].height + 16;
      }
      webpBuf = await sharp({
        create: {
          width: maxWidth,
          height: totalHeight,
          channels: 4,
          background: { r: 255, g: 255, b: 255, alpha: 1 }
        }
      }).composite(composites).webp({ quality: 90 }).toBuffer();
    }

    const cleanQId = item.qId.replace(/[^a-zA-Z0-9_-]/g, '_');
    const outFileName = `resgatada_${cleanQId}_gold.webp`;
    const destPath = path.join(RESCUED_DIR, outFileName);
    fs.writeFileSync(destPath, webpBuf);

    const storagePath = `resgatadas/${outFileName}`;
    const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
      contentType: 'image/webp',
      upsert: true
    });
    if (upErr) {
      console.error('Storage upload error:', upErr);
      continue;
    }

    const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
    const publicUrl = pubData.publicUrl;

    db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
      .run(JSON.stringify([publicUrl]), item.qId);

    const cleanUuid = item.qId.replace('questions_', '');
    await supabase.from('questions').update({ images: [publicUrl] }).eq('id', cleanUuid);

    cat.catalog = (cat.catalog || []).filter(c => c.id !== item.qId);
    syncStatus.synced_questions[item.qId] = {
      public_urls: [publicUrl],
      synced_at: new Date().toISOString(),
      remote_table: 'questions',
      remote_updated: true
    };

    console.log(`✅ Deployed ${item.qId} -> ${publicUrl}`);
  }

  fs.writeFileSync(catPath, JSON.stringify(cat, null, 2), 'utf8');
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');

  try {
    const r = await fetch('http://localhost:3336/api/reload-catalog');
    console.log('Dashboard reload:', await r.json());
  } catch {}
}

run().catch(console.error);
