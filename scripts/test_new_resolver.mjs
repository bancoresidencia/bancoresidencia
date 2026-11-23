import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

const HIGIENIZADAS_DIR = path.resolve('data/imagens_higienizadas_medq');
const ORIGINAIS_MEDQ_DIR = path.resolve('data/imagens_medq_originais');
const COMPARACOES_MEDQ_DIR = path.resolve('data/comparacoes_antes_depois_medq');
const CONVERTED_DIR = path.resolve('data/imagens_convertidas_webp');
const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
const PDR_DIR = path.resolve('data/imagens_provaderesidencia');
const BANCO_GERAL_DIR = path.resolve('data/imagens_banco_geral');
const MEDEVO_DOWNLOAD_DIR = path.resolve('data/imagens_medevo_download');
const EXTRACTED_DIR = path.resolve('data/extracted_images_webp');
const GINECO_DIR = path.resolve('public/images/questoes/ginecologia');
const URO_DIR = path.resolve('public/images/questoes/urologia');
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
  SELECT id, images FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

let brokenCount = 0;
const brokenQuestions = [];

for (const row of rows) {
  let imgs = [];
  try { imgs = JSON.parse(row.images); } catch { imgs = [row.images]; }
  if (!Array.isArray(imgs) || imgs.length === 0) continue;

  let isBroken = false;
  for (const img of imgs) {
    if (typeof img !== 'string') continue;
    if (img.includes('supabase.co/storage/v1/object/public/questoes/')) continue;
    const resolved = resolveLocalFile(img);
    if (!resolved) {
      isBroken = true;
      break;
    }
  }

  if (isBroken) {
    brokenCount++;
    brokenQuestions.push(row);
  }
}

console.log(`\n========================================`);
console.log(`TOTAL QUESTIONS CHECKED: ${rows.length}`);
console.log(`BROKEN QUESTIONS WITH UPDATED RESOLVER: ${brokenCount}`);
console.log(`========================================\n`);

if (brokenCount > 0) {
  console.log('Sample still broken:', brokenQuestions.slice(0, 5));
}
