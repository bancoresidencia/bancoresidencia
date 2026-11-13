import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
});

const tables = [
  { name: 'questions_direto', label: 'Acesso Direto' },
  { name: 'questions_revalida', label: 'Revalida' },
  { name: 'questions_rplus', label: 'R+' },
  { name: 'questions_titulo', label: 'Título de Especialista' }
];

async function runAudit() {
  console.log('=== AUDITORIA COMPLETA DAS TABELAS NO SUPABASE ===\n');

  for (const { name, label } of tables) {
    console.log(`\n==================================================`);
    console.log(`TABELA: ${name} (${label})`);
    console.log(`==================================================`);

    // Total
    const { count: totalCount, error: errTotal } = await supabase
      .from(name)
      .select('*', { count: 'exact', head: true });
    
    if (errTotal) {
      console.error(`Erro ao contar ${name}:`, errTotal.message);
      continue;
    }
    console.log(`Total de questões: ${totalCount}`);

    // Não categorizadas
    // Especialidade vazia/nula
    const { count: nullEsp } = await supabase
      .from(name)
      .select('*', { count: 'exact', head: true })
      .or('especialidade.is.null,especialidade.eq.""');

    // Tema vazio/nulo
    const { count: nullTema } = await supabase
      .from(name)
      .select('*', { count: 'exact', head: true })
      .or('tema.is.null,tema.eq.""');

    // Foco vazio/nulo
    const { count: nullFoco } = await supabase
      .from(name)
      .select('*', { count: 'exact', head: true })
      .or('foco.is.null,foco.eq.""');

    // Subfoco vazio/nulo
    const { count: nullSubfoco } = await supabase
      .from(name)
      .select('*', { count: 'exact', head: true })
      .or('subfoco.is.null,subfoco.eq.""');

    console.log(`Não categorizadas:`);
    console.log(`  - Sem Especialidade: ${nullEsp}`);
    console.log(`  - Sem Tema: ${nullTema}`);
    console.log(`  - Sem Foco: ${nullFoco}`);
    console.log(`  - Sem Subfoco: ${nullSubfoco}`);

    // Dificuldade
    const { data: diffData } = await supabase
      .from(name)
      .select('difficulty')
      .limit(2000);
    
    // Anos
    const { data: yearData } = await supabase
      .from(name)
      .select('year')
      .limit(5000);

    // Tipos de questão
    const { data: typeData } = await supabase
      .from(name)
      .select('type')
      .limit(1000);

    const diffCounts = {};
    if (diffData) {
      diffData.forEach(r => {
        const d = r.difficulty || 'NULL/Vazio';
        diffCounts[d] = (diffCounts[d] || 0) + 1;
      });
    }
    console.log(`Amostra de Dificuldades:`, diffCounts);

    const typesCount = {};
    if (typeData) {
      typeData.forEach(r => {
        const t = r.type || 'NULL/Vazio';
        typesCount[t] = (typesCount[t] || 0) + 1;
      });
    }
    console.log(`Amostra de Tipos:`, typesCount);
  }
}

runAudit().catch(console.error);
