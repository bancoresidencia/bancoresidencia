import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import {
  isPrivilegedRole,
  timingSafeEqualStrings,
  extractTrustedClientIpFromHeaders
} from '@/utils/security';

// In-Memory Rate Limiter de borda com teto rígido de memória (FIFO) contra OOM / CPU DoS
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

  // Garante limite máximo absoluto em O(1) amortizado sem varredura linear a cada request
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

export async function proxy(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Rate limiting global de proteção de infraestrutura para rotas de API
  if (pathname.startsWith('/api/')) {
    const clientIp = extractTrustedClientIp(request);

    if (checkGlobalApiRateLimit(clientIp)) {
      return NextResponse.json(
        { success: false, error: 'Limite de requisições excedido. Aguarde alguns instantes.' },
        { status: 429, headers: { 'Retry-After': '30' } }
      );
    }
  }

  const { supabaseResponse, user, supabase } = await updateSession(request);

  // 2. Proteção de rotas de API Administrativa (/api/admin/*)
  if (pathname.startsWith('/api/admin')) {
    const authHeader = request.headers.get('authorization');
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (authHeader) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (serviceRoleKey && timingSafeEqualStrings(token, serviceRoleKey)) {
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

  // 3. Proteção de páginas administrativas (/admin, /admin/curadoria, etc.)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth', 'login');
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }

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
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|woff|woff2|ttf|eot)$).*)'
  ]
};
