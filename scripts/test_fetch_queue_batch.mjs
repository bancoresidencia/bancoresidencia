import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
  const trimmed = l.trim();
  if (!trimmed || trimmed.startsWith('#')) return;
  const [k, ...v] = trimmed.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
const catPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');

const queueMatches = JSON.parse(fs.readFileSync('data/sanar_queue_matches.json', 'utf8'));
const sample = queueMatches.slice(0, 10);

console.log(`Testing batch fetch and rescue on first 10 queue matches with exact regex...`);

const HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
};

async function runPilot() {
  let catalogData = { catalog: [] };
  if (fs.existsSync(catPath)) {
    catalogData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  }
  const removedIds = new Set();

  let syncStatus = { synced_questions: {}, synced_images: {} };
  if (fs.existsSync(syncPath)) {
    syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
  }

  let successCount = 0;

  for (const item of sample) {
    try {
      console.log(`\nFetching ${item.qId} -> ${item.sanar_url}`);
      const pageRes = await fetch(item.sanar_url, { headers: HEADERS });
      if (!pageRes.ok) {
        console.warn(`Failed to fetch page: ${pageRes.status}`);
        continue;
      }

      const html = await pageRes.text();
      // Match exact Cetrus / Lunar asset URLs
      const matches = html.match(/https:\/\/lunar\.cetrus\.sanar\.com\.br\/assets\/[a-f0-9\-]+\.(?:png|jpg|jpeg|webp)/gi) || [];
      const assetUrls = [...new Set(matches)];

      if (assetUrls.length === 0) {
        console.warn(`No clinical image found on page for ${item.qId}`);
        continue;
      }

      console.log(`Found ${assetUrls.length} clinical image asset(s):`, assetUrls);

      const imgBuffers = [];
      for (const u of assetUrls) {
        const res = await fetch(u, { headers: HEADERS });
        if (res.ok) {
          imgBuffers.push(Buffer.from(await res.arrayBuffer()));
        }
      }

      if (imgBuffers.length === 0) continue;

      let webpBuf = null;
      if (imgBuffers.length === 1) {
        webpBuf = await sharp(imgBuffers[0]).webp({ quality: 90 }).toBuffer();
      } else {
        const metas = await Promise.all(imgBuffers.map(b => sharp(b).metadata()));
        const maxWidth = Math.max(...metas.map(m => m.width));
        const totalHeight = metas.reduce((sum, m) => sum + m.height, 0) + (imgBuffers.length - 1) * 16;

        let currentTop = 0;
        const composites = [];
        for (let i = 0; i < imgBuffers.length; i++) {
          const m = metas[i];
          composites.push({
            input: imgBuffers[i],
            top: currentTop,
            left: Math.floor((maxWidth - m.width) / 2)
          });
          currentTop += m.height + 16;
        }

        webpBuf = await sharp({
          create: {
            width: maxWidth,
            height: totalHeight,
            channels: 4,
            background: { r: 255, g: 255, b: 255, alpha: 1 }
          }
        })
        .composite(composites)
        .webp({ quality: 90 })
        .toBuffer();
      }

      const cleanQId = item.qId.replace(/[^a-zA-Z0-9_-]/g, '_');
      const outFileName = `resgatada_${cleanQId}_queue.webp`;
      const destPath = path.join(RESCUED_DIR, outFileName);
      fs.writeFileSync(destPath, webpBuf);

      const storagePath = `resgatadas/${outFileName}`;
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

      removedIds.add(item.qId);
      syncStatus.synced_questions[item.qId] = {
        public_urls: [publicUrl],
        synced_at: new Date().toISOString(),
        remote_table: 'questions',
        remote_updated: true
      };

      successCount++;
      console.log(`✅ [${successCount}] Successfully deployed clean image for ${item.qId}! URL: ${publicUrl}`);
    } catch (err) {
      console.error(`Error on ${item.qId}:`, err.message);
    }
  }

  // Update catalog and syncStatus
  catalogData.catalog = (catalogData.catalog || []).filter(c => !removedIds.has(c.id));
  fs.writeFileSync(catPath, JSON.stringify(catalogData, null, 2), 'utf8');
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');

  console.log(`\n========================================`);
  console.log(`PILOT FINISHED: ${successCount}/10 questions cleanly rescued!`);
  console.log(`========================================\n`);

  // Reload dashboard catalog
  try {
    const r = await fetch('http://localhost:3336/api/reload-catalog');
    console.log('Dashboard reload response:', await r.json());
  } catch {}
}

runPilot().catch(console.error);
