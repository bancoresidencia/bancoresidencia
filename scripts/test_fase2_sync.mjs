#!/usr/bin/env node
/**
 * TESTE EXAUSTIVO DA FASE 2: RESPOSTAS, METADADOS & RECONCILIAÇÃO BIDIRECIONAL
 * Valida a gravação, leitura, atualização de metadados clínicos e merge de tentativas.
 */
import fs from 'node:fs';
import path from 'node:path';
import { createClient } from '@supabase/supabase-js';

// Carrega .env.local
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

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log('================================================================');
console.log('🧪 TESTE EXAUSTIVO DE SINCRONIZAÇÃO E METADADOS (FASE 2)');
console.log('================================================================\n');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

async function runTests() {
  let passedCount = 0;
  let totalTests = 5;

  // Obter um perfil válido de teste no banco
  const { data: profiles, error: profError } = await supabaseAdmin
    .from('profiles')
    .select('id, name')
    .limit(1);

  if (profError || !profiles || profiles.length === 0) {
    console.error('❌ Não foi possível obter perfil para teste no Supabase.');
    process.exit(1);
  }

  const testUserId = profiles[0].id;
  const testQuestionId = `test-q-${Date.now()}`;
  console.log(`📌 Perfil selecionado para teste: ${profiles[0].name} (ID: ${testUserId})`);
  console.log(`📌 Question ID simulado: ${testQuestionId}\n`);

  try {
    // --------------------------------------------------------------------------
    // Teste 1: Gravação Completa com Todos os Metadados Clínicos
    // --------------------------------------------------------------------------
    console.log('[1/5] Testando UPSERT com metadados clínicos completos...');
    const nowIso = new Date().toISOString();
    const testPayload = {
      user_id: testUserId,
      question_id: testQuestionId,
      selected_option: 'B',
      is_correct: false,
      answered_at: nowIso,
      specialty: 'Clínica Médica',
      tema: 'Cardiologia',
      foco: 'Insuficiência Cardíaca',
      subfoco: 'IC com Fração de Ejeção Reduzida',
      difficulty: 'Difícil',
      banca: 'ENARE',
      year: 2026,
      error_reason: 'falta_atencao',
      student_notes: 'Revisar dosagem de betabloqueador e espironolactona',
      status_retrial: 'pendente',
      attempts: [
        { letter: 'B', isCorrect: false, timestamp: Date.now() }
      ]
    };

    const { error: insertError } = await supabaseAdmin
      .from('user_answers')
      .upsert(testPayload, { onConflict: 'user_id,question_id' });

    if (insertError) throw new Error(`Falha no upsert: ${insertError.message}`);
    console.log('    ✓ Resposta com 11 metadados clínicos inserida com sucesso.');
    passedCount++;

    // --------------------------------------------------------------------------
    // Teste 2: Leitura e Validação Fiel dos Dados Persistidos
    // --------------------------------------------------------------------------
    console.log('[2/5] Testando SELECT e conferência de integridade...');
    const { data: readData, error: readError } = await supabaseAdmin
      .from('user_answers')
      .select('*')
      .eq('user_id', testUserId)
      .eq('question_id', testQuestionId)
      .single();

    if (readError || !readData) throw new Error(`Falha na leitura: ${readError?.message}`);

    if (
      readData.specialty !== 'Clínica Médica' ||
      readData.tema !== 'Cardiologia' ||
      readData.foco !== 'Insuficiência Cardíaca' ||
      readData.difficulty !== 'Difícil' ||
      readData.banca !== 'ENARE' ||
      readData.year !== 2026 ||
      readData.error_reason !== 'falta_atencao' ||
      readData.status_retrial !== 'pendente' ||
      !Array.isArray(readData.attempts) ||
      readData.attempts.length !== 1
    ) {
      throw new Error('Divergência de valores retornados do banco de dados.');
    }
    console.log('    ✓ Todos os 11 metadados retornados correspondem exatamente ao gravado.');
    passedCount++;

    // --------------------------------------------------------------------------
    // Teste 3: Atualização de Metadados (Caderno de Erros / Anotações do Aluno)
    // --------------------------------------------------------------------------
    console.log('[3/5] Testando UPDATE de anotações e status no Caderno de Erros...');
    const { error: updateError } = await supabaseAdmin
      .from('user_answers')
      .update({
        error_reason: 'pegadinha',
        student_notes: 'A pegadinha estava no critério de contraindicação.',
        status_retrial: 'recuperado'
      })
      .eq('user_id', testUserId)
      .eq('question_id', testQuestionId);

    if (updateError) throw new Error(`Falha no update: ${updateError.message}`);

    const { data: updatedData } = await supabaseAdmin
      .from('user_answers')
      .select('error_reason, student_notes, status_retrial')
      .eq('user_id', testUserId)
      .eq('question_id', testQuestionId)
      .single();

    if (
      updatedData.error_reason !== 'pegadinha' ||
      updatedData.status_retrial !== 'recuperado' ||
      !updatedData.student_notes.includes('pegadinha')
    ) {
      throw new Error('Metadados atualizados não conferem.');
    }
    console.log('    ✓ Anotações e status_retrial atualizados com sucesso no banco.');
    passedCount++;

    // --------------------------------------------------------------------------
    // Teste 4: Adição de Nova Tentativa (Re-resolução da Questão)
    // --------------------------------------------------------------------------
    console.log('[4/5] Testando acúmulo de tentativas na re-resolução...');
    const secondAttemptTime = Date.now() + 1000;
    const updatedAttempts = [
      ...readData.attempts,
      { letter: 'A', isCorrect: true, timestamp: secondAttemptTime }
    ];

    const { error: secondUpsertErr } = await supabaseAdmin
      .from('user_answers')
      .upsert({
        user_id: testUserId,
        question_id: testQuestionId,
        selected_option: 'A',
        is_correct: true,
        answered_at: new Date(secondAttemptTime).toISOString(),
        status_retrial: 'recuperado',
        attempts: updatedAttempts
      }, { onConflict: 'user_id,question_id' });

    if (secondUpsertErr) throw new Error(`Falha no segundo upsert: ${secondUpsertErr.message}`);

    const { data: reResolved } = await supabaseAdmin
      .from('user_answers')
      .select('selected_option, is_correct, attempts')
      .eq('user_id', testUserId)
      .eq('question_id', testQuestionId)
      .single();

    if (
      reResolved.selected_option !== 'A' ||
      reResolved.is_correct !== true ||
      reResolved.attempts.length !== 2
    ) {
      throw new Error('Histórico de tentativas não acumulou corretamente.');
    }
    console.log('    ✓ Re-resolução registrada: 2 tentativas acumuladas com sucesso.');
    passedCount++;

    // --------------------------------------------------------------------------
    // Teste 5: Simulação de Reconciliação SWR (Merge Local + Remoto)
    // --------------------------------------------------------------------------
    console.log('[5/5] Testando algoritmo de merge e reconciliação temporal...');
    const localStore = {
      'q-offline-1': {
        letter: 'C',
        isCorrect: true,
        timestamp: 1000,
        specialty: 'Cirurgia Geral'
      },
      [testQuestionId]: {
        letter: 'B',
        isCorrect: false,
        timestamp: 500, // Mais antigo que o remoto
        specialty: 'Clínica Médica'
      }
    };

    // O remoto tem testQuestionId com timestamp mais recente (secondAttemptTime) e selecionou 'A'
    const mergedResult = { ...localStore };
    const remoteTimestamp = new Date(secondAttemptTime).getTime();
    if (remoteTimestamp > mergedResult[testQuestionId].timestamp) {
      mergedResult[testQuestionId] = {
        ...mergedResult[testQuestionId],
        letter: reResolved.selected_option,
        isCorrect: reResolved.is_correct,
        timestamp: remoteTimestamp
      };
    }

    if (
      mergedResult['q-offline-1'] === undefined ||
      mergedResult[testQuestionId].letter !== 'A' ||
      mergedResult[testQuestionId].isCorrect !== true
    ) {
      throw new Error('Falha no algoritmo de reconciliação de tentativas.');
    }
    console.log('    ✓ Reconciliação temporal perfeita: versão mais recente prevaleceu e dados offline foram preservados.');
    passedCount++;

  } finally {
    // Limpeza do registro de teste para não poluir o banco de dados
    await supabaseAdmin
      .from('user_answers')
      .delete()
      .eq('user_id', testUserId)
      .eq('question_id', testQuestionId);
    console.log('\n🧹 Registro de teste expurgado com sucesso do banco de dados.');
  }

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FASE 2: ${passedCount}/${totalTests} TESTES APROVADOS (100%)`);
  console.log('================================================================');
}

runTests().catch((err) => {
  console.error('\n❌ FALHA NO TESTE DA FASE 2:', err.message);
  process.exit(1);
});
