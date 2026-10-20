import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(line => {
    const [k, ...v] = line.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(SUPABASE_URL, SERVICE_KEY);

async function main() {
  console.log('🧪 Verificando query do ENARE no Supabase com os filtros...');

  const resolved = ['ENARE', 'ENARE/ENAMED'];
  const { data, error } = await supabase
    .from('questions')
    .select('id, especialidade, tema, foco, subfoco')
    .in('banca', resolved)
    .order('id', { ascending: true })
    .limit(3000);

  if (error) {
    console.error('Erro na query:', error);
    return;
  }

  const especialidades = {};
  const temasGineco = {};

  for (const row of data) {
    const esp = row.especialidade;
    const tem = row.tema;
    if (esp) {
      especialidades[esp] = (especialidades[esp] || 0) + 1;
    }
    if (esp === 'Ginecologia' && tem) {
      temasGineco[tem] = (temasGineco[tem] || 0) + 1;
    }
  }

  console.log('\n📊 Contagens por Especialidade no ENARE:');
  console.table(especialidades);

  console.log('\n🌸 Distribuição dos Temas em Ginecologia:');
  console.table(temasGineco);
}

main().catch(console.error);
