-- ==============================================================================
-- BANCO RESIDÊNCIA — FUNÇÃO ATÔMICA DE ATUALIZAÇÃO TAXONÔMICA EM LOTE
--
-- Execute este script no SQL Editor do Supabase:
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.batch_update_taxonomy(p_rows jsonb)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET statement_timeout = '30s'
AS $$
DECLARE
  v_updated integer := 0;
BEGIN
  UPDATE public.questions q
  SET
    tema = r.tema,
    foco = r.foco,
    subfoco = r.subfoco
  FROM jsonb_to_recordset(p_rows) AS r(
    id text,
    tema text,
    foco text,
    subfoco text
  )
  WHERE q.id = r.id;

  GET DIAGNOSTICS v_updated = ROW_COUNT;
  RETURN v_updated;
END;
$$;

GRANT EXECUTE ON FUNCTION public.batch_update_taxonomy TO service_role;
