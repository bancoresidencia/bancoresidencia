import sharp from 'sharp';

async function checkOldCenter() {
  const url = 'https://ezluharxlmlqhdkqrjbz.supabase.co/storage/v1/object/public/questoes/banco_geral/034dfdef_um-paciente-de-7-anos-encontra-se-internado-em-uti-pediatric-01.webp';
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());

  const { data, info } = await sharp(buf).raw().toBuffer({ resolveWithObject: true });
  const { width, height, channels } = info;

  let centerColored = 0;
  for (let y = Math.floor(height * 0.3); y < Math.floor(height * 0.7); y++) {
    for (let x = Math.floor(width * 0.3); x < Math.floor(width * 0.7); x++) {
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

  console.log(`OLD image center colored pixels: ${centerColored}`);
}

checkOldCenter().catch(console.error);
