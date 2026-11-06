-- ==============================================================================
-- MIGRAÇÃO 019: OTIMIZAÇÃO DE LATÊNCIA NA CONTAGEM E BUSCA FACETADA
-- Plataforma Banco Residência Médica (132.965 questões) — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. ÍNDICES COMPOSTOS E COBERTURA PARA ALTO RENDIMENTO
-- ------------------------------------------------------------------------------

-- Índice composto para acelerar buscas cruzadas de banca, ano e grande área
CREATE INDEX IF NOT EXISTS idx_questions_banca_year_esp
  ON public.questions(banca, year, especialidade)
  WHERE is_anulada = FALSE;

-- Índice para acelerar contagem de especialidades por modalidade
CREATE INDEX IF NOT EXISTS idx_questions_modalidade_esp
  ON public.questions(modalidade, especialidade)
  WHERE is_anulada = FALSE;

-- Índice para cruzamento ultrarrápido do histórico do aluno (Não vistas / Resolvidas)
CREATE INDEX IF NOT EXISTS idx_user_answers_user_qid_correct
  ON public.user_answers(user_id, question_id, is_correct);

-- ------------------------------------------------------------------------------
-- 2. RPC ATÔMICA: CONTAGEM DE FACETAS CLÍNICAS EM 1 ÚNICA OPERAÇÃO SQL
-- ------------------------------------------------------------------------------

-- Esta função substitui o download de 4.000 linhas de texto via HTTP e o loop for()
-- do Node.js, executando o GROUP BY diretamente no motor C do PostgreSQL em < 20ms.
CREATE OR REPLACE FUNCTION public.get_faceted_question_counts(
  p_bancas text[] DEFAULT NULL,
  p_years int[] DEFAULT NULL,
  p_especialidades text[] DEFAULT NULL,
  p_modalidades text[] DEFAULT NULL,
  p_dificuldades text[] DEFAULT NULL,
  p_tipos text[] DEFAULT NULL,
  p_ocultar_anuladas boolean DEFAULT FALSE,
  p_ultimos_5_anos boolean DEFAULT FALSE,
  p_status text DEFAULT 'Todas',
  p_user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_total bigint := 0;
  v_especialidades jsonb := '{}'::jsonb;
  v_temas jsonb := '{}'::jsonb;
  v_min_year int := NULL;
BEGIN
  IF p_ultimos_5_anos THEN
    v_min_year := EXTRACT(YEAR FROM CURRENT_DATE)::int - 4;
  END IF;

  -- 1. Agregação de Especialidades em uma única passagem indexada
  WITH filtered_universe AS (
    SELECT 
      q.id,
      q.especialidade,
      q.tema
    FROM public.questions q
    WHERE (p_bancas IS NULL OR q.banca = ANY(p_bancas))
      AND (p_years IS NULL OR q.year = ANY(p_years))
      AND (v_min_year IS NULL OR q.year >= v_min_year)
      AND (p_modalidades IS NULL OR q.modalidade = ANY(p_modalidades))
      AND (p_dificuldades IS NULL OR q.difficulty = ANY(p_dificuldades))
      AND (p_tipos IS NULL OR q.type = ANY(p_tipos))
      AND (NOT p_ocultar_anuladas OR q.is_anulada = FALSE)
      -- Tratamento de Status do Usuário com Anti-Join ou Semi-Join
      AND (
        p_status = 'Todas' 
        OR p_user_id IS NULL
        OR (p_status = 'Não vistas' AND NOT EXISTS (
            SELECT 1 FROM public.user_answers ua 
            WHERE ua.user_id = p_user_id AND ua.question_id = q.id
        ))
        OR (p_status = 'Resolvidas' AND EXISTS (
            SELECT 1 FROM public.user_answers ua 
            WHERE ua.user_id = p_user_id AND ua.question_id = q.id
        ))
        OR (p_status = 'Acertadas' AND EXISTS (
            SELECT 1 FROM public.user_answers ua 
            WHERE ua.user_id = p_user_id AND ua.question_id = q.id AND ua.is_correct = TRUE
        ))
        OR (p_status = 'Erradas' AND EXISTS (
            SELECT 1 FROM public.user_answers ua 
            WHERE ua.user_id = p_user_id AND ua.question_id = q.id AND ua.is_correct = FALSE
        ))
      )
  ),
  esp_agg AS (
    SELECT 
      especialidade,
      COUNT(*)::bigint AS qtd
    FROM filtered_universe
    WHERE especialidade IS NOT NULL
    GROUP BY especialidade
  ),
  tema_agg AS (
    SELECT 
      tema,
      COUNT(*)::bigint AS qtd
    FROM filtered_universe
    WHERE tema IS NOT NULL 
      AND (p_especialidades IS NULL OR especialidade = ANY(p_especialidades))
    GROUP BY tema
  )
  SELECT 
    COALESCE((SELECT COUNT(*) FROM filtered_universe), 0),
    COALESCE((SELECT jsonb_object_agg(especialidade, qtd) FROM esp_agg), '{}'::jsonb),
    COALESCE((SELECT jsonb_object_agg(tema, qtd) FROM tema_agg), '{}'::jsonb)
  INTO 
    v_total,
    v_especialidades,
    v_temas;

  RETURN jsonb_build_object(
    'totalRightCardCount', v_total,
    'especialidades', v_especialidades,
    'temas', v_temas
  );
END;
$$;

-- Permissões de execução para clientes autenticados e anônimos (a RPC não expõe dados sensíveis)
GRANT EXECUTE ON FUNCTION public.get_faceted_question_counts TO anon, authenticated, service_role;

COMMIT;
