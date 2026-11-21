/**
 * Next.js Edge Proxy — Banco Residência (Next.js 16)
 *
 * Responsabilidades:
 * 1. CORS dinâmico para rotas /api/* — reflete a Origin apenas se for uma origem
 *    autorizada (evita wildcard * que permitiria qualquer domínio)
 * 2. Resposta imediata a preflight OPTIONS para rotas /api/* (204 No Content)
 * 3. Rate limiting de infraestrutura na borda contra DoS / brute-force
 * 4. CSP baseada em nonce por requisição (elimina 'unsafe-inline' em script-src)
 * 5. Atualização de sessão Supabase (cookie refresh) para Server Components
 * 6. Proteção de rotas administrativas (/api/admin/* e /admin/*)
 */

import { NextResponse, NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { timingSafeEqualStrings } from '@/utils/serverCrypto';
import {
  isPrivilegedRole,
  extractTrustedClientIpFromHeaders
} from '@/utils/security';

// ---------------------------------------------------------------------------
// Content Security Policy com nonce (gerado por requisição)
// ---------------------------------------------------------------------------
const isDev = process.env.NODE_ENV === 'development';
const motionStudioEnabled = isDev && process.env.HIPPOCAMPUS_MOTION_STUDIO === '1';
const motionStudioOrigin = 'http://localhost:5200';

function buildCsp(nonce: string): string {
  const connectExtra = motionStudioEnabled
    ? ` ${motionStudioOrigin} ws://localhost:5200`
    : '';
  return [
    "default-src 'self'",
    // 'strict-dynamic' + nonce: scripts carregados por scripts confiáveis também são permitidos.
    // 'wasm-unsafe-eval' incluído globalmente (MercadoPago usa WASM em /checkout).
    // 'unsafe-eval' apenas em dev (Next.js Fast Refresh).
    `script-src 'nonce-${nonce}' 'strict-dynamic'` +
      (isDev ? " 'unsafe-eval'" : '') +
      " 'wasm-unsafe-eval'" +
      ' https://sdk.mercadopago.com https://http2.mlstatic.com https://accounts.google.com',
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "img-src 'self' data: blob: https:",
    "font-src 'self' data: https://fonts.gstatic.com",
    `connect-src 'self' https://*.supabase.co wss://*.supabase.co https://api.mercadopago.com https://http2.mlstatic.com https://secure-fields.mercadopago.com https://api-static.mercadopago.com https://www.mercadolibre.com https://api.mercadolibre.com https://accounts.google.com https://www.googleapis.com${connectExtra}`,
    "frame-src 'self' https://accounts.google.com https://*.mercadopago.com https://www.mercadopago.com.br",
    "frame-ancestors 'none'",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://accounts.google.com https://www.mercadopago.com.br",
  ].join('; ');
}

// ---------------------------------------------------------------------------
// CORS — Origens autorizadas para requisições cross-origin
// ---------------------------------------------------------------------------
const PRODUCTION_ORIGIN = 'https://hippocampusresidencia.com.br';

const ALLOWED_ORIGINS: ReadonlySet<string> = new Set([
  PRODUCTION_ORIGIN,
  // Dev local
  'http://localhost:3000',
  'http://localhost:3001',
]);

const CORS_ALLOW_METHODS = 'GET, POST, PUT, PATCH, DELETE, OPTIONS';
const CORS_ALLOW_HEADERS = 'Content-Type, Authorization, X-Requested-With, x-admin-key';
const CORS_MAX_AGE = '86400'; // 24h

function getAllowedOrigin(requestOrigin: string | null): string {
  if (!requestOrigin) return PRODUCTION_ORIGIN;
  if (ALLOWED_ORIGINS.has(requestOrigin)) return requestOrigin;
  return PRODUCTION_ORIGIN; // fallback seguro para domínio próprio
}

function applyCorsHeaders(response: NextResponse, requestOrigin: string | null): NextResponse {
  const allowedOrigin = getAllowedOrigin(requestOrigin);
  response.headers.set('Access-Control-Allow-Origin', allowedOrigin);
  response.headers.set('Access-Control-Allow-Methods', CORS_ALLOW_METHODS);
  response.headers.set('Access-Control-Allow-Headers', CORS_ALLOW_HEADERS);
  response.headers.set('Access-Control-Max-Age', CORS_MAX_AGE);
  response.headers.append('Vary', 'Origin');
  return response;
}

// ---------------------------------------------------------------------------
// In-Memory Rate Limiter de borda com teto rígido de memória (FIFO) contra DoS
// ---------------------------------------------------------------------------
interface IpRateLimit {
  count: number;
  resetAt: number;
}
const apiRateLimitMap = new Map<string, IpRateLimit>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_API_REQ_PER_MIN = 120;
const MAX_RATE_LIMIT_ENTRIES = 5000;

function extractTrustedClientIp(request: NextRequest): string {
  return extractTrustedClientIpFromHeaders(request.headers);
}

function checkGlobalApiRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = apiRateLimitMap.get(ip);

  if (entry && entry.resetAt >= now) {
    if (entry.count >= MAX_API_REQ_PER_MIN) {
      return true;
    }
    entry.count++;
    return false;
  }

  if (entry) {
    apiRateLimitMap.delete(ip);
  }

  // Garante limite máximo absoluto em O(1) amortizado sem varredura linear
  if (apiRateLimitMap.size >= MAX_RATE_LIMIT_ENTRIES) {
    let evicted = 0;
    for (const [k, v] of apiRateLimitMap.entries()) {
      if (v.resetAt < now || evicted < 250) {
        apiRateLimitMap.delete(k);
        evicted++;
        if (apiRateLimitMap.size < MAX_RATE_LIMIT_ENTRIES - 250) break;
      }
    }
  }

  apiRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
  return false;
}

// ---------------------------------------------------------------------------
// Proxy Principal (Next.js 16)
// ---------------------------------------------------------------------------
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isApiRoute = pathname.startsWith('/api/');
  const requestOrigin = request.headers.get('origin');

  // 1. Resposta imediata a preflight OPTIONS para rotas /api/*
  if (isApiRoute && request.method === 'OPTIONS') {
    const preflightResponse = new NextResponse(null, { status: 204 });
    return applyCorsHeaders(preflightResponse, requestOrigin);
  }

  // 2. Rate limiting global de proteção de infraestrutura para rotas /api/*
  if (isApiRoute) {
    const clientIp = extractTrustedClientIp(request);
    if (checkGlobalApiRateLimit(clientIp)) {
      const rateLimitResponse = NextResponse.json(
        { success: false, error: 'Limite de requisições excedido. Aguarde alguns instantes.' },
        { status: 429, headers: { 'Retry-After': '30' } }
      );
      return applyCorsHeaders(rateLimitResponse, requestOrigin);
    }
  }

  // 3. Para rotas de página (não-API): gera nonce por requisição e injeta nos headers
  let requestWithNonce = request;
  let cspValue = '';

  if (!isApiRoute) {
    const nonce = Buffer.from(crypto.randomUUID()).toString('base64');
    cspValue = buildCsp(nonce);

    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-nonce', nonce);
    requestHeaders.set('Content-Security-Policy', cspValue);

    requestWithNonce = new NextRequest(request, { headers: requestHeaders });
  }

  // 4. Atualização de sessão Supabase
  const { supabaseResponse, user, supabase } = await updateSession(requestWithNonce);

  // 5. Aplica CORS nos headers de resposta para rotas de API
  if (isApiRoute) {
    applyCorsHeaders(supabaseResponse, requestOrigin);
  }

  // 6. Propaga CSP e x-nonce na resposta para rotas de página
  if (!isApiRoute && cspValue) {
    supabaseResponse.headers.set('Content-Security-Policy', cspValue);
  }

  // 7. Proteção de rotas de API Administrativa (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization');
    const adminToken = process.env.ADMIN_M2M_TOKEN;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (adminToken && timingSafeEqualStrings(token, adminToken)) {
        return supabaseResponse;
      }
      // Se um Bearer JWT explícito (3 segmentos) foi fornecido sem cookies, delega validação criptográfica ao verifyAdminSession na rota
      if (!user && token.length > 20 && token.split('.').length === 3) {
        return supabaseResponse;
      }
    }

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Acesso não autorizado: faça login como administrador.' },
        { status: 401 }
      );
    }

    // Checar role admin ou curador APENAS em app_metadata ou na tabela profiles (nunca em user_metadata)
    const appRole = user.app_metadata?.role;
    let isPrivileged = isPrivilegedRole(appRole);

    if (!isPrivileged && supabase) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile && isPrivilegedRole(profile.role)) {
        isPrivileged = true;
      }
    }

    if (!isPrivileged) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado: privilégios de administrador ou curador necessários.' },
        { status: 403 }
      );
    }

    return supabaseResponse;
  }

  // 8. Proteção de páginas administrativas (/admin, /admin/curadoria, etc.)
  if (pathname.startsWith('/admin')) {
    if (!user || !supabase) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth', 'login');
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();

    if (error || !isPrivilegedRole(profile?.role)) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('error', 'unauthorized_admin');
      return NextResponse.redirect(url);
    }
  }

  return supabaseResponse;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static  (arquivos estáticos compilados)
     * - _next/image   (otimização de imagens)
     * - favicon.ico, sitemap.xml, robots.txt
     * - arquivos estáticos por extensão
     */
    '/((?!_next/static|_next/image|favicon\\.ico|sitemap\\.xml|robots\\.txt|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff2?|ttf|otf|eot|css|js\\.map)$).*)',
  ],
};
