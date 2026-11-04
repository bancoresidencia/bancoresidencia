-- ==============================================================================
-- BANCO RESIDÊNCIA — MIGRAÇÃO 007: PERMISSÃO AUTHENTICATED & COLUNA HAS_GABARITO
-- Execute este script no SQL Editor do Supabase:
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- 1. Garante permissão de leitura das 18 colunas seguras para alunos autenticados (logados)
GRANT SELECT (
  id,
  code,
  institution,
  banca,
  year,
  tipo_prova,
  modalidade,
  especialidade,
  tema,
  foco,
  subfoco,
  difficulty,
  type,
  is_anulada,
  statement,
  options,
  images,
  created_at
) ON public.questions TO authenticated;

-- 2. Cria coluna virtual booleana has_gabarito
-- Permite que o front-end filtre por "questões com gabarito" com máxima performance (índice B-Tree)
-- sem nunca expor a coluna sensível 'correct_answer' aos scrapers.
ALTER TABLE public.questions 
ADD COLUMN IF NOT EXISTS has_gabarito BOOLEAN 
GENERATED ALWAYS AS (correct_answer IS NOT NULL AND correct_answer != '' OR is_anulada = true) STORED;

CREATE INDEX IF NOT EXISTS idx_questions_has_gabarito ON public.questions(has_gabarito);

-- Concede SELECT apenas na flag booleana
GRANT SELECT (has_gabarito) ON public.questions TO anon, authenticated;

COMMIT;
