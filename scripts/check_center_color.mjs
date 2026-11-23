import sharp from 'sharp';

async function checkCenter() {
  const { data, info } = await sharp('data/sample_hiae_clean.webp').raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let centerColored = 0;
  for (let y = 80; y < 180; y++) {
    for (let x = 100; x < 200; x++) {
      const idx = (y * width + x) * channels;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const diff = Math.abs(r - b);
      if (diff > 15) {
        centerColored++;
      }
    }
  }

  console.log(`Center colored pixels (X: 100-200, Y: 80-180, diff > 15): ${centerColored}`);
}

checkCenter().catch(console.error);
