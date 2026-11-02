/**
 * Google OAuth Callback Handler — Troca o authorization_code por access_token
 * Usado pelo fluxo de redirecionamento (ux_mode: 'redirect') do Google Identity Services
 *
 * Fluxo:
 * 1. O componente redireciona para /api/auth/google (ou diretamente via GIS redirect)
 * 2. Google redireciona para ESTA rota com ?code=...&state=...
 * 3. Esta rota troca o code por access_token usando a API do Google
 * 4. Redireciona de volta para a página principal com o token em #fragment
 *    (fragment nunca é enviado ao servidor — fica apenas no browser do usuário)
 */

import { NextRequest, NextResponse } from 'next/server';

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '323022146503-csbd1pq8s2g22l3mghaaea4kocl2acfn.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');
  const state = searchParams.get('state') || '/';

  // Determina a origem do request para construir o redirect_uri correto
  const origin = request.headers.get('x-forwarded-host')
    ? `https://${request.headers.get('x-forwarded-host')}`
    : new URL(request.url).origin;

  const redirectUri = `${origin}/api/auth/google/callback`;

  if (error) {
    const redirectUrl = new URL('/', origin);
    redirectUrl.searchParams.set('google_auth_error', error);
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (!code) {
    const redirectUrl = new URL('/', origin);
    redirectUrl.searchParams.set('google_auth_error', 'no_code');
    return NextResponse.redirect(redirectUrl.toString());
  }

  if (!CLIENT_SECRET) {
    // Se não tem client_secret configurado, redireciona com o code para
    // o frontend trocar via PKCE (fluxo alternativo seguro sem secret)
    const redirectUrl = new URL('/', origin);
    redirectUrl.hash = `google_auth_code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(redirectUri)}`;
    return NextResponse.redirect(redirectUrl.toString());
  }

  try {
    // Troca o authorization_code pelo access_token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: CLIENT_ID,
        client_secret: CLIENT_SECRET,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }).toString(),
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      const redirectUrl = new URL('/', origin);
      redirectUrl.searchParams.set('google_auth_error', tokenData.error || 'token_exchange_failed');
      return NextResponse.redirect(redirectUrl.toString());
    }

    // Redireciona para a página principal com o token como fragment hash
    // (o hash nunca é enviado ao servidor — é seguro para tokens temporários)
    const redirectUrl = new URL('/', origin);
    redirectUrl.hash = `google_access_token=${encodeURIComponent(tokenData.access_token)}&token_type=${tokenData.token_type || 'Bearer'}`;
    return NextResponse.redirect(redirectUrl.toString());
  } catch {
    const redirectUrl = new URL('/', origin);
    redirectUrl.searchParams.set('google_auth_error', 'server_error');
    return NextResponse.redirect(redirectUrl.toString());
  }
}
