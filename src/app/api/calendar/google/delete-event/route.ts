import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getValidGoogleAccessToken,
  deleteGoogleCalendarEvent
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
    const { eventId } = body;

    if (!eventId) {
      return NextResponse.json(
        { error: 'Parâmetro "eventId" é obrigatório.' },
        { status: 400 }
      );
    }

    const accessToken = await getValidGoogleAccessToken(user.id);
    await deleteGoogleCalendarEvent(accessToken, eventId);

    return NextResponse.json({
      success: true,
      message: 'Evento excluído do Google Agenda com sucesso.'
    });
  } catch (err: any) {
    console.error('[GoogleCalendarDeleteEvent] Erro:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao excluir evento no Google Calendar.' },
      { status: 500 }
    );
  }
}
