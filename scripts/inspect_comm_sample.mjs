import fs from 'fs';
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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function inspectComm() {
  const { data } = await supabase
    .from('questions_direto')
    .select('id, code, commentary')
    .not('commentary', 'is', null)
    .limit(5);

  for (const d of data) {
    console.log('--- ID:', d.id, 'CODE:', d.code, '---');
    console.log(d.commentary?.slice(0, 400));
    console.log('Tem Take-Home?:', d.commentary?.includes('Take-Home'));
    console.log('Length:', d.commentary?.length);
  }
}

inspectComm();

