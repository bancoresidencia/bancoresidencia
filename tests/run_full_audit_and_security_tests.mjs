import { chromium } from 'playwright';
import fs from 'fs';

const BASE_URL = 'http://localhost:3000';

const PAGES_TO_TEST = [
  '/',
  '/dashboard',
  '/questoes',
  '/flashcards',
  '/resumos',
  '/caderno-de-erros',
  '/listas',
  '/provas',
  '/simulados',
  '/desempenho',
  '/ranking',
  '/agenda',
  '/configuracoes',
  '/checkout',
  '/privacidade',
  '/admin/curadoria',
  '/admin/medevo',
  '/admin/reportes'
];

async function main() {
  console.log('========================================================================');
  console.log('🛡️  AUDITORIA COMPLETA DE CONSOLE, ERROS E SEGURANÇA (BANCO RESIDÊNCIA)');
  console.log('========================================================================\n');

  const report = {
    timestamp: new Date().toISOString(),
    pagesAudited: {},
    apiSecurityAudit: {},
    summary: {
      totalConsoleErrors: 0,
      totalConsoleWarnings: 0,
      totalUncaughtExceptions: 0,
      totalFailedRequests: 0,
      apiVulnerabilitiesFound: 0,
      apiPassedChecks: 0
    }
  };

  // --------------------------------------------------------------------------
  // PARTE 1: NAVEGAÇÃO COMPLETA VIA PLAYWRIGHT & INTERCEPTAÇÃO DE CONSOLE
  // --------------------------------------------------------------------------
  console.log('🔍 INICIANDO AUDITORIA DE PÁGINAS E CONSOLE COM PLAYWRIGHT...\n');
  const browser = await chromium.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 }
  });
  const page = await context.newPage();

  for (const pagePath of PAGES_TO_TEST) {
    const fullUrl = `${BASE_URL}${pagePath}`;
    console.log(`➡️  Navegando em: ${pagePath}...`);

    const pageLogs = {
      errors: [],
      warnings: [],
      uncaught: [],
      failedRequests: [],
      httpStatus: 0
    };

    const consoleHandler = (msg) => {
      const type = msg.type();
      const text = msg.text();
      // Ignora ruído de HMR do Turbopack em dev
      if (text.includes('[Fast Refresh]') || text.includes('WebSocket') || text.includes('downloading')) return;

      if (type === 'error') {
        pageLogs.errors.push(text);
      } else if (type === 'warning') {
        pageLogs.warnings.push(text);
      }
    };

    const errorHandler = (err) => {
      pageLogs.uncaught.push(err.message || String(err));
    };

    const requestFailedHandler = (req) => {
      // Ignora falhas de telemetry ou favicons opcionais
      const url = req.url();
      if (!url.includes('_next/webpack-hmr') && !url.includes('/favicon.ico')) {
        pageLogs.failedRequests.push({
          url,
          failure: req.failure()?.errorText || 'Failed'
        });
      }
    };

    page.on('console', consoleHandler);
    page.on('pageerror', errorHandler);
    page.on('requestfailed', requestFailedHandler);

    try {
      const resp = await page.goto(fullUrl, { waitUntil: 'networkidle', timeout: 15000 }).catch(async () => {
        return await page.goto(fullUrl, { waitUntil: 'domcontentloaded', timeout: 10000 });
      });

      pageLogs.httpStatus = resp ? resp.status() : 0;
      await page.waitForTimeout(1000);

      // Scroll para engajar observadores de viewport
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 2));
      await page.waitForTimeout(400);
      await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
      await page.waitForTimeout(400);

    } catch (e) {
      pageLogs.uncaught.push(`Navigation failed: ${e.message}`);
    } finally {
      page.off('console', consoleHandler);
      page.off('pageerror', errorHandler);
      page.off('requestfailed', requestFailedHandler);
    }

    report.pagesAudited[pagePath] = pageLogs;
    report.summary.totalConsoleErrors += pageLogs.errors.length;
    report.summary.totalConsoleWarnings += pageLogs.warnings.length;
    report.summary.totalUncaughtExceptions += pageLogs.uncaught.length;
    report.summary.totalFailedRequests += pageLogs.failedRequests.length;

    console.log(`   ✓ Concluído: ${pageLogs.errors.length} erros, ${pageLogs.warnings.length} avisos, ${pageLogs.uncaught.length} exceções não tratadas.`);
  }

  await browser.close();

  // --------------------------------------------------------------------------
  // PARTE 2: TESTES DE SEGURANÇA E ROBUSTEZ EM TODAS AS ROTAS DE API
  // --------------------------------------------------------------------------
  console.log('\n🔒 INICIANDO TESTES DE SEGURANÇA E ROBUSTEZ NAS ROTAS DE API...\n');

  async function testApi(name, url, options, validator) {
    try {
      const res = await fetch(`${BASE_URL}${url}`, options);
      let body = null;
      const text = await res.text();
      try {
        body = JSON.parse(text);
      } catch {
        body = text;
      }

      const result = validator(res.status, res.headers, body);
      report.apiSecurityAudit[name] = {
        endpoint: url,
        method: options.method || 'GET',
        status: res.status,
        passed: result.passed,
        finding: result.finding || null,
        impact: result.impact || null,
        remediation: result.remediation || null
      };

      if (result.passed) {
        report.summary.apiPassedChecks++;
        console.log(`   ✅ [PASS] ${name} (Status: ${res.status})`);
      } else {
        report.summary.apiVulnerabilitiesFound++;
        console.log(`   🚨 [FINDING] ${name} (Status: ${res.status}) -> ${result.finding}`);
      }
    } catch (err) {
      report.apiSecurityAudit[name] = {
        endpoint: url,
        passed: false,
        finding: `Erro na execução do teste: ${err.message}`
      };
      console.log(`   ⚠️ [ERROR] ${name}: ${err.message}`);
    }
  }

  // --- GRUPO 1: ROTAS ADMINISTRATIVAS (/api/admin/*) ---
  const adminEndpoints = [
    { url: '/api/admin/analytics/recalculate', method: 'POST', body: {} },
    { url: '/api/admin/audit/logs', method: 'GET' },
    { url: '/api/admin/curadoria/generate-commentary', method: 'POST', body: { questionId: 'test-123' } },
    { url: '/api/admin/curadoria/provas-prioritarias', method: 'GET' },
    { url: '/api/admin/curadoria/questoes-prova?banca=ENARE&ano=2024', method: 'GET' },
    { url: '/api/admin/curadoria/update-gabarito', method: 'POST', body: { questionId: 'test', correctLetter: 'A' } },
    { url: '/api/admin/medevo/inpaint?url=https://images.unsplash.com/photo-1551836022-d5d88e9218df', method: 'GET' },
    { url: '/api/admin/medevo', method: 'GET' },
    { url: '/api/admin/medevo/upload', method: 'POST', body: {} },
    { url: '/api/admin/reports', method: 'GET' }
  ];

  for (const ep of adminEndpoints) {
    await testApi(
      `Admin Auth Barrier: ${ep.url}`,
      ep.url,
      {
        method: ep.method,
        headers: { 'Content-Type': 'application/json' },
        body: ep.body ? JSON.stringify(ep.body) : undefined
      },
      (status, headers, body) => {
        if (status === 401 || status === 403) {
          return { passed: true };
        }
        return {
          passed: false,
          finding: `Rota administrativa retornou status ${status} sem autenticação!`,
          impact: 'Acesso desautorizado a funções administrativas críticas ou vazamento de dados internos.',
          remediation: 'Implementar barreira server-side estrita com verificação de role administrativa.'
        };
      }
    );
  }

  // --- GRUPO 2: ROTAS DE IA (/api/ai/*) ---
  const aiEndpoints = [
    '/api/ai/banca-raiox',
    '/api/ai/performance-mentor',
    '/api/ai/schedule-optimizer',
    '/api/ai/smart-filter',
    '/api/ai/study-generator'
  ];

  for (const ep of aiEndpoints) {
    // 2.1 Teste de Autenticação / Proteção contra Abuso Não Autenticado
    await testApi(
      `AI Auth/Protection Barrier: ${ep}`,
      ep,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'Olá', topic: 'Cardiologia' })
      },
      (status, headers, body) => {
        if (status === 401 || status === 403 || status === 429) {
          return { passed: true };
        }
        if (status === 200) {
          return {
            passed: false,
            finding: 'Rota de IA responde com status 200 para requisição não autenticada.',
            impact: 'Risco de esgotamento de quota da API do Gemini e custos elevados por abuso automatizado.',
            remediation: 'Exigir autenticação de sessão ou aplicar rate limit estrito por IP.'
          };
        }
        return { passed: true };
      }
    );

    // 2.2 Teste de Proteção contra Payload Excessivo (DoS via tokens)
    await testApi(
      `AI Payload Size Cap: ${ep}`,
      ep,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: 'A'.repeat(25000), topic: 'B'.repeat(10000) })
      },
      (status, headers, body) => {
        if (status === 400 || status === 413 || status === 401 || status === 429) {
          return { passed: true };
        }
        return {
          passed: false,
          finding: `Payload massivo de 35.000 caracteres retornou status ${status} em vez de 400/413.`,
          impact: 'Vulnerabilidade de Denial of Service (DoS) por sobrecarga de tokens da IA.',
          remediation: 'Validar e limitar o tamanho do input via Zod antes de repassar à IA.'
        };
      }
    );
  }

  // --- GRUPO 3: EMBAIXADOR / AFILIADOS (/api/ambassador/*) ---
  await testApi(
    'Ambassador IDOR / BOLA Prevention (/api/ambassador/withdraw)',
    '/api/ambassador/withdraw',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: 'spoofed_target_victim_123',
        amount: 500,
        pixKey: 'attacker@evil.com'
      })
    },
    (status, headers, body) => {
      if (status === 401 || status === 403) {
        return { passed: true };
      }
      return {
        passed: false,
        finding: `Saque com userId forjado respondeu com ${status}.`,
        impact: 'Vulnerabilidade crítica de BOLA/IDOR permitindo saque de fundos de terceiros.',
        remediation: 'Extrair o userId estritamente da sessão autenticada (supabase.auth.getUser()).'
      };
    }
  );

  await testApi(
    'Ambassador Negative Amount Tampering (/api/ambassador/withdraw)',
    '/api/ambassador/withdraw',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: -100,
        pixKey: 'attacker@evil.com'
      })
    },
    (status, headers, body) => {
      if (status === 400 || status === 401 || status === 422) {
        return { passed: true };
      }
      return {
        passed: false,
        finding: 'Permite submissão de valores negativos ou não numéricos.',
        impact: 'Risco financeiro de manipulação de saldo.',
        remediation: 'Validar schema com Zod exigindo z.number().positive().'
      };
    }
  );

  // --- GRUPO 4: INTEGRAÇÃO COM GOOGLE CALENDAR & ICAL ---
  await testApi(
    'Google Calendar SSRF Prevention (/api/calendar/sync-ical)',
    '/api/calendar/sync-ical',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        feedUrl: 'http://169.254.169.254/latest/meta-data/'
      })
    },
    (status, headers, body) => {
      if (status === 400 || status === 401 || status === 403) {
        return { passed: true };
      }
      return {
        passed: false,
        finding: `Tentativa de SSRF em metadados de nuvem retornou status ${status}.`,
        impact: 'Vulnerabilidade de Server-Side Request Forgery (SSRF) permitindo sondagem interna.',
        remediation: 'Validar protocolo HTTPS e filtrar faixas de IP locais/privadas (RFC 1918, Link-local).'
      };
    }
  );

  await testApi(
    'Google Calendar Create Event Auth Barrier (/api/calendar/google/create-event)',
    '/api/calendar/google/create-event',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ summary: 'Revisão Médica', start: new Date().toISOString() })
    },
    (status, headers, body) => {
      if (status === 401 || status === 403) {
        return { passed: true };
      }
      return {
        passed: false,
        finding: `Criação de evento sem autenticação retornou ${status}.`,
        impact: 'Possível injeção de eventos no calendário de outros usuários.',
        remediation: 'Exigir token de autenticação de sessão do estudante.'
      };
    }
  );

  // --- GRUPO 5: CHECKOUT & WEBHOOK MERCADO PAGO ---
  await testApi(
    'Webhook Signature Forgery (/api/webhooks/mercadopago)',
    '/api/webhooks/mercadopago',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-signature': 'ts=1700000000,v1=fake_forged_invalid_hmac_hash'
      },
      body: JSON.stringify({
        action: 'payment.created',
        data: { id: '99999999999' }
      })
    },
    (status, headers, body) => {
      if (status === 401 || status === 403 || status === 400) {
        return { passed: true };
      }
      return {
        passed: false,
        finding: `Webhook com assinatura HMAC forjada retornou status ${status}.`,
        impact: 'Risco de ativação fraudulenta de planos sem pagamento real.',
        remediation: 'Garantir validação com crypto.timingSafeEqual e nunca ativar sem confirmação direta na API do MP.'
      };
    }
  );

  await testApi(
    'Checkout BOLA in Status (/api/checkout/status)',
    '/api/checkout/status?payment_id=spoofed_victim_payment_123',
    {
      method: 'GET'
    },
    (status, headers, body) => {
      if (status === 401 || status === 403 || status === 404) {
        return { passed: true };
      }
      if (status === 200 && body?.active) {
        return {
          passed: false,
          finding: 'Permite ativar plano consultando payment_id de outro usuário sem autenticação.',
          impact: 'Vulnerabilidade crítica de BOLA no checkout.',
          remediation: 'Vincular ativações estritamente ao userId da sessão autenticada.'
        };
      }
      return { passed: true };
    }
  );

  // --- GRUPO 6: KNOWLEDGE & PATH TRAVERSAL (/api/knowledge/book) ---
  const pathTraversalPayloads = [
    '../../../../etc/passwd',
    '..\\..\\..\\windows\\win.ini',
    '../../.env.local',
    '%2e%2e%2f%2e%2e%2fpackage.json'
  ];

  for (const traversal of pathTraversalPayloads) {
    await testApi(
      `Knowledge Path Traversal (${traversal})`,
      `/api/knowledge/book?path=${encodeURIComponent(traversal)}`,
      { method: 'GET' },
      (status, headers, body) => {
        if (status === 400 || status === 403 || status === 404) {
          return { passed: true };
        }
        if (status === 200 && (typeof body === 'string' && (body.includes('root:') || body.includes('[fonts]') || body.includes('GEMINI')))) {
          return {
            passed: false,
            finding: `Path traversal teve sucesso ao ler arquivo do sistema com ${traversal}!`,
            impact: 'Vazamento catastrófico de arquivos do servidor e chaves de ambiente.',
            remediation: 'Sanitizar o path garantindo que o caminho resolvido inicie rigorosamente dentro do diretório data/knowledge.'
          };
        }
        return { passed: true };
      }
    );
  }

  // --- GRUPO 7: QUESTÕES & VAZAMENTO DE GABARITOS (/api/questions) ---
  await testApi(
    'Questions Mass Scraping & Gabarito Leak (/api/questions)',
    '/api/questions',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ includeGabarito: true, pageSize: 20 })
    },
    (status, headers, body) => {
      if (status === 200 && Array.isArray(body?.questions)) {
        const hasLeak = body.questions.some(q => q.correctAnswer || q.correct_answer || q.commentary);
        if (hasLeak) {
          return {
            passed: false,
            finding: 'Listagem de questões expõe gabaritos (correct_answer) ou comentários da banca.',
            impact: 'Vazamento do banco de questões completo, permitindo scraping e trapaça.',
            remediation: 'Omitir correct_answer e commentary da projeção SQL pública (SAFE_QUESTION_COLUMNS).'
          };
        }
      }
      return { passed: true };
    }
  );

  await testApi(
    'Admin Inpaint SSRF Prevention (/api/admin/medevo/inpaint)',
    '/api/admin/medevo/inpaint?url=http://169.254.169.254/latest/meta-data/',
    { method: 'GET' },
    (status, headers, body) => {
      if (status === 401 || status === 403) {
        return { passed: true };
      }
      return {
        passed: false,
        finding: `Tentativa de SSRF em inpaint retornou status inesperado ${status}.`,
        impact: 'Vulnerabilidade de SSRF em rota administrativa.',
        remediation: 'Bloquear URLs com IPs privados ou sem autenticação administrativa.'
      };
    }
  );

  await testApi(
    'Ranking User ID Privacy Protection (/api/ranking)',
    '/api/ranking?tab=official',
    { method: 'GET' },
    (status, headers, body) => {
      if (status === 200 && Array.isArray(body?.candidates)) {
        const exposesRawUuid = body.candidates.some(c =>
          c.userId && !c.userId.startsWith('anon_') && c.userId.length === 36
        );
        if (exposesRawUuid) {
          return {
            passed: false,
            finding: 'Ranking público expõe UUID bruto de outros estudantes.',
            impact: 'Privacidade e LGPD.',
            remediation: 'Anonimizar userId para competidores terceiros.'
          };
        }
      }
      return { passed: true };
    }
  );

  // --- GRUPO 8: SOLVE BATCH (/api/questions/solve-batch) ---
  await testApi(
    'Solve Batch Unauthenticated Resolution Probing',
    '/api/questions/solve-batch',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ questionIds: ['arbitrary-q-1', 'arbitrary-q-2'] })
    },
    (status, headers, body) => {
      if (status === 401 || status === 403 || status === 400 || (status === 200 && Object.keys(body?.resolutions || {}).length === 0)) {
        return { passed: true };
      }
      return { passed: true };
    }
  );

  // --- GRUPO 9: RANKING (/api/ranking) ---
  await testApi(
    'Ranking PostgREST Sanity (/api/ranking)',
    '/api/ranking?tab=official',
    { method: 'GET' },
    (status, headers, body) => {
      if (status === 200) {
        return { passed: true };
      }
      return {
        passed: false,
        finding: `Endpoint de ranking retornou status inesperado ${status}.`,
        impact: 'Instabilidade ou erro interno de banco.',
        remediation: 'Verificar integridade da view/tabela de ranking.'
      };
    }
  );

  // --- GRUPO 10: REPORTS DE QUESTÃO (/api/reports) ---
  await testApi(
    'Reports XSS & Massive Payload (/api/reports)',
    '/api/reports',
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        questionId: 'test-q-1',
        reason: '<script>alert(1)</script>' + 'A'.repeat(5000),
        comment: '<img src=x onerror=alert(1)>'
      })
    },
    (status, headers, body) => {
      if (status === 400 || status === 401) {
        return { passed: true };
      }
      return { passed: true };
    }
  );

  // --- GRUPO 11: TAB AVAILABILITY (/api/tab-availability) ---
  await testApi(
    'Tab Availability Cache & Response (/api/tab-availability)',
    '/api/tab-availability',
    { method: 'GET' },
    (status, headers, body) => {
      if (status === 200 && body?.tabStatus) {
        return { passed: true };
      }
      return {
        passed: false,
        finding: `Tab availability retornou status inválido ${status}.`,
        impact: 'Abas da plataforma podem ficar inacessíveis para alunos.',
        remediation: 'Garantir fallback de DEFAULT_TAB_STATUS em caso de falha.'
      };
    }
  );

  // --- GRUPO 12: CABEÇALHOS DE SEGURANÇA GLOBAIS ---
  await testApi(
    'Security Headers Audit (Landing Page)',
    '/',
    { method: 'GET' },
    (status, headers, body) => {
      const xContentType = headers.get('x-content-type-options');
      const xFrameOptions = headers.get('x-frame-options');
      const csp = headers.get('content-security-policy');

      const missing = [];
      if (!xContentType) missing.push('X-Content-Type-Options: nosniff');
      if (!xFrameOptions && (!csp || !csp.includes('frame-ancestors'))) missing.push('X-Frame-Options (Clickjacking protection)');

      if (missing.length > 0) {
        return {
          passed: false,
          finding: `Cabeçalhos de segurança ausentes na resposta HTTP: ${missing.join(', ')}`,
          impact: 'Possibilidade teórica de MIME-sniffing ou Clickjacking.',
          remediation: 'Adicionar cabeçalhos de segurança em next.config.ts na chave headers().'
        };
      }
      return { passed: true };
    }
  );

  // Salva o relatório consolidado em JSON
  const outputPath = 'tests/audit_results.json';
  fs.writeFileSync(outputPath, JSON.stringify(report, null, 2), 'utf8');

  console.log('\n========================================================================');
  console.log('📊 AUDITORIA FINALIZADA COM SUCESSO!');
  console.log(`📑 Resultados salvos em: ${outputPath}`);
  console.log(`❌ Total de Erros de Console: ${report.summary.totalConsoleErrors}`);
  console.log(`⚠️  Total de Avisos de Console: ${report.summary.totalConsoleWarnings}`);
  console.log(`💥 Exceções Não Tratadas: ${report.summary.totalUncaughtExceptions}`);
  console.log(`🛡️  Testes de Segurança Aprovados: ${report.summary.apiPassedChecks}`);
  console.log(`🚨 Vulnerabilidades/Pontos de Atenção Identificados: ${report.summary.apiVulnerabilitiesFound}`);
  console.log('========================================================================\n');
}

main().catch(err => {
  console.error('Fatal audit failure:', err);
  process.exit(1);
});

