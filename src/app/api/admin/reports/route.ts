import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { verifyAdminSession } from '@/lib/supabase/adminAuth';
import { recordAuditEvent } from '@/lib/audit';
import { QuestionReport, ReportStatus } from '@/types';

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

/**
 * GET /api/admin/reports
 * Busca todas as denúncias/apontamentos de questões diretamente do Supabase
 * usando Service Role Key (garante que todos os administradores vejam tudo sem bloqueios de RLS).
 */
export async function GET(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso negado: permissões insuficientes.' },
        { status: auth.status }
      );
    }

    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get('status') || 'all';

    // Normalização: a UI usa 'in_progress', o check constraint da tabela usa 'in_review'
    const dbStatusFilter = statusParam === 'in_progress' ? 'in_review' : statusParam;

    const supabaseAdmin = getSupabaseAdmin();
    let query = supabaseAdmin
      .from('question_reports')
      .select('*')
      .order('created_at', { ascending: false });

    if (dbStatusFilter && dbStatusFilter !== 'all') {
      query = query.eq('status', dbStatusFilter);
    }

    const { data: rawReports, error: repError } = await query.limit(500);

    if (repError) {
      console.error('[API Admin Reports] Erro ao buscar denúncias no Supabase:', repError);
      return NextResponse.json(
        { success: false, error: 'Falha ao buscar denúncias de questões no banco.' },
        { status: 500 }
      );
    }

    if (!rawReports || rawReports.length === 0) {
      return NextResponse.json({ success: true, reports: [] });
    }

    // 1. Coleta IDs únicos das questões para busca em lote
    const questionIdentifiers = Array.from(
      new Set(
        rawReports
          .map((r: { question_id?: string }) => r.question_id)
          .filter((id): id is string => Boolean(id))
      )
    );

    // 2. Coleta IDs únicos dos estudantes (profiles)
    const userIds = Array.from(
      new Set(
        rawReports
          .map((r: { user_id?: string }) => r.user_id)
          .filter((id): id is string => Boolean(id) && isValidUuid(id))
      )
    );

    // 3. Separa identifiers: UUIDs (busca por id) e não-UUIDs (busca por code)
    const uuidIdentifiers = questionIdentifiers.filter((id) => isValidUuid(id));
    const codeIdentifiers = questionIdentifiers.filter((id) => !isValidUuid(id));

    const questionSelect = 'id, code, institution, banca, year, especialidade, tema, statement, options, correct_answer, commentary, is_anulada';

    // Executa queries em paralelo: por UUID, por código e profiles
    const [byIdRes, byCodeRes, profilesRes] = await Promise.all([
      uuidIdentifiers.length > 0
        ? supabaseAdmin.from('questions').select(questionSelect).in('id', uuidIdentifiers)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      codeIdentifiers.length > 0
        ? supabaseAdmin.from('questions').select(questionSelect).in('code', codeIdentifiers)
        : Promise.resolve({ data: [] as Record<string, unknown>[] }),
      userIds.length > 0
        ? supabaseAdmin
            .from('profiles')
            .select('id, name, email, college, specialty_target, avatar_url, role')
            .in('id', userIds)
        : Promise.resolve({ data: [] as Record<string, unknown>[] })
    ]);

    // Constrói o mapa indexando tanto por UUID quanto por code para cobertura máxima
    const questionMap = new Map<string, Record<string, unknown>>();
    const indexQuestion = (q: Record<string, unknown>) => {
      if (q.id) questionMap.set(String(q.id), q);
      if (q.code) questionMap.set(String(q.code), q);
    };
    if (byIdRes.data) (byIdRes.data as Array<Record<string, unknown>>).forEach(indexQuestion);
    if (byCodeRes.data) (byCodeRes.data as Array<Record<string, unknown>>).forEach(indexQuestion);

    // Fallback extra: qualquer identifier ainda ausente é buscado tanto por id quanto por code
    const missingIdentifiers = questionIdentifiers.filter((id) => !questionMap.has(id));
    if (missingIdentifiers.length > 0) {
      const missingUuids = missingIdentifiers.filter((id) => isValidUuid(id));
      const missingCodes = missingIdentifiers.filter((id) => !isValidUuid(id));

      const [fallbackById, fallbackByCode] = await Promise.all([
        missingUuids.length > 0
          ? supabaseAdmin.from('questions').select(questionSelect).in('id', missingUuids)
          : Promise.resolve({ data: [] as Record<string, unknown>[] }),
        missingCodes.length > 0
          ? supabaseAdmin.from('questions').select(questionSelect).in('code', missingCodes)
          : Promise.resolve({ data: [] as Record<string, unknown>[] })
      ]);

      if (fallbackById.data) (fallbackById.data as Array<Record<string, unknown>>).forEach(indexQuestion);
      if (fallbackByCode.data) (fallbackByCode.data as Array<Record<string, unknown>>).forEach(indexQuestion);
    }

    const profileMap = new Map<string, Record<string, unknown>>();
    if (profilesRes.data) {
      (profilesRes.data as Array<Record<string, unknown>>).forEach((p) => {
        if (p.id) profileMap.set(String(p.id), p);
      });
    }

    // 4. Monta a lista estruturada de QuestionReport compatível com a tipagem
    const enrichedReports: QuestionReport[] = rawReports.map((row: Record<string, unknown>) => {
      const rowStatus = String(row.status || 'pending');
      const uiStatus: ReportStatus =
        rowStatus === 'in_review' ? 'in_progress' : (rowStatus as ReportStatus);

      const qRow = row.question_id ? questionMap.get(String(row.question_id)) : undefined;
      const pRow = row.user_id ? profileMap.get(String(row.user_id)) : undefined;

      const userName = (pRow?.name as string) || (row.user_name as string) || 'Estudante';
      const userEmail = (pRow?.email as string) || (row.user_email as string) || undefined;

      return {
        id: String(row.id),
        questionId: String(row.question_id),
        userId: row.user_id ? String(row.user_id) : undefined,
        userEmail,
        userName,
        reason: String(row.reason || 'Erro no gabarito ou enunciado'),
        details: String(row.details || ''),
        status: uiStatus,
        adminNotes: (row.admin_notes as string) || null,
        createdAt: (row.created_at as string) || new Date().toISOString(),
        resolvedAt: (row.resolved_at as string) || null,
        userProfile: pRow
          ? {
              id: String(pRow.id),
              name: (pRow.name as string) || undefined,
              email: (pRow.email as string) || undefined,
              college: (pRow.college as string) || undefined,
              specialtyTarget: (pRow.specialty_target as string) || undefined,
              avatarUrl: (pRow.avatar_url as string) || undefined,
              role: (pRow.role as string) || undefined,
              isRegistered: true
            }
          : undefined,
        question: qRow
          ? {
              id: String(qRow.id),
              code: (qRow.code as string) || undefined,
              institution: (qRow.institution as string) || (qRow.banca as string) || '',
              banca: (qRow.banca as string) || '',
              year: Number(qRow.year) || 2026,
              especialidade: (qRow.especialidade as string) || '',
              tema: (qRow.tema as string) || '',
              statement: (qRow.statement as string) || '',
              options: (qRow.options as QuestionReport['question'] extends { options?: infer O } ? O : never) || [],
              correctAnswer: (qRow.correct_answer as 'A' | 'B' | 'C' | 'D' | 'E' | 'ANULADA') || 'A',
              commentary: (qRow.commentary as string) || '',
              isAnulada: Boolean(qRow.is_anulada)
            }
          : undefined
      };
    });

    return NextResponse.json({
      success: true,
      reports: enrichedReports
    });
  } catch (err) {
    console.error('[API Admin Reports] Erro inesperado ao listar denúncias:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao recuperar denúncias para auditoria.' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/reports
 * Atualiza o status e notas de auditoria de um reporte
 */
export async function PATCH(req: NextRequest) {
  try {
    const auth = await verifyAdminSession(req);
    if (!auth.authorized) {
      return NextResponse.json(
        { success: false, error: auth.error || 'Acesso negado: permissões insuficientes.' },
        { status: auth.status }
      );
    }

    const body = await req.json();
    const { reportId, status, adminNotes } = body;

    if (!reportId || typeof reportId !== 'string') {
      return NextResponse.json(
        { success: false, error: 'ID do reporte é obrigatório.' },
        { status: 400 }
      );
    }

    const validStatuses: ReportStatus[] = ['pending', 'in_progress', 'resolved', 'dismissed'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: `Status inválido: "${status}". Esperado: ${validStatuses.join(', ')}` },
        { status: 400 }
      );
    }

    // Mapeia da UI ('in_progress') para o banco ('in_review')
    const dbStatus = status === 'in_progress' ? 'in_review' : status;
    const now = new Date().toISOString();
    const supabaseAdmin = getSupabaseAdmin();

    const updatePayload: Record<string, unknown> = {
      status: dbStatus,
      resolved_at: status === 'resolved' ? now : null
    };

    if (auth.user?.id && isValidUuid(auth.user.id)) {
      updatePayload.resolved_by = auth.user.id;
    }

    // Tenta atualizar incluindo admin_notes se fornecido
    if (adminNotes !== undefined) {
      updatePayload.admin_notes = adminNotes;
    }

    let { error } = await supabaseAdmin
      .from('question_reports')
      .update(updatePayload)
      .eq('id', reportId);

    // Se falhar por causa da coluna admin_notes inexistente, atualiza sem ela
    if (error && error.message.includes('admin_notes')) {
      delete updatePayload.admin_notes;
      const retry = await supabaseAdmin
        .from('question_reports')
        .update(updatePayload)
        .eq('id', reportId);
      error = retry.error;
    }

    if (error) {
      console.error('[API Admin Reports] Erro ao atualizar status do reporte:', error);
      return NextResponse.json(
        { success: false, error: 'Falha ao atualizar status no banco de dados.' },
        { status: 500 }
      );
    }

    // Registra na trilha de auditoria
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 'unknown';
    await recordAuditEvent({
      userId: auth.user?.id || null,
      userEmail: auth.user?.email || (auth.isM2M ? 'm2m-service-role' : null),
      userRole: auth.role || 'admin',
      action: status === 'resolved' ? 'RESOLVE_REPORT' : 'UPDATE_REPORT_STATUS',
      entityType: 'question_report',
      entityId: reportId,
      newValues: { status, adminNotes },
      reason: `Alteração de status do reporte para [${status}]`,
      ipAddress: clientIp,
      userAgent: req.headers.get('user-agent')
    }).catch(() => {});

    return NextResponse.json({
      success: true,
      message: `Reporte atualizado com sucesso para "${status}".`
    });
  } catch (err) {
    console.error('[API Admin Reports] Erro inesperado ao atualizar status:', err);
    return NextResponse.json(
      { success: false, error: 'Erro interno ao atualizar denúncia.' },
      { status: 500 }
    );
  }
}
