import sharp from 'sharp';

async function locateColor() {
  const { data, info } = await sharp('data/sample_hiae_clean.webp').raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;
  console.log(`Image dimensions: ${width}x${height}`);

  const coloredPixels = [];
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const diff = Math.abs(r - b);
      if (diff > 30) {
        coloredPixels.push({ x, y, r, g, b, diff });
      }
    }
  }

  console.log(`Total colored pixels (diff > 30): ${coloredPixels.length}`);
  if (coloredPixels.length > 0) {
    const xs = coloredPixels.map(p => p.x);
    const ys = coloredPixels.map(p => p.y);
    console.log(`X range: ${Math.min(...xs)} to ${Math.max(...xs)} (center is ${Math.round(width/2)})`);
    console.log(`Y range: ${Math.min(...ys)} to ${Math.max(...ys)} (center is ${Math.round(height/2)})`);
    console.log('Sample colored pixel:', coloredPixels[0]);
  }
}

locateColor().catch(console.error);
