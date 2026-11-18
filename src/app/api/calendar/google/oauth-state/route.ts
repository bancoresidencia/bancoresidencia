import crypto from 'crypto';
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { signCalendarOAuthState } from '@/services/googleCalendarServerService';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error
    } = await supabase.auth.getUser();

    if (error || !user) {
      return NextResponse.json({ error: 'Não autorizado.' }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const mode = body?.mode === 'popup' ? 'popup' : 'redirect';
    const nonce = crypto.randomBytes(16).toString('hex');
    const state = `${mode}:${nonce}`;
    const signedCookie = signCalendarOAuthState(user.id, state);

    const res = NextResponse.json({ state });
    res.cookies.set('br_gcal_oauth_state', signedCookie, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 600,
      path: '/'
    });
    return res;
  } catch {
    return NextResponse.json({ error: 'Falha ao iniciar estado OAuth.' }, { status: 500 });
  }
}
