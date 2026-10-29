-- ==============================================================================
-- BANCO RESIDÊNCIA — MIGRATION 010: CORREÇÃO DO CONSTRAINT DE STATUS E RLS
-- Garante que o constraint de status aceita 'in_review' (mapeado de 'in_progress'
-- na UI) e que as policies RLS cobrem todas as roles admin válidas.
--
-- Execute no SQL Editor do Supabase:
-- https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- 1. Remove o constraint antigo de status (pode ter 'in_progress' ou estar ausente)
ALTER TABLE public.question_reports
  DROP CONSTRAINT IF EXISTS question_reports_status_check;

-- 2. Recria com o conjunto correto de valores (UI usa 'in_progress', banco usa 'in_review')
ALTER TABLE public.question_reports
  ADD CONSTRAINT question_reports_status_check
  CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed'));

-- 3. Corrige registros antigos que possam ter sido gravados com 'in_progress'
UPDATE public.question_reports
  SET status = 'in_review'
  WHERE status = 'in_progress';

-- 4. Garante que a coluna admin_notes existe (idempotente)
ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS admin_notes TEXT;
ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS user_name TEXT;
ALTER TABLE public.question_reports ADD COLUMN IF NOT EXISTS user_email TEXT;

-- 5. Recria policies RLS cobrindo todas as roles privilegiadas
--    (admin, curador, curator, superadmin)

-- Leitura
DROP POLICY IF EXISTS "Admins e curadores podem ler denúncias" ON public.question_reports;
CREATE POLICY "Admins e curadores podem ler denúncias"
  ON public.question_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND lower(profiles.role) IN ('admin', 'curador', 'curator', 'superadmin')
    )
    OR lower((auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'curador', 'curator', 'superadmin')
  );

-- Atualização
DROP POLICY IF EXISTS "Admins e curadores podem atualizar denúncias" ON public.question_reports;
CREATE POLICY "Admins e curadores podem atualizar denúncias"
  ON public.question_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND lower(profiles.role) IN ('admin', 'curador', 'curator', 'superadmin')
    )
    OR lower((auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'curador', 'curator', 'superadmin')
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND lower(profiles.role) IN ('admin', 'curador', 'curator', 'superadmin')
    )
    OR lower((auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'curador', 'curator', 'superadmin')
  );

-- Exclusão
DROP POLICY IF EXISTS "Admins podem excluir denúncias" ON public.question_reports;
CREATE POLICY "Admins podem excluir denúncias"
  ON public.question_reports
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND lower(profiles.role) IN ('admin', 'curador', 'curator', 'superadmin')
    )
    OR lower((auth.jwt() -> 'app_metadata' ->> 'role')) IN ('admin', 'curador', 'curator', 'superadmin')
  );

-- 6. Índices de performance (idempotentes)
CREATE INDEX IF NOT EXISTS idx_question_reports_status        ON public.question_reports(status);
CREATE INDEX IF NOT EXISTS idx_question_reports_question_id   ON public.question_reports(question_id);
CREATE INDEX IF NOT EXISTS idx_question_reports_created_at    ON public.question_reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_question_reports_status_cat    ON public.question_reports(status, created_at DESC);

COMMIT;

