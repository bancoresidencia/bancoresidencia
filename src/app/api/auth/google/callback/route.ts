import { NextRequest, NextResponse } from 'next/server';

/**
 * Google OAuth Callback Handler — /api/auth/google/callback
 * Trata retornos com ?code=...
 *
 * 1. Determina a origem exata (HTTP para localhost, HTTPS para Vercel).
 * 2. Se GOOGLE_CLIENT_SECRET estiver configurado, troca o code por access_token no Google
 *    e redireciona para a home com #access_token=...
 * 3. Se GOOGLE_CLIENT_SECRET NÃO estiver configurado, redireciona para a home com
 *    orientação para conectar diretamente via Google Identity Services.
 */

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '323022146503-csbd1pq8s2g22l3mghaaea4kocl2acfn.apps.googleusercontent.com';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || '';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const error = searchParams.get('error');

  // Determina host e protocolo com proteção contra Host Header Injection
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
  const rawHost = (request.headers.get('x-forwarded-host') || request.headers.get('host') || new URL(request.url).host).toLowerCase().trim();
  const isLocal = rawHost.includes('localhost') || rawHost.includes('127.0.0.1');
  let allowedHost = 'bancoresidencia-kappa.vercel.app';
  if (appUrl) {
    try {
      allowedHost = new URL(appUrl).host;
    } catch {}
  }
  const host = (isLocal || rawHost === allowedHost || rawHost === 'bancoresidencia-kappa.vercel.app') ? rawHost : allowedHost;
  const proto = isLocal ? 'http' : (request.headers.get('x-forwarded-proto') || 'https');
  const origin = `${proto}://${host}`;

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

  // Se temos o CLIENT_SECRET, faz a troca oficial no backend
  if (CLIENT_SECRET) {
    try {
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

      if (tokenData.access_token) {
        // Redireciona para /auth/google/callback com o access_token no fragment hash
        const callbackUrl = new URL('/auth/google/callback', origin);
        callbackUrl.hash = `access_token=${encodeURIComponent(tokenData.access_token)}&token_type=${encodeURIComponent(tokenData.token_type || 'Bearer')}`;
        return NextResponse.redirect(callbackUrl.toString());
      }
    } catch {
      // Falha na chamada ao token endpoint, segue para o fallback
    }
  }

  // Fallback seguro: Redireciona para a home avisando para usar a conexão direta
  const homeUrl = new URL('/', origin);
  homeUrl.searchParams.set('google_auth_info', 'use_direct_connect');
  return NextResponse.redirect(homeUrl.toString());
}
