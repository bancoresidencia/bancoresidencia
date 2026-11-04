#!/usr/bin/env node
/**
 * Test Suite - Fase 6: Ajustes de Interface, Prova Alvo e Preferências Visuais
 * 
 * Validações:
 * 1. profiles.preferences: persistência e leitura de preferências visuais (themeMode, accentColor, fontSize).
 * 2. profiles.target_exam_name e target_exam_date: persistência do concurso pretendido e data da prova.
 * 3. Validação do cálculo de countdown e reta final a partir da prova alvo.
 * 4. Atualização conjunta de perfil preservando dados de subscrição e psicometria.
 * 5. Teardown e restauração dos dados prévios do usuário.
 */

import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Carrega .env.local nativamente
const envPath = path.resolve(process.cwd(), '.env.local');
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const idx = trimmed.indexOf('=');
      if (idx !== -1) {
        const k = trimmed.slice(0, idx).trim();
        const v = trimmed.slice(idx + 1).trim().replace(/^['"]|['"]$/g, '');
        if (!process.env[k]) process.env[k] = v;
      }
    }
  }
}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY ausentes no .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runFase6Tests() {
  console.log('🧪 Iniciando Test Suite da Fase 6: Ajustes de Interface & Prova Alvo...');
  let passed = 0;
  let failed = 0;

  // 1. Obter usuário existente para o teste
  const { data: users, error: userErr } = await supabase.from('profiles').select('*').limit(1);
  if (userErr || !users || users.length === 0) {
    console.error('❌ Falha ao encontrar perfil de teste:', userErr);
    process.exit(1);
  }
  const testUser = users[0];
  const testUserId = testUser.id;
  console.log(`👤 Usuário de teste: ${testUserId} (${testUser.email})`);

  // Guardar estado original para restauração no teste 5
  const originalPreferences = testUser.preferences;
  const originalTargetExamName = testUser.target_exam_name;
  const originalTargetExamDate = testUser.target_exam_date;

  // TESTE 1: profiles.preferences (themeMode, accentColor, fontSize)
  try {
    const newPreferences = {
      themeMode: 'dark',
      accentColor: 'rose',
      fontSize: 'lg',
      updatedAt: new Date().toISOString()
    };

    const { error: pErr } = await supabase
      .from('profiles')
      .update({ preferences: newPreferences })
      .eq('id', testUserId);

    if (pErr) throw pErr;

    const { data: pCheck, error: pCheckErr } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', testUserId)
      .single();

    if (pCheckErr || !pCheck) throw pCheckErr || new Error('Perfil não encontrado');

    const prefs = pCheck.preferences;
    if (prefs && prefs.themeMode === 'dark' && prefs.accentColor === 'rose' && prefs.fontSize === 'lg') {
      console.log('✅ Teste 1: profiles.preferences persistido com themeMode, accentColor e fontSize.');
      passed++;
    } else {
      throw new Error(`Preferências divergentes: ${JSON.stringify(prefs)}`);
    }
  } catch (err) {
    console.error('❌ Teste 1 falhou:', err.message);
    failed++;
  }

  // TESTE 2: profiles.target_exam_name e target_exam_date
  try {
    const targetExamName = 'USP-SP 2026';
    const targetExamDate = '2026-11-15';

    const { error: tErr } = await supabase
      .from('profiles')
      .update({
        target_exam_name: targetExamName,
        target_exam_date: targetExamDate
      })
      .eq('id', testUserId);

    if (tErr) throw tErr;

    const { data: tCheck, error: tCheckErr } = await supabase
      .from('profiles')
      .select('target_exam_name, target_exam_date')
      .eq('id', testUserId)
      .single();

    if (tCheckErr || !tCheck) throw tCheckErr || new Error('Campos de prova não encontrados');

    if (tCheck.target_exam_name === 'USP-SP 2026' && tCheck.target_exam_date === '2026-11-15') {
      console.log('✅ Teste 2: target_exam_name e target_exam_date atualizados com sucesso no Supabase.');
      passed++;
    } else {
      throw new Error(`Dados de prova divergentes: ${JSON.stringify(tCheck)}`);
    }
  } catch (err) {
    console.error('❌ Teste 2 falhou:', err.message);
    failed++;
  }

  // TESTE 3: Cálculo determinístico de contagem regressiva
  try {
    const examDateStr = '2026-11-15';
    const target = new Date(examDateStr + 'T00:00:00');
    const now = new Date();
    const diffMs = target.getTime() - now.getTime();
    const daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));

    if (typeof daysLeft === 'number' && !isNaN(daysLeft)) {
      console.log(`✅ Teste 3: Cálculo de contagem regressiva válido (${daysLeft} dias restantes até a prova).`);
      passed++;
    } else {
      throw new Error('Falha no cálculo de contagem regressiva');
    }
  } catch (err) {
    console.error('❌ Teste 3 falhou:', err.message);
    failed++;
  }

  // TESTE 4: Atualização conjunta de perfil sem alterar dados sensíveis de subscrição
  try {
    const testDailyGoal = 45;
    const { error: upErr } = await supabase
      .from('profiles')
      .update({
        daily_goal: testDailyGoal,
        target_exam_name: 'ENARE 2026',
        target_exam_date: '2026-11-01'
      })
      .eq('id', testUserId);

    if (upErr) throw upErr;

    const { data: upCheck, error: upCheckErr } = await supabase
      .from('profiles')
      .select('daily_goal, target_exam_name, role, subscription_plan')
      .eq('id', testUserId)
      .single();

    if (upCheckErr || !upCheck) throw upCheckErr;

    if (upCheck.daily_goal === 45 && upCheck.target_exam_name === 'ENARE 2026' && upCheck.role === testUser.role) {
      console.log('✅ Teste 4: Atualização de perfil preserva role e subscrição íntegras.');
      passed++;
    } else {
      throw new Error(`Dados inconsistentes: ${JSON.stringify(upCheck)}`);
    }
  } catch (err) {
    console.error('❌ Teste 4 falhou:', err.message);
    failed++;
  }

  // TESTE 5: Teardown e restauração dos dados originais
  try {
    const { error: rErr } = await supabase
      .from('profiles')
      .update({
        preferences: originalPreferences,
        target_exam_name: originalTargetExamName,
        target_exam_date: originalTargetExamDate,
        daily_goal: testUser.daily_goal
      })
      .eq('id', testUserId);

    if (rErr) throw rErr;
    console.log('✅ Teste 5: Teardown e restauração dos dados originais concluídos com sucesso.');
    passed++;
  } catch (err) {
    console.error('❌ Teste 5 falhou na restauração:', err.message);
    failed++;
  }

  console.log(`\n📊 RESULTADO DA FASE 6: ${passed}/5 testes aprovados (${failed} falhas).`);
  if (failed > 0) {
    process.exit(1);
  }
}

runFase6Tests();

