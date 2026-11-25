import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const matches = JSON.parse(fs.readFileSync('data/sanar_all_matches_complete.json', 'utf8'));
const sanarSet = new Set(matches.map(m => m.question_id));

const allQ = stagingDb.prepare(`
  SELECT id, images, institution, year 
  FROM questions_curated_staging 
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const BANCO_GERAL_DIR = path.resolve('data/imagens_banco_geral');
const PDR_DIR = path.resolve('data/imagens_provaderesidencia');
const CONVERTED_DIR = path.resolve('data/imagens_convertidas_webp');
const ORIG_MEDQ_DIR = path.resolve('data/imagens_medq_originais');

// Cache directory file listings for fast lookup
const bancoGeralFiles = fs.readdirSync(BANCO_GERAL_DIR);
const pdrFiles = fs.readdirSync(PDR_DIR);
const convertedFiles = fs.readdirSync(CONVERTED_DIR);
const origMedqFiles = fs.readdirSync(ORIG_MEDQ_DIR);

function findOriginalFile(qId, currentUrl) {
  const cleanUrl = currentUrl.split('?')[0];
  const baseName = path.basename(cleanUrl);

  // 1. Check in orig_medq
  const origMedqMatch = origMedqFiles.find(f => f.includes(qId) || f === `orig_${qId}_${baseName}` || f === `orig_${baseName}`);
  if (origMedqMatch) {
    return { dir: ORIG_MEDQ_DIR, filename: origMedqMatch, sub: 'medq_originais' };
  }

  // 2. Candidate basenames
  const candidateBases = [
    baseName,
    baseName.replace(/_clean\.webp$/, '.webp'),
    baseName.replace(/^resgatada_/, ''),
    baseName.replace(/^clean_/, ''),
    baseName.replace(/^clean_questions_[a-zA-Z0-9_-]+_/, ''),
    baseName.replace(/^clean_[a-zA-Z0-9_-]+_/, '')
  ];

  for (const b of candidateBases) {
    if (fs.existsSync(path.join(BANCO_GERAL_DIR, b))) {
      return { dir: BANCO_GERAL_DIR, filename: b, sub: 'banco_geral' };
    }
    if (fs.existsSync(path.join(PDR_DIR, b))) {
      return { dir: PDR_DIR, filename: b, sub: 'provaderesidencia' };
    }
    if (fs.existsSync(path.join(CONVERTED_DIR, b))) {
      return { dir: CONVERTED_DIR, filename: b, sub: 'imagens_convertidas' };
    }
  }

  // 3. Search banco_geral with partial slug
  const slugPart = baseName.replace(/^[a-f0-9]+_/, '').replace(/\.webp$/, '').slice(0, 40);
  if (slugPart.length > 10) {
    const bgMatch = bancoGeralFiles.find(f => f.includes(slugPart));
    if (bgMatch) return { dir: BANCO_GERAL_DIR, filename: bgMatch, sub: 'banco_geral' };
  }

  return null;
}

let needsReversionCount = 0;
let inSanarCount = 0;
let resolvedOriginalCount = 0;
const unresolved = [];
const revertPlan = [];

for (const q of allQ) {
  const imgsStr = q.images || '';
  const isBlurredOrInpainted = imgsStr.includes('_clean.webp') || imgsStr.includes('clean_') || imgsStr.includes('higienizada');

  if (isBlurredOrInpainted) {
    needsReversionCount++;
    if (sanarSet.has(q.id)) {
      inSanarCount++;
      // Will be handled by Sanar deployment
    } else {
      let urls = [];
      try {
        urls = JSON.parse(imgsStr);
      } catch {
        urls = [imgsStr];
      }

      let allResolved = true;
      const originalFiles = [];
      for (const u of urls) {
        const found = findOriginalFile(q.id, u);
        if (found) {
          originalFiles.push(found);
        } else {
          allResolved = false;
        }
      }

      if (allResolved && originalFiles.length > 0) {
        resolvedOriginalCount++;
        revertPlan.push({
          question_id: q.id,
          current_images: urls,
          original_files: originalFiles
        });
      } else {
        unresolved.push({ id: q.id, images: urls });
      }
    }
  }
}

console.log(`--- INPAINT/BLUR AUDIT ---`);
console.log(`Total questions with inpaint/blur: ${needsReversionCount}`);
console.log(`Handled by Sanar authentic substitution: ${inSanarCount}`);
console.log(`Non-Sanar needing reversion to crisp original: ${needsReversionCount - inSanarCount}`);
console.log(`  - Successfully resolved original crisp file: ${resolvedOriginalCount}`);
console.log(`  - Unresolved: ${unresolved.length}`);

if (unresolved.length > 0) {
  console.log('\nSample unresolved (first 5):', JSON.stringify(unresolved.slice(0, 5), null, 2));
}

fs.writeFileSync('data/revert_inpaint_plan.json', JSON.stringify(revertPlan, null, 2), 'utf8');
console.log(`Saved revert plan for ${revertPlan.length} questions to data/revert_inpaint_plan.json.`);
