import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
sharp.cache(false);
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const listPath = path.resolve('data/confirmed_grayscale_medq.json');
const DIRS = [
  path.resolve('data/imagens_resgatadas_gate6'),
  path.resolve('data/imagens_banco_geral'),
  path.resolve('data/imagens_convertidas_webp'),
  path.resolve('data/imagens_provaderesidencia'),
  path.resolve('data/imagens_higienizadas_medq'),
  path.resolve('data/imagens_medevo_download')
];

function findLocal(filename) {
  if (!filename) return null;
  const base = path.basename(filename.split('?')[0]);
  for (const d of DIRS) {
    const p = path.join(d, base);
    if (fs.existsSync(p)) return p;
    const p2 = path.join(d, base.replace(/^clean_[a-f0-9]+_/, ''));
    if (fs.existsSync(p2)) return p2;
  }
  return null;
}

async function cleanGrayscaleResiduals() {
  if (!fs.existsSync(listPath)) {
    console.error('Lista confirmed_grayscale_medq.json não encontrada.');
    return;
  }

  const items = JSON.parse(fs.readFileSync(listPath, 'utf8'));
  console.log(`\n🚀 INICIANDO HIGIENIZAÇÃO DE ${items.length} EXAMES P&B COM MARCAS SALMÃO RESIDUAIS...\n`);

  let successCount = 0;
  for (let idx = 0; idx < items.length; idx++) {
    const item = items[idx];
    const localFile = findLocal(item.file);
    if (!localFile) {
      console.warn(`[${idx+1}/${items.length}] ⚠️ Arquivo não localizado: ${item.file}`);
      continue;
    }

    try {
      const fileBytes = fs.readFileSync(localFile);
      const { data, info } = await sharp(fileBytes).raw().toBuffer({ resolveWithObject: true });
      const w = info.width, h = info.height, ch = info.channels;
      if (ch < 3) continue;

      const outData = Buffer.from(data);
      const minX = Math.floor(w * 0.20), maxX = Math.floor(w * 0.80);
      const minY = Math.floor(h * 0.18), maxY = Math.floor(h * 0.82);

      let cleanedPixels = 0;
      for (let y = minY; y < maxY; y++) {
        for (let x = minX; x < maxX; x++) {
          const pIdx = (y * w + x) * ch;
          const r = outData[pIdx], g = outData[pIdx + 1], b = outData[pIdx + 2];
          // Normaliza qualquer desvio salmão para a luminância anatômica correta do exame
          if ((r - b) >= 4 && (r - g) >= 2 && r > 40) {
            const lum = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
            outData[pIdx] = lum;
            outData[pIdx + 1] = lum;
            outData[pIdx + 2] = lum;
            cleanedPixels++;
          }
        }
      }

      if (cleanedPixels > 0) {
        const webpBuf = await sharp(outData, { raw: { width: w, height: h, channels: ch } })
          .webp({ quality: 90, effort: 5 })
          .toBuffer();

        fs.writeFileSync(localFile, webpBuf);

        // Upload para Supabase Storage
        let subFolder = 'questoes';
        const parentDir = path.basename(path.dirname(localFile));
        if (parentDir === 'imagens_resgatadas_gate6') subFolder = 'resgatadas';
        else if (parentDir === 'imagens_banco_geral') subFolder = 'banco_geral';
        else if (parentDir === 'imagens_convertidas_webp') subFolder = 'imagens_convertidas';
        else if (parentDir === 'imagens_provaderesidencia') subFolder = 'provaderesidencia';
        else if (parentDir === 'imagens_higienizadas_medq') subFolder = 'imagens_higienizadas_medq';

        const storagePath = `${subFolder}/${path.basename(localFile)}`;
        await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
          contentType: 'image/webp',
          upsert: true
        });

        successCount++;
        process.stdout.write(`\r[${idx+1}/${items.length}] ✅ Higienizado & Sincronizado: ${item.file} (${cleanedPixels} pixels normalizados)`);
      }
    } catch (err) {
      console.warn(`\n⚠️ Erro ao processar ${item.file}:`, err.message);
    }
  }

  console.log(`\n\n======================================================`);
  console.log(`CONCLUÍDO! Total de exames higienizados e sincronizados: ${successCount} / ${items.length}`);
  console.log(`======================================================\n`);
}

cleanGrayscaleResiduals().catch(console.error);
