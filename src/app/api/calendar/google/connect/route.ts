import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  exchangeGoogleCode,
  fetchGoogleAccountEmail,
  encryptSecret
} from '@/services/googleCalendarServerService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

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
    const { code, redirectUri } = body;

    if (!code || !redirectUri) {
      return NextResponse.json(
        { error: 'Parâmetros "code" e "redirectUri" são obrigatórios.' },
        { status: 400 }
      );
    }

    // 1. Troca o código pelo par access_token + refresh_token
    const tokens = await exchangeGoogleCode(code, redirectUri);

    // 2. Busca o email da conta conectada
    const accountEmail = await fetchGoogleAccountEmail(tokens.accessToken);

    const tokenExpiresAt = new Date(Date.now() + tokens.expiresIn * 1000).toISOString();

    // 3. Salva no banco de dados com criptografia AES-256
    const payloadToUpsert: any = {
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

    // Só atualiza o refresh_token se o Google tiver enviado um novo (no consent inicial)
    if (tokens.refreshToken) {
      payloadToUpsert.refresh_token = encryptSecret(tokens.refreshToken);
    }

    const { error: upsertErr } = await supabase
      .from('user_calendar_integrations')
      .upsert(payloadToUpsert, { onConflict: 'user_id,provider' });

    if (upsertErr) {
      console.error('[GoogleCalendarConnect] Erro ao salvar integração no Supabase:', upsertErr);
      return NextResponse.json(
        { error: 'Falha ao salvar a integração segura no banco de dados.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      email: accountEmail || user.email,
      message: 'Google Agenda conectado com sucesso e protegido no servidor.'
    });
  } catch (err: any) {
    console.error('[GoogleCalendarConnect] Erro:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao processar autorização do Google.' },
      { status: 500 }
    );
  }
}
