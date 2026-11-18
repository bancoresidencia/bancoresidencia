import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyStudentSession(req);

    // Se for visitante não logado
    if (!auth.authorized || !auth.user) {
      return NextResponse.json({
        success: true,
        authenticated: false,
        user: null,
        profile: null,
        dailySolvedCount: 0,
        bookmarks: [],
        folders: [],
        lists: [],
        answers: []
      });
    }

    const supabaseAdmin = getSupabaseAdmin();
    const userId = auth.user.id;
    const startOfDay = new Date();
    startOfDay.setUTCHours(0, 0, 0, 0);
    const startIso = startOfDay.toISOString();

    // 4. Executa agregação em paralelo no servidor (Fim do Waterfall)
    const [
      profileResult,
      dailyCountResult,
      bookmarksResult,
      foldersResult,
      listsResult,
      answersResult
    ] = await Promise.all([
      // Perfil e preferências
      supabaseAdmin
        .from('profiles')
        .select('role, subscription_plan, subscription_status, subscription_expires_at, preferences, target_exam_name, target_exam_date')
        .eq('id', userId)
        .maybeSingle(),

      // Cota diária do dia de hoje (UTC)
      supabaseAdmin
        .from('user_answers')
        .select('question_id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('answered_at', startIso),

      // Questões favoritadas (bookmarks)
      supabaseAdmin
        .from('user_bookmarks')
        .select('question_id')
        .eq('user_id', userId),

      // Pastas do aluno
      supabaseAdmin
        .from('user_folders')
        .select('id, user_id, name, parent_id, color, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),

      // Listas personalizadas
      supabaseAdmin
        .from('user_lists')
        .select('id, user_id, name, description, question_ids, folder_id, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),

      // Projeção cirúrgica de respostas (apenas colunas necessárias para boot rápido e métricas)
      supabaseAdmin
        .from('user_answers')
        .select('question_id, selected_option, is_correct, answered_at, specialty, tema, foco, subfoco, difficulty, banca, year, status_retrial')
        .eq('user_id', userId)
    ]);

    const profile = profileResult.data || null;
    const dailySolvedCount = dailyCountResult.count || 0;
    const bookmarks = (bookmarksResult.data || []).map((b) => b.question_id);
    const folders = foldersResult.data || [];
    const lists = (listsResult.data || []).map((l) => ({
      id: l.id,
      userId: l.user_id,
      name: l.name,
      description: l.description,
      questionIds: Array.isArray(l.question_ids) ? l.question_ids : [],
      folderId: l.folder_id,
      createdAt: l.created_at,
      updatedAt: l.updated_at
    }));
    const answers = answersResult.data || [];

    return NextResponse.json({
      success: true,
      authenticated: true,
      userId,
      profile,
      dailySolvedCount,
      bookmarks,
      folders,
      lists,
      answers
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Falha interna ao inicializar sessão.';
    console.error('[API Bootstrap] Erro:', err);
    return NextResponse.json(
      { success: false, error: errorMsg },
      { status: 500 }
    );
  }
}
