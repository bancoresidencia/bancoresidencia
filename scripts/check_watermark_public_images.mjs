import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

const ginecoDir = path.resolve('public/images/questoes/ginecologia');
const uroDir = path.resolve('public/images/questoes/urologia');

async function testWatermarkHeuristic(filePath) {
  try {
    const { data, info } = await sharp(filePath)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;
    // Check center region (MedQ watermark is a central cross/salmon plus sign with R > B + 20 and G > B)
    let salmonPixels = 0;
    const startX = Math.floor(width * 0.3);
    const endX = Math.floor(width * 0.7);
    const startY = Math.floor(height * 0.3);
    const endY = Math.floor(height * 0.7);

    for (let y = startY; y < endY; y++) {
      for (let x = startX; x < endX; x++) {
        const idx = (y * width + x) * channels;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];

        // MedQ salmon watermark: R around 200-245, G around 130-180, B around 110-160, where R - B > 25
        if (r > 160 && g > 100 && b > 80 && (r - b > 25) && (r - g > 15)) {
          salmonPixels++;
        }
      }
    }

    const centerArea = (endX - startX) * (endY - startY);
    const ratio = salmonPixels / centerArea;
    return { hasWatermark: ratio > 0.005, ratio, salmonPixels };
  } catch (err) {
    return { hasWatermark: false, error: err.message };
  }
}

async function runCheck() {
  console.log('Auditing sample of images in public/images/questoes/ginecologia for salmon watermark...');
  const files = fs.readdirSync(ginecoDir).filter(f => f.endsWith('.webp'));
  let watermarkedCount = 0;
  const flagged = [];

  for (const f of files) {
    const fp = path.join(ginecoDir, f);
    const res = await testWatermarkHeuristic(fp);
    if (res.hasWatermark) {
      watermarkedCount++;
      flagged.push({ file: f, ratio: res.ratio, pixels: res.salmonPixels });
    }
  }

  console.log(`\nChecked ${files.length} ginecologia images:`);
  console.log(`Flagged with potential watermark: ${watermarkedCount}`);
  if (flagged.length > 0) {
    console.log('Sample flagged:', flagged.slice(0, 5));
  }
}

runCheck().catch(console.error);
