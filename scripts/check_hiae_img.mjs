import fs from 'fs';
import path from 'path';
import sharp from 'sharp';

async function checkHiaeImage() {
  const url = 'https://lunar.cetrus.sanar.com.br/assets/64bbe73b-3ee8-43ff-b401-c20dc010666c.png';
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });

  if (!res.ok) {
    console.error('Fetch failed:', res.status, res.statusText);
    return;
  }

  const buf = Buffer.from(await res.arrayBuffer());
  console.log('Downloaded size:', buf.length, 'bytes');

  const meta = await sharp(buf).metadata();
  console.log('Image metadata:', meta);

  // Check for any watermark / color anomalies
  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  let maxRBDiff = 0;
  for (let i = 0; i < data.length; i += info.channels) {
    const diff = Math.abs(data[i] - data[i + 2]);
    if (diff > maxRBDiff) maxRBDiff = diff;
  }
  console.log('Max R-B difference across image:', maxRBDiff);

  // Save as WebP
  const webpBuf = await sharp(buf).webp({ quality: 90 }).toBuffer();
  console.log('WebP size:', webpBuf.length, 'bytes');
  fs.writeFileSync('data/sample_hiae_clean.webp', webpBuf);
  console.log('Saved data/sample_hiae_clean.webp!');
}

checkHiaeImage().catch(console.error);
