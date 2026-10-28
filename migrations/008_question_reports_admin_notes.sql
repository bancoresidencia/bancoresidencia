-- ============================================================
-- Migration 008: Question Reports Improvements
-- Adiciona colunas para anotações do administrador e metadados
-- ============================================================

ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS user_email TEXT;

-- Atualizar índices para busca e ordenação rápida
CREATE INDEX IF NOT EXISTS idx_question_reports_created_at ON public.question_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_reports_status_created_at ON public.question_reports(status, created_at DESC);
