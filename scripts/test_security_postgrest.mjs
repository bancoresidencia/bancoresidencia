import fs from 'fs';
import { createClient } from '@supabase/supabase-js';

// Lê .env.local sem dependência de pacotes externos
let supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
let supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  try {
    const envContent = fs.readFileSync('.env.local', 'utf8');
    envContent.split('\n').forEach((line) => {
      const trimmed = line.trim();
      if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_URL=')) {
        supabaseUrl = trimmed.split('=')[1]?.trim();
      }
      if (trimmed.startsWith('NEXT_PUBLIC_SUPABASE_ANON_KEY=')) {
        supabaseAnonKey = trimmed.split('=')[1]?.trim();
      }
    });
  } catch (e) {
    // ignore
  }
}

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Variáveis NEXT_PUBLIC_SUPABASE_URL ou NEXT_PUBLIC_SUPABASE_ANON_KEY não encontradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

console.log('🔍 Executando teste de segurança na tabela public.questions...\n');

async function testPublicColumns() {
  console.log('1️⃣ Testando leitura de colunas públicas (enunciado, opções, ano)...');
  const { data, error } = await supabase
    .from('questions')
    .select('id, statement, year, banca')
    .limit(1);

  if (error) {
    console.error('   ❌ Falha inesperada ao ler colunas públicas:', error.message);
  } else {
    console.log('   ✅ SUCESSO: Alunos e visitantes conseguem ver o enunciado normalmente.');
    console.log('   Exemplo retornado:', data?.[0] ? `ID ${data[0].id} (${data[0].banca} - ${data[0].year})` : 'Nenhuma linha');
  }
}

async function testProtectedColumns() {
  console.log('\n2️⃣ Testando tentativa de raspagem das colunas protegidas (correct_answer, commentary)...');
  const { data, error } = await supabase
    .from('questions')
    .select('id, correct_answer, commentary')
    .limit(1);

  if (error) {
    console.log('   🛡️ BLOQUEADO COM SUCESSO PELO POSTGRESQL!');
    console.log(`   Código do Erro: ${error.code} (${error.message})`);
    console.log('   👉 A role anon já não tem permissão para ver gabarito ou comentário diretamente pelo PostgREST.\n');
  } else {
    console.warn('   ⚠️ ALERTA: As colunas foram retornadas diretamente pela anon key!');
    console.warn('   Dados expostos:', data);
    console.warn('   Execute o script 018 no SQL Editor do Supabase para fechar essa brecha!\n');
  }
}

async function run() {
  await testPublicColumns();
  await testProtectedColumns();
}

run();
