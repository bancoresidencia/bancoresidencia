import {
  UserStudySchedule,
  UserScheduleItem,
  UserFocusProgress,
  ScheduleItemType,
  StudyScheduleSettings
} from '@/types/studySchedule';

export interface DbScheduleRow {
  id: string;
  user_id: string;
  title: string;
  target_exam?: string | null;
  target_exam_date?: string | null;
  start_date: string;
  weekly_study_days: number[];
  daily_focus_target: number;
  is_active: boolean;
  auto_revision_intervals: number[];
  settings?: Record<string, unknown>;
  created_at?: string;
  updated_at?: string;
}

export interface DbScheduleItemRow {
  id: string;
  schedule_id: string;
  user_id: string;
  especialidade: string;
  tema: string;
  foco: string;
  scheduled_date: string;
  item_type: ScheduleItemType;
  is_completed: boolean;
  completed_at?: string | null;
  order_index: number;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface DbFocusProgressRow {
  id: string;
  user_id: string;
  focus_key: string;
  especialidade: string;
  tema: string;
  foco: string;
  is_studied: boolean;
  first_studied_at?: string | null;
  review_count: number;
  last_reviewed_at?: string | null;
  next_review_date?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
}

export function toUserStudySchedule(row: DbScheduleRow): UserStudySchedule {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    targetExam: row.target_exam,
    targetExamDate: row.target_exam_date,
    startDate: row.start_date,
    weeklyStudyDays: row.weekly_study_days || [1, 2, 3, 4, 5],
    dailyFocusTarget: row.daily_focus_target || 2,
    isActive: row.is_active,
    autoRevisionIntervals: row.auto_revision_intervals || [1, 7, 30],
    settings: (row.settings as StudyScheduleSettings) || {},
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toUserScheduleItem(row: DbScheduleItemRow): UserScheduleItem {
  return {
    id: row.id,
    scheduleId: row.schedule_id,
    userId: row.user_id,
    especialidade: row.especialidade,
    tema: row.tema,
    foco: row.foco,
    scheduledDate: row.scheduled_date,
    itemType: row.item_type,
    isCompleted: Boolean(row.is_completed),
    completedAt: row.completed_at,
    orderIndex: row.order_index,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export function toUserFocusProgress(row: DbFocusProgressRow): UserFocusProgress {
  return {
    id: row.id,
    userId: row.user_id,
    focusKey: row.focus_key,
    especialidade: row.especialidade,
    tema: row.tema,
    foco: row.foco,
    isStudied: Boolean(row.is_studied),
    firstStudiedAt: row.first_studied_at,
    reviewCount: row.review_count || 0,
    lastReviewedAt: row.last_reviewed_at,
    nextReviewDate: row.next_review_date,
    notes: row.notes,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
