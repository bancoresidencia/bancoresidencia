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

async function testILike() {
  const { count, error } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .ilike('commentary', '%Take-Home%');

  if (error) {
    console.error('Erro ilike:', error.message);
  } else {
    console.log(`Questões com 'Take-Home' em questions_direto: ${count?.toLocaleString('pt-BR')}`);
  }

  const { count: countTotalComm } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .not('commentary', 'is', null);

  console.log(`Total com comentário não nulo em questions_direto: ${countTotalComm?.toLocaleString('pt-BR')}`);
}

testILike();

