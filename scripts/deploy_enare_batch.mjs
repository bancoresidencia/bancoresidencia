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

const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
const catPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const syncPath = path.resolve('data/supabase_tables/supabase_sync_status.json');

const itemsToDeploy = [
  {
    qId: 'questions_29adac0f-e8dc-5b19-a48d-e9fc66cc1352',
    localWebp: 'data/sample_q81_clean.webp',
    outName: 'resgatada_questions_29adac0f_enare_q81.webp'
  },
  {
    qId: 'questions_2eb4e682-ae4c-5e7d-9bc1-fd31b0fe9398',
    localWebp: 'data/sample_q37_burn_clean.webp',
    outName: 'resgatada_questions_2eb4e682_enare_q37.webp'
  }
];

async function deployBatch() {
  let catalogData = { catalog: [] };
  if (fs.existsSync(catPath)) {
    catalogData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
  }

  let syncStatus = { synced_questions: {}, synced_images: {} };
  if (fs.existsSync(syncPath)) {
    syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
  }

  for (const item of itemsToDeploy) {
    const destPath = path.join(RESCUED_DIR, item.outName);
    fs.copyFileSync(path.resolve(item.localWebp), destPath);

    const storagePath = `resgatadas/${item.outName}`;
    const fileBuf = fs.readFileSync(destPath);

    console.log(`Uploading ${item.qId} -> ${storagePath}...`);
    const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, fileBuf, {
      contentType: 'image/webp',
      upsert: true
    });
    if (upErr) {
      console.error('Upload error:', upErr.message);
      continue;
    }

    const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
    const publicUrl = pubData.publicUrl;
    console.log(`Public URL: ${publicUrl}`);

    // Update SQLite
    db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
      .run(JSON.stringify([publicUrl]), item.qId);

    // Update Remote Supabase
    const cleanUuid = item.qId.replace('questions_', '');
    await supabase.from('questions').update({ images: [publicUrl] }).eq('id', cleanUuid);

    // Remove from watermark catalog
    catalogData.catalog = (catalogData.catalog || []).filter(c => c.id !== item.qId);

    // Update syncStatus
    syncStatus.synced_questions[item.qId] = {
      public_urls: [publicUrl],
      synced_at: new Date().toISOString(),
      remote_table: 'questions',
      remote_updated: true
    };

    console.log(`Successfully deployed clean image for ${item.qId}!`);
  }

  fs.writeFileSync(catPath, JSON.stringify(catalogData, null, 2), 'utf8');
  fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
  console.log('\nAll catalog and syncStatus files updated successfully!');
}

deployBatch().catch(console.error);
