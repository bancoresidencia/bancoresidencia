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

if (!supabaseUrl || !supabaseKey) {
  console.error('Credenciais do Supabase ausentes.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('='.repeat(70));
  console.log('🔍 AUDITORIA READ-ONLY: ESTADO ATUAL DO SUPABASE PÓS-RESTAURAÇÃO');
  console.log('='.repeat(70));

  // 1. Amostra para ver colunas
  const { data: sample, error: errSample } = await supabase.from('questions').select('*').limit(1);
  if (errSample) {
    console.error('Erro ao buscar amostra de questions:', errSample);
    return;
  }
  const cols = sample && sample[0] ? Object.keys(sample[0]) : [];
  console.log(`\n📋 Colunas na tabela 'questions' (${cols.length}):`);
  console.log(cols.join(', '));

  // 2. Contagens globais na tabela questions
  const { count: totalQ } = await supabase.from('questions').select('*', { count: 'exact', head: true });
  const { count: withCommentary } = await supabase.from('questions').select('*', { count: 'exact', head: true }).not('commentary', 'is', null).neq('commentary', '');
  const { count: withAnswer } = await supabase.from('questions').select('*', { count: 'exact', head: true }).not('correct_answer', 'is', null).neq('correct_answer', '');
  const { count: anuladas } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('is_anulada', true);

  console.log('\n📊 Totais na tabela questions:');
  console.log(`- Total de Questões: ${totalQ.toLocaleString()}`);
  console.log(`- Com Comentário: ${withCommentary.toLocaleString()} (${((withCommentary / totalQ) * 100).toFixed(2)}%)`);
  console.log(`- Sem Comentário: ${(totalQ - withCommentary).toLocaleString()} (${(((totalQ - withCommentary) / totalQ) * 100).toFixed(2)}%)`);
  console.log(`- Com Gabarito (correct_answer): ${withAnswer.toLocaleString()}`);
  console.log(`- Anuladas: ${anuladas.toLocaleString()}`);

  // 3. Distribuição por especialidade
  console.log('\n🏥 Distribuição por Especialidade no Supabase:');
  const specs = [
    'Clínica Médica',
    'Cirurgia Geral',
    'Cirurgia',
    'Pediatria',
    'Ginecologia e Obstetrícia',
    'Ginecologia',
    'Obstetrícia',
    'Medicina Preventiva',
    'Medicina Preventiva e Social',
    'Urologia',
    'Dermatologia',
    'Infectologia',
    'Ortopedia',
    'Oftalmologia',
    'Psiquiatria'
  ];

  for (const s of specs) {
    const { count } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', s);
    if (count > 0) {
      const { count: cWithComm } = await supabase.from('questions').select('*', { count: 'exact', head: true }).eq('especialidade', s).not('commentary', 'is', null).neq('commentary', '');
      console.log(`  - ${s.padEnd(30)}: ${count.toString().padStart(6)} questões | Com comentário: ${cWithComm.toString().padStart(6)} (${((cWithComm / count) * 100).toFixed(1)}%)`);
    }
  }

  // 4. Checar outras tabelas
  console.log('\n📦 Outras tabelas do Supabase:');
  const possibleTables = [
    'exams',
    'official_exams',
    'profiles',
    'lists',
    'list_items',
    'user_answers',
    'audit_logs',
    'curadoria_history',
    'comments',
    'question_comments',
    'user_stats',
    'system_metrics'
  ];

  for (const t of possibleTables) {
    try {
      const { count, error } = await supabase.from(t).select('*', { count: 'exact', head: true });
      if (!error && count !== null) {
        console.log(`  - ${t.padEnd(25)}: ${count} registros`);
      }
    } catch (e) {}
  }
}

run().catch(console.error);
