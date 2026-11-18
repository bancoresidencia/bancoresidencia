import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { SelectedTaxonomy, StudyType } from '@/types/studyTimer';

export const dynamic = 'force-dynamic';

export interface PersistedTimerRuntimeState {
  userId: string;
  status: 'running' | 'paused';
  accumulatedSeconds: number;
  runningSince: number | null;
  sessionStartTime: string;
  selectedTaxonomy: SelectedTaxonomy;
  studyType: StudyType;
  sessionSource: 'manual' | 'questoes' | 'simulado' | 'flashcards';
  questionsCount: number;
  correctCount: number;
  incorrectCount: number;
  updatedAtMs: number;
}

interface FinishedSessionPayload {
  id: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  taxonomy: SelectedTaxonomy;
  studyType: StudyType;
  questionsCount?: number;
  correctCount?: number;
  incorrectCount?: number;
  accuracy?: number;
  sessionSource?: 'manual' | 'questoes' | 'simulado' | 'flashcards';
  notes?: string;
  createdAt?: string;
}

interface ScheduledTaskPayload {
  id: string;
  title: string;
  category: string;
  date: string;
  startTime: string;
  endTime: string;
  startMinutes: number;
  endMinutes: number;
  source: 'plataforma' | 'google';
  description?: string;
  isCalendarTask?: boolean;
  isCompleted?: boolean;
}

interface TimerStatePostBody {
  dateStr?: string;
  activeSeconds?: number;
  activeTimerState?: PersistedTimerRuntimeState | null;
  finishedSession?: FinishedSessionPayload;
  scheduledTask?: ScheduledTaskPayload;
}

function pruneDailyActiveMap(
  map: Record<string, number>,
  maxDays = 14
): Record<string, number> {
  const validEntries = Object.entries(map).filter(
    ([date, secs]) => /^\d{4}-\d{2}-\d{2}$/.test(date) && typeof secs === 'number' && !isNaN(secs) && secs >= 0
  );
  validEntries.sort(([a], [b]) => b.localeCompare(a));
  return Object.fromEntries(validEntries.slice(0, maxDays));
}

export async function GET() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { success: false, authenticated: false },
        { status: 401 }
      );
    }

    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('preferences')
      .eq('id', user.id)
      .maybeSingle();

    if (profileErr) {
      return NextResponse.json(
        { success: false, error: profileErr.message },
        { status: 500 }
      );
    }

    const prefs =
      profile?.preferences && typeof profile.preferences === 'object' && !Array.isArray(profile.preferences)
        ? (profile.preferences as Record<string, unknown>)
        : {};

    const rawDaily =
      prefs.dailyActiveSecondsByDate &&
      typeof prefs.dailyActiveSecondsByDate === 'object' &&
      !Array.isArray(prefs.dailyActiveSecondsByDate)
        ? (prefs.dailyActiveSecondsByDate as Record<string, number>)
        : {};

    const rawTimer =
      prefs.activeTimerState &&
      typeof prefs.activeTimerState === 'object' &&
      !Array.isArray(prefs.activeTimerState)
        ? (prefs.activeTimerState as PersistedTimerRuntimeState)
        : null;

    const validTimer =
      rawTimer && rawTimer.userId === user.id && (rawTimer.status === 'running' || rawTimer.status === 'paused')
        ? rawTimer
        : null;

    return NextResponse.json({
      success: true,
      authenticated: true,
      dailyActiveSecondsByDate: pruneDailyActiveMap(rawDaily),
      activeTimerState: validTimer
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno ao consultar estado do relógio.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authErr
    } = await supabase.auth.getUser();

    if (authErr || !user) {
      return NextResponse.json(
        { success: false, error: 'Sessão não autenticada.' },
        { status: 401 }
      );
    }

    const body = (await req.json()) as TimerStatePostBody;
    const hasDailyUpdate =
      typeof body.dateStr === 'string' &&
      /^\d{4}-\d{2}-\d{2}$/.test(body.dateStr) &&
      typeof body.activeSeconds === 'number' &&
      !isNaN(body.activeSeconds) &&
      body.activeSeconds >= 0;

    const hasTimerUpdate = 'activeTimerState' in body;

    // 1. Atualiza preferências de tempo ativo diário e/ou estado do cronômetro em andamento
    if (hasDailyUpdate || hasTimerUpdate) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('preferences')
        .eq('id', user.id)
        .maybeSingle();

      const currentPrefs =
        profile?.preferences && typeof profile.preferences === 'object' && !Array.isArray(profile.preferences)
          ? { ...(profile.preferences as Record<string, unknown>) }
          : {};

      if (hasDailyUpdate && body.dateStr && typeof body.activeSeconds === 'number') {
        const currentDaily =
          currentPrefs.dailyActiveSecondsByDate &&
          typeof currentPrefs.dailyActiveSecondsByDate === 'object' &&
          !Array.isArray(currentPrefs.dailyActiveSecondsByDate)
            ? { ...(currentPrefs.dailyActiveSecondsByDate as Record<string, number>) }
            : {};

        const safeSecs = Math.min(86400, Math.max(0, Math.floor(body.activeSeconds)));
        const prevSecs = typeof currentDaily[body.dateStr] === 'number' ? currentDaily[body.dateStr] : 0;
        currentDaily[body.dateStr] = Math.max(prevSecs, safeSecs);
        currentPrefs.dailyActiveSecondsByDate = pruneDailyActiveMap(currentDaily);
      }

      if (hasTimerUpdate) {
        if (body.activeTimerState === null) {
          currentPrefs.activeTimerState = null;
        } else if (
          body.activeTimerState &&
          (body.activeTimerState.status === 'running' || body.activeTimerState.status === 'paused')
        ) {
          currentPrefs.activeTimerState = {
            ...body.activeTimerState,
            userId: user.id,
            updatedAtMs: body.activeTimerState.updatedAtMs || Date.now()
          };
        }
      }

      const { error: updateErr } = await supabase
        .from('profiles')
        .update({ preferences: currentPrefs })
        .eq('id', user.id);

      if (updateErr) {
        return NextResponse.json({ success: false, error: updateErr.message }, { status: 500 });
      }
    }

    // 2. Persistência resiliente (keepalive) de sessão finalizada se enviada junto ao fechamento
    if (body.finishedSession && body.finishedSession.id) {
      const s = body.finishedSession;
      const { error: sessErr } = await supabase.from('user_study_sessions').upsert(
        {
          id: s.id,
          user_id: user.id,
          start_time: s.startTime,
          end_time: s.endTime,
          duration_seconds: Math.max(0, Math.floor(s.durationSeconds || 0)),
          taxonomy: s.taxonomy || {},
          study_type: s.studyType || 'questoes',
          questions_count: s.questionsCount || 0,
          correct_count: s.correctCount || 0,
          incorrect_count: s.incorrectCount || 0,
          accuracy: s.accuracy ?? null,
          session_source: s.sessionSource || 'manual',
          notes: s.notes || null,
          created_at: s.createdAt || new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );

      if (sessErr) {
        return NextResponse.json({ success: false, error: sessErr.message }, { status: 500 });
      }
    }

    // 3. Persistência resiliente da tarefa correspondente na agenda
    if (body.scheduledTask && body.scheduledTask.id) {
      const t = body.scheduledTask;
      await supabase.from('user_scheduled_tasks').upsert(
        {
          id: t.id,
          user_id: user.id,
          title: t.title,
          category: t.category || 'estudo',
          date: t.date,
          start_time: t.startTime,
          end_time: t.endTime,
          start_minutes: t.startMinutes,
          end_minutes: t.endMinutes,
          source: t.source || 'plataforma',
          description: t.description || '',
          is_calendar_task: t.isCalendarTask ?? true,
          is_completed: Boolean(t.isCompleted),
          updated_at: new Date().toISOString()
        },
        { onConflict: 'id' }
      );
    }

    return NextResponse.json({ success: true });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno ao sincronizar estado do relógio.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
