/**
 * Serviço de Integração com Google Agenda (iCal + Google Calendar REST API)
 * Suporta:
 * 1. Links Template em 1 clique (Action TEMPLATE para adicionar eventos sem OAuth)
 * 2. Google Identity Services (GIS OAuth2 Client) para Leitura e Gravação direta via API
 *    - Fluxo de REDIRECIONAMENTO (ux_mode: 'redirect') — sem popup, funciona em qualquer ambiente
 *    - Fluxo de POPUP (initTokenClient) — fallback para localhost e ambientes sem restrição
 */

export interface GoogleCalendarEventInput {
  title: string;
  startTime: string; // "14:00"
  endTime: string;   // "15:30"
  description: string;
  location?: string;
  dateStr?: string;  // "YYYY-MM-DD", default hoje
}

/**
 * Converte horário HH:MM de hoje para string ISO compacta do Google (YYYYMMDDTHHmmSSZ)
 */
export function formatGoogleDateTimeCompact(timeStr: string, dateObj = new Date()): string {
  const [hours, mins] = timeStr.split(':').map(Number);
  const d = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate(), hours || 0, mins || 0, 0);
  return d.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

/**
 * OPÇÃO 1 (Auxiliar): Gera link oficial do Google Agenda em 1 clique (Zero OAuth)
 * Abre a tela do Google Agenda com o evento já pronto para o usuário apenas clicar em "Salvar".
 */
export function buildGoogleCalendarTemplateUrl(event: GoogleCalendarEventInput): string {
  const now = new Date();
  const startCompact = formatGoogleDateTimeCompact(event.startTime, now);
  const endCompact = formatGoogleDateTimeCompact(event.endTime, now);

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${startCompact}/${endCompact}`,
    details: event.description,
    location: event.location || 'Plataforma Banco Residência'
  });

  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/**
 * OPÇÃO 2: Garante o carregamento da biblioteca oficial do Google Identity Services (GIS)
 * Usa checagem ativa com timeout para nunca travar em listeners mortos
 */
export function loadGoogleGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    // Verifica se já está carregada (token client ou code client)
    if ((window as any).google?.accounts?.oauth2) return resolve();

    let attempts = 0;
    const interval = setInterval(() => {
      attempts++;
      if ((window as any).google?.accounts?.oauth2) {
        clearInterval(interval);
        return resolve();
      }
      if (attempts > 80) { // 8 segundos (aumentado para redes lentas)
        clearInterval(interval);
        return reject(
          new Error('Não foi possível carregar a biblioteca do Google. Se você usa AdBlock, uBlock ou Brave Shields, por favor desative-o para este site.')
        );
      }
    }, 100);

    const existingScript = document.getElementById('google-gsi-client');
    if (!existingScript) {
      const script = document.createElement('script');
      script.id = 'google-gsi-client';
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onerror = () => {
        clearInterval(interval);
        reject(new Error('Bloqueador de anúncios detectado. Desative o AdBlock/Brave Shields para conectar com o Google.'));
      };
      document.head.appendChild(script);
    }
  });
}

/**
 * Detecta se o ambiente atual é localhost ou dev
 */
function isLocalhost(): boolean {
  if (typeof window === 'undefined') return false;
  const host = window.location.hostname;
  return host === 'localhost' || host === '127.0.0.1' || host.startsWith('192.168.') || host === '';
}

/**
 * Constrói o redirect_uri para o fluxo OAuth implícito (página client-side)
 */
export function getGoogleOAuthRedirectUri(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/auth/google/callback`;
}

/**
 * OPÇÃO 2 — FLUXO PRINCIPAL (Redirect Implicit, sem popup, sem client_secret):
 * Usa o fluxo OAuth 2.0 Implicit Grant (response_type=token) diretamente.
 * Redireciona o navegador para o Google que, após autorização, redireciona para
 * /auth/google/callback#access_token=xxx (a página lê o hash e salva no localStorage).
 *
 * Vantagens:
 * - Não requer GOOGLE_CLIENT_SECRET no servidor
 * - Não usa popup (sem bloqueio de popup em produção)
 * - Funciona em todos os ambientes (Vercel, localhost)
 *
 * Adicione no Google Cloud Console → Authorized Redirect URIs:
 *   - https://bancoresidencia.vercel.app/auth/google/callback
 *   - https://bancoresidencia-kappa.vercel.app/auth/google/callback
 *   - http://localhost:3000/auth/google/callback
 */
export function startGoogleOAuthRedirect(clientId: string): void {
  if (typeof window === 'undefined') return;

  const redirectUri = getGoogleOAuthRedirectUri();
  const scope = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
  ].join(' ');

  // Fluxo implícito: response_type=token → Google retorna access_token direto no hash
  // Não precisa de client_secret para trocar código
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope,
    include_granted_scopes: 'true',
    prompt: 'select_account',
  });

  window.location.href = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

/**
 * OPÇÃO 2B — POPUP CONTROLADO COM FLUXO IMPLICIT (sem depender do GIS postMessage):
 * Abre um popup com o mesmo URL do fluxo redirect (OAuth Implicit Grant).
 * O Google redireciona dentro do popup para /auth/google/callback#access_token=xxx.
 * A callback page salva no localStorage e o evento 'storage' dispara na janela-pai.
 *
 * Vantagens sobre GIS initTokenClient:
 * - Não depende de postMessage (imune à tela "App não verificado" quebrando o canal)
 * - Funciona com telas de aviso intermediárias (unverified app, consent, etc.)
 * - Usa a mesma callback page já testada no fluxo de redirect
 *
 * Retorna uma função de cleanup para cancelar a espera se necessário.
 */
export function startGoogleOAuthPopup(
  clientId: string,
  onSuccess: (accessToken: string) => void,
  onError: (error: any) => void
): () => void {
  if (typeof window === 'undefined') {
    onError(new Error('Ambiente sem janela.'));
    return () => {};
  }

  const redirectUri = getGoogleOAuthRedirectUri();
  const scope = [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
  ].join(' ');

  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'token',
    scope,
    include_granted_scopes: 'true',
    prompt: 'select_account',
    state: 'popup',
  });

  const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

  // Limpa timestamp anterior para garantir que apenas novas autenticações sejam consideradas
  try {
    localStorage.removeItem('bancoresidencia_google_popup_auth_timestamp');
  } catch {
    // ignora
  }

  // Abre popup centralizado na tela
  const width = 500;
  const height = 640;
  const left = Math.round(window.screenX + (window.outerWidth - width) / 2);
  const top = Math.round(window.screenY + (window.outerHeight - height) / 2);

  const popup = window.open(
    authUrl,
    'bancoresidencia_google_oauth',
    `width=${width},height=${height},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );

  if (!popup) {
    onError(new Error('Popup bloqueado pelo navegador. Use o link "Abrir por redirecionamento".'));
    return () => {};
  }

  let resolved = false;

  const cleanup = () => {
    if (resolved) return;
    resolved = true;
    window.removeEventListener('storage', onStorageChange);
    window.removeEventListener('message', onMessage);
    clearInterval(pollTimer);
  };

  // 1. Escuta via postMessage da janela-filha (graças a same-origin-allow-popups)
  const onMessage = (e: MessageEvent) => {
    if (resolved) return;
    if (e.origin !== window.location.origin) return;
    if (e.data?.type === 'GOOGLE_AUTH_SUCCESS' && e.data?.accessToken) {
      cleanup();
      try { popup.close(); } catch { /* ignore */ }
      onSuccess(e.data.accessToken);
    } else if (e.data?.type === 'GOOGLE_AUTH_ERROR') {
      cleanup();
      try { popup.close(); } catch { /* ignore */ }
      onError(new Error(e.data?.error || 'Erro na autenticação'));
    }
  };
  window.addEventListener('message', onMessage);

  // 2. Escuta o evento 'storage' — disparado quando a página de callback salva o token
  const onStorageChange = (e: StorageEvent) => {
    if (resolved) return;

    if (e.key === 'bancoresidencia_google_access_token' && e.newValue) {
      cleanup();
      try { popup.close(); } catch { /* popup pode já estar fechado */ }
      onSuccess(e.newValue);
    }
  };
  window.addEventListener('storage', onStorageChange);

  // 3. Polling contínuo resiliente: detecta token ou encerramento do popup
  const pollTimer = setInterval(() => {
    if (resolved) {
      clearInterval(pollTimer);
      return;
    }

    // Checagem ativa se o popup gravou o token (imune a atrasos de eventos)
    try {
      const savedToken = localStorage.getItem('bancoresidencia_google_access_token');
      const authTs = localStorage.getItem('bancoresidencia_google_popup_auth_timestamp');
      if (savedToken && authTs && (Date.now() - Number(authTs)) < 60000) {
        cleanup();
        try { popup.close(); } catch { /* ignore */ }
        onSuccess(savedToken);
        return;
      }
    } catch {
      // Ignora restrições de localStorage
    }

    try {
      if (popup.closed) {
        clearInterval(pollTimer);

        // Dá 1500ms de tolerância para a callback page concluir a gravação antes de decidir
        setTimeout(() => {
          if (resolved) return;

          const token = localStorage.getItem('bancoresidencia_google_access_token');
          const isConnected = localStorage.getItem('bancoresidencia_google_calendar_connected') === 'true';
          const authTs = localStorage.getItem('bancoresidencia_google_popup_auth_timestamp');
          const isRecentlyAuthenticated = Boolean(
            token && (
              isConnected ||
              (authTs && (Date.now() - Number(authTs)) < 60000)
            )
          );

          if (token && isRecentlyAuthenticated) {
            cleanup();
            onSuccess(token);
          } else {
            cleanup();
            onError(new Error('popup_closed'));
          }
        }, 1500);
      }
    } catch {
      // Erro ao verificar popup.closed (cross-origin) — ignora
    }
  }, 300);

  return cleanup;
}

/**
 * OPÇÃO 2 — DISPARO DE AUTENTICAÇÃO DIRETA VIA POPUP (GIS Token Client):
 * Executa de forma síncrona se a biblioteca já estiver no window para
 * PREVENIR bloqueio de popups pelos navegadores (Chrome/Edge/Safari).
 */
export function requestGoogleCalendarAccessToken(
  clientId: string,
  onSuccess: (accessToken: string) => void,
  onError: (error: any) => void
): void {
  try {
    const google = typeof window !== 'undefined' ? (window as any).google : null;

    const executeTokenRequest = (g: any) => {
      let isDone = false;
      const timeoutTimer = setTimeout(() => {
        if (!isDone) {
          isDone = true;
          onError(new Error('Tempo limite esgotado. Clique em "Continuar com o Google" para tentar novamente.'));
        }
      }, 120000);

      const tokenClient = g.accounts.oauth2.initTokenClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
        callback: (resp: any) => {
          isDone = true;
          clearTimeout(timeoutTimer);
          if (resp?.error) {
            onError(resp);
          } else if (resp?.access_token) {
            onSuccess(resp.access_token);
          } else {
            onError(new Error('Nenhum token retornado pelo Google.'));
          }
        }
      });

      tokenClient.requestAccessToken({ prompt: 'select_account' });
    };

    // 1. Se GIS já carregou no <head>, executa imediatamente (zero delay = popup 100% liberado)
    if (google?.accounts?.oauth2) {
      executeTokenRequest(google);
      return;
    }

    // 2. Fallback caso a biblioteca ainda não tenha finalizado o download
    loadGoogleGsiScript()
      .then(() => {
        const g = (window as any).google;
        if (!g?.accounts?.oauth2) {
          throw new Error('Google Identity Services não está disponível.');
        }
        executeTokenRequest(g);
      })
      .catch((err) => onError(err));
  } catch (err) {
    onError(err);
  }
}

/**
 * OPÇÃO 2: Verifica se há um access_token na URL (hash fragment ou search params)
 * Suporta formatos padrão:
 *   #access_token=...
 *   #google_access_token=...
 *   ?access_token=...
 */
export function extractGoogleTokenFromUrlHash(): string | null {
  if (typeof window === 'undefined') return null;

  try {
    // 1. Busca no Hash
    const hash = window.location.hash.replace(/^#/, '');
    if (hash) {
      const hashParams = new URLSearchParams(hash);
      const token = hashParams.get('access_token') || hashParams.get('google_access_token');
      if (token) {
        const cleanUrl = window.location.pathname + window.location.search;
        window.history.replaceState(null, '', cleanUrl);
        return decodeURIComponent(token);
      }
    }

    // 2. Busca na Query
    const searchParams = new URLSearchParams(window.location.search);
    const searchToken = searchParams.get('access_token') || searchParams.get('google_access_token');
    if (searchToken) {
      searchParams.delete('access_token');
      searchParams.delete('google_access_token');
      const newQuery = searchParams.toString();
      const cleanUrl = window.location.pathname + (newQuery ? `?${newQuery}` : '');
      window.history.replaceState(null, '', cleanUrl);
      return decodeURIComponent(searchToken);
    }
  } catch {
    // ignora erros de parsing
  }

  return null;
}

/**
 * OPÇÃO 2: Verifica se há erro de auth na URL (query param) após redirect OAuth
 */
export function extractGoogleAuthErrorFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  const params = new URLSearchParams(window.location.search);
  const error = params.get('google_auth_error');

  if (error) {
    // Limpa o parâmetro de erro da URL
    params.delete('google_auth_error');
    const newSearch = params.toString();
    const cleanUrl = window.location.pathname + (newSearch ? `?${newSearch}` : '');
    window.history.replaceState(null, '', cleanUrl);

    const messages: Record<string, string> = {
      access_denied: 'Acesso negado. Você cancelou a autorização do Google.',
      no_code: 'Erro na autenticação Google. Tente novamente.',
      token_exchange_failed: 'Falha ao conectar com o Google. Tente novamente.',
      server_error: 'Erro interno ao conectar com o Google. Tente novamente.',
    };
    return messages[error] || `Erro Google OAuth: ${error}`;
  }

  return null;
}

/**
 * OPÇÃO 2: Busca o e-mail real da conta do Google Agenda conectada via access_token
 */
export async function fetchGoogleCalendarAccountEmail(accessToken: string): Promise<string | null> {
  if (!accessToken) return null;

  // 1. Tenta obter diretamente do calendário primário (funciona 100% com calendar.events / calendar.readonly)
  try {
    const res = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: 'application/json'
      },
      signal: AbortSignal.timeout(6000)
    });
    if (res.ok) {
      const data = await res.json();
      if (data.id && typeof data.id === 'string' && data.id.includes('@')) {
        return data.id;
      }
      if (data.summary && typeof data.summary === 'string' && data.summary.includes('@')) {
        return data.summary;
      }
    }
  } catch {
    // segue para fallback
  }

  // 2. Fallback: Endpoint de userinfo do Google OAuth2
  try {
    const resUser = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
      signal: AbortSignal.timeout(5000)
    });
    if (resUser.ok) {
      const userData = await resUser.json();
      if (userData.email) return userData.email;
    }
  } catch {
    // ignora erros de fallback
  }

  return null;
}

/**
 * OPÇÃO 2: Busca eventos de hoje direto da API do Google Calendar via access_token
 */
export async function fetchTodayEventsFromGoogleApi(accessToken: string) {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0).toISOString();
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999).toISOString();

  const url = `https://www.googleapis.com/calendar/v3/calendars/primary/events?timeMin=${encodeURIComponent(
    startOfDay
  )}&timeMax=${encodeURIComponent(endOfDay)}&singleEvents=true&orderBy=startTime`;

  const response = await fetch(url, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json'
    },
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || `Erro ${response.status} ao consultar API do Google Calendar.`);
  }

  const data = await response.json();
  const items = data.items || [];

  return items.map((item: any, idx: number) => {
    const startStr = item.start?.dateTime || item.start?.date || '';
    const endStr = item.end?.dateTime || item.end?.date || '';

    const startDate = startStr ? new Date(startStr) : new Date();
    const endDate = endStr ? new Date(endStr) : new Date(startDate.getTime() + 3600000);

    const startMinutes = startDate.getHours() * 60 + startDate.getMinutes();
    const endMinutes = endDate.getHours() * 60 + endDate.getMinutes();

    const startTime = `${String(startDate.getHours()).padStart(2, '0')}:${String(startDate.getMinutes()).padStart(2, '0')}`;
    const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

    const summary = item.summary || 'Compromisso';
    const lower = `${summary} ${item.description || ''}`.toLowerCase();
    let category: 'hospital' | 'estudo' | 'pausa' = 'hospital';
    if (lower.includes('almoço') || lower.includes('jantar') || lower.includes('descanso') || lower.includes('pausa')) {
      category = 'pausa';
    } else if (lower.includes('estudo') || lower.includes('questõ') || lower.includes('simulado') || lower.includes('revis')) {
      category = 'estudo';
    }

    return {
      id: item.id || `google_api_${idx}`,
      title: summary,
      category,
      startTime,
      endTime,
      startMinutes,
      endMinutes: Math.max(endMinutes, startMinutes + 15),
      source: 'google' as const,
      description: item.description || '',
      location: item.location || undefined
    };
  });
}

/**
 * OPÇÃO 2: Cria um evento direto no Google Agenda do usuário usando access_token
 */
export async function createEventInGoogleCalendarApi(
  accessToken: string,
  event: GoogleCalendarEventInput
): Promise<any> {
  const now = new Date();
  const [startH, startM] = event.startTime.split(':').map(Number);
  const [endH, endM] = event.endTime.split(':').map(Number);

  const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH || 0, startM || 0, 0);
  const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH || 0, endM || 0, 0);

  const payload = {
    summary: event.title,
    description: event.description,
    location: event.location || 'Plataforma Banco Residência',
    start: {
      dateTime: startDateTime.toISOString()
    },
    end: {
      dateTime: endDateTime.toISOString()
    }
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload),
    signal: AbortSignal.timeout(10000)
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || `Erro ${response.status} ao gravar evento no Google Calendar.`);
  }

  return response.json();
}

/**
 * OPÇÃO 1 & 2: Gera arquivo iCal (.ics) padronizado para um lote de tarefas/eventos
 */
export function generateIcsContent(events: GoogleCalendarEventInput[]): string {
  const now = new Date();
  const dtStamp = now.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';

  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Banco Residencia//Cronograma Inteligente//PT-BR',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'X-WR-CALNAME:Estudos - Banco Residência'
  ];

  events.forEach((ev, idx) => {
    const startCompact = formatGoogleDateTimeCompact(ev.startTime, now);
    const endCompact = formatGoogleDateTimeCompact(ev.endTime, now);
    const uid = `bancoresidencia_${Date.now()}_${idx}@bancoresidencia.com.br`;

    lines.push(
      'BEGIN:VEVENT',
      `UID:${uid}`,
      `DTSTAMP:${dtStamp}`,
      `DTSTART:${startCompact}`,
      `DTEND:${endCompact}`,
      `SUMMARY:${ev.title.replace(/\n/g, ' ')}`,
      `DESCRIPTION:${(ev.description || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${(ev.location || 'Plataforma Banco Residência').replace(/\n/g, ' ')}`,
      'STATUS:CONFIRMED',
      'END:VEVENT'
    );
  });

  lines.push('END:VCALENDAR');
  return lines.join('\r\n');
}

/**
 * Dispara download do arquivo .ics no navegador para importação direta no Google Agenda
 */
export function downloadIcsFile(filename: string, content: string): void {
  if (typeof window === 'undefined') return;
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.ics') ? filename : `${filename}.ics`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Cria múltiplos eventos em lote na API do Google Agenda
 */
export async function createEventsBatchInGoogleCalendarApi(
  accessToken: string,
  events: GoogleCalendarEventInput[]
): Promise<{ success: number; failed: number }> {
  let success = 0;
  let failed = 0;

  for (const ev of events) {
    try {
      await createEventInGoogleCalendarApi(accessToken, ev);
      success++;
    } catch {
      failed++;
    }
  }

  return { success, failed };
}
