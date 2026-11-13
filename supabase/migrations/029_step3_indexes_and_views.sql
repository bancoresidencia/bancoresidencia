-- ==============================================================================
-- ETAPA 3 (FINALIZAÇÃO): CRIAÇÃO DOS ÍNDICES PARALELOS E VIEWS UNIFICADAS
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL SQL Editor: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
--
-- Executar APÓS a conclusão da carga dos dados via Node.js (Opção B)
-- Duração estimada: ~10 a 15 segundos
-- ==============================================================================

BEGIN;

-- 1. Índices: questions_direto
CREATE INDEX IF NOT EXISTS idx_qdireto_esp_year ON public.questions_direto(especialidade, year);
CREATE INDEX IF NOT EXISTS idx_qdireto_esp_tema ON public.questions_direto(especialidade, tema);
CREATE INDEX IF NOT EXISTS idx_qdireto_banca_year ON public.questions_direto(banca, year);
CREATE INDEX IF NOT EXISTS idx_qdireto_institution ON public.questions_direto(institution);
CREATE INDEX IF NOT EXISTS idx_qdireto_difficulty ON public.questions_direto(difficulty);
CREATE INDEX IF NOT EXISTS idx_qdireto_type ON public.questions_direto(type);
CREATE INDEX IF NOT EXISTS idx_qdireto_modalidade ON public.questions_direto(modalidade);
CREATE INDEX IF NOT EXISTS idx_qdireto_correct_answer ON public.questions_direto(correct_answer);
CREATE INDEX IF NOT EXISTS idx_qdireto_is_anulada ON public.questions_direto(is_anulada);
CREATE INDEX IF NOT EXISTS idx_qdireto_has_gabarito ON public.questions_direto(has_gabarito);
CREATE INDEX IF NOT EXISTS idx_qdireto_tema ON public.questions_direto(tema);
CREATE INDEX IF NOT EXISTS idx_qdireto_foco ON public.questions_direto(foco);
CREATE INDEX IF NOT EXISTS idx_qdireto_subfoco ON public.questions_direto(subfoco);

-- 2. Índices: questions_rplus
CREATE INDEX IF NOT EXISTS idx_qrplus_esp_year ON public.questions_rplus(especialidade, year);
CREATE INDEX IF NOT EXISTS idx_qrplus_esp_tema ON public.questions_rplus(especialidade, tema);
CREATE INDEX IF NOT EXISTS idx_qrplus_banca_year ON public.questions_rplus(banca, year);
CREATE INDEX IF NOT EXISTS idx_qrplus_institution ON public.questions_rplus(institution);
CREATE INDEX IF NOT EXISTS idx_qrplus_difficulty ON public.questions_rplus(difficulty);
CREATE INDEX IF NOT EXISTS idx_qrplus_type ON public.questions_rplus(type);
CREATE INDEX IF NOT EXISTS idx_qrplus_modalidade ON public.questions_rplus(modalidade);
CREATE INDEX IF NOT EXISTS idx_qrplus_correct_answer ON public.questions_rplus(correct_answer);
CREATE INDEX IF NOT EXISTS idx_qrplus_is_anulada ON public.questions_rplus(is_anulada);
CREATE INDEX IF NOT EXISTS idx_qrplus_has_gabarito ON public.questions_rplus(has_gabarito);
CREATE INDEX IF NOT EXISTS idx_qrplus_tema ON public.questions_rplus(tema);
CREATE INDEX IF NOT EXISTS idx_qrplus_foco ON public.questions_rplus(foco);
CREATE INDEX IF NOT EXISTS idx_qrplus_subfoco ON public.questions_rplus(subfoco);

-- 3. Índices: questions_revalida
CREATE INDEX IF NOT EXISTS idx_qrevalida_esp_year ON public.questions_revalida(especialidade, year);
CREATE INDEX IF NOT EXISTS idx_qrevalida_esp_tema ON public.questions_revalida(especialidade, tema);
CREATE INDEX IF NOT EXISTS idx_qrevalida_banca_year ON public.questions_revalida(banca, year);
CREATE INDEX IF NOT EXISTS idx_qrevalida_institution ON public.questions_revalida(institution);
CREATE INDEX IF NOT EXISTS idx_qrevalida_difficulty ON public.questions_revalida(difficulty);
CREATE INDEX IF NOT EXISTS idx_qrevalida_type ON public.questions_revalida(type);
CREATE INDEX IF NOT EXISTS idx_qrevalida_modalidade ON public.questions_revalida(modalidade);
CREATE INDEX IF NOT EXISTS idx_qrevalida_correct_answer ON public.questions_revalida(correct_answer);
CREATE INDEX IF NOT EXISTS idx_qrevalida_is_anulada ON public.questions_revalida(is_anulada);
CREATE INDEX IF NOT EXISTS idx_qrevalida_has_gabarito ON public.questions_revalida(has_gabarito);
CREATE INDEX IF NOT EXISTS idx_qrevalida_tema ON public.questions_revalida(tema);
CREATE INDEX IF NOT EXISTS idx_qrevalida_foco ON public.questions_revalida(foco);
CREATE INDEX IF NOT EXISTS idx_qrevalida_subfoco ON public.questions_revalida(subfoco);

-- 4. Índices: questions_titulo
CREATE INDEX IF NOT EXISTS idx_qtitulo_esp_year ON public.questions_titulo(especialidade, year);
CREATE INDEX IF NOT EXISTS idx_qtitulo_esp_tema ON public.questions_titulo(especialidade, tema);
CREATE INDEX IF NOT EXISTS idx_qtitulo_banca_year ON public.questions_titulo(banca, year);
CREATE INDEX IF NOT EXISTS idx_qtitulo_institution ON public.questions_titulo(institution);
CREATE INDEX IF NOT EXISTS idx_qtitulo_difficulty ON public.questions_titulo(difficulty);
CREATE INDEX IF NOT EXISTS idx_qtitulo_type ON public.questions_titulo(type);
CREATE INDEX IF NOT EXISTS idx_qtitulo_modalidade ON public.questions_titulo(modalidade);
CREATE INDEX IF NOT EXISTS idx_qtitulo_correct_answer ON public.questions_titulo(correct_answer);
CREATE INDEX IF NOT EXISTS idx_qtitulo_is_anulada ON public.questions_titulo(is_anulada);
CREATE INDEX IF NOT EXISTS idx_qtitulo_has_gabarito ON public.questions_titulo(has_gabarito);
CREATE INDEX IF NOT EXISTS idx_qtitulo_tema ON public.questions_titulo(tema);
CREATE INDEX IF NOT EXISTS idx_qtitulo_foco ON public.questions_titulo(foco);
CREATE INDEX IF NOT EXISTS idx_qtitulo_subfoco ON public.questions_titulo(subfoco);

-- 5. Views Unificadas Canônicas
DROP VIEW IF EXISTS public.view_questions_acesso_direto CASCADE;
CREATE OR REPLACE VIEW public.view_questions_acesso_direto AS
SELECT * FROM public.questions_direto;

DROP VIEW IF EXISTS public.view_questions_revalida CASCADE;
CREATE OR REPLACE VIEW public.view_questions_revalida AS
SELECT * FROM public.questions_revalida;

DROP VIEW IF EXISTS public.view_questions_rplus CASCADE;
CREATE OR REPLACE VIEW public.view_questions_rplus AS
SELECT * FROM public.questions_rplus;

DROP VIEW IF EXISTS public.view_questions_titulo CASCADE;
CREATE OR REPLACE VIEW public.view_questions_titulo AS
SELECT * FROM public.questions_titulo;

-- Concessão de Privilégios para Views
GRANT SELECT ON public.view_questions_acesso_direto TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_revalida TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_rplus TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_titulo TO anon, authenticated, service_role;

COMMIT;

