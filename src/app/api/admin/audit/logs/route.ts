import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';

export const dynamic = 'force-dynamic';

function getSupabaseAdmin() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const supabaseKey =
    process.env.SUPABASE_SERVICE_ROLE_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    'placeholder-key';
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    }
  });
}

export async function GET(req: NextRequest) {
  try {
    // 1. Verificação de sessão administrativa estrita
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso restrito a administradores.' },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const entityId = searchParams.get('entityId') || searchParams.get('questionId');
    const entityType = searchParams.get('entityType');
    const action = searchParams.get('action');
    const userEmail = searchParams.get('userEmail');
    const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)));
    const offset = (page - 1) * limit;

    const supabaseAdmin = getSupabaseAdmin();

    let query = supabaseAdmin
      .from('audit_logs')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false });

    if (entityId) {
      query = query.eq('entity_id', entityId);
    }
    if (entityType) {
      query = query.eq('entity_type', entityType);
    }
    if (action) {
      query = query.eq('action', action);
    }
    if (userEmail) {
      query = query.ilike('user_email', `%${userEmail.trim()}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) {
      // Se a tabela ainda não existir no ambiente de testes antes da migração SQL
      console.warn('[API Audit Logs] Aviso ao consultar logs de auditoria:', error.message);
      return NextResponse.json({
        success: true,
        logs: [],
        total: 0,
        page,
        limit,
        totalPages: 0,
        warning: 'Tabela de auditoria não inicializada ou vazia no banco de dados.'
      });
    }

    const total = count || 0;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      logs: data || [],
      total,
      page,
      limit,
      totalPages
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno do servidor';
    console.error('[API Audit Logs] Exceção:', err);
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
