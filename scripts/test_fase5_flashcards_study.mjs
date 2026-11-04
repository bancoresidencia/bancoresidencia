#!/usr/bin/env node
/**
 * Test Suite - Fase 5: Persistência de Flashcards (FSRS) & Materiais de Estudo
 * 
 * Validações:
 * 1. user_flashcard_progress: upsert de estado FSRS (repetitions, interval_days, ease_factor, stability, difficulty, retrievability, last_reviewed_at, next_review_date).
 * 2. user_flashcard_decks: upsert de baralho personalizado (title, description, card_ids).
 * 3. user_created_flashcards: criação de cartão próprio do aluno (front, back, specialty, theme, focus, comment, priority).
 * 4. user_study_progress: progresso de leitura em resumo clínico (material_id, read_time_minutes, is_completed, last_read_at).
 * 5. Limpeza de dados de teste (teardown seguro).
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

async function runFase5Tests() {
  console.log('🧪 Iniciando Test Suite da Fase 5: Flashcards FSRS & Materiais de Estudo...');
  let passed = 0;
  let failed = 0;

  // 1. Obter usuário existente para o teste
  const { data: users, error: userErr } = await supabase.from('profiles').select('id, email').limit(1);
  if (userErr || !users || users.length === 0) {
    console.error('❌ Falha ao encontrar perfil de teste:', userErr);
    process.exit(1);
  }
  const testUserId = users[0].id;
  console.log(`👤 Usuário de teste: ${testUserId} (${users[0].email})`);

  const testCardId = `fc_test_${Date.now()}`;
  const testDeckId = `deck_test_${Date.now()}`;
  const testUserCardId = `user_fc_test_${Date.now()}`;
  const testMaterialId = `mat_test_${Date.now()}`;

  // TESTE 1: user_flashcard_progress
  try {
    const nowIso = new Date().toISOString();
    const nextReviewIso = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString();

    const { error: pErr } = await supabase.from('user_flashcard_progress').upsert({
      user_id: testUserId,
      card_id: testCardId,
      state: 'review',
      repetitions: 3,
      interval_days: 2,
      ease_factor: 2.65,
      stability: 7.95,
      difficulty: 4.5,
      retrievability: 0.9,
      lapses: 0,
      last_reviewed_at: nowIso,
      next_review_date: nextReviewIso
    }, { onConflict: 'user_id,card_id' });

    if (pErr) throw pErr;

    const { data: pCheck, error: pCheckErr } = await supabase
      .from('user_flashcard_progress')
      .select('*')
      .eq('user_id', testUserId)
      .eq('card_id', testCardId)
      .single();

    if (pCheckErr || !pCheck) throw pCheckErr || new Error('Registro não encontrado');

    if (pCheck.state === 'review' && Number(pCheck.interval_days) === 2 && Number(pCheck.repetitions) === 3) {
      console.log('✅ Teste 1: user_flashcard_progress persistido com parâmetros FSRS.');
      passed++;
    } else {
      throw new Error(`Dados inconsistentes: ${JSON.stringify(pCheck)}`);
    }
  } catch (err) {
    console.error('❌ Teste 1 falhou:', err.message);
    failed++;
  }

  // TESTE 2: user_flashcard_decks
  try {
    const { error: dErr } = await supabase.from('user_flashcard_decks').upsert({
      id: testDeckId,
      user_id: testUserId,
      title: 'Baralho de Revisão Reta Final ENARE',
      description: 'Flashcards de alto rendimento para cirurgia e clínica',
      card_ids: [testCardId, 'fc_dummy_1', 'fc_dummy_2']
    }, { onConflict: 'id' });

    if (dErr) throw dErr;

    const { data: dCheck, error: dCheckErr } = await supabase
      .from('user_flashcard_decks')
      .select('*')
      .eq('id', testDeckId)
      .single();

    if (dCheckErr || !dCheck) throw dCheckErr || new Error('Baralho não encontrado');

    if (dCheck.title === 'Baralho de Revisão Reta Final ENARE' && Array.isArray(dCheck.card_ids) && dCheck.card_ids.length === 3) {
      console.log('✅ Teste 2: user_flashcard_decks salvo e verificado (title e card_ids).');
      passed++;
    } else {
      throw new Error(`Dados do baralho divergentes: ${JSON.stringify(dCheck)}`);
    }
  } catch (err) {
    console.error('❌ Teste 2 falhou:', err.message);
    failed++;
  }

  // TESTE 3: user_created_flashcards
  try {
    const { error: cErr } = await supabase.from('user_created_flashcards').upsert({
      id: testUserCardId,
      user_id: testUserId,
      front: 'Qual o achado tomográfico clássico da pneumonia por COVID-19?',
      back: 'Opacidades com atenuação em vidro fosco, com distribuição periférica e bilateral.',
      specialty: 'Clínica Médica',
      theme: 'Pneumologia',
      focus: 'Pneumonia Viral',
      comment: 'Cai com frequência na USP e no ENARE',
      priority: 'essential'
    }, { onConflict: 'id' });

    if (cErr) throw cErr;

    const { data: cCheck, error: cCheckErr } = await supabase
      .from('user_created_flashcards')
      .select('*')
      .eq('id', testUserCardId)
      .single();

    if (cCheckErr || !cCheck) throw cCheckErr || new Error('Cartão criado não encontrado');

    if (cCheck.front.includes('COVID-19') && cCheck.priority === 'essential') {
      console.log('✅ Teste 3: user_created_flashcards persistido com campos clínicos.');
      passed++;
    } else {
      throw new Error(`Dados do cartão divergentes: ${JSON.stringify(cCheck)}`);
    }
  } catch (err) {
    console.error('❌ Teste 3 falhou:', err.message);
    failed++;
  }

  // TESTE 4: user_study_progress
  try {
    const nowIso = new Date().toISOString();
    const { error: sErr } = await supabase.from('user_study_progress').upsert({
      user_id: testUserId,
      material_id: testMaterialId,
      read_time_minutes: 8,
      is_completed: true,
      last_read_at: nowIso,
      notes: 'Lido e revisado os pontos-chave de conduta.'
    }, { onConflict: 'user_id,material_id' });

    if (sErr) throw sErr;

    const { data: sCheck, error: sCheckErr } = await supabase
      .from('user_study_progress')
      .select('*')
      .eq('user_id', testUserId)
      .eq('material_id', testMaterialId)
      .single();

    if (sCheckErr || !sCheck) throw sCheckErr || new Error('Progresso de estudo não encontrado');

    if (sCheck.is_completed === true && sCheck.read_time_minutes === 8) {
      console.log('✅ Teste 4: user_study_progress validado (read_time_minutes, is_completed).');
      passed++;
    } else {
      throw new Error(`Dados de estudo divergentes: ${JSON.stringify(sCheck)}`);
    }
  } catch (err) {
    console.error('❌ Teste 4 falhou:', err.message);
    failed++;
  }

  // TESTE 5: Teardown dos dados de teste
  try {
    await supabase.from('user_flashcard_progress').delete().eq('card_id', testCardId);
    await supabase.from('user_flashcard_decks').delete().eq('id', testDeckId);
    await supabase.from('user_created_flashcards').delete().eq('id', testUserCardId);
    await supabase.from('user_study_progress').delete().eq('material_id', testMaterialId);
    console.log('✅ Teste 5: Teardown e limpeza de registros efetuados com sucesso.');
    passed++;
  } catch (err) {
    console.error('❌ Teste 5 falhou na limpeza:', err.message);
    failed++;
  }

  console.log(`\n📊 RESULTADO DA FASE 5: ${passed}/5 testes aprovados (${failed} falhas).`);
  if (failed > 0) {
    process.exit(1);
  }
}

runFase5Tests();
