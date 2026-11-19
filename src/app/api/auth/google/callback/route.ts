import { NextRequest, NextResponse } from 'next/server';

/**
 * Google OAuth Callback Handler — /api/auth/google/callback
 * Encaminha com segurança o código de autorização OAuth (e state anti-CSRF)
 * para /auth/google/callback realizar o vínculo criptografado no servidor,
 * NUNCA expondo access_token em URL hash ou localStorage e bloqueando Host Injection.
 */
const ALLOWED_PRODUCTION_HOSTS = new Set([
  'hippocampusresidencia.com.br',
  'bancoresidencia.com.br',
  'www.bancoresidencia.com.br',
  'bancoresidencia-kappa.vercel.app'
]);

function resolveSafeOrigin(request: NextRequest): string {
  const reqUrl = new URL(request.url);
  const isDev = process.env.NODE_ENV !== 'production';

  if (isDev && (reqUrl.hostname === 'localhost' || reqUrl.hostname === '127.0.0.1')) {
    return reqUrl.origin;
  }

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  let configuredHost = '';
  if (appUrl) {
    try {
      configuredHost = new URL(appUrl).host.toLowerCase();
    } catch {
      configuredHost = '';
    }
  }

  const candidateHost = (request.headers.get('x-forwarded-host') || reqUrl.host).toLowerCase().trim();
  if (ALLOWED_PRODUCTION_HOSTS.has(candidateHost) || (configuredHost && candidateHost === configuredHost)) {
    return `https://${candidateHost}`;
  }

  return configuredHost ? `https://${configuredHost}` : 'https://bancoresidencia-kappa.vercel.app';
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  const origin = resolveSafeOrigin(request);

  if (error) {
    const redirectUrl = new URL('/', origin);
    redirectUrl.searchParams.set('google_auth_error', error.slice(0, 64));
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (!code) {
    const redirectUrl = new URL('/', origin);
    redirectUrl.searchParams.set('google_auth_error', 'no_code');
    return NextResponse.redirect(redirectUrl.toString());
  }

  // Encaminha code + state para o fluxo seguro de backend (/api/calendar/google/connect) sem expor access_token
  const callbackUrl = new URL('/auth/google/callback', origin);
  callbackUrl.searchParams.set('code', code);
  if (state) {
    callbackUrl.searchParams.set('state', state);
  }
  return NextResponse.redirect(callbackUrl.toString());
}
