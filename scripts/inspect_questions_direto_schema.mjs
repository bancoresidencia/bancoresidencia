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

async function inspectSample() {
  const { data, error } = await supabase.from('questions_direto').select('*').limit(2);
  if (error) {
    console.error('Erro:', error.message);
    return;
  }
  console.log('Colunas de questions_direto:', Object.keys(data[0] || {}));
  console.log('Amostra de 1 questão:');
  console.log(JSON.stringify(data[0], null, 2));
}

inspectSample();

