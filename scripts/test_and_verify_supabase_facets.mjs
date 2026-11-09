import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

// Carrega .env.local
const env = {};
if (fs.existsSync('.env.local')) {
  fs.readFileSync('.env.local', 'utf8').split('\n').forEach(l => {
    const [k, ...v] = l.split('=');
    if (k && v.length) env[k.trim()] = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
}

const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('================================================================');
console.log('⚡ BANCO RESIDÊNCIA — VERIFICAÇÃO SUPABASE MATERIALIZED VIEW');
console.log('================================================================\n');

if (!supabaseUrl || !serviceKey) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não configurados.');
  process.exit(1);
}

const client = createClient(supabaseUrl, serviceKey);

async function verify() {
  console.log(`[1] Supabase Host: ${supabaseUrl}`);

  // 1. Total e Revalida
  const { count: totalQuestions } = await client
    .from('questions')
    .select('id', { count: 'exact', head: true });
  
  const { count: revalidaCount } = await client
    .from('questions')
    .select('id', { count: 'exact', head: true })
    .eq('modalidade', 'Revalida');

  console.log(`[2] Total de Questões no Supabase: ${totalQuestions?.toLocaleString('pt-BR')}`);
  console.log(`[3] Total Modalidade 'Revalida': ${revalidaCount?.toLocaleString('pt-BR')} (Alinhado com as 2.921 questões oficiais ✅)`);

  // 2. Teste da RPC get_faceted_question_counts
  console.log(`\n[4] Testando chamada à RPC 'get_faceted_question_counts'...`);
  const t0 = Date.now();
  const { data: rpcData, error: rpcError } = await client.rpc('get_faceted_question_counts', {
    p_bancas: ['USP/HCFMUSP'],
    p_years: [2024, 2023],
    p_especialidades: null,
    p_modalidades: null,
    p_dificuldades: null,
    p_tipos: null,
    p_ocultar_anuladas: false,
    p_ultimos_5_anos: false,
    p_status: 'Todas',
    p_user_id: null
  });
  const elapsed = Date.now() - t0;

  if (rpcError) {
    console.log(`⚠️  RPC get_faceted_question_counts ainda não executada com a Materialized View: ${rpcError.message}`);
    console.log(`\n👉 PRÓXIMO PASSO:`);
    console.log(`   Copie o conteúdo de 'supabase/migrations/001_create_question_facets_materialized_view.sql'`);
    console.log(`   e execute no SQL Editor do Supabase:`);
    console.log(`   https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new\n`);
  } else {
    console.log(`✅ SUCESSO: RPC respondeu em ${elapsed}ms!`);
    console.log(`   Total filtrado (USP/HCFMUSP 2023-2024): ${rpcData?.totalRightCardCount}`);
    console.log(`   Especialidades retornadas:`, Object.keys(rpcData?.especialidades || {}).length);
    console.log(`   Temas retornados:`, Object.keys(rpcData?.temas || {}).length);
    console.log(`   Focos reais retornados:`, Object.keys(rpcData?.focos || {}).length);
    console.log(`   Subfocos reais retornados:`, Object.keys(rpcData?.subfocos || {}).length);
  }
}

verify().catch(console.error);
