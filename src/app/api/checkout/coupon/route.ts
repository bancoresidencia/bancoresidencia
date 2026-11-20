import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { validateBackendReferralCoupon } from '@/services/ambassadorService';

export async function POST(request: Request) {
  try {
    const { data: { user } } = await (await createClient()).auth.getUser();
    if (!user) return NextResponse.json({ message: 'Entre na sua conta para aplicar um cupom.' }, { status: 401 });
    const { code } = await request.json();
    if (typeof code !== 'string' || code.length > 20) return NextResponse.json({ message: 'Código inválido.' }, { status: 400 });
    const result = await validateBackendReferralCoupon(code, user.id, user.user_metadata?.name);
    return NextResponse.json(result, { status: result.valid ? 200 : 422 });
  } catch {
    return NextResponse.json({ message: 'Não foi possível verificar o cupom.' }, { status: 503 });
  }
}
