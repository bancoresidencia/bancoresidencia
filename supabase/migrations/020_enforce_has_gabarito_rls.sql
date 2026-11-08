-- ==============================================================================
-- MIGRAÇÃO 020: BLINDAGEM RLS - ALUNOS VISUALIZAM APENAS QUESTÕES COM GABARITO HOMOLOGADO
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- 1. Garante que a coluna has_gabarito esteja indexada para alta performance
CREATE INDEX IF NOT EXISTS idx_questions_has_gabarito ON public.questions(has_gabarito);

-- 2. Atualiza política de leitura para que 'anon' e 'authenticated' (alunos)
-- só visualizem questões onde has_gabarito = true (ou perfil de curador/admin).
DROP POLICY IF EXISTS "Permitir leitura de questões públicas" ON public.questions;
DROP POLICY IF EXISTS "Permitir leitura de questões homologadas" ON public.questions;

CREATE POLICY "Permitir leitura de questões homologadas"
ON public.questions
FOR SELECT
TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());

COMMIT;
