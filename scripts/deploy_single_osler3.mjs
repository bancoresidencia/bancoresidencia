import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');

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

const questionId = 'questions_445aca61-4415-4894-969e-ef3110c3481d';
const oslerUrl = 'https://oslermedicina.com.br/questoes/fmusp-2026-bf176b635eb24770a8533603a13b9793';

const pageRes = await fetch(oslerUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
const html = await pageRes.text();
const match = html.match(/\/api\/images\/content\/[^\s"'<>]+/i);
if (!match) throw new Error('No image found in Osler page');

const imgUrl = 'https://oslermedicina.com.br' + match[0];
console.log('Downloading:', imgUrl);

const res = await fetch(imgUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } });
const buf = Buffer.from(await res.arrayBuffer());
const webpBuf = await sharp(buf).webp({ quality: 90 }).toBuffer();

const outName = `resgatada_${questionId}_osler.webp`;
const localPath = path.resolve(`data/imagens_resgatadas_gate6/${outName}`);
fs.writeFileSync(localPath, webpBuf);

const storagePath = `resgatadas/${outName}`;
const { error: upErr } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, { contentType: 'image/webp', upsert: true });
if (upErr) throw upErr;

const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
const publicUrl = pubData.publicUrl;

db.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?').run(JSON.stringify([publicUrl]), questionId);
const cleanId = questionId.replace('questions_', '');
await supabase.from('questions').update({ images: [publicUrl] }).eq('id', cleanId);

// Update catalog
const catPath = 'data/supabase_tables/medq_watermark_catalog.json';
const catData = JSON.parse(fs.readFileSync(catPath, 'utf8'));
catData.catalog = (catData.catalog || []).filter(c => c.id !== questionId);
catData.total_items = catData.catalog.length;
fs.writeFileSync(catPath, JSON.stringify(catData, null, 2));

// Update sync
const syncPath = 'data/supabase_tables/supabase_sync_status.json';
const syncData = JSON.parse(fs.readFileSync(syncPath, 'utf8'));
syncData.synced_questions[questionId] = {
  public_urls: [publicUrl],
  synced_at: new Date().toISOString(),
  remote_table: 'questions',
  remote_updated: true
};
fs.writeFileSync(syncPath, JSON.stringify(syncData, null, 2));

console.log(`✅ Successfully deployed ${questionId} -> ${publicUrl}`);
await fetch('http://localhost:3336/api/reload-catalog', { method: 'POST' });
