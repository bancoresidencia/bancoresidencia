import sharp from 'sharp';
import fs from 'fs';

async function checkQ37() {
  const u = 'https://medbrave.com.br/questions/enareenamed-2027-r1-2027/1789574940078_sdaj7yj77a_q37.png';
  const res = await fetch(u, { headers: { 'Referer': 'https://www.medbrave.com.br/', 'User-Agent': 'Mozilla/5.0...' } });
  const buf = Buffer.from(await res.arrayBuffer());
  console.log('Downloaded size:', buf.length);

  const meta = await sharp(buf).metadata();
  console.log('Metadata:', meta.width, meta.height, meta.format);

  const webpBuf = await sharp(buf).webp({ quality: 90 }).toBuffer();
  console.log('WebP size:', webpBuf.length);
  fs.writeFileSync('data/sample_q37_burn_clean.webp', webpBuf);
  console.log('Saved data/sample_q37_burn_clean.webp!');
}

checkQ37().catch(console.error);
