import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';

export async function middleware(request: NextRequest) {
  const { supabaseResponse, user, supabase } = await updateSession(request);
  const pathname = request.nextUrl.pathname;

  // Proteção de rotas administrativas (/admin, /admin/curadoria, etc.)
  if (pathname.startsWith('/admin')) {
    if (!user) {
      const url = request.nextUrl.clone();
      url.pathname = '/';
      url.searchParams.set('auth', 'login');
      url.searchParams.set('redirectTo', pathname);
      return NextResponse.redirect(url);
    }

    // Checar role admin em app_metadata ou na tabela profiles
    const appRole = user.app_metadata?.role || user.user_metadata?.role;
    let isAdmin = appRole === 'admin';

    if (!isAdmin && supabase) {
      // Verificação de fallback no banco
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      if (profile?.role === 'admin') {
        isAdmin = true;
      }
    }

    if (!isAdmin) {
      // Usuário autenticado mas não-admin tentando acessar /admin
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
