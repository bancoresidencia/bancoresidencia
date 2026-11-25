import fs from 'fs';
import path from 'path';
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

const DIRS = [
  { dir: path.resolve('data/imagens_banco_geral'), sub: 'banco_geral' },
  { dir: path.resolve('data/imagens_provaderesidencia'), sub: 'provaderesidencia' },
  { dir: path.resolve('data/imagens_convertidas_webp'), sub: 'imagens_convertidas' },
  { dir: path.resolve('data/imagens_medq_originais'), sub: 'medq_originais' },
  { dir: path.resolve('data/sanar_media/webp'), sub: 'sanar_media' },
  { dir: path.resolve('data/imagens_resgatadas_gate6'), sub: 'resgatadas' }
];

function findFile(baseName, qId) {
  const candidates = [
    baseName,
    baseName.replace(/^clean_/, ''),
    baseName.replace(/_clean\.webp$/, '.webp'),
    baseName.replace(/^resgatada_/, '').replace(/_clean\.webp$/, '.webp'),
    baseName.replace(/^clean_questions_[a-f0-9-]+_/i, ''),
    baseName.replace(/^clean_[a-f0-9]+_/, '')
  ];

  for (const c of candidates) {
    for (const d of DIRS) {
      const p = path.join(d.dir, c);
      if (fs.existsSync(p)) return { fullPath: p, filename: c, sub: d.sub };
    }
  }

  // Check origMedq
  const origFiles = fs.readdirSync(DIRS[3].dir);
  const match = origFiles.find(f => f.includes(qId));
  if (match) return { fullPath: path.join(DIRS[3].dir, match), filename: match, sub: DIRS[3].sub };

  return null;
}

const rows = stagingDb.prepare(`
  SELECT id, institution, year, images 
  FROM questions_curated_staging 
  WHERE images LIKE '%_clean.webp%' OR images LIKE '%clean_%' OR images LIKE '%higienizada%'
`).all();

async function run() {
  console.log(`Reverting final ${rows.length} questions...`);

  for (const q of rows) {
    let urls = [];
    try { urls = JSON.parse(q.images); } catch { urls = [q.images]; }

    const newUrls = [];
    for (const u of urls) {
      const bn = path.basename(u.split('?')[0]);
      const found = findFile(bn, q.id);
      if (found) {
        const fileBytes = fs.readFileSync(found.fullPath);
        const storagePath = `${found.sub}/${found.filename}`;
        await supabase.storage.from('questoes').upload(storagePath, fileBytes, {
          contentType: 'image/webp',
          upsert: true
        });
        const { data } = supabase.storage.from('questoes').getPublicUrl(storagePath);
        newUrls.push(data.publicUrl);
        console.log(`✅ ${q.id} -> ${data.publicUrl}`);
      } else {
        console.warn(`❌ Not found for ${q.id}: ${bn}`);
      }
    }

    if (newUrls.length > 0) {
      stagingDb.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
        .run(JSON.stringify(newUrls), q.id);

      const rawId = q.id.replace(/^questions_/, '');
      await supabase.from('questions').update({ images: newUrls }).eq('id', rawId);
    }
  }

  console.log('Final 9 revert completed.');
}

run().catch(console.error);
