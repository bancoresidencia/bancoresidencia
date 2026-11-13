import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const t = line.trim();
  if (t && !t.startsWith('#')) {
    const idx = t.indexOf('=');
    if (idx !== -1) env[t.slice(0, idx).trim()] = t.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
  }
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function findCamilo() {
  const { data } = await supabase
    .from('questions')
    .select('institution')
    .ilike('institution', '%Camilo%')
    .limit(20);

  const insts = [...new Set(data?.map(q => q.institution))];
  console.log('Existing Camilo institutions:', insts);
}

findCamilo();
