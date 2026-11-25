import fs from 'fs';
import path from 'path';

const dec = JSON.parse(fs.readFileSync('data/supabase_tables/image_watermark_decisions.json', 'utf8'));
const medqActions = dec.medq_actions || {};

const matches = JSON.parse(fs.readFileSync('data/sanar_all_matches_complete.json', 'utf8'));
const sanarSet = new Set(matches.map(m => m.question_id));

let inSanar = 0;
let foundOrigMedq = 0;
let foundConverted = 0;
let foundPdr = 0;
let notFound = 0;

for (const [qid, action] of Object.entries(medqActions)) {
  if (action.action !== 'inpainted') continue;

  if (sanarSet.has(qid)) {
    inSanar++;
    continue;
  }

  const origUrl = action.original_url || '';
  const baseName = path.basename(origUrl.split('?')[0]);

  const pMedqOrig = `data/imagens_medq_originais/orig_${qid}_${baseName}`;
  const pConverted = `data/imagens_convertidas_webp/${baseName}`;
  const pPdr = `data/imagens_provaderesidencia/${baseName}`;

  if (fs.existsSync(pMedqOrig)) {
    foundOrigMedq++;
  } else if (fs.existsSync(pConverted)) {
    foundConverted++;
  } else if (fs.existsSync(pPdr)) {
    foundPdr++;
  } else {
    notFound++;
    if (notFound <= 5) {
      console.log(`Still not found: ${qid} -> ${baseName}`);
    }
  }
}

console.log(`Inpainted in Sanar: ${inSanar}`);
console.log(`Found in imagens_medq_originais: ${foundOrigMedq}`);
console.log(`Found in imagens_convertidas_webp: ${foundConverted}`);
console.log(`Found in imagens_provaderesidencia: ${foundPdr}`);
console.log(`Not found: ${notFound}`);
