import sharp from 'sharp';
import fs from 'fs';

async function checkImg() {
  const url = "https://ezluharxlmlqhdkqrjbz.supabase.co/storage/v1/object/public/questoes/imagens_higienizadas_medq/clean_questions_1555dafc-75ed-4174-bc47-9681649e0b1d_converted_86_q015-ac76610980f0.webp";
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync('temp_abem.webp', buf);
  const meta = await sharp(buf).metadata();
  console.log('Image dimensions:', meta.width, 'x', meta.height);
}
checkImg();
