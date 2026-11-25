import fs from 'fs';
import path from 'path';
import { DatabaseSync } from 'node:sqlite';
import { createClient } from '@supabase/supabase-js';

const stagingDb = new DatabaseSync('data/supabase_tables/supabase_tables.db');

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const origFile = path.resolve('data/imagens_medq_originais/orig_questions_9949f1b9-3196-4a09-ae33-d4c54e943144_9949f1b9_tomografia_aorta.webp');
const fileBytes = fs.readFileSync(origFile);
const storagePath = 'medq_originais/orig_questions_9949f1b9-3196-4a09-ae33-d4c54e943144_9949f1b9_tomografia_aorta.webp';

async function run() {
  await supabase.storage.from('questoes').upload(storagePath, fileBytes, {
    contentType: 'image/webp',
    upsert: true
  });
  const { data } = supabase.storage.from('questoes').getPublicUrl(storagePath);
  const publicUrl = data.publicUrl;
  console.log('Public URL:', publicUrl);

  const qId = 'questions_9949f1b9-3196-4a09-ae33-d4c54e943144';
  stagingDb.prepare('UPDATE questions_curated_staging SET images = ? WHERE id = ?')
    .run(JSON.stringify([publicUrl]), qId);

  await supabase.from('questions').update({ images: [publicUrl] }).eq('id', '9949f1b9-3196-4a09-ae33-d4c54e943144');
  console.log('Updated 9949f1b9.');
}

run().catch(console.error);
