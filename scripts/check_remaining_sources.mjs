import fs from 'fs';
import path from 'path';

const catalog = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8')).catalog || [];
console.log(`Remaining catalog count: ${catalog.length}`);

const HIGIENIZADAS_DIR = path.resolve('data/imagens_higienizadas_medq');
const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
const BANCO_GERAL_DIR = path.resolve('data/imagens_banco_geral');
const ORIGINAIS_MEDQ_DIR = path.resolve('data/imagens_medq_originais');
const PDR_DIR = path.resolve('data/imagens_provaderesidencia');

let localFound = 0;
let needsDownload = 0;
const toProcess = [];

for (const q of catalog) {
  const url = q.image_url || '';
  const cleanUrl = url.split('?')[0];
  const base = path.basename(cleanUrl);

  let foundPath = null;
  for (const d of [ORIGINAIS_MEDQ_DIR, BANCO_GERAL_DIR, HIGIENIZADAS_DIR, RESCUED_DIR, PDR_DIR]) {
    const p1 = path.join(d, base);
    if (fs.existsSync(p1)) { foundPath = p1; break; }
    const cleanBase = base.replace(/^clean_[a-f0-9]+_/, '');
    const p2 = path.join(d, cleanBase);
    if (fs.existsSync(p2)) { foundPath = p2; break; }
  }

  if (foundPath) {
    localFound++;
    toProcess.push({ id: q.id, sourcePath: foundPath, url, base, needDl: false });
  } else {
    needsDownload++;
    toProcess.push({ id: q.id, sourcePath: null, url, base, needDl: true });
  }
}

console.log(`Local files found: ${localFound}`);
console.log(`Needs download: ${needsDownload}`);
fs.writeFileSync('data/remaining_169_plan.json', JSON.stringify(toProcess, null, 2), 'utf8');
