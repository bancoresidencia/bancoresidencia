import { DatabaseSync } from 'node:sqlite';
import fs from 'node:fs';
import path from 'node:path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const MANIFEST_PATH = path.resolve('data/supabase_tables/gate1_conversion_manifest.json');

const db = new DatabaseSync(DB_PATH);

console.log('='.repeat(80));
console.log('🚀 APLICANDO ATUALIZAÇÕES DO GATE 1 & GATE 2 NA STAGING');
console.log('='.repeat(80));

if (!fs.existsSync(MANIFEST_PATH)) {
  console.error('❌ Manifesto do Gate 1 não encontrado:', MANIFEST_PATH);
  process.exit(1);
}

const manifestData = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf-8'));
const conversions = manifestData.manifest || [];

console.log(`Carregadas ${conversions.length} conversões do Gate 1.`);

// Mapeamento de URL antiga -> Novo nome canônico WebP
const urlReplacementMap = new Map();

for (const c of conversions) {
  // O arquivo convertido está salvo em data/imagens_convertidas_webp/{c.converted_file}
  // No storage canônico, será uma URL segura .webp
  urlReplacementMap.set(c.original_url, {
    new_filename: c.converted_file,
    local_path: c.converted_path
  });
}

// Também mapear as 1.136 URLs do PDR
const pdrRows = db.prepare('SELECT url, local_path, questao_id FROM provaderesidencia_imagens_arquivo').all();
for (const p of pdrRows) {
  const baseName = path.basename(p.local_path);
  urlReplacementMap.set(p.url, {
    new_filename: baseName,
    local_path: p.local_path
  });
}

console.log(`Total de URLs no mapa de substituição: ${urlReplacementMap.size}`);

// Iniciar transação atômica
db.exec('BEGIN TRANSACTION');

try {
  let updatedQuestions = 0;
  let updatedOptions = 0;

  const rows = db.prepare(`
    SELECT id, images, statement, options
    FROM questions_curated_staging
    WHERE (images IS NOT NULL AND images != '[]' AND images != '')
       OR (options LIKE '%http%')
  `).all();

  const updateStmt = db.prepare(`
    UPDATE questions_curated_staging
    SET images = ?, options = ?
    WHERE id = ?
  `);

  for (const r of rows) {
    let imagesChanged = false;
    let optionsChanged = false;

    // 1. Atualizar coluna images
    let newImages = r.images;
    if (r.images) {
      try {
        let imgs = JSON.parse(r.images);
        if (Array.isArray(imgs)) {
          const mapped = imgs.map(u => {
            if (typeof u === 'string' && urlReplacementMap.has(u.trim())) {
              imagesChanged = true;
              const rep = urlReplacementMap.get(u.trim());
              return `/storage/questoes/${rep.new_filename}`;
            }
            return u;
          });
          if (imagesChanged) newImages = JSON.stringify(mapped);
        }
      } catch {
        if (typeof r.images === 'string' && urlReplacementMap.has(r.images.trim())) {
          imagesChanged = true;
          const rep = urlReplacementMap.get(r.images.trim());
          newImages = JSON.stringify([`/storage/questoes/${rep.new_filename}`]);
        }
      }
    }

    // 2. Atualizar opções com URLs antigas
    let newOptions = r.options;
    if (r.options && r.options.includes('http')) {
      try {
        const opts = JSON.parse(r.options);
        if (Array.isArray(opts)) {
          for (const opt of opts) {
            if (opt.text && urlReplacementMap.has(opt.text.trim())) {
              optionsChanged = true;
              const rep = urlReplacementMap.get(opt.text.trim());
              opt.text = `/storage/questoes/${rep.new_filename}`;
            }
            if (Array.isArray(opt.images)) {
              opt.images = opt.images.map(img => {
                const u = typeof img === 'string' ? img : img?.url;
                if (u && urlReplacementMap.has(u.trim())) {
                  optionsChanged = true;
                  const rep = urlReplacementMap.get(u.trim());
                  return `/storage/questoes/${rep.new_filename}`;
                }
                return img;
              });
            }
          }
          if (optionsChanged) newOptions = JSON.stringify(opts);
        }
      } catch {}
    }

    if (imagesChanged || optionsChanged) {
      updateStmt.run(newImages, newOptions, r.id);
      if (imagesChanged) updatedQuestions++;
      if (optionsChanged) updatedOptions++;
    }
  }

  db.exec('COMMIT');
  console.log(`✅ Sucesso! Atualizadas ${updatedQuestions} questões na coluna images e ${updatedOptions} em opções.`);

} catch (err) {
  db.exec('ROLLBACK');
  console.error('❌ Erro durante atualização! Rollback executado:', err);
  process.exit(1);
}

