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

const goldMatches = JSON.parse(fs.readFileSync('data/sanar_gold_matches.json', 'utf8'));
console.log(`Starting high-speed deployment of ${goldMatches.length} clean Sanar images...`);

let catalogData = { catalog: [] };
if (fs.existsSync(catPath)) {
  catalogData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
}
const catIdsToRemove = new Set();

let syncStatus = { synced_questions: {}, synced_images: {} };
if (fs.existsSync(syncPath)) {
  syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
}

async function runDeploy() {
  const CONCURRENCY = 15;
  let completed = 0;
  let errors = 0;

  const updateStagingStmt = db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?');

  // Process concurrent batches
  for (let i = 0; i < goldMatches.length; i += CONCURRENCY) {
    const chunk = goldMatches.slice(i, i + CONCURRENCY);
    await Promise.all(chunk.map(async (m) => {
      try {
        const srcFile = path.resolve(m.local_webp_path);
        if (!fs.existsSync(srcFile)) {
          errors++;
          return;
        }

        const cleanQId = m.qId.replace(/[^a-zA-Z0-9_-]/g, '_');
        const outFileName = `resgatada_${cleanQId}_clean.webp`;
        const destFile = path.join(RESCUED_DIR, outFileName);

        fs.copyFileSync(srcFile, destFile);

        const storagePath = `resgatadas/${outFileName}`;
        const fileBuf = fs.readFileSync(destFile);

        // Upload to Supabase Storage
        const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, fileBuf, {
          contentType: 'image/webp',
          upsert: true
        });

        if (upErr) {
          errors++;
          return;
        }

        const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
        const publicUrl = pubData.publicUrl;

        // 1. Update SQLite staging
        updateStagingStmt.run(JSON.stringify([publicUrl]), m.qId);

        // 2. Update Remote Supabase
        const cleanUuid = m.qId.replace('questions_', '');
        await supabase.from('questions').update({ images: [publicUrl] }).eq('id', cleanUuid);

        // 3. Mark for catalog removal
        catIdsToRemove.add(m.qId);

        // 4. Update sync status in memory
        syncStatus.synced_questions[m.qId] = {
          public_urls: [publicUrl],
          synced_at: new Date().toISOString(),
          remote_table: 'questions',
          remote_updated: true
        };

        completed++;
      } catch (err) {
        errors++;
      }
    }));

    process.stdout.write(`Progress: ${completed}/${goldMatches.length} (Errors: ${errors})\r`);
  }

  console.log(`\nDeployment finished: ${completed} deployed successfully, ${errors} errors.`);

  // Write catalog and syncStatus
  catalogData.catalog = (catalogData.catalog || []).filter(c => !catIdsToRemove.has(c.id));
  fs.writeFileSync(catPath, JSON.stringify(catalogData, null, 2), 'utf8');
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
  console.log('Saved catalog and sync status!');

  // Trigger reload on dashboard
  try {
    const res = await fetch('http://localhost:3336/api/reload-catalog');
    const d = await res.json();
    console.log('Dashboard catalog reload response:', d);
  } catch (e) {
    console.warn('Could not reload dashboard automatically:', e.message);
  }
}

runDeploy().catch(console.error);
