import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

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
      return NextResponse.json({ connected: false });
    }

    const { data: integration } = await supabase
      .from('user_calendar_integrations')
      .select('id, provider, account_email, sync_mode, last_sync_at')
      .eq('user_id', user.id)
      .eq('provider', 'google')
      .maybeSingle();

    if (!integration) {
      return NextResponse.json({ connected: false });
    }

    return NextResponse.json({
      connected: true,
      email: integration.account_email || 'Minha Agenda',
      syncMode: integration.sync_mode || 'api',
      lastSyncAt: integration.last_sync_at
    });
  } catch (err: any) {
    return NextResponse.json({ connected: false });
  }
}
