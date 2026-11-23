#!/usr/bin/env node

/**
 * Teste dos HTTP Handlers das Rotas da API de Embaixador:
 * - /api/ambassador/stats (GET)
 * - /api/ambassador/code (POST)
 * - /api/ambassador/withdraw (POST)
 * - /api/ambassador/refund-plan (POST)
 * - /api/ambassador/simulate (POST)
 */

import assert from 'node:assert';
import { NextRequest } from 'next/server';
import { GET as getStatsRoute } from '../src/app/api/ambassador/stats/route.ts';
import { POST as postCodeRoute } from '../src/app/api/ambassador/code/route.ts';
import { POST as postWithdrawRoute } from '../src/app/api/ambassador/withdraw/route.ts';
import { POST as postRefundRoute } from '../src/app/api/ambassador/refund-plan/route.ts';
import { POST as postSimulateRoute } from '../src/app/api/ambassador/simulate/route.ts';
import { GET as getAdminUsersRoute } from '../src/app/api/admin/users/route.ts';
import { POST as postAdminSubscriptionRoute } from '../src/app/api/admin/users/subscription/route.ts';
import { GET as getAdminPaymentsRoute } from '../src/app/api/admin/payments/route.ts';
import { GET as getAdminPayoutsRoute } from '../src/app/api/admin/ambassador/payouts/route.ts';
import { POST as postProcessPayoutRoute } from '../src/app/api/admin/ambassador/payouts/process/route.ts';
import { POST as postProcessRefundRoute } from '../src/app/api/admin/ambassador/refunds/process/route.ts';

console.log('================================================================');
console.log('🌐 TESTE DAS ROTAS DE API DO BACKEND (/api/ambassador/*)');
console.log('================================================================\n');

const TEST_M2M_TOKEN = 'test-token-m2m-ambassador-secure-suite-12345';
process.env.ADMIN_M2M_TOKEN = TEST_M2M_TOKEN;

let passed = 0;
let total = 0;

async function test(name, fn) {
  total++;
  try {
    await fn();
    console.log(`  ✓ [PASS] ${name}`);
    passed++;
  } catch (err) {
    console.error(`  ❌ [FAIL] ${name}:`, err);
  }
}

const mockUserId = 'usr-api-test-123';

function makeAuthHeaders(userId = mockUserId) {
  return {
    Authorization: `Bearer ${TEST_M2M_TOKEN}`,
    'x-test-user-id': userId,
    'Content-Type': 'application/json'
  };
}

// 1. GET /api/ambassador/stats
await test('GET /api/ambassador/stats retorna estatísticas do usuário', async () => {
  const req = new NextRequest(`http://localhost:3000/api/ambassador/stats?userId=${mockUserId}`, {
    headers: makeAuthHeaders()
  });
  const res = await getStatsRoute(req);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(data.stats);
  assert.ok(data.stats.referralCode);
  assert.strictEqual(data.stats.salesNeededForPix, 3);
  assert.strictEqual(data.stats.canWithdrawPix, false);
});

// 2. POST /api/ambassador/code
await test('POST /api/ambassador/code atualiza código de indicação', async () => {
  const req = new NextRequest('http://localhost:3000/api/ambassador/code', {
    method: 'POST',
    headers: makeAuthHeaders(),
    body: JSON.stringify({ userId: mockUserId, code: 'MED-DOUTOR-VIP' })
  });
  const res = await postCodeRoute(req);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.code, 'MED-DOUTOR-VIP');
});

// 3. POST /api/ambassador/simulate (adiciona venda recente de hoje)
await test('POST /api/ambassador/simulate adiciona venda recente de hoje', async () => {
  const req = new NextRequest('http://localhost:3000/api/ambassador/simulate', {
    method: 'POST',
    headers: makeAuthHeaders(),
    body: JSON.stringify({ userId: mockUserId, planType: 'annual', matured: false })
  });
  const res = await postSimulateRoute(req);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.strictEqual(data.sale.isMatured, false);
  assert.strictEqual(data.sale.daysRemaining, 7);
});

// 4. POST /api/ambassador/withdraw com menos de 3 válidas deve ser rejeitado (400)
await test('POST /api/ambassador/withdraw com menos de 3 válidas é rejeitado com status 400', async () => {
  const req = new NextRequest('http://localhost:3000/api/ambassador/withdraw', {
    method: 'POST',
    headers: makeAuthHeaders(),
    body: JSON.stringify({ userId: mockUserId, amount: 20, pixKey: '12345678900', pixKeyType: 'cpf' })
  });
  const res = await postWithdrawRoute(req);
  const data = await res.json();

  assert.strictEqual(res.status, 400);
  assert.strictEqual(data.success, false);
  assert.match(data.message, /bloqueado/i);
});

// 5. Simular 3 vendas válidas (> 7 dias) para liberar saque
await test('POST /api/ambassador/simulate adiciona 3 vendas válidas de 8+ dias atrás', async () => {
  for (let i = 0; i < 3; i++) {
    const req = new NextRequest('http://localhost:3000/api/ambassador/simulate', {
      method: 'POST',
      headers: makeAuthHeaders(),
      body: JSON.stringify({ userId: mockUserId, planType: 'annual', matured: true, daysAgo: 8 + i })
    });
    const res = await postSimulateRoute(req);
    const data = await res.json();
    assert.strictEqual(res.status, 200);
    assert.strictEqual(data.sale.isMatured, true);
  }
});

// 6. POST /api/ambassador/withdraw com 3 vendas válidas tem sucesso
await test('POST /api/ambassador/withdraw com 3 vendas válidas é aprovado com sucesso', async () => {
  const req = new NextRequest('http://localhost:3000/api/ambassador/withdraw', {
    method: 'POST',
    headers: makeAuthHeaders(),
    body: JSON.stringify({ userId: mockUserId, amount: 35.50, pixKey: 'email@aluno.com', pixKeyType: 'email' })
  });
  const res = await postWithdrawRoute(req);
  const data = await res.json();

  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(data.withdrawal);
  assert.strictEqual(data.withdrawal.amount, 35.50);
});

// 7. Simular 7 vendas válidas adicionais para atingir 10
await test('Simular vendas para atingir 10 e testar POST /api/ambassador/refund-plan', async () => {
  for (let i = 0; i < 7; i++) {
    const req = new NextRequest('http://localhost:3000/api/ambassador/simulate', {
      method: 'POST',
      headers: makeAuthHeaders(),
      body: JSON.stringify({ userId: mockUserId, planType: 'annual', matured: true, daysAgo: 10 + i })
    });
    await postSimulateRoute(req);
  }

  const refundReq = new NextRequest('http://localhost:3000/api/ambassador/refund-plan', {
    method: 'POST',
    headers: makeAuthHeaders(),
    body: JSON.stringify({ userId: mockUserId })
  });
  const refundRes = await postRefundRoute(refundReq);
  const refundData = await refundRes.json();

  assert.strictEqual(refundRes.status, 200);
  assert.strictEqual(refundData.success, true);
  assert.match(refundData.message, /100% estornado/i);
});

// 8. GET /api/admin/users bloqueia acesso sem privilégios e permite com token M2M de admin
await test('GET /api/admin/users valida controle de acesso restrito a admins', async () => {
  const unauthReq = new NextRequest('http://localhost:3000/api/admin/users');
  const unauthRes = await getAdminUsersRoute(unauthReq);
  assert.strictEqual(unauthRes.status, 401);

  const authReq = new NextRequest('http://localhost:3000/api/admin/users', {
    headers: makeAuthHeaders()
  });
  const authRes = await getAdminUsersRoute(authReq);
  const data = await authRes.json();
  assert.strictEqual(authRes.status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(data.metrics !== undefined);
  assert.ok(Array.isArray(data.users));
});

// 9. GET /api/admin/payments retorna lista e métricas agregadas
await test('GET /api/admin/payments retorna métricas financeiras e lista de pedidos', async () => {
  const req = new NextRequest('http://localhost:3000/api/admin/payments', {
    headers: makeAuthHeaders()
  });
  const res = await getAdminPaymentsRoute(req);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(data.metrics !== undefined);
  assert.ok(data.pagination !== undefined);
});

// 10. GET /api/admin/ambassador/payouts retorna saques, reembolsos e top embaixadores
await test('GET /api/admin/ambassador/payouts retorna saques e reembolsos', async () => {
  const req = new NextRequest('http://localhost:3000/api/admin/ambassador/payouts', {
    headers: makeAuthHeaders()
  });
  const res = await getAdminPayoutsRoute(req);
  const data = await res.json();
  assert.strictEqual(res.status, 200);
  assert.strictEqual(data.success, true);
  assert.ok(Array.isArray(data.withdrawals));
  assert.ok(Array.isArray(data.refundRequests));
  assert.ok(Array.isArray(data.topAmbassadors));
  assert.ok(data.metrics !== undefined);
});

// 11. Validações de entrada em endpoints POST administrativos
await test('Endpoints POST administrativos rejeitam payloads inválidos com 400', async () => {
  const subReq = new NextRequest('http://localhost:3000/api/admin/users/subscription', {
    method: 'POST',
    headers: makeAuthHeaders(),
    body: JSON.stringify({ userId: '', action: 'invalid' })
  });
  const subRes = await postAdminSubscriptionRoute(subReq);
  assert.strictEqual(subRes.status, 400);

  const payoutReq = new NextRequest('http://localhost:3000/api/admin/ambassador/payouts/process', {
    method: 'POST',
    headers: makeAuthHeaders(),
    body: JSON.stringify({ withdrawalId: '', action: 'invalid' })
  });
  const payoutRes = await postProcessPayoutRoute(payoutReq);
  assert.strictEqual(payoutRes.status, 400);

  const refReq = new NextRequest('http://localhost:3000/api/admin/ambassador/refunds/process', {
    method: 'POST',
    headers: makeAuthHeaders(),
    body: JSON.stringify({ refundRequestId: '', action: 'invalid' })
  });
  const refRes = await postProcessRefundRoute(refReq);
  assert.strictEqual(refRes.status, 400);
});

console.log('\n================================================================');
console.log(`🏁 RESULTADO DOS TESTES DE API: ${passed} / ${total} PASSARAM`);
console.log('================================================================\n');

if (passed === total) {
  process.exit(0);
} else {
  process.exit(1);
}
