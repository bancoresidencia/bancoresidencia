import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function runBenchmarkAccurate() {
  console.log('=== BENCHMARK DE BASELINE COM NOMES REAIS (FASE 0) ===\n');

  // Cenário B: ENARE/ENAMED 2024
  const t1 = performance.now();
  const { count: countB, error: errB } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .in('banca', ['ENARE', 'ENARE/ENAMED'])
    .eq('year', 2024);
  const timeB = (performance.now() - t1).toFixed(1);
  console.log(`Cenário B (ENARE 2024): ${countB} questões | Tempo: ${timeB}ms | Erro: ${errB?.message || 'Nenhum'}`);

  // Cenário D: ENARE 2022 + Ginecologia
  const t3 = performance.now();
  const { count: countD, error: errD } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .in('banca', ['ENARE', 'ENARE/ENAMED'])
    .eq('year', 2022)
    .eq('especialidade', 'Ginecologia');
  const timeD = (performance.now() - t3).toFixed(1);
  console.log(`Cenário D (ENARE 2022 + Ginecologia): ${countD} questões | Tempo: ${timeD}ms | Erro: ${errD?.message || 'Nenhum'}`);

  // Cenário E: Download de linhas de ENARE (simulando a rota /api/questions hoje)
  const t4 = performance.now();
  const { data: facetRows, error: errE } = await supabase
    .from('questions')
    .select('especialidade, tema, foco, subfoco')
    .in('banca', ['ENARE', 'ENARE/ENAMED'])
    .limit(4000);
  const timeE = (performance.now() - t4).toFixed(1);
  console.log(`Cenário E (Loop atual de Facetas ENARE): ${facetRows?.length || 0} linhas | Tempo: ${timeE}ms | Erro: ${errE?.message || 'Nenhum'}`);

  // Cenário F: USP/HCFMUSP 2024
  const t5 = performance.now();
  const { count: countF, error: errF } = await supabase
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .in('banca', ['USP/HCFMUSP', 'USP-SP', 'FUVEST/USP'])
    .eq('year', 2024);
  const timeF = (performance.now() - t5).toFixed(1);
  console.log(`Cenário F (USP-SP 2024): ${countF} questões | Tempo: ${timeF}ms | Erro: ${errF?.message || 'Nenhum'}`);

  console.log('\nBenchmark concluído.');
}

runBenchmarkAccurate().catch(console.error);
