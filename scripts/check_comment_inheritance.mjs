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

async function checkOverlap() {
  console.log('Verificando sobreposição de IDs entre questions e questions_direto...');
  
  // Pega uma amostra de 20 questões que têm Take-Home Message em questions
  const { data: goldSample, error } = await supabase
    .from('questions')
    .select('id, code, commentary')
    .ilike('commentary', '%Take-Home Message%')
    .limit(20);

  if (error || !goldSample || goldSample.length === 0) {
    console.log('Erro ou sem amostra:', error?.message);
    return;
  }

  const ids = goldSample.map(q => q.id);
  const codes = goldSample.map(q => q.code).filter(Boolean);

  const { data: matchById } = await supabase
    .from('questions_direto')
    .select('id, code, commentary')
    .in('id', ids);

  const { data: matchByCode } = await supabase
    .from('questions_direto')
    .select('id, code, commentary')
    .in('code', codes);

  console.log(`Amostra de 20 questões Ouro de 'questions':`);
  console.log(` - Encontradas em questions_direto por ID: ${matchById?.length || 0} de 20`);
  console.log(` - Encontradas em questions_direto por CODE: ${matchByCode?.length || 0} de 20`);
  if (matchById && matchById.length > 0) {
    console.log('Exemplo de comentário atual em questions_direto:', matchById[0].commentary?.slice(0, 100));
  }
}

checkOverlap();

