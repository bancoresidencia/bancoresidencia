import { DatabaseSync } from 'node:sqlite';
import path from 'node:path';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

console.log('--- VERIFICANDO SE IMAGENS DA COLUNA IMAGES SÃO DAS OPÇÕES ---');

const rows = db.prepare(`
  SELECT id, images, options
  FROM questions_curated_staging
  WHERE images IS NOT NULL AND length(images) > 4
`).all();

let countOverlap = 0;
let countPureStatementImgs = 0;
let countPureOptionImgs = 0;

for (const r of rows) {
  let colImgs = [];
  try { colImgs = JSON.parse(r.images || '[]'); } catch {}
  if (!Array.isArray(colImgs)) colImgs = [colImgs];

  let optImgs = [];
  try {
    const opts = JSON.parse(r.options || '[]');
    if (Array.isArray(opts)) {
      for (const o of opts) {
        if (o.text && o.text.includes('/storage/')) optImgs.push(o.text.trim());
        if (Array.isArray(o.images)) {
          o.images.forEach(u => optImgs.push(typeof u === 'string' ? u.trim() : u?.url?.trim()));
        }
      }
    }
  } catch {}

  const hasOptImgs = optImgs.length > 0;
  const hasColImgs = colImgs.length > 0;

  if (hasOptImgs && hasColImgs) {
    // Check if the URLs in colImgs match optImgs
    const intersection = colImgs.filter(u => optImgs.includes(u));
    if (intersection.length > 0) {
      countOverlap++;
    } else {
      countPureStatementImgs++;
    }
  } else if (hasColImgs) {
    countPureStatementImgs++;
  } else if (hasOptImgs) {
    countPureOptionImgs++;
  }
}

console.log(`Questões com imagens estritamente no statement: ${countPureStatementImgs}`);
console.log(`Questões com imagens que sobrepõem opções e coluna: ${countOverlap}`);
console.log(`Questões com imagens puramente nas opções: ${countPureOptionImgs}`);

