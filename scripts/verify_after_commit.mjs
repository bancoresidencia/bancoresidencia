import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
  const [k, ...v] = line.split('=');
  if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
});
const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY);

async function verify() {
  const rep = JSON.parse(fs.readFileSync('data/relatorio_aplicacao_supabase_176.json', 'utf8'));
  const codes = rep.registros.filter(r => r.status === 'SUCCESS').map(r => r.code);
  console.log(`Verificando amostra dos ${codes.length} códigos no Supabase...`);
  
  const { data: sample } = await supabase
    .from('questions')
    .select('code, correct_answer')
    .in('code', codes.slice(0, 8));
  
  console.log('Amostra de registros no Supabase:');
  console.table(sample);

  const { count: nullCount } = await supabase.from('questions').select('id', { count: 'exact', head: true }).is('correct_answer', null);
  const { count: emptyCount } = await supabase.from('questions').select('id', { count: 'exact', head: true }).eq('correct_answer', '');
  
  console.log('\n--- STATUS DO SUPABASE APÓS COMMIT ---');
  console.log(`Null: ${nullCount}`);
  console.log(`Vazio: ${emptyCount}`);
  console.log(`Total de pendências restantes: ${(nullCount || 0) + (emptyCount || 0)}`);
  console.log(`Total com gabarito preenchido: ${130024 - ((nullCount || 0) + (emptyCount || 0))}`);
}

verify().catch(console.error);
