#!/usr/bin/env node

/**
 * Script de Testes Automatizados do Sistema de Embaixadores & Indicações
 * Valida todas as regras de negócio:
 * 1. Código individual por perfil
 * 2. Regra dos 7 dias de permanência para contabilização
 * 3. Desbloqueio do saque ao atingir 3 indicações válidas
 * 4. Card de Conquista (faltam X para saque, faltam Y para reembolso do plano)
 * 5. Reembolso total do plano com 10 indicações válidas
 * 6. Prevenção de autoindicação
 * 7. Endpoints e serviços de backend
 */

import assert from 'node:assert';
import {
  AMBASSADOR_CONFIG,
  generateInitialReferralCode,
  normalizeReferralCode,
  computeSaleMaturity,
  validateReferralCode,
  getAmbassadorStats,
  requestAmbassadorPixWithdrawal,
  requestAmbassadorPlanRefund,
  simulateAmbassadorSale
} from '../src/config/ambassadorConfig.ts';

import {
  getOrGenerateUserReferralCode,
  updateUserReferralCode,
  getBackendAmbassadorStats,
  requestBackendAmbassadorWithdrawal,
  requestBackendPlanRefund,
  simulateBackendAmbassadorSale,
  recordReferralSale
} from '../src/services/ambassadorService.ts';

console.log('================================================================');
console.log('🧪 TESTE COMPLETO: PROGRAMA DE EMBAIXADORES & INDICAÇÕES');
console.log('================================================================\n');

let testsPassed = 0;
let testsTotal = 0;

function runTest(name, fn) {
  testsTotal++;
  try {
    fn();
    console.log(`  ✓ [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
  }
}

async function runAsyncTest(name, fn) {
  testsTotal++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    testsPassed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err.message);
  }
}

// -------------------------------------------------------------
// GRUPO 1: CÓDIGOS DE INDICAÇÃO INDIVIDUAIS POR PERFIL
// -------------------------------------------------------------
console.log('--- 1. CÓDIGO DE INDICAÇÃO EXCLUSIVO POR PERFIL ---');

runTest('Gera código único determinístico para perfil do aluno', () => {
  const user1 = { id: 'usr-12345', name: 'Carlos Arruda', email: 'carlos@med.br', dailyGoal: 30, createdAt: '' };
  const user2 = { id: 'usr-67890', name: 'Mariana Silva', email: 'mariana@med.br', dailyGoal: 30, createdAt: '' };

  const code1 = generateInitialReferralCode(user1);
  const code2 = generateInitialReferralCode(user2);

  assert.strictEqual(code1, 'MED-CARLOS-USR');
  assert.strictEqual(code2, 'MED-MARIANA-USR');
  assert.notStrictEqual(code1, code2);
});

runTest('Normalização de código remove espaços e acentos', () => {
  assert.strictEqual(normalizeReferralCode(' med-joão-10 '), 'MED-JOO-10');
  assert.strictEqual(normalizeReferralCode('Dr_Lucas_2026!'), 'DR_LUCAS_2026');
});

runTest('Impede autoindicação (aluno usar o próprio código)', () => {
  const user = { id: 'usr-100', name: 'Gabriel Alencar', email: 'gabriel@med.br', dailyGoal: 30, createdAt: '' };
  const userCode = generateInitialReferralCode(user);

  const res = validateReferralCode(userCode, userCode, user.id, user);
  assert.strictEqual(res.valid, false);
  assert.match(res.message, /próprio código/i);
});

runTest('Valida código de colega com sucesso e 10% de desconto', () => {
  const res = validateReferralCode('MED-BEATRIZ', 'MED-CARLOS-10');
  assert.strictEqual(res.valid, true);
  assert.strictEqual(res.discountPercent, 10);
});

// -------------------------------------------------------------
// GRUPO 2: REGRA DOS 7 DIAS DE PERMANÊNCIA DO INDICADO
// -------------------------------------------------------------
console.log('\n--- 2. REGRA DOS 7 DIAS DE PERMANÊNCIA DO INDICADO ---');

runTest('Venda feita hoje está em período de retenção (não maturada)', () => {
  const today = new Date().toISOString();
  const maturity = computeSaleMaturity({ confirmedAt: today, retentionDays: 7, status: 'confirmed' });

  assert.strictEqual(maturity.isMatured, false);
  assert.strictEqual(maturity.daysRemaining, 7);
});

runTest('Venda feita há 3 dias permanece em retenção com 4 dias restantes', () => {
  const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
  const maturity = computeSaleMaturity({ confirmedAt: threeDaysAgo, retentionDays: 7, status: 'confirmed' });

  assert.strictEqual(maturity.isMatured, false);
  assert.strictEqual(maturity.daysRemaining, 4);
});

runTest('Venda feita há 8 dias é VÁLIDA / MATURADA (permanência >= 7 dias)', () => {
  const eightDaysAgo = new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString();
  const maturity = computeSaleMaturity({ confirmedAt: eightDaysAgo, retentionDays: 7, status: 'confirmed' });

  assert.strictEqual(maturity.isMatured, true);
  assert.strictEqual(maturity.daysRemaining, 0);
});

// -------------------------------------------------------------
// GRUPO 3: CONTABILIZAÇÃO DE SALDO & REGRAS DE SAQUE (META 3)
// -------------------------------------------------------------
console.log('\n--- 3. CONTABILIZAÇÃO DE SALDO & DESBLOQUEIO DE SAQUE (META 3) ---');

await runAsyncTest('Com 2 vendas válidas e 1 recente, saque permanece bloqueado e saldo disponível conta apenas as válidas', async () => {
  const testUserId = 'test-user-flow-1';

  // Adiciona 2 vendas válidas (> 7 dias)
  await simulateBackendAmbassadorSale(testUserId, 'annual', { matured: true, daysAgo: 9 });
  await simulateBackendAmbassadorSale(testUserId, 'annual', { matured: true, daysAgo: 10 });
  // Adiciona 1 venda recente (hoje, < 7 dias)
  await simulateBackendAmbassadorSale(testUserId, 'annual', { matured: false });

  const stats = await getBackendAmbassadorStats(testUserId, 'Dr. Teste');

  assert.strictEqual(stats.salesCount, 3, 'Total de vendas deve ser 3');
  assert.strictEqual(stats.validSalesCount, 2, 'Vendas válidas devem ser 2 (apenas as de 7+ dias)');
  assert.strictEqual(stats.pendingSalesCount, 1, 'Vendas pendentes devem ser 1 (a de hoje)');
  assert.strictEqual(stats.salesNeededForPix, 1, 'Falta 1 indicação válida para liberar saque');
  assert.strictEqual(stats.canWithdrawPix, false, 'Saque deve estar bloqueado com apenas 2 válidas');

  // Tentativa de saque deve ser rejeitada
  const withdrawAttempt = await requestBackendAmbassadorWithdrawal(testUserId, 50, '12345678900', 'cpf');
  assert.strictEqual(withdrawAttempt.success, false);
  assert.match(withdrawAttempt.message, /bloqueado/i);
});

await runAsyncTest('Ao atingir 3 indicações válidas, botão de saque via PIX é liberado com sucesso', async () => {
  const testUserId = 'test-user-flow-1';

  // Adiciona a 3ª indicação válida (> 7 dias)
  await simulateBackendAmbassadorSale(testUserId, 'annual', { matured: true, daysAgo: 8 });

  const stats = await getBackendAmbassadorStats(testUserId, 'Dr. Teste');

  assert.strictEqual(stats.validSalesCount, 3, 'Vendas válidas devem ser 3');
  assert.strictEqual(stats.salesNeededForPix, 0, 'Faltam 0 indicações para saque');
  assert.strictEqual(stats.canWithdrawPix, true, 'Saque deve estar liberado com 3 indicações válidas!');
  assert.ok(stats.availableBalance > 0, 'Saldo disponível deve ser maior que zero');

  // Executa o saque de R$ 50 via PIX
  const withdrawRes = await requestBackendAmbassadorWithdrawal(testUserId, 50, '11999998888', 'phone');
  assert.strictEqual(withdrawRes.success, true);
  assert.match(withdrawRes.message, /solicitado com sucesso via PIX/i);

  // Verifica que o saldo disponível foi reduzido
  const updatedStats = await getBackendAmbassadorStats(testUserId, 'Dr. Teste');
  assert.strictEqual(updatedStats.withdrawnBalance, 50);
  assert.strictEqual(updatedStats.availableBalance, parseFloat((stats.availableBalance - 50).toFixed(2)));
});

// -------------------------------------------------------------
// GRUPO 4: CARD DE CONQUISTA & REEMBOLSO TOTAL DO PLANO (META 10)
// -------------------------------------------------------------
console.log('\n--- 4. CARD DE CONQUISTA & REEMBOLSO TOTAL (META 10) ---');

await runAsyncTest('Card de conquista reflete exatamente o que falta para saque e para reembolso', async () => {
  const testUserId = 'test-user-conquista';

  // 1 venda válida de 7+ dias
  await simulateBackendAmbassadorSale(testUserId, 'annual', { matured: true, daysAgo: 10 });
  const stats = await getBackendAmbassadorStats(testUserId, 'Dra. Conquista');

  assert.strictEqual(stats.validSalesCount, 1);
  assert.strictEqual(stats.salesNeededForPix, 2, 'Faltam 2 indicações válidas para sacar');
  assert.strictEqual(stats.salesNeededForPlanRefund, 9, 'Faltam 9 indicações para receber o reembolso total do plano adquirido');
  assert.strictEqual(stats.canRequestPlanRefund, false);
});

await runAsyncTest('Ao atingir 10 indicações válidas, conquista do reembolso integral é desbloqueada', async () => {
  const testUserId = 'test-user-refund-10';

  // Simula 10 vendas válidas com mais de 7 dias de permanência
  for (let i = 0; i < 10; i++) {
    await simulateBackendAmbassadorSale(testUserId, 'annual', { matured: true, daysAgo: 8 + i });
  }

  const stats = await getBackendAmbassadorStats(testUserId, 'Dr. Top Embaixador');

  assert.strictEqual(stats.validSalesCount, 10);
  assert.strictEqual(stats.salesNeededForPix, 0);
  assert.strictEqual(stats.salesNeededForPlanRefund, 0, 'Faltam 0 indicações para reembolso');
  assert.strictEqual(stats.hasAmbassadorBadge, true, 'Selo de Embaixador conquistado');
  assert.strictEqual(stats.canRequestPlanRefund, true, 'Direito ao reembolso do plano adquirido conquistado');

  // Solicita o reembolso do plano
  const refundRes = await requestBackendPlanRefund(testUserId);
  assert.strictEqual(refundRes.success, true);
  assert.match(refundRes.message, /100% estornado/i);

  const statsAfter = await getBackendAmbassadorStats(testUserId, 'Dr. Top Embaixador');
  assert.strictEqual(statsAfter.planRefundRequested, true);
});

// -------------------------------------------------------------
// GRUPO 5: PERSONALIZAÇÃO DE CÓDIGO
// -------------------------------------------------------------
console.log('\n--- 5. PERSONALIZAÇÃO DE CÓDIGO ---');

await runAsyncTest('Aluno pode atualizar seu código para um código customizado válido', async () => {
  const testUserId = 'test-user-custom-code';
  const customCode = 'DR-MEDICO-2026';

  const updateRes = await updateUserReferralCode(testUserId, customCode);
  assert.strictEqual(updateRes.success, true);

  const code = await getOrGenerateUserReferralCode(testUserId);
  assert.strictEqual(code, customCode);
});

console.log('\n================================================================');
console.log(`🏁 RESULTADO DOS TESTES: ${testsPassed} / ${testsTotal} PASSARAM`);
console.log('================================================================\n');

if (testsPassed === testsTotal) {
  process.exit(0);
} else {
  process.exit(1);
}

