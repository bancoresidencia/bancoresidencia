import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const rawCat = JSON.parse(fs.readFileSync('data/supabase_tables/medq_watermark_catalog.json', 'utf8'));
const list = Array.isArray(rawCat) ? rawCat : (rawCat.catalog || rawCat.items || []);

console.log(`Auditing all ${list.length} catalog items for actual salmon/orange watermark pixels...`);

const HIGIENIZADAS_DIR = path.resolve('data/imagens_higienizadas_medq');
const RESCUED_DIR = path.resolve('data/imagens_resgatadas_gate6');
const BANCO_GERAL_DIR = path.resolve('data/imagens_banco_geral');
const PDR_DIR = path.resolve('data/imagens_provaderesidencia');

function findLocal(url) {
  if (!url) return null;
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

const distribution = {
  zero: 0,        // < 15 px
  faint: 0,       // 15 - 150 px
  moderate: 0,    // 150 - 1000 px
  heavy: 0,       // > 1000 px
  missing: 0
};

const cleanIds = [];
const trueWatermarkIds = [];

for (const q of list) {
  const fPath = findLocal(q.image_url);
  if (!fPath) {
    distribution.missing++;
    trueWatermarkIds.push(q);
    continue;
  }

  try {
    const { data, info } = await sharp(fPath).raw().toBuffer({ resolveWithObject: true });
    const channels = info.channels;
    let salmonCount = 0;

    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      // Carimbo/cruz MedQ: R > 175, R - B > 35, G > 75, R - G < 90
      if (r > 175 && (r - b) > 35 && g > 75 && (r - g) < 90) {
        salmonCount++;
      }
    }

    if (salmonCount < 15) {
      distribution.zero++;
      cleanIds.push({ id: q.id, salmonCount, reason: q.reason, fPath });
    } else if (salmonCount < 150) {
      distribution.faint++;
      trueWatermarkIds.push(q);
    } else if (salmonCount < 1000) {
      distribution.moderate++;
      trueWatermarkIds.push(q);
    } else {
      distribution.heavy++;
      trueWatermarkIds.push(q);
    }
  } catch {
    distribution.missing++;
    trueWatermarkIds.push(q);
  }
}

console.log('\nSalmon Pixel Distribution across catalog:');
console.log(distribution);
console.log(`\nVerified Clean Images (<15 salmon px): ${cleanIds.length}`);
console.log(`Confirmed Watermarked Images (Needs replacement/cleaning): ${trueWatermarkIds.length}`);

fs.writeFileSync('data/verified_clean_from_catalog.json', JSON.stringify(cleanIds, null, 2), 'utf8');
fs.writeFileSync('data/confirmed_watermarked_remaining.json', JSON.stringify(trueWatermarkIds, null, 2), 'utf8');
