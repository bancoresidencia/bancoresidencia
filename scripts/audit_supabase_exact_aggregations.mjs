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

async function runExactAggregations() {
  console.log('=== CONTAGEM EXATA DE DIFICULDADES NO SUPABASE ===');
  for (const t of tables) {
    console.log(`\nTabela: ${t}`);
    for (const diff of ['Fácil', 'Médio', 'Difícil']) {
      const { count } = await supabase.from(t).select('*', { count: 'exact', head: true }).eq('difficulty', diff);
      console.log(`  - ${diff}: ${count}`);
    }
    const { count: nullCount } = await supabase.from(t).select('*', { count: 'exact', head: true }).is('difficulty', null);
    console.log(`  - NULL: ${nullCount}`);
  }

  console.log('\n=== CONTAGEM EXATA DE TIPOS NO SUPABASE ===');
  for (const t of tables) {
    console.log(`\nTabela: ${t}`);
    for (const tp of ['Múltipla escolha', 'Certo ou errado', 'Dissertativa', 'Discursiva', 'Verdadeiro ou falso']) {
      const { count } = await supabase.from(t).select('*', { count: 'exact', head: true }).eq('type', tp);
      console.log(`  - ${tp}: ${count}`);
    }
  }

  console.log('\n=== CONTAGEM EXATA DE ANOS NO SUPABASE ===');
  for (const t of tables) {
    console.log(`\nTabela: ${t}`);
    const yearsFound = [];
    for (let y = 2027; y >= 2000; y--) {
      const { count } = await supabase.from(t).select('*', { count: 'exact', head: true }).eq('year', y);
      if (count && count > 0) {
        yearsFound.push(`${y}: ${count}`);
      }
    }
    console.log(`  Anos com questões: ${yearsFound.join(', ')}`);
    const { count: nullYears } = await supabase.from(t).select('*', { count: 'exact', head: true }).is('year', null);
    console.log(`  - Anos NULL: ${nullYears}`);
  }
}

runExactAggregations().catch(console.error);

