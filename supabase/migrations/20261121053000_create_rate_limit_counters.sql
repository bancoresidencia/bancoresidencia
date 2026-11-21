-- =============================================================================
-- Migração: Tabela de Rate Limiting Persistente (Serverless-safe)
-- Resolve C-1: rate limiters in-memory não funcionam em Vercel Serverless
-- porque cada instância tem memória isolada. Esta tabela substitui os Maps
-- locais e garante estado compartilhado entre todas as instâncias.
-- =============================================================================

CREATE TABLE IF NOT EXISTS public.rate_limit_counters (
  -- Identificador único: "prefix:key", ex: "ai_user:uuid" ou "solve_ip:1.2.3.4"
  id            text        NOT NULL,
  -- Contador de requisições na janela atual
  count         integer     NOT NULL DEFAULT 1,
  -- Fim da janela de rate limiting (Unix epoch em segundos)
  reset_at      bigint      NOT NULL,
  -- Timestamp de última atualização (para limpeza)
  updated_at    timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT rate_limit_counters_pkey PRIMARY KEY (id)
);

-- Índice para limpeza eficiente de registros expirados
CREATE INDEX IF NOT EXISTS rate_limit_counters_reset_at_idx
  ON public.rate_limit_counters (reset_at);

-- RLS: apenas service role pode ler/escrever (nunca exposto ao cliente)
ALTER TABLE public.rate_limit_counters ENABLE ROW LEVEL SECURITY;

-- Nenhuma policy pública — acesso exclusivo via adminClient (service role)
-- (service role ignora RLS por design do Supabase)

-- Função atômica de incremento com sliding-window
-- Retorna o count APÓS incremento. Se reset_at expirou, reinicia o contador.
CREATE OR REPLACE FUNCTION public.rate_limit_increment(
  p_id        text,
  p_window_s  integer  -- duração da janela em segundos
)
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now     bigint := extract(epoch from now())::bigint;
  v_reset   bigint := v_now + p_window_s;
  v_count   integer;
BEGIN
  INSERT INTO public.rate_limit_counters (id, count, reset_at, updated_at)
    VALUES (p_id, 1, v_reset, now())
  ON CONFLICT (id) DO UPDATE
    SET
      count      = CASE
                     WHEN rate_limit_counters.reset_at <= v_now
                     THEN 1               -- janela expirou: reinicia
                     ELSE rate_limit_counters.count + 1
                   END,
      reset_at   = CASE
                     WHEN rate_limit_counters.reset_at <= v_now
                     THEN v_reset         -- nova janela
                     ELSE rate_limit_counters.reset_at
                   END,
      updated_at = now()
  RETURNING count INTO v_count;

  RETURN v_count;
END;
$$;

-- Limpeza programada: remove registros expirados há mais de 1 hora
-- (chamada periodicamente pelo job de manutenção ou manualmente)
CREATE OR REPLACE FUNCTION public.rate_limit_cleanup()
RETURNS integer
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deleted integer;
BEGIN
  DELETE FROM public.rate_limit_counters
  WHERE reset_at < extract(epoch from now())::bigint - 3600;
  GET DIAGNOSTICS v_deleted = ROW_COUNT;
  RETURN v_deleted;
END;
$$;

COMMENT ON TABLE public.rate_limit_counters IS
  'Rate limiting persistente compartilhado entre instâncias serverless. Substitui Maps in-memory que se reiniciam a cada cold start.';

COMMENT ON FUNCTION public.rate_limit_increment IS
  'Incrementa atomicamente o contador de rate limit para o identificador dado. Reinicia automaticamente quando a janela expira. Retorna o count pós-incremento.';
