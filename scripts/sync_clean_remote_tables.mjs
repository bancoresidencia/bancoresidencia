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

const cleanToSync = [];
for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  if (!Array.isArray(imgs) || imgs.length === 0) continue;

  const isWatermarked = medqWatermarkSet.has(r.id) || imgs.some(u => typeof u === 'string' && u.includes('imagens_medq_originais'));
  if (!isWatermarked) {
    cleanToSync.push({ id: r.id, images: imgs, source_tables: r.source_tables });
  }
}

console.log(`Auditing remote table sync for ${cleanToSync.length} clean questions...`);

const validTables = ['questions', 'questions_expansion_direto', 'questions_expansion_r_plus', 'questions_expansion_revalida', 'questions_expansion_titulo_especialista'];

// Group by target table
const byTable = {};
for (const q of cleanToSync) {
  let sourceTable = 'questions';
  try {
    const st = JSON.parse(q.source_tables || '[]');
    if (Array.isArray(st) && st.length > 0) sourceTable = st[0];
  } catch {}

  let cleanId = q.id;
  for (const vt of validTables) {
    if (cleanId.startsWith(vt + '_')) {
      cleanId = cleanId.replace(vt + '_', '');
      sourceTable = vt;
      break;
    }
  }

  if (cleanId.startsWith('pdr_')) continue; // local pdr questions not in remote supabase tables

  if (!byTable[sourceTable]) byTable[sourceTable] = [];
  byTable[sourceTable].push({ fullId: q.id, cleanId, images: q.images });
}

console.log('Clean questions grouped by remote table:');
for (const [tbl, list] of Object.entries(byTable)) {
  console.log(`  Table ${tbl}: ${list.length} questions`);
}

// Batch sync to remote tables in chunks of 50
async function syncRemote() {
  let totalUpdated = 0;
  let totalErrors = 0;

  for (const [tbl, list] of Object.entries(byTable)) {
    console.log(`\nSyncing table: ${tbl} (${list.length} items)...`);
    
    // Process in batches
    const BATCH_SIZE = 50;
    for (let i = 0; i < list.length; i += BATCH_SIZE) {
      const batch = list.slice(i, i + BATCH_SIZE);
      const promises = batch.map(async (item) => {
        try {
          const { error } = await supabase
            .from(tbl)
            .update({ images: item.images })
            .eq('id', item.cleanId);
          if (error) {
            totalErrors++;
          } else {
            totalUpdated++;
          }
        } catch {
          totalErrors++;
        }
      });
      await Promise.all(promises);
      process.stdout.write(`  Processed ${Math.min(i + BATCH_SIZE, list.length)}/${list.length}...\r`);
    }
    console.log(`\nTable ${tbl} complete.`);
  }

  console.log(`\n========================================`);
  console.log(`SYNC FINISHED: ${totalUpdated} updated, ${totalErrors} errors`);
  console.log(`========================================\n`);
}

syncRemote().catch(console.error);
