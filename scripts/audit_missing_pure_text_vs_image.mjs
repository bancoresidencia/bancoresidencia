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

async function auditMissing() {
  console.log('='.repeat(80));
  console.log('🔍 AUDITORIA DAS 42.576 QUESTÕES HOMOLOGADAS SEM COMENTÁRIO EM questions_direto');
  console.log('='.repeat(80));

  const especialidades = [
    'Clínica Médica',
    'Cirurgia Geral',
    'Cirurgia',
    'Ginecologia',
    'Obstetrícia',
    'Pediatria',
    'Medicina Preventiva e Social',
    'Medicina Preventiva'
  ];

  const report = [];
  let totalFaltam = 0;

  for (const esp of especialidades) {
    // Total homologadas sem comentário
    const { count: faltamTotal } = await supabase
      .from('questions_direto')
      .select('id', { count: 'exact', head: true })
      .eq('especialidade', esp)
      .in('correct_answer', ['A', 'B', 'C', 'D', 'E'])
      .is('commentary', null);

    if (!faltamTotal || faltamTotal === 0) continue;
    totalFaltam += faltamTotal;

    // Das que faltam, quantas têm imagem não vazia na coluna 'images'
    // 'images' é um array jsonb
    const { count: comImagem } = await supabase
      .from('questions_direto')
      .select('id', { count: 'exact', head: true })
      .eq('especialidade', esp)
      .in('correct_answer', ['A', 'B', 'C', 'D', 'E'])
      .is('commentary', null)
      .neq('images', '[]');

    const imgCount = comImagem ?? 0;
    const textoPuroCount = Math.max(0, faltamTotal - imgCount);

    report.push({
      especialidade: esp,
      faltamTotal,
      textoPuro: textoPuroCount,
      comImagem: imgCount,
      pctTextoPuro: ((textoPuroCount / faltamTotal) * 100).toFixed(1) + '%'
    });
  }

  console.table(report);
  console.log(`\n📌 Total verificado nas especialidades mapeadas: ${totalFaltam.toLocaleString('pt-BR')} questões pendentes.`);
}

auditMissing();

