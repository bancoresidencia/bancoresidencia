import sharp from 'sharp';
import fs from 'fs';

async function testFetch() {
  const url = "https://oslermedicina.com.br/api/images/content/residencia_FMUSP_2026_R1_Q41_img1.png?q=12583795-6f33-42f6-a000-e51dd9eacf93";
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36'
    }
  });
  console.log('Status:', res.status, res.headers.get('content-type'));
  const buf = Buffer.from(await res.arrayBuffer());
  console.log('Buffer size:', buf.length);
  const meta = await sharp(buf).metadata();
  console.log('Metadata:', meta.width, 'x', meta.height, meta.format);
  const webpBuf = await sharp(buf).webp({ quality: 90 }).toBuffer();
  fs.writeFileSync('temp_osler_test.webp', webpBuf);
  console.log('WebP size:', webpBuf.length, 'saved to temp_osler_test.webp');
}

testFetch().catch(console.error);
