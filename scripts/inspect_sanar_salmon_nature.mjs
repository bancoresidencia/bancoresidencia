import fs from 'fs';
import sharp from 'sharp';

const watermarkedMatches = JSON.parse(fs.readFileSync('data/sanar_direct_matches_watermarked.json', 'utf8'));

for (let i = 0; i < 5; i++) {
  const m = watermarkedMatches[i];
  const imgPath = m.sanar_images[0].local_webp;
  const { data, info } = await sharp(imgPath).raw().toBuffer({ resolveWithObject: true });
  const w = info.width, h = info.height, ch = info.channels;
  
  let salmonPixels = [];
  for (let y = 0; y < h; y += 4) {
    for (let x = 0; x < w; x += 4) {
      const idx = (y * w + x) * ch;
      const r = data[idx], g = data[idx+1], b = data[idx+2];
      if (r > 165 && (r - b) > 30 && g > 70 && (r - g) < 95) {
        salmonPixels.push({ x, y, r, g, b });
      }
    }
  }

  console.log(`\n--- Sanar Img ${i+1}: ${m.question_id} (${m.banca} ${m.year})`);
  console.log(`Dimensions: ${w}x${h}, Total salmon sampled: ${salmonPixels.length}`);
  if (salmonPixels.length > 0) {
    const minX = Math.min(...salmonPixels.map(p => p.x));
    const maxX = Math.max(...salmonPixels.map(p => p.x));
    const minY = Math.min(...salmonPixels.map(p => p.y));
    const maxY = Math.max(...salmonPixels.map(p => p.y));
    console.log(`Bounding box: x=[${minX}, ${maxX}] (${((maxX-minX)/w*100).toFixed(0)}%), y=[${minY}, ${maxY}] (${((maxY-minY)/h*100).toFixed(0)}%)`);
    console.log('Sample pixels:', salmonPixels.slice(0, 3));
  }
}
