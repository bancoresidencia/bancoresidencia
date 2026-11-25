import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY);

async function replaceQ89() {
  const url = 'https://medbrave.com.br/questions/enareenamed-2027-r1-2027/1789574954049_hx2l6h5lei_q89.png';
  const res = await fetch(url);
  const buf = Buffer.from(await res.arrayBuffer());
  const webpBuf = await sharp(buf).webp({ quality: 90, effort: 5 }).toBuffer();
  
  const destPath = path.resolve('data/imagens_resgatadas_gate6/resgatada_questions_88ec4797_enare_q89.webp');
  fs.writeFileSync(destPath, webpBuf);
  console.log('Saved local WebP! Size:', webpBuf.length);
  
  const storagePath = 'resgatadas/resgatada_questions_88ec4797_enare_q89.webp';
  const { error } = await supabase.storage.from('questoes').upload(storagePath, webpBuf, {
    contentType: 'image/webp',
    upsert: true
  });
  if (error) console.error('Upload error:', error.message);
  else console.log('Successfully re-uploaded clean ENARE Q89 to Supabase Storage!');
}

replaceQ89().catch(console.error);
