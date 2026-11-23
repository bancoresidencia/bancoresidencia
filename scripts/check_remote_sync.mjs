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
const medqWatermarkSet = new Set();
const cat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8')).catalog || [];
cat.forEach(i => medqWatermarkSet.add(i.id));
medqWatermarkSet.add('questions_66a08e3e-6c58-41bd-8375-c97250110c13');

const rows = db.prepare(`
  SELECT id, images, source_tables
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const cleanQuestions = [];
for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  const isWatermarked = medqWatermarkSet.has(r.id) || imgs.some(u => typeof u === 'string' && u.includes('imagens_medq_originais'));
  if (!isWatermarked) {
    cleanQuestions.push(r);
  }
}

console.log(`Total clean questions: ${cleanQuestions.length}`);

// Sample 10 clean questions and check remote Supabase table
async function checkRemote() {
  const sample = cleanQuestions.slice(0, 10);
  for (const q of sample) {
    let sourceTable = 'questions';
    try {
      const parsed = JSON.parse(q.source_tables || '[]');
      if (Array.isArray(parsed) && parsed.length > 0) sourceTable = parsed[0];
    } catch {}

    const { data, error } = await supabase.from(sourceTable).select('id, images').eq('id', q.id).maybeSingle();
    if (error) {
      console.error(`Error querying ${sourceTable} for ${q.id}:`, error.message);
    } else if (!data) {
      console.warn(`Question ${q.id} not found in ${sourceTable}`);
    } else {
      console.log(`[${sourceTable}] ${q.id} -> Remote images:`, data.images);
    }
  }
}

checkRemote().catch(console.error);
