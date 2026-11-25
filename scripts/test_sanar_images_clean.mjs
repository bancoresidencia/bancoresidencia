import fs from 'fs';
import sharp from 'sharp';

const watermarkedMatches = JSON.parse(fs.readFileSync('data/sanar_direct_matches_watermarked.json', 'utf8'));

console.log('Testando arquivos do Sanar correspondentes às questões com marca dágua...');

let countSalmonFound = 0;
let cleanCount = 0;

for (let i = 0; i < Math.min(100, watermarkedMatches.length); i++) {
  const m = watermarkedMatches[i];
  for (const img of m.sanar_images) {
    if (!fs.existsSync(img.local_webp)) continue;
    const { data, info } = await sharp(img.local_webp).raw().toBuffer({ resolveWithObject: true });
    let salmon = 0;
    for (let j = 0; j < data.length; j += info.channels) {
      const r = data[j], g = data[j+1], b = data[j+2];
      if (r > 165 && (r - b) > 30 && g > 70 && (r - g) < 95) {
        salmon++;
      }
    }
    if (salmon > 50) countSalmonFound++;
    else cleanCount++;
  }
}

console.log(`Amostra de 100 Sanar imagens: ${cleanCount} limpas, ${countSalmonFound} com salmão`);
