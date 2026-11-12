import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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

    await supabase
      .from('user_calendar_integrations')
      .delete()
      .eq('user_id', user.id)
      .eq('provider', 'google');

    return NextResponse.json({
      success: true,
      message: 'Google Agenda desconectado com sucesso.'
    });
  } catch (err: any) {
    console.error('[GoogleCalendarDisconnect] Erro:', err);
    return NextResponse.json(
      { error: err?.message || 'Falha ao desconectar Google Agenda.' },
      { status: 500 }
    );
  }
}
