import crypto from 'crypto';
import { createClient } from '@/lib/supabase/server';
import { DailyScheduleSlot } from '@/components/dashboard/scheduleTypes';

// ── 1. Criptografia AES-256-GCM para Tokens em Repouso ──
function getEncryptionKey(): Buffer {
  const secret =
    process.env.CALENDAR_ENCRYPTION_KEY ||
    process.env.GOOGLE_CLIENT_SECRET ||
    'bancoresidencia_secure_calendar_token_vault_2026';
  return crypto.createHash('sha256').update(secret).digest();
}

export function encryptSecret(plainText: string): string {
  if (!plainText) return '';
  const iv = crypto.randomBytes(12);
  const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);
  let encrypted = cipher.update(plainText, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const authTag = cipher.getAuthTag().toString('hex');
  return `${iv.toString('hex')}:${authTag}:${encrypted}`;
}

export function decryptSecret(cipherText: string): string {
  if (!cipherText) return '';
  const parts = cipherText.split(':');
  if (parts.length !== 3) return cipherText; // Formato legado/texto simples fallback
  try {
    const [ivHex, authTagHex, encryptedHex] = parts;
    const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), Buffer.from(ivHex, 'hex'));
    decipher.setAuthTag(Buffer.from(authTagHex, 'hex'));
    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  } catch (err) {
    console.error('[GoogleCalendarServer] Falha ao descriptografar token:', err);
    return cipherText;
  }
}

// ── 2. Troca de Authorization Code por Tokens (OAuth 2.0 Backend Flow) ──
export async function exchangeGoogleCode(code: string, redirectUri: string) {
  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    '323022146503-csbd1pq8s2g22l3mghaaea4kocl2acfn.apps.googleusercontent.com';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const missingKeys: string[] = [];
    if (!clientId) missingKeys.push('GOOGLE_CLIENT_ID');
    if (!clientSecret) missingKeys.push('GOOGLE_CLIENT_SECRET');
    throw new Error(`Credenciais ${missingKeys.join(' e ')} ausentes no servidor.`);
  }

  const tokenUrl = 'https://oauth2.googleapis.com/token';
  const bodyParams = new URLSearchParams({
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
    grant_type: 'authorization_code'
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: bodyParams.toString()
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(
      errorJson.error_description || errorJson.error || `Falha na troca de código Google: HTTP ${response.status}`
    );
  }

  const tokenData = await response.json();
  return {
    accessToken: tokenData.access_token as string,
    refreshToken: (tokenData.refresh_token as string) || null,
    expiresIn: (tokenData.expires_in as number) || 3600,
    scope: (tokenData.scope as string) || ''
  };
}

// ── 3. Renovação Silenciosa Server-Side (Garante token sempre válido) ──
export async function getValidGoogleAccessToken(userId: string): Promise<string> {
  const supabase = await createClient();

  const { data: integration, error: fetchErr } = await supabase
    .from('user_calendar_integrations')
    .select('*')
    .eq('user_id', userId)
    .eq('provider', 'google')
    .maybeSingle();

  if (fetchErr || !integration) {
    throw new Error('Integração com Google Agenda não encontrada para este usuário.');
  }

  const now = new Date();
  const expiresAt = integration.token_expires_at ? new Date(integration.token_expires_at) : new Date(0);

  // Se o token ainda tem mais de 5 minutos de validade, reutiliza
  if (expiresAt.getTime() - now.getTime() > 5 * 60 * 1000 && integration.access_token) {
    return decryptSecret(integration.access_token);
  }

  // Se expirou ou está perto de expirar, usa o refresh_token para renovar nos bastidores
  const rawRefreshToken = integration.refresh_token ? decryptSecret(integration.refresh_token) : null;
  if (!rawRefreshToken) {
    throw new Error('Sessão expirada e nenhum Refresh Token disponível. Por favor, reconecte o Google Agenda.');
  }

  const clientId =
    process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID ||
    process.env.GOOGLE_CLIENT_ID ||
    '323022146503-csbd1pq8s2g22l3mghaaea4kocl2acfn.apps.googleusercontent.com';
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    const missingKeys: string[] = [];
    if (!clientId) missingKeys.push('GOOGLE_CLIENT_ID');
    if (!clientSecret) missingKeys.push('GOOGLE_CLIENT_SECRET');
    throw new Error(`Credenciais ${missingKeys.join(' e ')} ausentes no servidor.`);
  }

  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: rawRefreshToken,
      grant_type: 'refresh_token'
    }).toString()
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    if (errorJson.error === 'invalid_grant') {
      // O usuário revogou o acesso no Google; limpa a integração no banco
      await supabase.from('user_calendar_integrations').delete().eq('user_id', userId);
      throw new Error('Acesso revogado na Conta Google. Por favor, conecte novamente.');
    }
    throw new Error(errorJson.error_description || 'Falha ao renovar credenciais do Google.');
  }

  const newTokens = await response.json();
  const newAccessToken = newTokens.access_token as string;
  const newExpiresIn = (newTokens.expires_in as number) || 3600;
  const newExpiresAt = new Date(Date.now() + newExpiresIn * 1000).toISOString();

  // Atualiza banco com novo access_token criptografado
  await supabase
    .from('user_calendar_integrations')
    .update({
      access_token: encryptSecret(newAccessToken),
      token_expires_at: newExpiresAt,
      updated_at: new Date().toISOString()
    })
    .eq('user_id', userId);

  return newAccessToken;
}

// ── 4. Busca o Email da Conta Principal do Google Agenda ──
export async function fetchGoogleAccountEmail(accessToken: string): Promise<string | null> {
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
      if (data.id && typeof data.id === 'string' && data.id.includes('@')) return data.id;
      if (data.summary && typeof data.summary === 'string' && data.summary.includes('@')) return data.summary;
    }
  } catch (err) {
    console.warn('[GoogleCalendarServer] Falha ao obter email primário:', err);
  }
  return null;
}

// ── 5. Busca Eventos de Hoje no Google Calendar ──
export async function fetchTodayGoogleEvents(accessToken: string): Promise<DailyScheduleSlot[]> {
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

  return items.map((item: any, idx: number): DailyScheduleSlot => {
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
    let category: DailyScheduleSlot['category'] = 'hospital';
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
      source: 'google',
      description: item.description || '',
      location: item.location || undefined
    };
  });
}

// ── 6. Cria um Evento no Google Calendar Server-Side ──
export async function createGoogleCalendarEvent(
  accessToken: string,
  event: { title: string; startTime: string; endTime: string; description: string; location?: string }
) {
  const now = new Date();
  const [startH, startM] = event.startTime.split(':').map(Number);
  const [endH, endM] = event.endTime.split(':').map(Number);

  const startDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), startH || 0, startM || 0, 0);
  const endDateTime = new Date(now.getFullYear(), now.getMonth(), now.getDate(), endH || 0, endM || 0, 0);

  const payload = {
    summary: event.title,
    description: event.description,
    location: event.location || 'Plataforma Banco Residência',
    start: { dateTime: startDateTime.toISOString() },
    end: { dateTime: endDateTime.toISOString() }
  };

  const response = await fetch('https://www.googleapis.com/calendar/v3/calendars/primary/events', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const errorJson = await response.json().catch(() => ({}));
    throw new Error(errorJson.error?.message || `Erro ${response.status} ao criar evento no Google Calendar.`);
  }

  return await response.json();
}
