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

async function runAudit() {
  console.log('='.repeat(80));
  console.log('🔍 AUDITORIA COMPLETA DA TABELA "questions_direto" NO SUPABASE');
  console.log('='.repeat(80));

  // 1. Total Geral
  const { count: totalGeral, error: errTotal } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true });

  if (errTotal) {
    console.error('Erro ao contar total:', errTotal.message);
    return;
  }
  console.log(`\n📊 TOTAL GERAL DE REGISTROS: ${totalGeral.toLocaleString('pt-BR')}`);

  // 2. Total com Gabarito Homologado
  const { count: totalABCDE } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .in('correct_answer', ['A', 'B', 'C', 'D', 'E']);

  const { count: totalAnuladas } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .eq('is_anulada', true);

  const homologadasTotal = (totalABCDE || 0) + (totalAnuladas || 0);

  console.log(` - Gabaritos Válidos (A, B, C, D, E): ${(totalABCDE || 0).toLocaleString('pt-BR')}`);
  console.log(` - Questões Anuladas (is_anulada = true): ${(totalAnuladas || 0).toLocaleString('pt-BR')}`);
  console.log(` - TOTAL HOMOLOGADAS PADRÃO-OURO: ${homologadasTotal.toLocaleString('pt-BR')}`);

  // 3. Status de Comentários
  const { count: comComentarioTotal, error: errComm } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .not('commentary', 'is', null);

  const { count: semComentarioTotal, error: errSemComm } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .is('commentary', null);

  // Take-Home Message
  const { count: comTakeHome, error: errTHM } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .like('commentary', '%Take-Home Message%');

  const ouroCount = comTakeHome ?? 0;
  const legadoCount = Math.max(0, (comComentarioTotal || 0) - ouroCount);

  console.log('\n📝 SITUAÇÃO DOS COMENTÁRIOS:');
  console.log(` - Comentário Padrão-Ouro (Take-Home Message): ${ouroCount.toLocaleString('pt-BR')}`);
  console.log(` - Comentário Legado / Preliminar: ${legadoCount.toLocaleString('pt-BR')}`);
  console.log(` - Sem Comentário (NULL): ${(semComentarioTotal || 0).toLocaleString('pt-BR')}`);
  console.log(` - Total com Algum Comentário: ${(comComentarioTotal || 0).toLocaleString('pt-BR')} (${(((comComentarioTotal || 0) / totalGeral) * 100).toFixed(1)}%)`);

  // 4. Quantas faltam entre as Homologadas
  const { count: homologadasSemComentario } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .in('correct_answer', ['A', 'B', 'C', 'D', 'E'])
    .is('commentary', null);

  const { count: homologadasComComentario } = await supabase
    .from('questions_direto')
    .select('id', { count: 'exact', head: true })
    .in('correct_answer', ['A', 'B', 'C', 'D', 'E'])
    .not('commentary', 'is', null);

  console.log('\n🎯 RECORTE EXCLUSIVO: GABARITOS HOMOLOGADOS');
  console.log(` - Homologadas COM Comentário: ${(homologadasComComentario || 0).toLocaleString('pt-BR')} (${(((homologadasComComentario || 0) / (totalABCDE || 1)) * 100).toFixed(1)}%)`);
  console.log(` - Homologadas SEM Comentário (FALTAM): ${(homologadasSemComentario || 0).toLocaleString('pt-BR')} (${(((homologadasSemComentario || 0) / (totalABCDE || 1)) * 100).toFixed(1)}%)`);

  // 5. Quebra por Especialidade
  console.log('\n' + '='.repeat(80));
  console.log('🩺 DISTRIBUIÇÃO DAS HOMOLOGADAS POR ESPECIALIDADE:');
  console.log('='.repeat(80));

  const especialidades = [
    'Clínica Médica',
    'Cirurgia Geral',
    'Cirurgia',
    'Ginecologia e Obstetrícia',
    'Ginecologia',
    'Obstetrícia',
    'Pediatria',
    'Medicina Preventiva e Social',
    'Medicina Preventiva'
  ];

  const specReport = [];

  for (const esp of especialidades) {
    const { count: espHomologada } = await supabase
      .from('questions_direto')
      .select('id', { count: 'exact', head: true })
      .eq('especialidade', esp)
      .in('correct_answer', ['A', 'B', 'C', 'D', 'E']);

    if (!espHomologada || espHomologada === 0) continue;

    const { count: espComComentario } = await supabase
      .from('questions_direto')
      .select('id', { count: 'exact', head: true })
      .eq('especialidade', esp)
      .in('correct_answer', ['A', 'B', 'C', 'D', 'E'])
      .not('commentary', 'is', null);

    const { count: espSemComentario } = await supabase
      .from('questions_direto')
      .select('id', { count: 'exact', head: true })
      .eq('especialidade', esp)
      .in('correct_answer', ['A', 'B', 'C', 'D', 'E'])
      .is('commentary', null);

    const comComm = espComComentario || 0;
    const semComm = espSemComentario || 0;
    const pct = ((comComm / espHomologada) * 100).toFixed(1) + '%';

    specReport.push({
      especialidade: esp,
      homologadas: espHomologada,
      comComentario: comComm,
      pctComentada: pct,
      faltamComentar: semComm
    });
  }

  console.table(specReport);
}

runAudit();
