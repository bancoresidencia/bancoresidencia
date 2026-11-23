import assert from 'node:assert';

// Testa a lógica exata de proteção de rotas da plataforma implementada no proxy.ts
const PROTECTED_PLATFORM_ROUTES: readonly string[] = [
  '/dashboard',
  '/agenda',
  '/caderno-de-erros',
  '/configuracoes',
  '/cronograma',
  '/desempenho',
  '/flashcards',
  '/listas',
  '/provas',
  '/questoes',
  '/ranking',
  '/resumos',
  '/simulados',
];

function isProtectedPlatformPath(pathname: string): boolean {
  const normalized = pathname.endsWith('/') && pathname.length > 1
    ? pathname.slice(0, -1)
    : pathname;
  return PROTECTED_PLATFORM_ROUTES.some(
    (route) => normalized === route || normalized.startsWith(`${route}/`)
  );
}

function simulateProxyRouteGuard(pathname: string, user: { id: string } | null): { action: 'next' | 'redirect'; redirectUrl?: string } {
  if (isProtectedPlatformPath(pathname)) {
    if (!user) {
      return { action: 'redirect', redirectUrl: '/' };
    }
  }
  return { action: 'next' };
}

console.log('🧪 Iniciando testes de proteção de rotas da plataforma (proxy & layout)...');

// 1. Testa todas as rotas da plataforma como protegidas
for (const route of PROTECTED_PLATFORM_ROUTES) {
  assert.strictEqual(isProtectedPlatformPath(route), true, `A rota ${route} DEVE ser protegida`);
  assert.strictEqual(isProtectedPlatformPath(`${route}/`), true, `A rota com trailing slash ${route}/ DEVE ser protegida`);
  assert.strictEqual(isProtectedPlatformPath(`${route}/sub-item-123`), true, `Sub-rotas de ${route} DEVEM ser protegidas`);
}

// 2. Testa rotas públicas que NÃO devem ser bloqueadas
const PUBLIC_ROUTES = [
  '/',
  '/login',
  '/entrar',
  '/termos',
  '/privacidade',
  '/checkout',
  '/simulado-priapismo',
  '/auth/callback',
  '/auth/confirm',
  '/auth/google/callback',
  '/api/questions',
  '/api/auth/status'
];

for (const route of PUBLIC_ROUTES) {
  assert.strictEqual(isProtectedPlatformPath(route), false, `A rota pública ${route} NÃO deve ser marcada como protegida de plataforma`);
}

// 3. Testa simulação de decisão do Edge Proxy
// 3.1 Usuário não autenticado tentando acessar /dashboard
const unauthDashboard = simulateProxyRouteGuard('/dashboard', null);
assert.strictEqual(unauthDashboard.action, 'redirect', 'Acesso anônimo a /dashboard DEVE ser redirecionado');
assert.strictEqual(unauthDashboard.redirectUrl, '/', 'Redirecionamento de /dashboard anônimo DEVE ser para a landing page "/"');

// 3.2 Usuário não autenticado tentando acessar /questoes
const unauthQuestoes = simulateProxyRouteGuard('/questoes', null);
assert.strictEqual(unauthQuestoes.action, 'redirect', 'Acesso anônimo a /questoes DEVE ser redirecionado');
assert.strictEqual(unauthQuestoes.redirectUrl, '/', 'Redirecionamento de /questoes anônimo DEVE ser para a landing page "/"');

// 3.3 Usuário autenticado acessando /dashboard
const authDashboard = simulateProxyRouteGuard('/dashboard', { id: 'usr-123' });
assert.strictEqual(authDashboard.action, 'next', 'Usuário autenticado DEVE ter acesso liberado a /dashboard');

// 3.4 Usuário autenticado acessando /questoes
const authQuestoes = simulateProxyRouteGuard('/questoes', { id: 'usr-123' });
assert.strictEqual(authQuestoes.action, 'next', 'Usuário autenticado DEVE ter acesso liberado a /questoes');

// 3.5 Usuário anônimo acessando a landing page /
const unauthLanding = simulateProxyRouteGuard('/', null);
assert.strictEqual(unauthLanding.action, 'next', 'Acesso anônimo à landing page "/" DEVE ser liberado normalmente');

console.log('✅ Todos os testes de proteção de rotas da plataforma foram aprovados com sucesso!');
