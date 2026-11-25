import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
sharp.cache(false);
import { DatabaseSync } from 'node:sqlite';

const db = new DatabaseSync('data/supabase_tables/supabase_tables.db');
const rows = db.prepare(`
  SELECT id, banca, year, images, statement 
  FROM questions_curated_staging 
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

console.log('Total de questoes cadastradas:', rows.length);

const DIRS = [
  path.resolve('data/imagens_resgatadas_gate6'),
  path.resolve('data/imagens_banco_geral'),
  path.resolve('data/imagens_convertidas_webp'),
  path.resolve('data/imagens_provaderesidencia'),
  path.resolve('data/imagens_higienizadas_medq'),
  path.resolve('data/imagens_medevo_download')
];

function findLocal(url) {
  if (!url) return null;
  const base = path.basename(url.split('?')[0]);
  for (const d of DIRS) {
    const p = path.join(d, base);
    if (fs.existsSync(p)) return p;
    const p2 = path.join(d, base.replace(/^clean_[a-f0-9]+_/, ''));
    if (fs.existsSync(p2)) return p2;
  }
  return null;
}

async function fastScan() {
  const flagged = [];
  let checked = 0;
  const startTime = Date.now();

  for (const r of rows) {
    checked++;
    let imgs = [];
    try { imgs = JSON.parse(r.images); } catch { imgs = [r.images]; }
    if (!imgs.length) continue;

    const local = findLocal(imgs[0]);
    if (!local) continue;

    try {
      // Redimensiona para thumbnail 250x250 para detecção ultrarrápida (100x mais rápido)
      const { data, info } = await sharp(local)
        .resize(200, 200, { fit: 'inside' })
        .raw()
        .toBuffer({ resolveWithObject: true });

      const w = info.width, h = info.height, ch = info.channels;
      if (ch < 3) continue;

      let salmonCount = 0;
      // Região central 60%
      const minX = Math.floor(w * 0.20), maxX = Math.floor(w * 0.80);
      const minY = Math.floor(h * 0.20), maxY = Math.floor(h * 0.80);

      for (let y = minY; y < maxY; y++) {
        for (let x = minX; x < maxX; x++) {
          const idx = (y * w + x) * ch;
          const red = data[idx], green = data[idx + 1], blue = data[idx + 2];
          // Marca salmão MedQ clássica ou escura
          if (red > 150 && (red - blue) > 25 && green > 65 && (red - green) < 95) {
            salmonCount++;
          }
        }
      }

      if (salmonCount >= 10) {
        flagged.push({
          id: r.id,
          banca: r.banca,
          year: r.year,
          file: path.basename(local),
          fullPath: local,
          image_url: imgs[0],
          salmonCount
        });
      }
    } catch {}

    if (checked % 1000 === 0) {
      console.log(`Scan: ${checked}/${rows.length} em ${((Date.now() - startTime)/1000).toFixed(1)}s | Flagged: ${flagged.length}`);
    }
  }

  console.log(`\n======================================================`);
  console.log(`VARREDURA ULTRARRÁPIDA CONCLUÍDA em ${((Date.now() - startTime)/1000).toFixed(1)}s:`);
  console.log(`Total checados: ${checked}`);
  console.log(`Total de imagens com marca salmão real detectada: ${flagged.length}`);
  console.log(`======================================================\n`);

  fs.writeFileSync('data/real_salmon_all_6883.json', JSON.stringify(flagged, null, 2), 'utf8');
  console.log('Salvo em data/real_salmon_all_6883.json');
}

fastScan().catch(console.error);
