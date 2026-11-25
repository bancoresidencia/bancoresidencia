import fs from 'fs';
import path from 'path';
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

async function deployQ75() {
  const localDest = path.resolve('data/imagens_resgatadas_gate6/resgatada_questions_1550514f-0e3f-484a-b90a-efe9764e5788_clean.webp');
  fs.copyFileSync(path.resolve('data/test_amrigs_q75_clean.webp'), localDest);
  console.log('Local file updated:', localDest);

  const buf = fs.readFileSync(localDest);
  const storagePath = 'resgatadas/resgatada_questions_1550514f-0e3f-484a-b90a-efe9764e5788_clean.webp';
  const { error } = await supabase.storage.from('questoes').upload(storagePath, buf, {
    contentType: 'image/webp',
    upsert: true
  });
  if (error) {
    console.error('Upload error:', error.message);
  } else {
    console.log('Successfully re-uploaded to Supabase Storage:', storagePath);
  }
}

deployQ75().catch(console.error);
