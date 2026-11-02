/**
 * Serviço de Integração com Google Agenda (iCal + Google Calendar REST API)
 * Suporta:
 * 1. Links Template em 1 clique (Action TEMPLATE para adicionar eventos sem OAuth)
 * 2. Google Identity Services (GIS OAuth2 Client) para Leitura e Gravação direta via API
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
 * OPÇÃO 2: Carrega dinamicamente a biblioteca oficial do Google Identity Services (GIS)
 */
export function loadGoogleGsiScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if ((window as any).google?.accounts?.oauth2) return resolve();

    const existingScript = document.getElementById('google-gsi-client');
    if (existingScript) {
      existingScript.addEventListener('load', () => resolve());
      existingScript.addEventListener('error', (err) => reject(err));
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-gsi-client';
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = (err) => reject(err);
    document.head.appendChild(script);
  });
}

/**
 * OPÇÃO 2: Inicializa o fluxo OAuth Token Client do Google
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

    // Tempo limite generoso de 3 minutos para permitir ao aluno ler e confirmar com calma
    timeoutTimer = setTimeout(() => {
      if (!isDone) {
        cleanup();
        onError(new Error('Tempo limite esgotado. Clique em "Continuar com o Google" para tentar novamente.'));
      }
    }, 180000);

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

    // Se o usuário já tiver autorizado previamente, conecta imediatamente sem reexibir avisos
    tokenClient.requestAccessToken({ prompt: '' });
  } catch (err) {
    onError(err);
  }
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
