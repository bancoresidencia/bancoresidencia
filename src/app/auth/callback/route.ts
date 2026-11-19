import { createClient } from '@/lib/supabase/server';
import { NextResponse, type NextRequest } from 'next/server';

export const dynamic = 'force-dynamic';

const ALLOWED_HOSTS = new Set([
  'hippocampusresidencia.com.br',
  'bancoresidencia.com.br',
  'www.bancoresidencia.com.br',
  'bancoresidencia-kappa.vercel.app'
]);

function getCanonicalOrigin(request: NextRequest): string {
  const requestUrl = new URL(request.url);
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev && (requestUrl.hostname === 'localhost' || requestUrl.hostname === '127.0.0.1')) {
    return requestUrl.origin;
  }

  const configuredAppUrl = process.env.NEXT_PUBLIC_APP_URL;
  let configuredHost: string | null = null;
  if (configuredAppUrl) {
    try {
      configuredHost = new URL(configuredAppUrl).host.toLowerCase();
    } catch {
      configuredHost = null;
    }
  }

  const forwardedHost = (request.headers.get('x-forwarded-host') || '').toLowerCase().trim();
  if (forwardedHost && (ALLOWED_HOSTS.has(forwardedHost) || (configuredHost && forwardedHost === configuredHost))) {
    return `https://${forwardedHost}`;
  }

  const reqHost = requestUrl.host.toLowerCase();
  if (ALLOWED_HOSTS.has(reqHost) || (configuredHost && reqHost === configuredHost)) {
    return `https://${reqHost}`;
  }

  return configuredAppUrl && configuredHost ? `https://${configuredHost}` : 'https://bancoresidencia-kappa.vercel.app';
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const rawNext = requestUrl.searchParams.get('next') ?? '/';
  const canonicalOrigin = getCanonicalOrigin(request);

  // Sanitização estrita contra Open Redirect: garante mesma origem exata após normalização WHATWG URL
  let safeRedirectUrl = new URL('/', canonicalOrigin);
  if (
    rawNext &&
    rawNext.startsWith('/') &&
    !rawNext.startsWith('//') &&
    !rawNext.includes('\\') &&
    !/[\u0000-\u001F]/.test(rawNext)
  ) {
    try {
      const candidate = new URL(rawNext, canonicalOrigin);
      if (candidate.origin === canonicalOrigin) {
        safeRedirectUrl = candidate;
      }
    } catch {
      safeRedirectUrl = new URL('/', canonicalOrigin);
    }
  }

  if (code) {
    try {
      const supabase = await createClient();
      const { error } = await supabase.auth.exchangeCodeForSession(code);
      if (!error) {
        return NextResponse.redirect(safeRedirectUrl.toString());
      } else {
        console.error('[Auth Callback] Erro ao trocar código por sessão:', error.message);
      }
    } catch (err) {
      console.error('[Auth Callback] Exceção durante a troca de código OAuth:', err);
    }
  }

  return NextResponse.redirect(new URL('/?error=oauth_error', canonicalOrigin).toString());
}
