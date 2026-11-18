import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function checkPreventivaSupabase() {
  const { count } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .ilike('especialidade', '%preventiva%');
  
  console.log('Supabase questions_direto (Preventiva):', count);
}

checkPreventivaSupabase();
