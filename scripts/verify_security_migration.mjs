#!/usr/bin/env node
import { createClient } from '@supabase/supabase-js';
import fs from 'node:fs';
import path from 'node:path';

// Carrega .env.local se disponível
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx !== -1) {
        const key = trimmed.slice(0, eqIdx).trim();
        const val = trimmed.slice(eqIdx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[key]) {
          process.env[key] = val;
        }
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('================================================================');
console.log('🔍 BANCO RESIDÊNCIA — DIAGNÓSTICO DE INFRAESTRUTURA & SEGURANÇA');
console.log('================================================================\n');

if (!supabaseUrl || !anonKey) {
  console.error('❌ ERRO: Variáveis NEXT_PUBLIC_SUPABASE_URL ou ANON_KEY não configuradas.');
  process.exit(1);
}

const clientAnon = createClient(supabaseUrl, anonKey);
const clientAdmin = serviceKey ? createClient(supabaseUrl, serviceKey) : null;

async function runDiagnostics() {
  console.log(`[1] Supabase Host: ${supabaseUrl}`);
  console.log(`    Service Role Key configurada: ${serviceKey ? 'SIM (ativo)' : 'NÃO (atenção)'}\n`);

  // 1. Teste de Exposição Pública de Gabaritos via Anon Key (PostgREST)
  console.log('[2] Testando proteção de gabarito contra anon key...');
  try {
    const { data, error } = await clientAnon
      .from('questions')
      .select('id, correct_answer')
      .limit(1);

    if (error) {
      console.log('    🛡️  SUCESSO: Anon key foi bloqueada de ler correct_answer no PostgreSQL.');
      console.log(`       Código retornado pelo banco: ${error.code} (${error.message})`);
    } else if (data && data.length > 0 && data[0].correct_answer) {
      console.log('    ⚠️  AVISO PENDENTE: A role anon ainda consegue projetar correct_answer diretamente.');
      console.log('       Ação recomendada: Execute o arquivo "migrations/005_anti_scraping_and_storage_protection.sql" no SQL Editor do Supabase.');
    } else {
      console.log('    ✓ Coluna correct_answer protegida ou sem valores expostos para anon.');
    }
  } catch (err) {
    console.log('    🛡️  Exceção ao tentar consulta direta:', err.message);
  }

  // 2. Teste de Acesso Público ao Storage medical-knowledge
  console.log('\n[3] Testando se o bucket medical-knowledge está privado...');
  try {
    const { data, error } = await clientAnon.storage
      .from('medical-knowledge')
      .download('Cardiologia/Bradiarritmias.json');

    if (error) {
      console.log('    🛡️  SUCESSO: Acesso anônimo direto ao bucket medical-knowledge está bloqueado.');
      console.log(`       Resposta do Storage: ${error.message}`);
    } else if (data) {
      console.log('    ⚠️  AVISO PENDENTE: O bucket medical-knowledge ainda permite download anônimo direto.');
      console.log('       Ação recomendada: Execute "migrations/005_anti_scraping_and_storage_protection.sql" para tornar o bucket privado.');
    }
  } catch (err) {
    console.log('    🛡️  Acesso anônimo ao bucket bloqueado:', err.message);
  }

  // 3. Teste da Tabela audit_logs
  console.log('\n[4] Testando tabela de auditoria (audit_logs)...');
  if (clientAdmin) {
    try {
      const { data, error } = await clientAdmin
        .from('audit_logs')
        .select('id, action, created_at')
        .limit(1);

      if (error && error.code === '42P01') {
        console.log('    ⚠️  AVISO PENDENTE: Tabela "audit_logs" ainda não foi criada no banco.');
        console.log('       Ação recomendada: Execute "migrations/006_data_integrity_and_audit_logs.sql" no SQL Editor do Supabase.');
      } else if (error) {
        console.log(`    ℹ️  Resposta da tabela audit_logs: ${error.message}`);
      } else {
        console.log('    🛡️  SUCESSO: Tabela audit_logs está ativa e pronta para registrar auditorias.');
      }
    } catch (err) {
      console.log('    ℹ️  Erro ao verificar audit_logs:', err.message);
    }
  } else {
    console.log('    ℹ️  Pulando teste direto de audit_logs (sem SUPABASE_SERVICE_ROLE_KEY).');
  }

  console.log('\n================================================================');
  console.log('🏁 DIAGNÓSTICO CONCLUÍDO');
  console.log('================================================================\n');
}

runDiagnostics();
