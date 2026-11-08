import { NextRequest, NextResponse } from 'next/server';
import { createClient as createSupabaseAdminClient } from '@supabase/supabase-js';
import { createClient as createSupabaseServerClient } from '@/lib/supabase/server';
import { computePlatformLeaderboard } from '@/services/rankingService';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
  return createSupabaseAdminClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function GET(req: NextRequest) {
  try {
    const supabaseAdmin = getSupabaseAdmin();
    let authenticatedUserId: string | null = null;

    // 1. Identificar usuário via Bearer Token no header
    const authHeader = req.headers.get('authorization');
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      const { data: { user: authUser } } = await supabaseAdmin.auth.getUser(token);
      if (authUser) {
        authenticatedUserId = authUser.id;
      }
    }

    // 2. Se não encontrou no header, verifica cookies de sessão
    if (!authenticatedUserId) {
      try {
        const supabaseServer = await createSupabaseServerClient();
        const { data: { user: cookieUser } } = await supabaseServer.auth.getUser();
        if (cookieUser) {
          authenticatedUserId = cookieUser.id;
        }
      } catch {
        // Sem cookies de sessão
      }
    }

    // 3. Parâmetros de consulta
    const { searchParams } = new URL(req.url);
    const banca = searchParams.get('banca') || undefined;
    const institution = searchParams.get('institution') || undefined;
    const modalidade = searchParams.get('modalidade') || undefined;
    const limit = searchParams.get('limit') ? parseInt(searchParams.get('limit')!, 10) : 50;
    const offset = searchParams.get('offset') ? parseInt(searchParams.get('offset')!, 10) : 0;
    const forceRefresh = searchParams.get('refresh') === 'true';

    const result = await computePlatformLeaderboard(
      {
        banca,
        institution,
        modalidade,
        currentUserId: authenticatedUserId,
        limit,
        offset
      },
      forceRefresh
    );

    return NextResponse.json(result);
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Falha interna ao processar ranking.';
    console.error('[API Ranking] Erro:', err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
