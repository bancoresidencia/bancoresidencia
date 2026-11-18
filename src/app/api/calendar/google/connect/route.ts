import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { safeErrorMessage } from '@/utils/security';
import {
  exchangeGoogleCode,
  fetchGoogleAccountEmail,
  encryptSecret,
  verifyCalendarOAuthStateCookie
} from '@/services/googleCalendarServerService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const ALLOWED_REDIRECT_HOSTS = new Set([
  'bancoresidencia.com.br',
  'www.bancoresidencia.com.br',
  'bancoresidencia-kappa.vercel.app',
  'localhost:3000',
  '127.0.0.1:3000'
]);

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json();
    const { code, redirectUri, state } = body;

    if (!code || typeof code !== 'string' || !redirectUri || typeof redirectUri !== 'string') {
      return NextResponse.json(
        { error: 'Parâmetros "code" e "redirectUri" são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Validação estrita do redirectUri contra domínios autorizados
    try {
      const parsedRedirect = new URL(redirectUri);
      const configuredHost = process.env.NEXT_PUBLIC_APP_URL ? new URL(process.env.NEXT_PUBLIC_APP_URL).host : '';
      if (
        !ALLOWED_REDIRECT_HOSTS.has(parsedRedirect.host.toLowerCase()) &&
        (!configuredHost || parsedRedirect.host.toLowerCase() !== configuredHost.toLowerCase())
      ) {
        return NextResponse.json({ error: 'redirectUri não autorizado.' }, { status: 400 });
      }
    } catch {
      return NextResponse.json({ error: 'redirectUri inválido.' }, { status: 400 });
    }

    // 2. Proteção OAuth CSRF: exige coincidência criptográfica entre o parâmetro state e o cookie HttpOnly assinado vinculado ao user.id
    const rawStateCookie = req.cookies.get('br_gcal_oauth_state')?.value;
    if (
      typeof state !== 'string' ||
      !verifyCalendarOAuthStateCookie(user.id, rawStateCookie, state)
    ) {
      return NextResponse.json(
        { error: 'Validação de segurança OAuth (state anti-CSRF) falhou ou expirou. Inicie a conexão novamente.' },
        { status: 403 }
      );
    }

    // 3. Troca o código pelo par access_token + refresh_token
    const tokens = await exchangeGoogleCode(code, redirectUri);

    // 4. Busca o email da conta conectada
    const accountEmail = await fetchGoogleAccountEmail(tokens.accessToken);
    const tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000).toISOString();

    // 5. Salva no banco de dados com criptografia AES-256-GCM (via service_role restrito ao user.id autenticado)
    const payloadToUpsert: Record<string, unknown> = {
      user_id: user.id,
      provider: 'google',
      account_email: accountEmail || user.email,
      access_token: encryptSecret(tokens.accessToken),
      token_expires_at: tokenExpiresAt,
      scope: tokens.scope,
      sync_mode: 'api',
      last_sync_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    if (tokens.refreshToken) {
      payloadToUpsert.refresh_token = encryptSecret(tokens.refreshToken);
    }

    const supabaseAdmin = getSupabaseAdmin();
    const { error: upsertErr } = await supabaseAdmin
      .from('user_calendar_integrations')
      .upsert(payloadToUpsert, { onConflict: 'user_id,provider' });

    if (upsertErr) {
      console.error('[GoogleCalendarConnect] Erro ao salvar integração no Supabase:', upsertErr);
      return NextResponse.json(
        { error: 'Falha ao salvar a integração segura no banco de dados.' },
        { status: 500 }
      );
    }

    const res = NextResponse.json({
      success: true,
      email: accountEmail || user.email,
      message: 'Google Agenda conectado com sucesso e protegido no servidor.'
    });
    res.cookies.delete('br_gcal_oauth_state');
    return res;
  } catch (err: unknown) {
    console.error('[GoogleCalendarConnect] Erro:', err);
    return NextResponse.json(
      { error: safeErrorMessage(err, 'Falha ao processar autorização do Google.') },
      { status: 500 }
    );
  }
}
