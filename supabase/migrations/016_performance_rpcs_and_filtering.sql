-- ==============================================================================
-- MIGRAÇÃO 016: RPCS DE ALTO RENDIMENTO, FILTRAGEM NATIVA E FIM DO SLICE 150
-- Plataforma Banco Residência Médica (132.965 questões) — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. ÍNDICES COMPOSTOS DE ALTA PERFORMANCE
-- ------------------------------------------------------------------------------

-- Acelera buscas de respostas do aluno por status de acerto e IDs
CREATE INDEX IF NOT EXISTS idx_user_answers_user_correct_qid
  ON public.user_answers(user_id, is_correct, question_id);

-- Acelera paginação padrão ordenada por ano e ID
CREATE INDEX IF NOT EXISTS idx_questions_year_id_desc
  ON public.questions(year DESC, id ASC);

-- ------------------------------------------------------------------------------
-- 2. RPC: BUSCA DE IDS DE QUESTÕES RESOLVIDAS / NÃO VISTAS POR ALUNO
-- ------------------------------------------------------------------------------

-- Retorna os IDs das questões que o aluno AINDA NÃO RESOLVEU (Não vistas),
-- permitindo paginação 100% nativa em SQL sem limite de URL ou corte de 120/150
CREATE OR REPLACE FUNCTION get_unseen_question_ids(
  p_user_id UUID,
  p_especialidade TEXT DEFAULT NULL,
  p_banca TEXT DEFAULT NULL,
  p_year INT DEFAULT NULL,
  p_limit INT DEFAULT 50,
  p_offset INT DEFAULT 0
)
RETURNS TABLE (
  question_id UUID,
  total_unseen BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total BIGINT;
BEGIN
  -- Contagem total de não vistas respeitando filtros
  SELECT COUNT(*)
  INTO v_total
  FROM questions q
  WHERE NOT EXISTS (
    SELECT 1 FROM user_answers ua
    WHERE ua.question_id = q.id
      AND ua.user_id = p_user_id
  )
  AND (p_especialidade IS NULL OR q.especialidade = p_especialidade)
  AND (p_banca IS NULL OR q.banca = p_banca)
  AND (p_year IS NULL OR q.year = p_year);

  RETURN QUERY
  SELECT q.id AS question_id, v_total AS total_unseen
  FROM questions q
  WHERE NOT EXISTS (
    SELECT 1 FROM user_answers ua
    WHERE ua.question_id = q.id
      AND ua.user_id = p_user_id
  )
  AND (p_especialidade IS NULL OR q.especialidade = p_especialidade)
  AND (p_banca IS NULL OR q.banca = p_banca)
  AND (p_year IS NULL OR q.year = p_year)
  ORDER BY q.year DESC, q.id ASC
  LIMIT p_limit
  OFFSET p_offset;
END;
$$;

-- ------------------------------------------------------------------------------
-- 3. RPC: CONTAGEM DE FACETS DE ESPECIALIDADES EM 1 ÚNICA VARREDURA
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION get_specialty_facets(
  p_banca TEXT DEFAULT NULL,
  p_year INT DEFAULT NULL,
  p_modalidade TEXT DEFAULT NULL
)
RETURNS TABLE (
  especialidade TEXT,
  total_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT
    q.especialidade,
    COUNT(*)::BIGINT AS total_count
  FROM questions q
  WHERE (p_banca IS NULL OR q.banca = p_banca)
    AND (p_year IS NULL OR q.year = p_year)
    AND (p_modalidade IS NULL OR q.modalidade = p_modalidade)
    AND q.especialidade IS NOT NULL
  GROUP BY q.especialidade
  ORDER BY total_count DESC;
END;
$$;

COMMIT;
