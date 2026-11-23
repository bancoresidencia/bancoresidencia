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

const SUPABASE_URL = env.NEXT_PUBLIC_SUPABASE_URL || 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const SUPABASE_KEY = env.SUPABASE_SECRET_KEY || env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function testStorage() {
  console.log('Testing Supabase storage connection to bucket "questoes"...');
  const testFile = 'public/images/questoes/ginecologia/mulher-29-anos-de-idade-2g2pc-comparece-ao-servico-de-gineco-01.webp';
  const buf = fs.readFileSync(testFile);
  const storagePath = `ginecologia/${path.basename(testFile)}`;

  const { data, error } = await supabase.storage.from('questoes').upload(storagePath, buf, {
    contentType: 'image/webp',
    upsert: true
  });

  if (error) {
    console.error('Upload error:', error.message);
  } else {
    console.log('Upload OK:', data);
    const { data: pubData } = supabase.storage.from('questoes').getPublicUrl(storagePath);
    console.log('Public URL:', pubData.publicUrl);

    // Verify HTTP 200
    const res = await fetch(pubData.publicUrl);
    console.log('HTTP status:', res.status, res.headers.get('content-type'));
  }
}

testStorage().catch(console.error);
