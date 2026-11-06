import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_HOSTS = new Set([
  'medevo.com.br',
  'www.medevo.com.br',
  'bancoresidencia-kappa.vercel.app',
  'localhost:3000',
  '127.0.0.1:3000'
]);

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const rawNext = requestUrl.searchParams.get('next') ?? '/';

  // Sanitização estrita contra Open Redirect (permite apenas caminhos relativos internos)
  let safeNext = '/';
  if (rawNext && rawNext.startsWith('/') && !rawNext.startsWith('//') && !rawNext.includes('\\')) {
    safeNext = rawNext;
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        const forwardedHost = (request.headers.get('x-forwarded-host') || '').toLowerCase().trim();
        const isLocalEnv = process.env.NODE_ENV === 'development';

        // Blindagem contra Host Header Injection: valida contra whitelist estrita
        let targetHost = requestUrl.host;
        if (forwardedHost && (ALLOWED_HOSTS.has(forwardedHost) || forwardedHost.endsWith('.vercel.app'))) {
          targetHost = forwardedHost;
        }

        const protocol = isLocalEnv ? requestUrl.protocol : 'https:';
        return NextResponse.redirect(`${protocol}//${targetHost}${safeNext}`);
      } else {
        console.error('[Auth Callback] Erro ao trocar código por sessão:', error.message);
      }
    } catch (err) {
      console.error('[Auth Callback] Exceção durante a troca de código OAuth:', err);
    }
  }

  // Se houver falha na troca ou ausência de código, redireciona para a home com indicação de erro
  return NextResponse.redirect(new URL('/?error=oauth_error', requestUrl.origin));
}
