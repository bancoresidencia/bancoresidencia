import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
sharp.cache(false);
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

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

const qId = 'questions_1550514f-0e3f-484a-b90a-efe9764e5788';
const sanarLocalWebp = path.resolve('data/sanar_media/webp/e9f041016597025c6e93115791d6155a04bd986df2e5a805322e2a1c84e3e9f6.webp');

const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
if (!fs.existsSync(RESCUED_DIR)) fs.mkdirSync(RESCUED_DIR, { recursive: true });

async function run() {
  console.log(`Deploying clean Sanar image for target question ${qId}...`);
  const webpBuf = await sharp(fs.readFileSync(sanarLocalWebp))
    .webp({ quality: 90, effort: 5 })
    .toBuffer();

  const outFileName = `resgatada_${qId}_sanar.webp`;
  const localDest = path.join(RESCUED_DIR, outFileName);
  fs.writeFileSync(localDest, webpBuf);

  // Upload to Supabase Storage
  const storagePath = `resgatadas/${outFileName}`;
  const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
    contentType: 'image/webp',
    upsert: true
  });
  if (upErr) throw upErr;

  const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
  const publicUrl = pubData.publicUrl;
  console.log('Uploaded to Supabase Storage:', publicUrl);

  // Update SQLite local SSOT
  stagingDb.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
    .run(JSON.stringify([publicUrl]), qId);
  console.log('Updated SQLite staging table questions_curated_staging.');

  // Update Remote Supabase
  const rawId = qId.replace(/^questions_/, '');
  const { error: remErr } = await supabase.from('questions').update({ images: [publicUrl] }).eq('id', rawId);
  if (remErr) {
    console.warn('Remote update warn:', remErr.message);
  } else {
    console.log('Updated remote Supabase table questions.');
  }

  // Update catalog if present
  const catPath = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
  if (fs.existsSync(catPath)) {
    const cat = JSON.parse(fs.readFileSync(catPath, 'utf8'));
    cat.catalog = cat.catalog.filter(c => c.id !== qId);
    cat.total_items = cat.catalog.length;
    fs.writeFileSync(catPath, JSON.stringify(cat, null, 2), 'utf8');
    console.log('Removed from catalog.');
  }

  // Also remove from image_watermark_decisions.json if present
  const decPath = path.resolve('data/supabase_tables/image_watermark_decisions.json');
  if (fs.existsSync(decPath)) {
    const dec = JSON.parse(fs.readFileSync(decPath, 'utf8'));
    if (dec.medq_actions && dec.medq_actions[qId]) {
      dec.medq_actions[qId] = {
        action: 'substituted_sanar',
        substituted_url: publicUrl,
        timestamp: new Date().toISOString()
      };
      fs.writeFileSync(decPath, JSON.stringify(dec, null, 2), 'utf8');
      console.log('Updated decisions JSON.');
    }
  }

  console.log('SUCCESS! Target question cleanly substituted with authentic Sanar image.');
}

run().catch(e => {
  console.error('Fatal error:', e);
  process.exit(1);
});
