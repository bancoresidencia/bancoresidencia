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
 * Constrói o redirect_uri correto para o ambiente atual
 */
export function getGoogleOAuthRedirectUri(): string {
  if (typeof window === 'undefined') return '';
  return `${window.location.origin}/api/auth/google/callback`;
}

/**
 * OPÇÃO 2 — FLUXO PRINCIPAL (Redirect, sem popup):
 * Inicia o fluxo OAuth Authorization Code com redirecionamento.
 * Não depende de popup — funciona em produção Vercel, Chrome com pop-up bloqueados etc.
 *
 * O Google redireciona de volta para /api/auth/google/callback?code=...
 * que por sua vez redireciona para /#google_access_token=...
 *
 * Para usar este fluxo, adicione no Google Cloud Console:
 *   Authorized redirect URIs:
 *     - https://bancoresidencia-kappa.vercel.app/api/auth/google/callback
 *     - https://bancoresidencia.vercel.app/api/auth/google/callback
 *     - http://localhost:3000/api/auth/google/callback
 */
export async function startGoogleOAuthRedirect(clientId: string): Promise<void> {
  await loadGoogleGsiScript();
  const google = (window as any).google;

  if (!google?.accounts?.oauth2) {
    throw new Error('Google Identity Services não está disponível no navegador.');
  }

  const redirectUri = getGoogleOAuthRedirectUri();

  return new Promise<void>((resolve, reject) => {
    try {
      const codeClient = google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
        ux_mode: 'redirect',
        redirect_uri: redirectUri,
        // state: preserva a URL atual para retornar após auth
        state: window.location.pathname + window.location.search,
      });

      // requestCode() redireciona o navegador para o Google — não retorna
      codeClient.requestCode();
      resolve(); // nunca chegará aqui normalmente (página redireciona)
    } catch (err) {
      reject(err);
    }
  });
}

/**
 * OPÇÃO 2 — FLUXO FALLBACK (Popup, para localhost):
 * Inicializa o fluxo OAuth Token Client com abertura de popup.
 * Use apenas como fallback quando o redirect não for possível.
 */
export async function requestGoogleCalendarAccessToken(
  clientId: string,
  onSuccess: (accessToken: string) => void,
  onError: (error: any) => void
): Promise<void> {
  try {
    await loadGoogleGsiScript();
    const google = (window as any).google;

    if (!google?.accounts?.oauth2) {
      throw new Error('Google Identity Services não está disponível no navegador.');
    }

    let isDone = false;
    let timeoutTimer: any = null;

    const cleanup = () => {
      isDone = true;
      if (timeoutTimer) clearTimeout(timeoutTimer);
    };

    // Tempo limite de 2 minutos para o usuário concluir o login
    timeoutTimer = setTimeout(() => {
      if (!isDone) {
        cleanup();
        onError(new Error('Tempo limite esgotado. Clique em "Continuar com o Google" para tentar novamente.'));
      }
    }, 120000);

    const tokenClient = google.accounts.oauth2.initTokenClient({
      client_id: clientId,
      scope: 'https://www.googleapis.com/auth/calendar.events https://www.googleapis.com/auth/calendar.readonly',
      callback: (resp: any) => {
        cleanup();
        if (resp.error) {
          onError(resp);
        } else if (resp.access_token) {
          onSuccess(resp.access_token);
        }
      }
    });

    // Abre imediatamente o popup de seleção de conta do Google
    tokenClient.requestAccessToken({ prompt: 'select_account' });
  } catch (err) {
    onError(err);
  }
}

/**
 * OPÇÃO 2: Verifica se há um access_token na URL (hash fragment) após redirect OAuth
 * Chame esta função na inicialização do componente para capturar o token retornado
 * pelo fluxo de redirecionamento.
 *
 * Retorna o token se encontrado, ou null se não houver token na URL.
 * Limpa automaticamente o hash da URL após extrair o token.
 */
export function extractGoogleTokenFromUrlHash(): string | null {
  if (typeof window === 'undefined') return null;

  const hash = window.location.hash;
  if (!hash || !hash.includes('google_access_token=')) return null;

  try {
    // Remove o '#' inicial e parseia os parâmetros
    const params = new URLSearchParams(hash.replace(/^#/, ''));
    const token = params.get('google_access_token');

    if (token) {
      // Limpa o hash da URL sem recarregar a página
      const cleanUrl = window.location.pathname + window.location.search;
      window.history.replaceState(null, '', cleanUrl);
      return decodeURIComponent(token);
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
      description: item.description || 'Evento importado via Google Calendar API',
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
