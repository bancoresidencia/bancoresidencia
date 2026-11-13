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

async function checkPadrãoOuro() {
  console.log('='.repeat(80));
  console.log('🔍 AUDITORIA RIGOROSA: APENAS COMENTÁRIOS PADRÃO-OURO EM questions_direto');
  console.log('='.repeat(80));

  // Vamos testar paginando lotes de 1000 apenas trazendo id, especialidade, correct_answer, commentary
  // Para ver o ritmo de contagem e se podemos auditar rapidamente
  const startTime = Date.now();
  let countGold = 0;
  let countLegacy = 0;
  let countNull = 0;
  let totalHomologadas = 0;

  const specGoldMap = {};

  console.log('Testando amostragem de 5.000 questões homologadas de questions_direto...');
  const { data: sample, error } = await supabase
    .from('questions_direto')
    .select('id, especialidade, correct_answer, commentary')
    .in('correct_answer', ['A', 'B', 'C', 'D', 'E'])
    .limit(5000);

  if (error) {
    console.error('Erro na amostragem:', error.message);
    return;
  }

  for (const q of sample) {
    totalHomologadas++;
    const comm = q.commentary || '';
    const isGold = comm.includes('Take-Home Message:') || comm.includes('Take-Home Message') || comm.includes('**Take-Home');
    const esp = q.especialidade || 'Outros';
    if (!specGoldMap[esp]) specGoldMap[esp] = { total: 0, gold: 0, legacy: 0, none: 0 };
    specGoldMap[esp].total++;

    if (!comm || comm.trim() === '') {
      countNull++;
      specGoldMap[esp].none++;
    } else if (isGold) {
      countGold++;
      specGoldMap[esp].gold++;
    } else {
      countLegacy++;
      specGoldMap[esp].legacy++;
    }
  }

  console.log(`\nResultado da Amostra (5.000 questões homologadas):`);
  console.log(` - Padrão-Ouro (Take-Home Message): ${countGold} (${((countGold / totalHomologadas) * 100).toFixed(1)}%)`);
  console.log(` - Comentário Legado / Descartável: ${countLegacy} (${((countLegacy / totalHomologadas) * 100).toFixed(1)}%)`);
  console.log(` - Sem Comentário (NULL): ${countNull} (${((countNull / totalHomologadas) * 100).toFixed(1)}%)`);
  console.log(` - FALTAM NO PADRÃO-OURO (Legado + Null): ${countLegacy + countNull} (${(((countLegacy + countNull) / totalHomologadas) * 100).toFixed(1)}%)`);

  console.log('\nDistribuição na Amostra:');
  console.table(specGoldMap);
}

checkPadrãoOuro();

