import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import {
  getValidGoogleAccessToken,
  createGoogleCalendarEvent
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
    const { title, startTime, endTime, description, location } = body;

    if (!title || !startTime || !endTime) {
      return NextResponse.json(
        { error: 'Campos "title", "startTime" e "endTime" são obrigatórios.' },
        { status: 400 }
      );
    }

    const accessToken = await getValidGoogleAccessToken(user.id);
    const createdEvent = await createGoogleCalendarEvent(accessToken, {
      title,
      startTime,
      endTime,
      description: description || '',
      location
    });

    return NextResponse.json({
      success: true,
      event: createdEvent
    });
  } catch (err: any) {
    console.error('[GoogleCalendarCreateEvent] Erro:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao criar evento no Google Calendar.' },
      { status: 500 }
    );
  }
}
