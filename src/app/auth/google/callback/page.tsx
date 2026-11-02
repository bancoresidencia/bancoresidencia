'use client';

/**
 * Página de callback do Google OAuth — /auth/google/callback
 * Captura o access_token do hash (#access_token=...) ou da query (?access_token=...)
 * Salva no localStorage e redireciona de volta para a Home.
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export default function GoogleCalendarCallbackPage() {
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('Conectando com o Google Agenda...');

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. Tenta extrair do hash (#access_token=...)
    const hash = window.location.hash.replace(/^#/, '');
    const hashParams = new URLSearchParams(hash);

    // 2. Tenta extrair da query string (?access_token=...)
    const searchParams = new URLSearchParams(window.location.search);

    const accessToken =
      hashParams.get('access_token') ||
      hashParams.get('google_access_token') ||
      searchParams.get('access_token') ||
      searchParams.get('google_access_token');

    const error = hashParams.get('error') || searchParams.get('error');

    if (accessToken) {
      try {
        localStorage.setItem('bancoresidencia_google_access_token', accessToken);
        localStorage.setItem('bancoresidencia_google_calendar_connected', 'true');
        localStorage.setItem('bancoresidencia_google_calendar_mode', 'api');
        sessionStorage.setItem('bancoresidencia_google_just_connected', 'true');
      } catch {
        // Ignora erros de localStorage restrito
      }

      setStatus('success');
      setMessage('Google Agenda conectado com sucesso! Redirecionando...');

      setTimeout(() => {
        router.replace('/');
      }, 600);
    } else if (error) {
      const messages: Record<string, string> = {
        access_denied: 'Autorização cancelada.',
        redirect_uri_mismatch: 'URI de redirecionamento divergente no Google Cloud.',
        invalid_client: 'Client ID não reconhecido pelo Google.',
      };
      const errMsg = messages[error] || `Aviso do Google: ${error}`;

      try {
        sessionStorage.setItem('bancoresidencia_google_auth_error', errMsg);
      } catch { /* ignora */ }

      setStatus('error');
      setMessage(errMsg);

      setTimeout(() => {
        router.replace('/');
      }, 2000);
    } else {
      router.replace('/');
    }
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 text-white font-sans">
      <div className="text-center space-y-4 px-6 max-w-sm w-full">
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center shadow-xl">
            <svg viewBox="0 0 24 24" className="w-8 h-8" aria-hidden="true">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
          </div>
        </div>

        {status === 'loading' && (
          <div className="w-7 h-7 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        )}
        {status === 'success' && (
          <div className="w-7 h-7 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center mx-auto text-emerald-400 font-bold">
            ✓
          </div>
        )}

        <p className={`text-xs font-medium ${status === 'error' ? 'text-red-400' : status === 'success' ? 'text-emerald-400' : 'text-zinc-300'}`}>
          {message}
        </p>
      </div>
    </div>
  );
}
