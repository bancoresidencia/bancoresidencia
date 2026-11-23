import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SECRET_KEY);

async function checkPadraoOuroInSupabase() {
  const { count: countDireto, error: errD } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .ilike('commentary', '%Take-Home%');
  
  const { count: countQuestions, error: errQ } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .ilike('commentary', '%Take-Home%');

  console.log('Padrão-Ouro em questions_direto no Supabase:', countDireto, errD ? errD.message : '');
  console.log('Padrão-Ouro em questions no Supabase:', countQuestions, errQ ? errQ.message : '');
}

checkPadraoOuroInSupabase();
