#!/usr/bin/env node

/**
 * Script de verificação de status do Google OAuth no Supabase
 * Executar com: node scripts/check_google_auth.mjs
 */

const SUPABASE_URL = 'https://ezluharxlmlqhdkqrjbz.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV6bHVoYXJ4bG1scWhka3FyamJ6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTEyNDkxNzcsImV4cCI6MjEwNjgyNTE3N30.kT9521OP3j5yTmnQTqF6Wzl29xc6ZjV2UzF8EB_5xrI';

async function check() {
  console.log('🔍 Checando status do provedor Google no Supabase...');
  try {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/settings`, {
      headers: { 'apikey': ANON_KEY }
    });
    const settings = await res.json();
    const isGoogleEnabled = Boolean(settings?.external?.google);

    if (isGoogleEnabled) {
      console.log('✅ PROVEDOR GOOGLE ATIVO NO SUPABASE!');
      console.log('O fluxo de login social está 100% pronto para uso.');
    } else {
      console.log('⚠️ PROVEDOR GOOGLE AINDA NÃO ATIVADO NO SUPABASE.');
      console.log('Acesse https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/auth/providers');
      console.log('Ative o Google e cole o Client ID e Secret.');
    }
  } catch (err) {
    console.error('Erro ao verificar:', err.message);
  }
}

check();
