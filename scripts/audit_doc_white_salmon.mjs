import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const rawCat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = Array.isArray(rawCat) ? rawCat : (rawCat.catalog || rawCat.items || []);

const docWhite = list.filter(q => (q.reason || '').includes('Documento em fundo branco com carimbo cinza central'));
console.log(`Auditing ${docWhite.length} "doc white" images with Sharp...`);

const HIGIENIZADAS_DIR = path.resolve('data/imagens_higienizadas_medq');
const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
const BANCO_GERAL_DIR = path.resolve('data/imagens_banco_geral');
const PDR_DIR = path.resolve('data/imagens_provaderesidencia');

function findLocal(url) {
  const base = path.basename(url.split('?')[0]);
  for (const d of [HIGIENIZADAS_DIR, RESCUED_DIR, BANCO_GERAL_DIR, PDR_DIR]) {
    const p = path.join(d, base);
    if (fs.existsSync(p)) return p;
    const cleanBase = base.replace(/^clean_[a-f0-9]+_/, '');
    const p2 = path.join(d, cleanBase);
    if (fs.existsSync(p2)) return p2;
  }
  return null;
}

let zeroSalmon = 0;
let withSalmon = 0;
const cleanList = [];
const dirtyList = [];

for (const q of docWhite) {
  const fPath = findLocal(q.image_url);
  if (!fPath) continue;

  const { data, info } = await sharp(fPath).raw().toBuffer({ resolveWithObject: true });
  const channels = info.channels;
  let salmonCount = 0;

  for (let i = 0; i < data.length; i += channels) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    // MedQ salmon watermark: R > 175, R - B > 35, G > 75, R - G < 90
    if (r > 175 && (r - b) > 35 && g > 75 && (r - g) < 90) {
      salmonCount++;
    }
  }

  if (salmonCount < 10) {
    zeroSalmon++;
    cleanList.push({ id: q.id, fPath, salmonCount });
  } else {
    withSalmon++;
    dirtyList.push({ id: q.id, fPath, salmonCount });
  }
}

console.log(`\nRESULTS:`);
console.log(`Zero / negligible salmon pixels (Completely Clean): ${zeroSalmon}`);
console.log(`Contains salmon pixels (Legitimate Watermark): ${withSalmon}`);

if (dirtyList.length > 0) {
  console.log('\nSample dirty images:', dirtyList.slice(0, 5));
}
