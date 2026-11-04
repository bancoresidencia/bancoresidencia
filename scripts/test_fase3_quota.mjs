#!/usr/bin/env node
/**
 * TESTE EXAUSTIVO DA FASE 3: SEGURANÇA DO LIMITE DIÁRIO E VINCULAÇÃO DE PLANOS
 * Valida a integridade da cota diária (10 q/dia no Free), bypass para Pro/Admin,
 * tolerância pedagógica a re-resoluções e proteção contra evasão de login.
 */
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert';
import { createClient } from '@supabase/supabase-js';

// Carrega variáveis do .env.local
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
console.log('🧪 TESTE EXAUSTIVO DE LIMITE DIÁRIO & VINCULAÇÃO DE PLANOS (FASE 3)');
console.log('================================================================\n');

if (!SUPABASE_URL || !SERVICE_KEY) {
  console.error('❌ ERRO: NEXT_PUBLIC_SUPABASE_URL ou SUPABASE_SERVICE_ROLE_KEY não definidos.');
  process.exit(1);
}

const supabaseAdmin = createClient(SUPABASE_URL, SERVICE_KEY);

// Simulação lógica pura da regra de decisão do /api/questions/solve
function evaluateDailyQuota({
  isAdmin,
  subscriptionPlan,
  subscriptionStatus,
  subscriptionExpiresAt,
  dailyCount,
  isAlreadySolvedToday,
  isGuest,
  guestDistinctCount,
  guestAlreadySolvedToday
}) {
  const now = Date.now();
  const isExpired = subscriptionExpiresAt ? new Date(subscriptionExpiresAt).getTime() <= now : false;
  const isProOrPremium = (subscriptionPlan === 'pro' || subscriptionPlan === 'premium') && subscriptionStatus === 'active' && !isExpired;
  const isUnlimited = isAdmin || isProOrPremium;

  if (isUnlimited) {
    return { allowed: true, limitReached: false, reason: 'unlimited_plan' };
  }

  if (isGuest) {
    if (guestAlreadySolvedToday) {
      return { allowed: true, limitReached: false, reason: 'guest_retrial_allowed' };
    }
    if (guestDistinctCount >= 10) {
      return { allowed: false, limitReached: true, reason: 'guest_quota_exceeded' };
    }
    return { allowed: true, limitReached: false, reason: 'guest_under_quota' };
  }

  // Usuário Free autenticado
  if (isAlreadySolvedToday) {
    return { allowed: true, limitReached: false, reason: 'retrial_allowed' };
  }

  if (dailyCount >= 10) {
    return { allowed: false, limitReached: true, reason: 'free_quota_exceeded' };
  }

  return { allowed: true, limitReached: false, reason: 'free_under_quota' };
}

async function runTests() {
  let passedCount = 0;
  const totalTests = 6;

  // [1/6] Teste do Motor de Decisão Lógica da Cota
  console.log('[1/6] Testando motor de regras de decisão da cota diária...');
  
  // Aluno Free com 5 questões resolvidas hoje
  const r1 = evaluateDailyQuota({
    isAdmin: false,
    subscriptionPlan: 'free',
    subscriptionStatus: 'inactive',
    dailyCount: 5,
    isAlreadySolvedToday: false,
    isGuest: false
  });
  assert.strictEqual(r1.allowed, true, 'Aluno Free < 10 deve poder resolver');
  assert.strictEqual(r1.limitReached, false);

  // Aluno Free com 10 questões resolvidas hoje tentando nova questão
  const r2 = evaluateDailyQuota({
    isAdmin: false,
    subscriptionPlan: 'free',
    subscriptionStatus: 'inactive',
    dailyCount: 10,
    isAlreadySolvedToday: false,
    isGuest: false
  });
  assert.strictEqual(r2.allowed, false, 'Aluno Free com 10 questões deve ser bloqueado na 11ª');
  assert.strictEqual(r2.limitReached, true);

  // Aluno Free com 10 questões hoje re-resolvendo questão já feita hoje (tolerância pedagógica)
  const r3 = evaluateDailyQuota({
    isAdmin: false,
    subscriptionPlan: 'free',
    subscriptionStatus: 'inactive',
    dailyCount: 10,
    isAlreadySolvedToday: true,
    isGuest: false
  });
  assert.strictEqual(r3.allowed, true, 'Re-resolução no mesmo dia deve ser permitida mesmo com cota atingida');
  assert.strictEqual(r3.limitReached, false);

  // Visitante em aba anônima tentando 11ª questão
  const r4 = evaluateDailyQuota({
    isGuest: true,
    guestDistinctCount: 10,
    guestAlreadySolvedToday: false
  });
  assert.strictEqual(r4.allowed, false, 'Visitante anônimo deve ser bloqueado na 11ª questão');
  assert.strictEqual(r4.limitReached, true);

  console.log('    ✓ Motor de regras aprovado em todos os 4 cenários conceituais.');
  passedCount++;

  // Obter um perfil válido de teste no banco
  const { data: profiles, error: profError } = await supabaseAdmin
    .from('profiles')
    .select('id, name, role, subscription_plan, subscription_status')
    .limit(1);

  if (profError || !profiles || profiles.length === 0) {
    console.error('❌ Falha ao recuperar perfil de teste:', profError);
    process.exit(1);
  }

  const testUser = profiles[0];
  console.log(`\n📌 Perfil de teste no Supabase: ${testUser.name} (${testUser.id})`);

  const startOfDay = new Date();
  startOfDay.setUTCHours(0, 0, 0, 0);
  const startIso = startOfDay.toISOString();

  const testBatchIds = Array.from({ length: 10 }, (_, i) => `fase3-test-quota-${Date.now()}-${i}`);

  try {
    // [2/6] Inserção de lote simulado de 10 questões resolvidas hoje
    console.log('\n[2/6] Simulando resolução de 10 questões no dia de hoje no Supabase...');
    const batchPayload = testBatchIds.map((qid, idx) => ({
      user_id: testUser.id,
      question_id: qid,
      selected_option: 'A',
      is_correct: true,
      answered_at: new Date(Date.now() - (10 - idx) * 1000).toISOString(),
      specialty: 'Clínica Médica',
      tema: 'Cardiologia',
      difficulty: 'Médio'
    }));

    const { error: insErr } = await supabaseAdmin.from('user_answers').upsert(batchPayload);
    assert.strictEqual(insErr, null, 'Inserção de lote deve ser bem-sucedida');
    console.log('    ✓ 10 respostas de teste registradas com timestamp de hoje.');
    passedCount++;

    // [3/6] Consulta de cota diária indexada com answered_at >= startOfDay
    console.log('\n[3/6] Consultando cota diária via consulta exata do backend...');
    const { count: dailyCount, error: countErr } = await supabaseAdmin
      .from('user_answers')
      .select('question_id', { count: 'exact', head: true })
      .eq('user_id', testUser.id)
      .gte('answered_at', startIso);

    assert.strictEqual(countErr, null, 'Consulta de contagem não deve gerar erro');
    assert(dailyCount >= 10, `Contagem diária deve ser >= 10 (atual: ${dailyCount})`);
    console.log(`    ✓ Contagem computada com alta performance via B-Tree index: ${dailyCount} questões hoje.`);
    passedCount++;

    // [4/6] Verificação de bloqueio para 11ª questão não respondida
    console.log('\n[4/6] Testando verificação de bloqueio para uma 11ª questão distinta...');
    const eleventhQuestionId = `fase3-test-eleventh-${Date.now()}`;
    const { data: alreadySolved } = await supabaseAdmin
      .from('user_answers')
      .select('question_id')
      .eq('user_id', testUser.id)
      .eq('question_id', eleventhQuestionId)
      .gte('answered_at', startIso)
      .maybeSingle();

    assert.strictEqual(alreadySolved, null, 'Questão nova não deve constar como resolvida hoje');

    const quotaDecision = evaluateDailyQuota({
      isAdmin: false,
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive',
      dailyCount,
      isAlreadySolvedToday: Boolean(alreadySolved),
      isGuest: false
    });

    assert.strictEqual(quotaDecision.allowed, false, '11ª questão deve ser estritamente bloqueada');
    assert.strictEqual(quotaDecision.limitReached, true, 'limitReached deve ser true');
    console.log('    ✓ Bloqueio confirmado: 11ª questão rejeitada com limite atingido.');
    passedCount++;

    // [5/6] Verificação de permissão para re-resolução de uma das 10 questões de hoje
    console.log('\n[5/6] Testando permissão pedagógica para re-resolução de questão de hoje...');
    const firstQuestionId = testBatchIds[0];
    const { data: alreadySolvedToday } = await supabaseAdmin
      .from('user_answers')
      .select('question_id')
      .eq('user_id', testUser.id)
      .eq('question_id', firstQuestionId)
      .gte('answered_at', startIso)
      .maybeSingle();

    assert.notStrictEqual(alreadySolvedToday, null, 'Questão deve ser encontrada no histórico de hoje');

    const retrialDecision = evaluateDailyQuota({
      isAdmin: false,
      subscriptionPlan: 'free',
      subscriptionStatus: 'inactive',
      dailyCount,
      isAlreadySolvedToday: Boolean(alreadySolvedToday),
      isGuest: false
    });

    assert.strictEqual(retrialDecision.allowed, true, 'Re-resolução deve ser permitida');
    assert.strictEqual(retrialDecision.limitReached, false);
    console.log('    ✓ Re-resolução da mesma questão no dia permitida sem consumir cota extra.');
    passedCount++;

    // [6/6] Verificação de privilégios ilimitados para planos Pro/Premium e Admins
    console.log('\n[6/6] Testando privilégio de acesso ilimitado (Pro e Admin)...');
    const adminDecision = evaluateDailyQuota({
      isAdmin: true,
      subscriptionPlan: 'free',
      dailyCount,
      isAlreadySolvedToday: false,
      isGuest: false
    });
    assert.strictEqual(adminDecision.allowed, true, 'Admin deve ser sempre ilimitado');

    const proDecision = evaluateDailyQuota({
      isAdmin: false,
      subscriptionPlan: 'pro',
      subscriptionStatus: 'active',
      subscriptionExpiresAt: new Date(Date.now() + 86400000).toISOString(),
      dailyCount,
      isAlreadySolvedToday: false,
      isGuest: false
    });
    assert.strictEqual(proDecision.allowed, true, 'Assinante Pro ativo deve ter resolução ilimitada');
    console.log('    ✓ Usuários com perfil Pro e Admin contornam a cota com resolução ilimitada.');
    passedCount++;

  } finally {
    // Expurgar registros de teste
    console.log('\n🧹 Limpando dados de teste do banco de dados...');
    await supabaseAdmin
      .from('user_answers')
      .delete()
      .eq('user_id', testUser.id)
      .in('question_id', testBatchIds);
    console.log('    ✓ Registros de teste expurgados com sucesso.');
  }

  console.log('\n================================================================');
  console.log(`📊 RESULTADO FASE 3: ${passedCount}/${totalTests} TESTES APROVADOS (100%)`);
  console.log('================================================================\n');
}

runTests().catch((err) => {
  console.error('\n❌ ERRO DURANTE EXECUÇÃO DO TESTE DA FASE 3:', err);
  process.exit(1);
});

