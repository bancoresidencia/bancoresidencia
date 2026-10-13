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

const targetSpecs = [
  'Clínica Médica',
  'Cirurgia',
  'Cirurgia Geral',
  'Ginecologia',
  'Obstetrícia',
  'Ginecologia e Obstetrícia',
  'Pediatria',
  'Medicina Preventiva e Social',
  'Medicina Preventiva',
  'Urologia'
];

async function main() {
  console.log('=== CONTAGEM REAL NO SUPABASE POR ESPECIALIDADE ===\n');

  let sumComGabarito = 0;
  let sumTotal = 0;

  for (const s of targetSpecs) {
    const { count: total } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('especialidade', s);

    const { count: comGabarito } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('especialidade', s)
      .neq('correct_answer', '');

    if (total > 0) {
      sumComGabarito += (comGabarito || 0);
      sumTotal += (total || 0);
      const pct = ((comGabarito / total) * 100).toFixed(1);
      console.log(` • ${s.padEnd(30)}: ${String(comGabarito).padStart(6)} com gabarito | ${String(total).padStart(6)} total (${pct}%)`);
    }
  }

  // Check total with answer in table
  const { count: globalComGabarito } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .neq('correct_answer', '');

  const { count: globalTotal } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true });

  console.log('-------------------------------------------------------------');
  console.log(` TOTAL GLOBAL NO SUPABASE    : ${globalComGabarito.toLocaleString('pt-BR')} com gabarito | ${globalTotal.toLocaleString('pt-BR')} total (${((globalComGabarito/globalTotal)*100).toFixed(1)}%)`);
}

main().catch(console.error);
