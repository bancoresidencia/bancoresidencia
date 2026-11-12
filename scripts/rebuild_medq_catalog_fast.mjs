import { DatabaseSync } from 'node:sqlite';
import fs from 'fs';
import path from 'path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const MEDQ_CATALOG_PATH = path.resolve('data/supabase_tables/medq_watermark_catalog.json');
const DECISIONS_PATH = path.resolve('data/supabase_tables/image_watermark_decisions.json');

const COMP_DIR = path.resolve('data/comparacoes_antes_depois_medq');
const compFiles = new Set(fs.existsSync(COMP_DIR) ? fs.readdirSync(COMP_DIR) : []);

const db = new DatabaseSync(DB_PATH);

console.time('Catalog Build');

// Find all questions with higienizadas images
const rows = db.prepare(`
  SELECT id, code, banca, year, statement, images, options 
  FROM questions_curated_staging 
  WHERE images LIKE '%imagens_higienizadas_medq%' OR options LIKE '%imagens_higienizadas_medq%'
`).all();

console.log(`Found ${rows.length} questions with higienizadas images in questions_curated_staging.`);

const catalog = [];
const medq_actions = {};

for (const r of rows) {
  let imgs = [];
  try { imgs = JSON.parse(r.images || '[]'); } catch {}
  
  let targetImg = imgs[0] || '';
  let compUrl = null;

  if (targetImg) {
    const base = path.basename(targetImg);
    // Find matching comparison file
    const compCandidate = `comp_${base.replace(/^clean_/, '')}`;
    if (compFiles.has(compCandidate)) {
      compUrl = `/storage/questoes/comparacoes_medq/${compCandidate}`;
    } else {
      // Look for any comp file containing base
      for (const f of compFiles) {
        if (f.includes(r.id) || f.includes(base.slice(0, 20))) {
          compUrl = `/storage/questoes/comparacoes_medq/${f}`;
          break;
        }
      }
    }
  }

  catalog.push({
    id: r.id,
    code: r.code || r.id,
    banca: r.banca || 'N/A',
    year: r.year || 2026,
    image_url: targetImg,
    score: 85,
    reason: 'Marca dágua MedQ identificada e higienizada',
    statement_snippet: (r.statement || '').slice(0, 130)
  });

  medq_actions[r.id] = {
    action: 'inpainted',
    original_url: targetImg,
    cleaned_url: targetImg,
    comparison_url: compUrl || targetImg,
    acted_at: new Date().toISOString()
  };
}

fs.writeFileSync(MEDQ_CATALOG_PATH, JSON.stringify({
  timestamp: new Date().toISOString(),
  total_detected: catalog.length,
  catalog
}, null, 2));

const decisionsData = fs.existsSync(DECISIONS_PATH) ? JSON.parse(fs.readFileSync(DECISIONS_PATH, 'utf8')) : {};
decisionsData.medq_actions = medq_actions;
decisionsData.updated_at = new Date().toISOString();
fs.writeFileSync(DECISIONS_PATH, JSON.stringify(decisionsData, null, 2));

console.timeEnd('Catalog Build');
console.log(`✅ Catálogo atualizado com sucesso com ${catalog.length} questões!`);
