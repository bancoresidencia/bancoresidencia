import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

const ids = [
  '17004dcf-f0b1-4106-8196-56a2b471ca7a',
  '75a8fb9f-0851-4171-899e-37c5a0ec341e',
  '85ac3a97-5436-4382-87ea-8ae4fed8fde6',
  '3202ab2d-e6d7-42e4-8e4e-30e628a1b810'
];

async function check() {
  console.log('Verificando tabela "questions" no Supabase...');
  const { data, error } = await supabase
    .from('questions')
    .select('id, code, commentary, options')
    .in('id', ids);

  if (error) {
    console.error('Erro ao buscar no Supabase:', error);
  } else {
    console.log(`Encontradas ${data.length} questões no Supabase:`);
    data.forEach(d => {
      console.log(`- ID: ${d.id} | Código: ${d.code} | Tem comentário: ${!!d.commentary} | Comentário length: ${d.commentary ? d.commentary.length : 0}`);
    });
  }
}

check().catch(console.error);

