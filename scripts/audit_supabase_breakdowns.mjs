import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const tables = [
  'questions_direto',
  'questions_revalida',
  'questions_rplus',
  'questions_titulo'
];

async function runBreakdowns() {
  console.log('=== 1. AUDITORIA DE ANOS POR TABELA ===');
  for (const t of tables) {
    console.log(`\n--- Tabela: ${t} ---`);
    // Buscar anos distintos via RPC ou paginação de anos
    const { data, error } = await supabase
      .from(t)
      .select('year')
      .order('year', { ascending: false })
      .limit(50000);

    if (error) {
      console.error(`Erro ao buscar anos em ${t}:`, error.message);
      continue;
    }

    const yearCounts = {};
    let nullYears = 0;
    for (const r of data) {
      if (r.year == null) nullYears++;
      else yearCounts[r.year] = (yearCounts[r.year] || 0) + 1;
    }
    const sortedYears = Object.keys(yearCounts).map(Number).sort((a,b) => b - a);
    console.log(`  Anos encontrados (amostra ${data.length}):`, sortedYears.join(', '));
    console.log(`  Anos Min: ${Math.min(...sortedYears)}, Max: ${Math.max(...sortedYears)}, Nulos: ${nullYears}`);
  }

  console.log('\n=== 2. AUDITORIA DE DIFICULDADE (DISTRIBUIÇÃO REAL) ===');
  for (const t of tables) {
    console.log(`\n--- Tabela: ${t} ---`);
    const { data, error } = await supabase
      .from(t)
      .select('difficulty')
      .limit(20000);

    if (error) {
      console.error(`Erro em ${t}:`, error.message);
      continue;
    }

    const diffCounts = {};
    for (const r of data) {
      const d = r.difficulty || 'NULL/Vazio';
      diffCounts[d] = (diffCounts[d] || 0) + 1;
    }
    console.log(`  Dificuldades (amostra ${data.length}):`, diffCounts);
  }

  console.log('\n=== 3. AUDITORIA DE TIPOS DE QUESTÃO ===');
  for (const t of tables) {
    console.log(`\n--- Tabela: ${t} ---`);
    const { data, error } = await supabase
      .from(t)
      .select('type')
      .limit(20000);

    if (error) {
      console.error(`Erro em ${t}:`, error.message);
      continue;
    }

    const typeCounts = {};
    for (const r of data) {
      const tp = r.type || 'NULL/Vazio';
      typeCounts[tp] = (typeCounts[tp] || 0) + 1;
    }
    console.log(`  Tipos (amostra ${data.length}):`, typeCounts);
  }
}

runBreakdowns().catch(console.error);

