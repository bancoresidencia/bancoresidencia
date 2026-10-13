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
  // Let's get distinct specialties and count each
  const { data: specData } = await supabase
    .from('questions')
    .select('especialidade')
    .limit(50000);

  const distinctSpecs = Array.from(new Set(specData.map(d => d.especialidade).filter(Boolean)));
  console.log(`Especialidades encontradas: ${distinctSpecs.length}`);

  const counts = [];
  for (const s of distinctSpecs) {
    const { count } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('especialidade', s)
      .neq('correct_answer', '');

    const { count: totalSpec } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('especialidade', s);

    counts.push({ especialidade: s, comGabarito: count || 0, total: totalSpec || 0 });
  }

  // Also check without especialidade
  const { count: nullSpec } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .is('especialidade', null)
    .neq('correct_answer', '');

  const { count: emptySpec } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('especialidade', '')
    .neq('correct_answer', '');

  counts.push({ especialidade: 'Sem Especialidade Definida', comGabarito: (nullSpec || 0) + (emptySpec || 0), total: 0 });

  counts.sort((a,b) => b.comGabarito - a.comGabarito);
  console.log('\n--- CONTAGEM EXATA DE GABARITOS POR ÁREA (SUPABASE) ---');
  counts.forEach(c => {
    const pct = c.total > 0 ? ((c.comGabarito / c.total) * 100).toFixed(1) + '%' : '-';
    console.log(` • ${c.especialidade.padEnd(35)}: ${String(c.comGabarito).padStart(6)} com gabarito / ${String(c.total).padStart(6)} total (${pct})`);
  });

  // Check sources of questions
  console.log('\n--- FONTES DE DADOS REGISTRADAS (banca / institution / metadata) ---');
  const { data: bancasSample } = await supabase
    .from('questions')
    .select('banca, institution, year')
    .neq('correct_answer', '')
    .limit(100);

  const bancas = new Set(bancasSample.map(b => b.banca));
  console.log('Exemplos de Bancas de Origem:', Array.from(bancas).slice(0, 15));
}

main().catch(console.error);
