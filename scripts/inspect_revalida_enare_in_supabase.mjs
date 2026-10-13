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
  console.log('--- INSPEÇÃO REVALIDA & ENARE NO SUPABASE ---');

  // 1. REVALIDA / INEP
  const { count: inepCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .or('banca.ilike.%INEP%,banca.ilike.%REVALIDA%,institution.ilike.%INEP%,institution.ilike.%REVALIDA%');

  const { count: inepComGab } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .or('banca.ilike.%INEP%,banca.ilike.%REVALIDA%,institution.ilike.%INEP%,institution.ilike.%REVALIDA%')
    .neq('correct_answer', '');

  console.log(`REVALIDA / INEP : Total ${inepCount} | Com Gabarito: ${inepComGab} | Sem Gabarito: ${inepCount - inepComGab}`);

  // 2. ENARE
  const { count: enareCount } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .or('banca.ilike.%ENARE%,institution.ilike.%ENARE%');

  const { count: enareComGab } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .or('banca.ilike.%ENARE%,institution.ilike.%ENARE%')
    .neq('correct_answer', '');

  console.log(`ENARE           : Total ${enareCount} | Com Gabarito: ${enareComGab} | Sem Gabarito: ${enareCount - enareComGab}`);

  // 3. Amostra de questões do ENARE e Revalida para entender campos (code, year, number, statement)
  const { data: sampleEnare } = await supabase
    .from('questions')
    .select('id, code, banca, year, correct_answer, statement, is_anulada')
    .or('banca.ilike.%ENARE%,institution.ilike.%ENARE%')
    .limit(3);

  console.log('\nAmostra ENARE no Supabase:');
  console.log(JSON.stringify(sampleEnare, null, 2));

  const { data: sampleInep } = await supabase
    .from('questions')
    .select('id, code, banca, year, correct_answer, statement, is_anulada')
    .or('banca.ilike.%INEP%,banca.ilike.%REVALIDA%')
    .limit(3);

  console.log('\nAmostra REVALIDA no Supabase:');
  console.log(JSON.stringify(sampleInep, null, 2));
}

main().catch(console.error);
