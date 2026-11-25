import fs from 'fs';
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const matches = JSON.parse(fs.readFileSync('data/sanar_all_matches_complete.json', 'utf8'));
const sanarSet = new Set(matches.map(m => m.question_id));

// Find all questions in DB that currently use imagens_higienizadas_medq OR have medq_actions
const dec = JSON.parse(fs.readFileSync('data/supabase_tables/image_watermark_decisions.json', 'utf8'));
const medqActions = dec.medq_actions || {};

console.log(`Checking questions that had inpainting...`);

let inpaintedInSanar = 0;
let inpaintedNotInSanar = 0;
let origFileFound = 0;
let origFileMissing = 0;

for (const [qid, action] of Object.entries(medqActions)) {
  if (action.action !== 'inpainted') continue;

  if (sanarSet.has(qid)) {
    inpaintedInSanar++;
  } else {
    inpaintedNotInSanar++;
    // Check if original file exists
    const origUrl = action.original_url || '';
    const baseName = origUrl.replace('/storage/questoes/', '').split('?')[0];
    
    // Check possible locations
    const cand1 = `data/imagens_convertidas_webp/${baseName}`;
    const cand2 = `data/imagens_provaderesidencia/${baseName}`;
    const cand3 = `data/imagens_medq_originais/orig_${qid}_${baseName}`;

    if (fs.existsSync(cand1) || fs.existsSync(cand2) || fs.existsSync(cand3)) {
      origFileFound++;
    } else {
      origFileMissing++;
      if (origFileMissing <= 5) {
        console.log(`Missing original for ${qid}: ${origUrl}`);
      }
    }
  }
}

console.log(`Inpainted questions that CAN be substituted by Sanar: ${inpaintedInSanar}`);
console.log(`Inpainted questions NOT in Sanar: ${inpaintedNotInSanar}`);
console.log(`  - Original un-blurred file found: ${origFileFound}`);
console.log(`  - Original un-blurred file missing: ${origFileMissing}`);
