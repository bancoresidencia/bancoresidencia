import sharp from 'sharp';
import fs from 'fs';

async function checkQ81() {
  const u1 = 'https://medbrave.com.br/questions/enareenamed-2027-r1-2027/1789574949806_cpi64nbj1em_q81-img1.png';
  const u2 = 'https://medbrave.com.br/questions/enareenamed-2027-r1-2027/1789574951074_07jshhq5g3ix_q81-img2.png';

  const res1 = await fetch(u1, { headers: { 'Referer': 'https://www.medbrave.com.br/', 'User-Agent': 'Mozilla/5.0...' } });
  const b1 = Buffer.from(await res1.arrayBuffer());
  const res2 = await fetch(u2, { headers: { 'Referer': 'https://www.medbrave.com.br/', 'User-Agent': 'Mozilla/5.0...' } });
  const b2 = Buffer.from(await res2.arrayBuffer());

  console.log('b1 size:', b1.length, 'b2 size:', b2.length);
  const m1 = await sharp(b1).metadata();
  const m2 = await sharp(b2).metadata();
  console.log('m1:', m1.width, m1.height, 'm2:', m2.width, m2.height);

  // Check if they can be stitched vertically
  const maxWidth = Math.max(m1.width, m2.width);
  const totalHeight = m1.height + m2.height + 16;

  const stitched = await sharp({
    create: {
      width: maxWidth,
      height: totalHeight,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 1 }
    }
  })
  .composite([
    { input: b1, top: 0, left: Math.floor((maxWidth - m1.width) / 2) },
    { input: b2, top: m1.height + 16, left: Math.floor((maxWidth - m2.width) / 2) }
  ])
  .webp({ quality: 90 })
  .toBuffer();

  console.log('Stitched WebP size:', stitched.length, 'bytes');
  fs.writeFileSync('data/sample_q81_clean.webp', stitched);
  console.log('Saved data/sample_q81_clean.webp!');
}

checkQ81().catch(console.error);
