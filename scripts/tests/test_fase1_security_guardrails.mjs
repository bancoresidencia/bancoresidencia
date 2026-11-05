import crypto from 'crypto';
import { createClient } from '@supabase/supabase-js';

console.log('\n======================================================');
console.log('🛡️ TESTE AUTOMATIZADO DA FASE 1: BLINDAGEM DE SEGURANÇA');
console.log('======================================================\n');

const BASE_URL = process.env.TEST_APP_URL || 'http://localhost:3000';
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const MP_SECRET = process.env.MERCADO_PAGO_WEBHOOK_SECRET || process.env.MERCADOPAGO_WEBHOOK_SECRET || 'test_secret_for_validation_12345';

async function makeRequest(path, options = {}) {
  const url = `${BASE_URL}${path}`;
  const start = performance.now();
  try {
    const res = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      }
    });
    const elapsed = performance.now() - start;
    let body = null;
    try {
      body = await res.json();
    } catch {
      // not json
    }
    return {
      status: res.status,
      body,
      elapsedMs: Math.round(elapsed)
    };
  } catch (err) {
    const elapsed = performance.now() - start;
    return {
      status: 0,
      error: err.message,
      elapsedMs: Math.round(elapsed)
    };
  }
}

async function getRealStudentToken() {
  if (!SUPABASE_URL || !SERVICE_KEY || !ANON_KEY) return null;
  try {
    const admin = createClient(SUPABASE_URL, SERVICE_KEY);
    const client = createClient(SUPABASE_URL, ANON_KEY);

    const { data: usersData } = await admin.auth.admin.listUsers({ page: 1, perPage: 1 });
    const userEmail = usersData?.users?.[0]?.email || 'drivesckek@gmail.com';

    const { data: linkData, error: lErr } = await admin.auth.admin.generateLink({
      type: 'magiclink',
      email: userEmail
    });
    if (lErr || !linkData?.properties?.email_otp) return null;

    const { data: authData, error: aErr } = await client.auth.verifyOtp({
      email: userEmail,
      token: linkData.properties.email_otp,
      type: 'magiclink'
    });
    if (aErr || !authData?.session?.access_token) return null;

    return authData.session.access_token;
  } catch {
    return null;
  }
}

async function runTests() {
  let passed = 0;
  let failed = 0;

  function report(name, isSuccess, details) {
    if (isSuccess) {
      console.log(`✅ [PASS] ${name} (${details.elapsedMs}ms)`);
      if (details.info) console.log(`   └─ ${details.info}`);
      passed++;
    } else {
      console.error(`❌ [FAIL] ${name} (${details.elapsedMs}ms)`);
      if (details.error) console.error(`   └─ Erro: ${details.error}`);
      if (details.status) console.error(`   └─ Status retornado: ${details.status}`);
      failed++;
    }
  }

  console.log(`🌐 Alvo dos testes: ${BASE_URL}\n`);

  // --- PARTE A: REJEIÇÃO DE REQUISIÇÕES ANÔNIMAS / FORJADAS (SECURITY GUARDS) ---

  // 1. Bloqueio em /api/ai/performance-mentor
  {
    const res = await makeRequest('/api/ai/performance-mentor', {
      method: 'POST',
      body: JSON.stringify({ targetExam: 'ENARE', totalAnswered: 50 })
    });
    const ok = res.status === 401;
    report('1. Proteção de Rota IA: /api/ai/performance-mentor (Rejeição Anônima)', ok, {
      elapsedMs: res.elapsedMs,
      status: res.status,
      info: `Status: 401 Unauthorized em ${res.elapsedMs}ms`,
      error: ok ? null : `Esperado status 401, recebeu ${res.status}`
    });
  }

  // 2. Bloqueio em /api/ai/study-generator
  {
    const res = await makeRequest('/api/ai/study-generator', {
      method: 'POST',
      body: JSON.stringify({ especialidade: 'Clínica Médica', tema: 'Cardiologia', foco: 'HAS' })
    });
    const ok = res.status === 401;
    report('2. Proteção de Rota IA: /api/ai/study-generator (Economia de Tokens Vertex/Gemini)', ok, {
      elapsedMs: res.elapsedMs,
      status: res.status,
      info: `Status: 401 Unauthorized em ${res.elapsedMs}ms (Sem consumir 60s nem quota de IA)`,
      error: ok ? null : `Esperado status 401, recebeu ${res.status}`
    });
  }

  // 3. Bloqueio em /api/ai/smart-filter
  {
    const res = await makeRequest('/api/ai/smart-filter', {
      method: 'POST',
      body: JSON.stringify({ prompt: '10 questões de pediatria' })
    });
    const ok = res.status === 401;
    report('3. Proteção de Rota IA: /api/ai/smart-filter (Rejeição Anônima)', ok, {
      elapsedMs: res.elapsedMs,
      status: res.status,
      info: `Status: 401 Unauthorized em ${res.elapsedMs}ms`,
      error: ok ? null : `Esperado status 401, recebeu ${res.status}`
    });
  }

  // 4. Bloqueio em /api/ai/banca-raiox
  {
    const res = await makeRequest('/api/ai/banca-raiox', {
      method: 'POST',
      body: JSON.stringify({ banca: 'ENARE' })
    });
    const ok = res.status === 401;
    report('4. Proteção de Rota IA: /api/ai/banca-raiox (Rejeição Anônima)', ok, {
      elapsedMs: res.elapsedMs,
      status: res.status,
      info: `Status: 401 Unauthorized em ${res.elapsedMs}ms`,
      error: ok ? null : `Esperado status 401, recebeu ${res.status}`
    });
  }

  // 5. Bloqueio em /api/ai/schedule-optimizer
  {
    const res = await makeRequest('/api/ai/schedule-optimizer', {
      method: 'POST',
      body: JSON.stringify({ prompt: 'Otimizar estudo hoje' })
    });
    const ok = res.status === 401;
    report('5. Proteção de Rota IA: /api/ai/schedule-optimizer (Rejeição Anônima)', ok, {
      elapsedMs: res.elapsedMs,
      status: res.status,
      info: `Status: 401 Unauthorized em ${res.elapsedMs}ms`,
      error: ok ? null : `Esperado status 401, recebeu ${res.status}`
    });
  }

  // 6. Bloqueio em /api/knowledge/book
  {
    const testPath = 'clinica_medica/cardiologia/hipertensao_arterial.json';
    const res = await makeRequest(`/api/knowledge/book?path=${encodeURIComponent(testPath)}`, {
      method: 'GET'
    });
    const ok = res.status === 401;
    report('6. Proteção do Acervo: /api/knowledge/book (Bloqueio de Download Anônimo)', ok, {
      elapsedMs: res.elapsedMs,
      status: res.status,
      info: `Status: 401 Unauthorized em ${res.elapsedMs}ms (Impedindo scraping em massa)`,
      error: ok ? null : `Esperado status 401, recebeu ${res.status}`
    });
  }

  // 7. Rejeição de Assinatura Forjada em /api/webhooks/mercadopago
  {
    const res = await makeRequest('/api/webhooks/mercadopago?id=123456789&topic=payment', {
      method: 'POST',
      headers: {
        'x-signature': 'ts=1700000000,v1=assinatura_falsa_forjada_invalida',
        'x-request-id': 'req-test-uuid'
      },
      body: JSON.stringify({
        action: 'payment.updated',
        data: { id: '123456789' }
      })
    });
    const ok = res.status === 401;
    report('7. Validação HMAC: /api/webhooks/mercadopago (Rejeição de Assinatura Forjada)', ok, {
      elapsedMs: res.elapsedMs,
      status: res.status,
      info: `Status: 401 Unauthorized em ${res.elapsedMs}ms (HMAC SHA-256 barrou a falsificação)`,
      error: ok ? null : `Esperado status 401, recebeu ${res.status}`
    });
  }

  // --- PARTE B: LIBERAÇÃO CORRETA PARA ESTUDANTES AUTENTICADOS (NO REGRESSION) ---
  console.log('\n🔑 Obtendo token JWT de estudante válido para testes de autorização...');
  const studentToken = await getRealStudentToken();

  if (studentToken) {
    // 8. Estudante Autenticado acessando /api/ai/smart-filter
    {
      const res = await makeRequest('/api/ai/smart-filter', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${studentToken}` },
        body: JSON.stringify({ prompt: '10 questões de pediatria' })
      });
      // Aceita 200 (sucesso da IA) ou status válido processado
      const ok = res.status === 200 || (res.status !== 401 && res.status !== 403);
      report('8. Autorização de Aluno: /api/ai/smart-filter (Acesso com JWT Válido)', ok, {
        elapsedMs: res.elapsedMs,
        status: res.status,
        info: `Status: ${res.status} (Aluno autenticado liberado com sucesso!)`,
        error: ok ? null : `Acesso foi incorretamente bloqueado: ${res.status}`
      });
    }

    // 9. Estudante Autenticado acessando /api/knowledge/book
    {
      const testPath = 'clinica_medica/cardiologia/hipertensao_arterial.json';
      const res = await makeRequest(`/api/knowledge/book?path=${encodeURIComponent(testPath)}`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${studentToken}` }
      });
      const ok = res.status === 200 || res.status === 404 || res.status === 502; // Não pode ser 401 nem 403
      report('9. Autorização de Aluno: /api/knowledge/book (Download do Livro Liberado com JWT)', ok, {
        elapsedMs: res.elapsedMs,
        status: res.status,
        info: `Status: ${res.status} (Acesso ao acervo médico autorizado)`,
        error: ok ? null : `Acesso foi bloqueado com status ${res.status}`
      });
    }
  } else {
    console.log('⚠️ Aviso: Token de estudante não gerado no ambiente local; pulando testes 8 e 9.');
  }

  console.log('\n------------------------------------------------------');
  console.log(`📊 RESULTADO FINAL DA BATERIA DA FASE 1:`);
  console.log(`   ✅ Aprovados: ${passed}/${passed + failed}`);
  console.log(`   ❌ Falhas:    ${failed}/${passed + failed}`);
  console.log('------------------------------------------------------\n');

  if (failed > 0) {
    process.exit(1);
  }
}

runTests();
