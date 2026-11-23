import sharp from 'sharp';
import fs from 'fs';
import path from 'path';
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

const qId = 'questions_189c4b71-935f-4e3f-8744-78f5cd102f2d';

const imgUrls = {
  stmt: 'https://lunar.cetrus.sanar.com.br/assets/a934aa60-24ca-43d1-b18b-63768b2aae49.png',
  A: 'https://lunar.cetrus.sanar.com.br/assets/ee28611f-9a2d-48f9-b050-a67dc7ebb814.png',
  B: 'https://lunar.cetrus.sanar.com.br/assets/d7ee11c7-7c96-440d-a526-9cdb9e8b54a9.png',
  C: 'https://lunar.cetrus.sanar.com.br/assets/74550322-3a5f-4fad-bd38-9158f9d33834.png',
  D: 'https://lunar.cetrus.sanar.com.br/assets/de627a50-7f1c-407b-9443-25680224ad19.png'
};

async function rescueUspSp1() {
  console.log(`Rescuing USP-SP 2026 pediatric ITU question ${qId}...`);
  const uploadedUrls = {};

  for (const [key, url] of Object.entries(imgUrls)) {
    const res = await fetch(url);
    const buf = Buffer.from(await res.arrayBuffer());
    const webpBuf = await sharp(buf).webp({ quality: 90 }).toBuffer();

    const fileName = `resgatada_${qId}_${key}.webp`;
    const destPath = path.join(RESCUED_DIR, fileName);
    fs.writeFileSync(destPath, webpBuf);

    const storagePath = `resgatadas/${fileName}`;
    const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
      contentType: 'image/webp',
      upsert: true
    });
    if (upErr) throw upErr;

    const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
    uploadedUrls[key] = pubData.publicUrl;
    console.log(`Uploaded ${key} -> ${pubData.publicUrl}`);
  }

  // Update Options in SQLite
  const row = db.prepare('SELECT options FROM questions_curated_staging WHERE id = ?').get(qId);
  const opts = JSON.parse(row.options);
  opts.forEach(opt => {
    if (uploadedUrls[opt.letter]) {
      opt.text = uploadedUrls[opt.letter];
    }
  });

  const stmtImages = [uploadedUrls.stmt];

  // 1. Update SQLite
  db.prepare('UPDATE questions_curated_staging SET images = ?, options = ? WHERE id = ?')
    .run(JSON.stringify(stmtImages), JSON.stringify(opts), qId);

  // 2. Update Remote Supabase
  const cleanUuid = qId.replace('questions_', '');
  await supabase.from('questions').update({
    images: stmtImages,
    options: opts
  }).eq('id', cleanUuid);

  // 3. Remove from catalog
  if (fs.existsSync(catPath)) {
    const catalogData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
    catalogData.catalog = (catalogData.catalog || []).filter(c => c.id !== qId);
    fs.writeFileSync(catPath, JSON.stringify(catalogData, null, 2), 'utf8');
  }

  // 4. Update syncStatus
  if (fs.existsSync(syncPath)) {
    const syncStatus = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
    syncStatus.synced_questions[qId] = {
      public_urls: stmtImages,
      synced_at: new Date().toISOString(),
      remote_table: 'questions',
      remote_updated: true
    };
    fs.writeFileSync(syncPath, JSON.stringify(syncStatus, null, 2), 'utf8');
  }

  console.log(`USP-SP 2026 ${qId} completely rescued and updated!`);
}

rescueUspSp1().catch(console.error);
