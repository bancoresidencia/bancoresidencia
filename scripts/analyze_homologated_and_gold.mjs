import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const trimmed = l.trim();
    if (!trimmed || trimmed.startsWith('#')) return;
    const [k, ...v] = trimmed.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim();
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('='.repeat(70));
  console.log('🔍 ANÁLISE RIGOROSA: GABARITOS HOMOLOGADOS E COMENTÁRIOS PADRÃO-OURO');
  console.log('='.repeat(70));

  // 1. Totais Globais
  const { count: totalQ } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  
  // Com gabarito homologado: has_gabarito = true
  const { count: hasGabTrue } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('has_gabarito', true);
  
  // Sem gabarito homologado: has_gabarito = false (ou null)
  const { count: hasGabFalse } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('has_gabarito', false);

  console.log('\n📊 TOTAIS GERAIS NO BANCO SUPABASE:');
  console.log(`- Total de Questões: ${totalQ.toLocaleString()}`);
  console.log(`- Com Gabarito Homologado (has_gabarito = true): ${hasGabTrue.toLocaleString()} (${((hasGabTrue / totalQ) * 100).toFixed(2)}%)`);
  console.log(`- Sem Gabarito Homologado (has_gabarito = false): ${hasGabFalse.toLocaleString()} (${((hasGabFalse / totalQ) * 100).toFixed(2)}%)`);

  // 2. Análise dos Comentários em Questões COM Gabarito Homologado
  console.log('\n🔍 Analisando Comentários em Questões Homologadas...');

  // Quantas homologadas têm commentary preenchido?
  const { count: homWithAnyComm } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('has_gabarito', true)
    .not('commentary', 'is', null)
    .neq('commentary', '');

  // Quantas homologadas têm comentário Padrão-Ouro (Take-Home Message)?
  const { count: homWithGoldComm } = await supabase
    .from('questions')
    .select('*', { count: 'exact', head: true })
    .eq('has_gabarito', true)
    .like('commentary', '%Take-Home Message:%');

  // Quantas homologadas têm comentário legado (sem Take-Home Message)?
  const homWithLegacyComm = homWithAnyComm - homWithGoldComm;
  const homWithoutComm = hasGabTrue - homWithAnyComm;

  console.log(`\n🏆 COBERTURA DE COMENTÁRIOS NAS QUESTÕES HOMOLOGADAS (${hasGabTrue.toLocaleString()} questões):`);
  console.log(`  1. Com Comentário PADRÃO-OURO: ${homWithGoldComm.toLocaleString()} (${((homWithGoldComm / hasGabTrue) * 100).toFixed(2)}%)`);
  console.log(`  2. Com Comentário Legado / Externo: ${homWithLegacyComm.toLocaleString()} (${((homWithLegacyComm / hasGabTrue) * 100).toFixed(2)}%)`);
  console.log(`  3. Total com Algum Comentário: ${homWithAnyComm.toLocaleString()} (${((homWithAnyComm / hasGabTrue) * 100).toFixed(2)}%)`);
  console.log(`  4. Totalmente Sem Comentário: ${homWithoutComm.toLocaleString()} (${((homWithoutComm / hasGabTrue) * 100).toFixed(2)}%)`);

  // 3. Distribuição por Especialidade
  console.log('\n' + '='.repeat(70));
  console.log('🏥 DISTRIBUIÇÃO DETALHADA POR ESPECIALIDADE');
  console.log('='.repeat(70));

  const specs = [
    'Clínica Médica',
    'Cirurgia',
    'Cirurgia Geral',
    'Pediatria',
    'Ginecologia',
    'Obstetrícia',
    'Medicina Preventiva e Social'
  ];

  const breakdown = [];

  for (const s of specs) {
    const { count: totalSpec } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', s);
    const { count: homSpec } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', s).eq('has_gabarito', true);
    const { count: nonHomSpec } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', s).eq('has_gabarito', false);
    
    const { count: goldSpec } = await supabase.from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('especialidade', s)
      .eq('has_gabarito', true)
      .like('commentary', '%Take-Home Message:%');

    const { count: anyCommSpec } = await supabase.from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('especialidade', s)
      .eq('has_gabarito', true)
      .not('commentary', 'is', null)
      .neq('commentary', '');

    const pctGold = homSpec > 0 ? ((goldSpec / homSpec) * 100).toFixed(1) + '%' : '0%';
    const pctHom = totalSpec > 0 ? ((homSpec / totalSpec) * 100).toFixed(1) + '%' : '0%';

    breakdown.push({
      Especialidade: s,
      'Total Questões': totalSpec,
      'Homologadas': homSpec,
      '% Homolog': pctHom,
      'Sem Gabarito': nonHomSpec,
      'Padrão-Ouro': goldSpec,
      '% Padrão-Ouro / Homolog': pctGold,
      'Qualquer Comentário': anyCommSpec
    });
  }

  console.table(breakdown);

  // 4. Detalhes sobre as questões SEM gabarito homologado
  console.log('\n🔎 DETALHES DAS QUESTÕES SEM GABARITO HOMOLOGADO:');
  const { data: sampleNoGab } = await supabase
    .from('questions')
    .select('id, code, banca, year, especialidade, correct_answer, is_anulada')
    .eq('has_gabarito', false)
    .limit(10);

  console.log('Amostra de questões sem gabarito:');
  sampleNoGab.forEach(q => {
    console.log(` - [${q.code}] ${q.banca} (${q.year}) - ${q.especialidade} | correct_answer: '${q.correct_answer}' | is_anulada: ${q.is_anulada}`);
  });
}

run().catch(console.error);

