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

const supabase = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY || env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function run() {
  const specs = [
    'Clínica Médica',
    'Cirurgia Geral',
    'Cirurgia',
    'Pediatria',
    'Ginecologia',
    'Obstetrícia',
    'Medicina Preventiva e Social'
  ];

  console.log('='.repeat(80));
  console.log('🔍 CENSO EM TEMPO REAL: HOMOLOGADAS E COMENTÁRIOS POR ESPECIALIDADE');
  console.log('='.repeat(80));

  const rows = [];
  let sumTotal = 0;
  let sumHomolog = 0;
  let sumGold = 0;
  let sumAnyComm = 0;

  for (const s of specs) {
    const [{ count: totalSpec }, { count: homSpec }, { count: goldSpec }, { count: anyCommSpec }] = await Promise.all([
      supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', s),
      supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', s).eq('has_gabarito', true),
      supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', s).eq('has_gabarito', true).like('commentary', '%Take-Home Message:%'),
      supabase.from('questions').select('id', { count: 'exact', head: true }).eq('especialidade', s).eq('has_gabarito', true).not('commentary', 'is', null).neq('commentary', '')
    ]);

    sumTotal += totalSpec;
    sumHomolog += homSpec;
    sumGold += goldSpec;
    sumAnyComm += anyCommSpec;

    const pctGold = homSpec > 0 ? ((goldSpec / homSpec) * 100).toFixed(1) + '%' : '0%';
    const pctAny = homSpec > 0 ? ((anyCommSpec / homSpec) * 100).toFixed(1) + '%' : '0%';
    const pendingGold = homSpec - goldSpec;

    rows.push({
      Especialidade: s,
      'Total Banco': totalSpec.toLocaleString('pt-BR'),
      'Homologadas': homSpec.toLocaleString('pt-BR'),
      'Com Padrão-Ouro': goldSpec.toLocaleString('pt-BR'),
      '% Padrão-Ouro': pctGold,
      'Total c/ Comentário': anyCommSpec.toLocaleString('pt-BR'),
      '% c/ Comentário': pctAny,
      'Pendentes Padrão-Ouro': pendingGold.toLocaleString('pt-BR')
    });
  }

  console.table(rows);

  console.log('\n📊 TOTAIS CONSOLIDADOS (BASE ATIVA DO SUPABASE):');
  console.log(`- Total de Questões no Banco: ${sumTotal.toLocaleString('pt-BR')}`);
  console.log(`- Total de Questões Homologadas: ${sumHomolog.toLocaleString('pt-BR')} (${((sumHomolog / sumTotal) * 100).toFixed(2)}%)`);
  console.log(`- Homologadas com Comentário PADRÃO-OURO: ${sumGold.toLocaleString('pt-BR')} (${((sumGold / sumHomolog) * 100).toFixed(2)}% das homologadas)`);
  console.log(`- Homologadas com Qualquer Comentário: ${sumAnyComm.toLocaleString('pt-BR')} (${((sumAnyComm / sumHomolog) * 100).toFixed(2)}% das homologadas)`);
  console.log(`- Homologadas Pendentes de Padrão-Ouro: ${(sumHomolog - sumGold).toLocaleString('pt-BR')} (${(((sumHomolog - sumGold) / sumHomolog) * 100).toFixed(2)}%)`);
}

run().catch(console.error);

