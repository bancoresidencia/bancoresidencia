import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getValidGoogleAccessToken,
  fetchTodayGoogleEvents
} from '@/services/googleCalendarServerService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    // 1. Obtém token sempre válido (renovando com refresh_token nos bastidores se expirado)
    let accessToken: string;
    try {
      accessToken = await getValidGoogleAccessToken(user.id);
    } catch (tokenErr: any) {
      return NextResponse.json(
        { error: tokenErr?.message || 'Sessão do Google não encontrada ou revogada.', requiresReconnect: true },
        { status: 401 }
      );
    }

    // 2. Busca eventos do Google Calendar
    const events = await fetchTodayGoogleEvents(accessToken);

    // 3. Atualiza timestamp de última sincronização
    await supabase
      .from('user_calendar_integrations')
      .update({ last_sync_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('provider', 'google');

    return NextResponse.json({
      success: true,
      events,
      count: events.length
    });
  } catch (err: any) {
    console.error('[GoogleCalendarEventsAPI] Erro:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao sincronizar eventos do Google Agenda.' },
      { status: 500 }
    );
  }
}
