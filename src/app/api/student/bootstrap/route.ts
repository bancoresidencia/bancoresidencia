import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/adminClient';
import { verifyStudentSession } from '@/lib/supabase/studentAuth';
import { MOCK_LIST_IDS } from '@/services/userListsService';

export const dynamic = 'force-dynamic';

const ANSWERS_PAGE_SIZE = 1000;
const MAX_ANSWERS_PAGES = 50;
const ANSWERS_SELECT_COLUMNS =
  'question_id, selected_option, is_correct, answered_at, specialty, tema, foco, subfoco, difficulty, banca, year, status_retrial, error_reason, student_notes, attempts';

const MOCK_FOLDER_IDS = new Set([
  'f-clinica',
  'f-cardio',
  'f-coronariana',
  'f-cirurgia',
  'f-abdome',
  'f-apendicite',
  'f-pediatria',
  'f-go',
  'f-preventiva'
]);

async function fetchAllUserAnswersForBootstrap(
  supabaseAdmin: ReturnType<typeof getSupabaseAdmin>,
  userId: string
): Promise<Record<string, unknown>[] | null> {
  const allRows: Record<string, unknown>[] = [];
  let page = 0;

  while (page < MAX_ANSWERS_PAGES) {
    const from = page * ANSWERS_PAGE_SIZE;
    const { data, error } = await supabaseAdmin
      .from('user_answers')
      .select(ANSWERS_SELECT_COLUMNS)
      .eq('user_id', userId)
      .order('answered_at', { ascending: true })
      .range(from, from + ANSWERS_PAGE_SIZE - 1);

    if (error) {
      return page === 0 ? null : allRows;
    }
    if (!data || data.length === 0) break;
    allRows.push(...(data as Record<string, unknown>[]));
    if (data.length < ANSWERS_PAGE_SIZE) break;
    page += 1;
  }

  return allRows;
}

export async function GET(req: NextRequest) {
  try {
    const auth = await verifyStudentSession(req);

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

    const [
      profileResult,
      dailyCountResult,
      bookmarksResult,
      foldersResult,
      listsResult,
      answers
    ] = await Promise.all([
      supabaseAdmin
        .from('profiles')
        .select(
          'role, daily_goal, subscription_plan, subscription_status, subscription_expires_at, preferences, target_exam_name, target_exam_date, google_calendar_connected, google_calendar_email, google_calendar_last_sync'
        )
        .eq('id', userId)
        .maybeSingle(),

      supabaseAdmin
        .from('user_answers')
        .select('question_id', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('answered_at', startIso),

      supabaseAdmin
        .from('user_bookmarks')
        .select('question_id')
        .eq('user_id', userId)
        .range(0, 4999),

      supabaseAdmin
        .from('user_folders')
        .select('id, user_id, name, parent_id, color, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: true }),

      supabaseAdmin
        .from('user_lists')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false }),

      fetchAllUserAnswersForBootstrap(supabaseAdmin, userId)
    ]);

    const profile = profileResult.data || null;
    const dailySolvedCount = dailyCountResult.count || 0;

    const bookmarks = bookmarksResult.error
      ? null
      : (bookmarksResult.data || []).map((b) => b.question_id);

    const folders = foldersResult.error
      ? null
      : (foldersResult.data || [])
        .filter((f) => !MOCK_FOLDER_IDS.has(f.id))
        .map((f) => ({
          id: f.id,
          userId: f.user_id,
          name: f.name,
          parentId: f.parent_id || null,
          color: f.color || '#3b82f6',
          createdAt: f.created_at,
          updatedAt: f.updated_at
        }));

    const rawLists = (listsResult.data || []) as Array<Record<string, unknown>>;
    const lists = listsResult.error
      ? null
      : rawLists
        .filter((l) => typeof l.id === 'string' && !MOCK_LIST_IDS.has(l.id))
        .map((l) => {
          const qIds = Array.isArray(l.question_ids) ? (l.question_ids as string[]) : [];
          return {
            id: String(l.id),
            userId: typeof l.user_id === 'string' ? l.user_id : userId,
            folderId: typeof l.folder_id === 'string' ? l.folder_id : undefined,
            title: typeof l.title === 'string' ? l.title : 'Lista de Questões',
            questionIds: qIds,
            totalQuestions:
              typeof l.total_questions === 'number' && l.total_questions > 0
                ? l.total_questions
                : qIds.length,
            completedQuestions:
              typeof l.completed_questions === 'number' ? l.completed_questions : 0,
            lastStudiedAt:
              typeof l.last_studied_at === 'string' && l.last_studied_at
                ? l.last_studied_at
                : 'Nunca estudada',
            inProgress: Boolean(l.in_progress),
            progressPercentage:
              typeof l.progress_percentage === 'number' ? l.progress_percentage : 0,
            filters:
              l.filters && typeof l.filters === 'object' && !Array.isArray(l.filters)
                ? l.filters
                : undefined,
            createdAt: typeof l.created_at === 'string' ? l.created_at : undefined,
            updatedAt: typeof l.updated_at === 'string' ? l.updated_at : undefined
          };
        });

    return NextResponse.json({
      success: true,
      authenticated: true,
      userId,
      profile,
      dailySolvedCount,
      bookmarks,
      folders,
      lists,
      listsLoadedOk: !listsResult.error,
      foldersLoadedOk: !foldersResult.error,
      answers
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Falha interna ao inicializar sessão.';
    console.error('[API Bootstrap] Erro:', err);
    return NextResponse.json({ success: false, error: errorMsg }, { status: 500 });
  }
}
