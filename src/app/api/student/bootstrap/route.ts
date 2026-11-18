import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';

export const dynamic = 'force-dynamic';

const ANSWERS_PAGE_SIZE = 1000;
const MAX_ANSWERS_PAGES = 50; // Suporta até 50.000 questões resolvidas por aluno sem truncamento
const ANSWERS_SELECT_COLUMNS =
  'question_id, selected_option, is_correct, answered_at, specialty, tema, foco, subfoco, difficulty, banca, year, status_retrial, error_reason, student_notes, attempts';

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

    // Executa agregação em paralelo no servidor (Fim do Waterfall)
    const [
      profileResult,
      dailyCountResult,
      bookmarksResult,
      foldersResult,
      listsResult,
      firstAnswersPage
    ] = await Promise.all([
      // Perfil, metas e preferências
      supabaseAdmin
        .from('profiles')
        .select(
          'role, subscription_plan, subscription_status, subscription_expires_at, preferences, target_exam_name, target_exam_date, daily_goal'
        )
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
        .eq('user_id', userId)
        .range(0, 4999),

      // Pastas do aluno (colunas canônicas)
      supabaseAdmin
        .from('user_folders')
        .select('id, user_id, name, parent_id, color, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),

      // Listas personalizadas (schema real de public.user_lists)
      supabaseAdmin
        .from('user_lists')
        .select(
          'id, user_id, folder_id, title, question_ids, total_questions, completed_questions, last_studied_at, in_progress, progress_percentage, created_at, updated_at'
        )
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      // Primeira página de respostas completas (inclui error_reason, student_notes e attempts)
      supabaseAdmin
        .from('user_answers')
        .select(ANSWERS_SELECT_COLUMNS)
        .eq('user_id', userId)
        .order('answered_at', { ascending: true })
        .range(0, ANSWERS_PAGE_SIZE - 1)
    ]);

    const profile = profileResult.data || null;
    const dailySolvedCount = dailyCountResult.count || 0;

    // Se houver erro de consulta em alguma tabela, retorna null para evitar sobrescrever o cache local
    const bookmarks = bookmarksResult.error
      ? null
      : (bookmarksResult.data || []).map((b) => b.question_id);

    const folders = foldersResult.error
      ? null
      : (foldersResult.data || []).map((f) => ({
          id: f.id,
          userId: f.user_id,
          name: f.name,
          parentId: f.parent_id || null,
          color: f.color || '#3b82f6',
          createdAt: f.created_at,
          updatedAt: f.updated_at
        }));

    const lists = listsResult.error
      ? null
      : (listsResult.data || []).map((l) => {
          const qIds = Array.isArray(l.question_ids) ? l.question_ids : [];
          return {
            id: l.id,
            userId: l.user_id,
            folderId: l.folder_id || undefined,
            title: l.title,
            questionIds: qIds,
            totalQuestions: l.total_questions || qIds.length,
            completedQuestions: l.completed_questions || 0,
            lastStudiedAt: l.last_studied_at || 'Nunca estudada',
            inProgress: Boolean(l.in_progress),
            progressPercentage: l.progress_percentage || 0,
            createdAt: l.created_at,
            updatedAt: l.updated_at
          };
        });

    let answers: typeof firstAnswersPage.data = null;
    if (!firstAnswersPage.error && firstAnswersPage.data) {
      const allAnswers = [...firstAnswersPage.data];
      let page = 1;
      let lastBatchLength = firstAnswersPage.data.length;

      // Paginação automática além de 1.000 respostas para preservar 100% do histórico entre dispositivos
      while (lastBatchLength === ANSWERS_PAGE_SIZE && page < MAX_ANSWERS_PAGES) {
        const from = page * ANSWERS_PAGE_SIZE;
        const to = from + ANSWERS_PAGE_SIZE - 1;
        const { data: nextBatch, error: nextErr } = await supabaseAdmin
          .from('user_answers')
          .select(ANSWERS_SELECT_COLUMNS)
          .eq('user_id', userId)
          .order('answered_at', { ascending: true })
          .range(from, to);

        if (nextErr || !nextBatch || nextBatch.length === 0) {
          break;
        }
        allAnswers.push(...nextBatch);
        lastBatchLength = nextBatch.length;
        page += 1;
      }
      answers = allAnswers;
    }

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
