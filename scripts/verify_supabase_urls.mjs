import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`
  SELECT id, images FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const medqWatermarkSet = new Set();
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8')).catalog || [];
cat.forEach(i => medqWatermarkSet.add(i.id));
medqWatermarkSet.add('questions_66a08e3e-6c58-41bd-8375-c97250110c13');

const cleanSupabaseUrls = [];

for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  const isWatermarked = medqWatermarkSet.has(r.id) || imgs.some(u => typeof u === 'string' && u.includes('imagens_medq_originais'));
  if (isWatermarked) continue;

  for (const img of imgs) {
    if (typeof img === 'string' && img.includes('supabase.co')) {
      cleanSupabaseUrls.push({ qId: r.id, url: img });
    }
  }
}

console.log(`Total clean Supabase URLs found in DB: ${cleanSupabaseUrls.length}`);

// Test 20 random URLs
async function testUrls() {
  const sample = [];
  for (let i = 0; i < 20; i++) {
    const idx = Math.floor(Math.random() * cleanSupabaseUrls.length);
    sample.push(cleanSupabaseUrls[idx]);
  }

  let okCount = 0;
  for (const item of sample) {
    try {
      const res = await fetch(item.url, { method: 'HEAD' });
      if (res.ok) {
        okCount++;
      } else {
        console.warn(`HTTP ${res.status} for ${item.url}`);
      }
    } catch (e) {
      console.error(`Fetch err for ${item.url}:`, e.message);
    }
  }

  console.log(`Tested 20 URLs: ${okCount}/20 returned HTTP 200 OK!`);
}

testUrls().catch(console.error);
