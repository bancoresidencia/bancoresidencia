import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { isPrivilegedRole } from '@/utils/security';

// In-Memory Rate Limiter de borda para proteção contra DoS / Brute-force em APIs (máx 120 req/min por IP)
interface IpRateLimit {
  count: number;
  resetAt: number;
}
const apiRateLimitMap = new Map<string, IpRateLimit>();
const RATE_LIMIT_WINDOW = 60 * 1000;
const MAX_API_REQ_PER_MIN = 120;

function checkGlobalApiRateLimit(ip: string): boolean {
  const now = Date.now();
  if (apiRateLimitMap.size > 5000) {
    for (const [k, v] of apiRateLimitMap.entries()) {
      if (v.resetAt < now) apiRateLimitMap.delete(k);
    }
  }
  const entry = apiRateLimitMap.get(ip);
  if (!entry || entry.resetAt < now) {
    apiRateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW });
    return false;
  }
  if (entry.count >= MAX_API_REQ_PER_MIN) {
    return true;
  }
  entry.count++;
  return false;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;

  // 1. Rate limiting global de proteção de infraestrutura para rotas de API
  if (pathname.startsWith('/api/')) {
    const clientIp =
      request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
      request.headers.get('x-real-ip') ||
      'unknown-ip';

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
    // Permite M2M se o header de Authorization contiver a SERVICE_ROLE_KEY
    const authHeader = request.headers.get('authorization');
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (authHeader && serviceRoleKey) {
      const token = authHeader.replace(/^Bearer\s+/i, '').trim();
      if (token === serviceRoleKey) {
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

  // 2. Proteção de páginas administrativas (/admin, /admin/curadoria, etc.)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth', 'login');
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }

    // Checar role admin/curador de forma estrita
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
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Public assets like images, fonts, etc.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'
  ]
};
