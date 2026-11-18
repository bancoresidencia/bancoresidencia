import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { sanitizePostgrestTerm, safeErrorMessage } from '@/utils/security';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    // 1. Verificação de sessão administrativa estrita (somente admin/superadmin acessam logs forenses e PII)
    const auth = await verifyAdminSession(req, { requireStrictAdmin: true });
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
      const safeEmail = sanitizePostgrestTerm(userEmail);
      if (safeEmail) {
        query = query.ilike('user_email', `%${safeEmail}%`);
      }
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
    console.error('[API Audit Logs] Exceção:', err);
    return NextResponse.json({ success: false, error: safeErrorMessage(err, 'Erro interno ao consultar auditoria.') }, { status: 500 });
  }
}
