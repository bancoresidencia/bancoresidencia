-- ==============================================================================
-- MIGRAÇÃO 025: SEPARAÇÃO DO REVALIDA DA BASE 132K E CRIAÇÃO DAS VIEWS UNIFICADAS
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL direta: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
--
-- Objetivos:
--   1. Criar a tabela independente 'questions_revalida_base' para isolar o Revalida.
--   2. Transferir as 2.921 questões de Revalida da tabela 'questions' para 'questions_revalida_base'.
--   3. Remover as 2.921 questões de Revalida de 'questions', deixando-a puramente com Acesso Direto (130.026).
--   4. Criar 'view_questions_acesso_direto' (Base + Expansão Aprovadas com subfoco != 'Geral').
--   5. Criar 'view_questions_revalida' (Base + Expansão Aprovadas com subfoco != 'Geral').
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. CRIAÇÃO DA TABELA: questions_revalida_base (2.921 questões originais do Revalida)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions_revalida_base (
  id TEXT PRIMARY KEY,
  code TEXT,
  institution TEXT,
  banca TEXT,
  year INT,
  tipo_prova TEXT,
  modalidade TEXT DEFAULT 'Revalida',
  especialidade TEXT,
  tema TEXT,
  foco TEXT,
  subfoco TEXT,
  sub_subfoco TEXT,
  difficulty TEXT DEFAULT 'Médio',
  type TEXT DEFAULT 'Múltipla escolha',
  is_anulada BOOLEAN DEFAULT false,
  statement TEXT NOT NULL,
  options JSONB DEFAULT '[]'::jsonb,
  correct_answer TEXT,
  commentary TEXT,
  images JSONB DEFAULT '[]'::jsonb,
  has_gabarito BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de Alta Performance: questions_revalida_base
CREATE INDEX IF NOT EXISTS idx_revalida_base_esp_year ON public.questions_revalida_base(especialidade, year);
CREATE INDEX IF NOT EXISTS idx_revalida_base_esp_tema ON public.questions_revalida_base(especialidade, tema);
CREATE INDEX IF NOT EXISTS idx_revalida_base_banca_year ON public.questions_revalida_base(banca, year);
CREATE INDEX IF NOT EXISTS idx_revalida_base_institution ON public.questions_revalida_base(institution);
CREATE INDEX IF NOT EXISTS idx_revalida_base_difficulty ON public.questions_revalida_base(difficulty);
CREATE INDEX IF NOT EXISTS idx_revalida_base_type ON public.questions_revalida_base(type);
CREATE INDEX IF NOT EXISTS idx_revalida_base_modalidade ON public.questions_revalida_base(modalidade);
CREATE INDEX IF NOT EXISTS idx_revalida_base_correct_answer ON public.questions_revalida_base(correct_answer);
CREATE INDEX IF NOT EXISTS idx_revalida_base_is_anulada ON public.questions_revalida_base(is_anulada);
CREATE INDEX IF NOT EXISTS idx_revalida_base_has_gabarito ON public.questions_revalida_base(has_gabarito);
CREATE INDEX IF NOT EXISTS idx_revalida_base_tema ON public.questions_revalida_base(tema);
CREATE INDEX IF NOT EXISTS idx_revalida_base_foco ON public.questions_revalida_base(foco);
CREATE INDEX IF NOT EXISTS idx_revalida_base_subfoco ON public.questions_revalida_base(subfoco);

-- Row Level Security (RLS)
ALTER TABLE public.questions_revalida_base ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura homologada questions_revalida_base" ON public.questions_revalida_base;
CREATE POLICY "Permitir leitura homologada questions_revalida_base"
ON public.questions_revalida_base
FOR SELECT
TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());


-- ==============================================================================
-- 2. MIGRAÇÃO SEGURA: TRANSFERIR 2.921 QUESTÕES DE REVALIDA PARA A NOVA TABELA
-- ==============================================================================
INSERT INTO public.questions_revalida_base (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
)
SELECT 
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
FROM public.questions
WHERE modalidade ILIKE '%revalida%'
   OR banca IN ('INEP Revalida', 'UFMT Revalida', 'UEPA Revalida', 'UNIRG Revalida', 'FMRP-USP')
   OR institution ILIKE '%revalida%'
   OR institution ILIKE '%inep%'
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- 3. HIGIENIZAÇÃO: REMOVER REVALIDA DA TABELA 'questions' (FICA PURA COM 130.026 Q)
-- ==============================================================================
DELETE FROM public.questions
WHERE modalidade ILIKE '%revalida%'
   OR banca IN ('INEP Revalida', 'UFMT Revalida', 'UEPA Revalida', 'UNIRG Revalida', 'FMRP-USP')
   OR institution ILIKE '%revalida%'
   OR institution ILIKE '%inep%';


-- ==============================================================================
-- 4. VIEW UNIFICADA: view_questions_acesso_direto
-- ==============================================================================
-- Unifica as 130.026 da base + 43.500 aprovadas da expansão (subfoco != 'Geral')
-- Total: 173.526 questões de Acesso Direto com filtros 100% canônicos
DROP VIEW IF EXISTS public.view_questions_acesso_direto CASCADE;

CREATE OR REPLACE VIEW public.view_questions_acesso_direto AS
SELECT 
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
FROM public.questions
UNION ALL
SELECT 
  id::text AS id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, NULL::text AS sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
FROM public.questions_expansion_direto
WHERE subfoco IS NOT NULL AND subfoco != 'Geral';


-- ==============================================================================
-- 5. VIEW UNIFICADA: view_questions_revalida
-- ==============================================================================
-- Unifica as 2.921 da base + 2.578 aprovadas da expansão (subfoco != 'Geral')
-- Total: 5.499 questões de Revalida com filtros 100% canônicos
DROP VIEW IF EXISTS public.view_questions_revalida CASCADE;

CREATE OR REPLACE VIEW public.view_questions_revalida AS
SELECT 
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
FROM public.questions_revalida_base
UNION ALL
SELECT 
  id::text AS id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, NULL::text AS sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
FROM public.questions_expansion_revalida
WHERE subfoco IS NOT NULL AND subfoco != 'Geral';


-- ==============================================================================
-- 6. PERMISSÕES DE ACESSO ÀS VIEWS
-- ==============================================================================
GRANT SELECT ON public.view_questions_acesso_direto TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_revalida TO anon, authenticated, service_role;

COMMIT;
