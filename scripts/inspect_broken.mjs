import { DatabaseSync } from 'node:sqlite';
import path from 'path';
import fs from 'fs';

const dbPath = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(dbPath);

const rows = db.prepare(`
  SELECT id, institution, year, specialty, subspecialty, statement, images, options, correct_answer
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

const broken = [];

for (const row of rows) {
  let imgs = [];
  try {
    imgs = JSON.parse(row.images);
  } catch (e) {
    if (typeof row.images === 'string' && row.images.length > 2) {
      imgs = [row.images];
    }
  }
  if (!Array.isArray(imgs) || imgs.length === 0) continue;

  const isRescued = imgs.some(img => typeof img === 'string' && img.includes('/resgatadas/'));
  if (isRescued) continue;

  // Check if all image paths are missing on disk
  let hasValid = false;
  for (const img of imgs) {
    if (typeof img !== 'string') continue;
    const clean = img.replace(/^\/+/, '');
    const pathsToCheck = [
      path.resolve(clean),
      path.resolve('public', clean),
      path.resolve('data/imagens_originais_gate6', path.basename(clean)),
      path.resolve('data/imagens_resgatadas_gate6', path.basename(clean)),
      path.resolve('data/imagens_higienizadas_medq', path.basename(clean)),
      path.resolve('data/imagens_convertidas_webp', path.basename(clean)),
      path.resolve('data/imagens_provaderesidencia', path.basename(clean))
    ];
    if (pathsToCheck.some(p => fs.existsSync(p))) {
      hasValid = true;
      break;
    }
  }

  if (!hasValid) {
    broken.push(row);
  }
}

console.log(`Total broken found: ${broken.length}`);

// Group by institution and year
const byInstYear = {};
const bySpecialty = {};

for (const b of broken) {
  const key = `${b.institution || 'SEM_BANCA'} ${b.year || 'SEM_ANO'}`;
  byInstYear[key] = (byInstYear[key] || 0) + 1;
  const spec = b.specialty || 'SEM_ESPECIALIDADE';
  bySpecialty[spec] = (bySpecialty[spec] || 0) + 1;
}

console.log('\n--- BY SPECIALTY ---');
console.log(JSON.stringify(bySpecialty, null, 2));

console.log('\n--- TOP INSTITUTION & YEAR ---');
const sortedInst = Object.entries(byInstYear).sort((a, b) => b[1] - a[1]);
console.log(JSON.stringify(sortedInst.slice(0, 30), null, 2));

fs.writeFileSync('data/broken_questions_list.json', JSON.stringify(broken, null, 2), 'utf8');
console.log(`\nSaved ${broken.length} broken questions to data/broken_questions_list.json`);
