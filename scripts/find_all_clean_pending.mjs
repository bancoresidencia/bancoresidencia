import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const MEDQ_CATALOG_PATH = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const db = new DatabaseSync(DB_PATH);

const medqWatermarkSet = new Set();
if (fs.existsSync(MEDQ_CATALOG_PATH)) {
  const cat = JSON.parse(fs.readFileSync(MEDQ_CATALOG_PATH, 'utf8')).catalog || [];
  cat.forEach(i => medqWatermarkSet.add(i.id));
}
medqWatermarkSet.add('questions_66a08e3e-6c58-41bd-8375-c97250110c13');

const HIGIENIZADAS_DIR = path.resolve('data/imagens_higienizadas_medq');
const GINECO_DIR = path.resolve('public/images/questoes/ginecologia');
const URO_DIR = path.resolve('public/images/questoes/urologia');
const PDR_DIR = path.resolve('data/imagens_provaderesidencia');
const BANCO_GERAL_DIR = path.resolve('data/imagens_banco_geral');
const CONVERTED_DIR = path.resolve('data/imagens_convertidas_webp');
const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
const EXTRACTED_DIR = path.resolve('data/extracted_images_webp');
const MEDEVO_DOWNLOAD_DIR = path.resolve('data/imagens_medevo_download');
const ORIGINAIS_MEDQ_DIR = path.resolve('data/imagens_medq_originais');
const COMPARACOES_MEDQ_DIR = path.resolve('data/comparacoes_antes_depois_medq');
const PUBLIC_DIR = path.resolve('public');

function resolveLocalFile(rawUrl) {
  if (!rawUrl) return null;
  const cleanUrl = rawUrl.split('?')[0];
  const baseName = path.basename(cleanUrl);

  const directPublic = path.resolve(PUBLIC_DIR, cleanUrl.replace(/^\/+/, ''));
  if (fs.existsSync(directPublic)) {
    const parent = path.basename(path.dirname(directPublic));
    return { fullPath: directPublic, baseName, subFolder: parent || 'questoes' };
  }

  const candidates = [
    { dir: HIGIENIZADAS_DIR, sub: 'imagens_higienizadas_medq' },
    { dir: GINECO_DIR, sub: 'ginecologia' },
    { dir: URO_DIR, sub: 'urologia' },
    { dir: PDR_DIR, sub: 'provaderesidencia' },
    { dir: BANCO_GERAL_DIR, sub: 'banco_geral' },
    { dir: CONVERTED_DIR, sub: 'imagens_convertidas' },
    { dir: RESCUED_DIR, sub: 'resgatadas' },
    { dir: EXTRACTED_DIR, sub: 'extracted' },
    { dir: MEDEVO_DOWNLOAD_DIR, sub: 'medevo' },
    { dir: ORIGINAIS_MEDQ_DIR, sub: 'medq_originais' },
    { dir: COMPARACOES_MEDQ_DIR, sub: 'comparacoes_medq' }
  ];

  for (const c of candidates) {
    const fPath = path.join(c.dir, baseName);
    if (fs.existsSync(fPath)) {
      return { fullPath: fPath, baseName, subFolder: c.sub };
    }
  }

  const cleanBase = baseName.replace(/^clean_[a-f0-9]+_/, '');
  for (const c of candidates) {
    const fPath = path.join(c.dir, cleanBase);
    if (fs.existsSync(fPath)) {
      return { fullPath: fPath, baseName: cleanBase, subFolder: c.sub };
    }
  }

  return null;
}

const rows = db.prepare(`
  SELECT id, images, source_tables
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const allCleanPendingSync = [];

for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch { imgs = [r.images]; }
  if (!Array.isArray(imgs) || imgs.length === 0) continue;

  const isWatermarked = medqWatermarkSet.has(r.id) || imgs.some(u => typeof u === 'string' && u.includes('imagens_medq_originais'));
  if (isWatermarked) continue;

  const needsUpload = imgs.some(u => typeof u === 'string' && !u.includes('supabase.co'));
  if (!needsUpload) continue;

  let allResolved = true;
  for (const img of imgs) {
    if (typeof img === 'string' && !img.includes('supabase.co')) {
      const loc = resolveLocalFile(img);
      if (!loc) {
        allResolved = false;
        break;
      }
    }
  }

  if (allResolved) {
    allCleanPendingSync.push({
      id: r.id,
      images: imgs,
      source_tables: r.source_tables
    });
  }
}

console.log(`TOTAL CLEAN QUESTIONS WITH IMAGES TO SYNC: ${allCleanPendingSync.length}`);
fs.writeFileSync('data/all_clean_pending_sync.json', JSON.stringify(allCleanPendingSync, null, 2), 'utf8');
