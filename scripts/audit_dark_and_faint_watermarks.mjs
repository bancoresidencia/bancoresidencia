import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { DatabaseSync } from 'node:sqlite';

const DB_PATH = path.resolve('data/supabase_tables/supabase_tables.db');
const db = new DatabaseSync(DB_PATH);

const rows = db.prepare(`
  SELECT id, banca, year, images, statement 
  FROM questions_curated_staging 
  WHERE images IS NOT NULL AND images != '[]' AND images != ''
`).all();

console.log('Total de questoes cadastradas com imagem:', rows.length);

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

async function runAudit() {
  const flagged = [];
  let checked = 0;
  let missing = 0;

  for (const r of rows) {
    checked++;
    let imgs = [];
    try { imgs = JSON.parse(r.images); } catch { imgs = [r.images]; }
    if (!imgs.length) continue;

    const imgUrl = imgs[0];
    const localFile = findLocal(imgUrl);
    if (!localFile) {
      missing++;
      continue;
    }

    try {
      const { data, info } = await sharp(localFile).raw().toBuffer({ resolveWithObject: true });
      const w = info.width, h = info.height, ch = info.channels;
      if (ch < 3) continue;

      // Amostragem de bordas
      let grayDiffSum = 0, borderCount = 0;
      for (let y = 0; y < h; y += 8) {
        for (let x = 0; x < w; x += 8) {
          if (x < w * 0.15 || x > w * 0.85 || y < h * 0.15 || y > h * 0.85) {
            const idx = (y * w + x) * ch;
            grayDiffSum += Math.abs(data[idx] - data[idx+1]) + Math.abs(data[idx+1] - data[idx+2]);
            borderCount++;
          }
        }
      }
      const isGrayscale = (grayDiffSum / (borderCount || 1)) < 6.0;

      const minX = Math.floor(w * 0.28), maxX = Math.floor(w * 0.72);
      const minY = Math.floor(h * 0.25), maxY = Math.floor(h * 0.75);

      let faintSalmonCount = 0;
      let grayscaleWarmCount = 0;

      for (let y = minY; y < maxY; y += 2) {
        for (let x = minX; x < maxX; x += 2) {
          const idx = (y * w + x) * ch;
          const red = data[idx], green = data[idx+1], blue = data[idx+2];

          // 1. Marca salmao de media luminancia (fundo escuro/medio que escapou do r > 175)
          if (red > 90 && red <= 175 && (red - blue) >= 20 && (red - green) >= 6 && (red - green) < 65) {
            faintSalmonCount++;
          }

          // 2. Marca sobreposta em radiografia/PB
          if (isGrayscale) {
            if (red > 45 && (red - blue) >= 4 && (red - green) >= 2) {
              grayscaleWarmCount++;
            }
          }
        }
      }

      if (faintSalmonCount > 35 || grayscaleWarmCount > 35) {
        flagged.push({
          id: r.id,
          banca: r.banca,
          year: r.year,
          file: path.basename(localFile),
          fullPath: localFile,
          image_url: imgUrl,
          statementSnippet: (r.statement || '').slice(0, 100),
          isGrayscale,
          faintSalmonCount,
          grayscaleWarmCount
        });
      }
    } catch {}

    if (checked % 1000 === 0) {
      console.log(`Auditados ${checked}/${rows.length}... Flagged: ${flagged.length}`);
    }
  }

  console.log(`\n==============================================`);
  console.log(`AUDITORIA MULTIESPECTRAL CONCLUIDA:`);
  console.log(`Total checados: ${checked}`);
  console.log(`Nao encontrados localmente: ${missing}`);
  console.log(`Questoes com marcas residuais fracas/escuras detectadas: ${flagged.length}`);
  console.log(`==============================================`);
  fs.writeFileSync('data/faint_watermarks_detected.json', JSON.stringify(flagged, null, 2), 'utf8');
  console.log('Salvo em data/faint_watermarks_detected.json');
  for (const item of flagged.slice(0, 10)) {
    console.log(`- ${item.id} (${item.banca} ${item.year}): faint=${item.faintSalmonCount}, grayWarm=${item.grayscaleWarmCount}, gray=${item.isGrayscale}`);
  }
}

runAudit().catch(console.error);
