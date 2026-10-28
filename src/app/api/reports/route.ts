import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createClient as createServerClient } from '@/lib/supabase/server';
import crypto from 'crypto';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

function isValidUuid(id?: string | null): boolean {
  if (!id || typeof id !== 'string') return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { questionId, reason, details, userMeta } = body;

    if (!questionId || typeof questionId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID da questão inválido ou ausente.' },
        { status: 400 }
      );
    }

    if (!details || typeof details !== 'string' || details.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'Por favor, descreva o apontamento com pelo menos 3 caracteres.' },
        { status: 400 }
      );
    }

    // 1. Tenta identificar se há usuário autenticado via cookies da sessão
    let finalUserId: string | null = null;
    let finalUserEmail: string | null = null;
    let finalUserName: string | null = userMeta?.name || 'Estudante';

    try {
      const serverSupabase = await createServerClient();
      const { data: { user } } = await serverSupabase.auth.getUser();
      if (user) {
        finalUserId = user.id;
        finalUserEmail = user.email || null;
        finalUserName = (user.user_metadata?.name as string) || (user.user_metadata?.full_name as string) || finalUserName;
      }
    } catch {
      // Ignora erro de sessão de cookies e segue com userMeta
    }

    if (!finalUserId && userMeta?.id && isValidUuid(userMeta.id)) {
      finalUserId = userMeta.id;
    }
    if (!finalUserEmail && userMeta?.email) {
      finalUserEmail = userMeta.email;
    }

    const reportId = crypto.randomUUID();
    const now = new Date().toISOString();
    const supabaseAdmin = getSupabaseAdmin();

    // 2. Insere no Supabase via Service Role Key (garante que todos os admins recebam sem restrição de RLS)
    const basePayload: Record<string, unknown> = {
      id: reportId,
      question_id: questionId,
      user_id: finalUserId,
      reason: reason || 'Erro no gabarito ou enunciado',
      details: details.trim(),
      status: 'pending',
      created_at: now
    };

    // Tenta primeiro com colunas extras caso existam (user_name, user_email)
    const enrichedPayload = {
      ...basePayload,
      ...(finalUserName ? { user_name: finalUserName } : {}),
      ...(finalUserEmail ? { user_email: finalUserEmail } : {})
    };

    let { error } = await supabaseAdmin.from('question_reports').insert(enrichedPayload);

    // Se falhar por coluna inexistente, faz fallback para o payload estrito
    if (error && error.message.includes('column')) {
      const fallbackRes = await supabaseAdmin.from('question_reports').insert(basePayload);
      error = fallbackRes.error;
    }

    if (error) {
      console.error('[API Reports] Erro ao gravar denúncia no Supabase:', error);
      return NextResponse.json(
        { success: false, error: 'Falha ao registrar denúncia no banco de dados. Tente novamente.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      reportId,
      message: 'Apontamento registrado com sucesso. A equipe médica e curadoria foram notificadas!'
    });
  } catch (err) {
    console.error('[API Reports] Erro inesperado ao processar reporte:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao processar o apontamento.' },
      { status: 500 }
    );
  }
}
