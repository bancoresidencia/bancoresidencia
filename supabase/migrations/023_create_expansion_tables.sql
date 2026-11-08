-- ==============================================================================
-- MIGRAÇÃO 023: CRIAÇÃO DAS 4 TABELAS DE EXPANSÃO MODULAR NO SUPABASE
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- Tabelas Isoladas:
--   1. questions_expansion_direto
--   2. questions_expansion_r_plus
--   3. questions_expansion_revalida
--   4. questions_expansion_titulo_especialista
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- 1. TABELA: questions_expansion_direto (64.531 questões de Acesso Direto)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions_expansion_direto (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  institution TEXT,
  banca TEXT,
  year INT,
  tipo_prova TEXT,
  modalidade TEXT DEFAULT 'Residência Médica',
  especialidade TEXT,
  tema TEXT,
  foco TEXT,
  subfoco TEXT,
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

-- Índices de Alta Performance: questions_expansion_direto
CREATE INDEX IF NOT EXISTS idx_exp_direto_esp_year ON public.questions_expansion_direto(especialidade, year);
CREATE INDEX IF NOT EXISTS idx_exp_direto_esp_tema ON public.questions_expansion_direto(especialidade, tema);
CREATE INDEX IF NOT EXISTS idx_exp_direto_banca_year ON public.questions_expansion_direto(banca, year);
CREATE INDEX IF NOT EXISTS idx_exp_direto_institution ON public.questions_expansion_direto(institution);
CREATE INDEX IF NOT EXISTS idx_exp_direto_difficulty ON public.questions_expansion_direto(difficulty);
CREATE INDEX IF NOT EXISTS idx_exp_direto_type ON public.questions_expansion_direto(type);
CREATE INDEX IF NOT EXISTS idx_exp_direto_modalidade ON public.questions_expansion_direto(modalidade);
CREATE INDEX IF NOT EXISTS idx_exp_direto_correct_answer ON public.questions_expansion_direto(correct_answer);
CREATE INDEX IF NOT EXISTS idx_exp_direto_is_anulada ON public.questions_expansion_direto(is_anulada);
CREATE INDEX IF NOT EXISTS idx_exp_direto_has_gabarito ON public.questions_expansion_direto(has_gabarito);
CREATE INDEX IF NOT EXISTS idx_exp_direto_tema ON public.questions_expansion_direto(tema);
CREATE INDEX IF NOT EXISTS idx_exp_direto_foco ON public.questions_expansion_direto(foco);
CREATE INDEX IF NOT EXISTS idx_exp_direto_subfoco ON public.questions_expansion_direto(subfoco);

-- RLS: questions_expansion_direto
ALTER TABLE public.questions_expansion_direto ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura homologada questions_expansion_direto" ON public.questions_expansion_direto;
CREATE POLICY "Permitir leitura homologada questions_expansion_direto"
ON public.questions_expansion_direto
FOR SELECT
TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());


-- ==============================================================================
-- 2. TABELA: questions_expansion_r_plus (50.582 questões de R+ e Pré-Requisito)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions_expansion_r_plus (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  institution TEXT,
  banca TEXT,
  year INT,
  tipo_prova TEXT,
  modalidade TEXT DEFAULT 'R+ Cirurgia / Clínica / Pediatria / GO',
  especialidade TEXT,
  tema TEXT,
  foco TEXT,
  subfoco TEXT,
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

-- Índices de Alta Performance: questions_expansion_r_plus
CREATE INDEX IF NOT EXISTS idx_exp_rplus_esp_year ON public.questions_expansion_r_plus(especialidade, year);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_esp_tema ON public.questions_expansion_r_plus(especialidade, tema);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_banca_year ON public.questions_expansion_r_plus(banca, year);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_institution ON public.questions_expansion_r_plus(institution);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_difficulty ON public.questions_expansion_r_plus(difficulty);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_type ON public.questions_expansion_r_plus(type);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_modalidade ON public.questions_expansion_r_plus(modalidade);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_correct_answer ON public.questions_expansion_r_plus(correct_answer);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_is_anulada ON public.questions_expansion_r_plus(is_anulada);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_has_gabarito ON public.questions_expansion_r_plus(has_gabarito);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_tema ON public.questions_expansion_r_plus(tema);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_foco ON public.questions_expansion_r_plus(foco);
CREATE INDEX IF NOT EXISTS idx_exp_rplus_subfoco ON public.questions_expansion_r_plus(subfoco);

-- RLS: questions_expansion_r_plus
ALTER TABLE public.questions_expansion_r_plus ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura homologada questions_expansion_r_plus" ON public.questions_expansion_r_plus;
CREATE POLICY "Permitir leitura homologada questions_expansion_r_plus"
ON public.questions_expansion_r_plus
FOR SELECT
TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());


-- ==============================================================================
-- 3. TABELA: questions_expansion_revalida (4.429 questões de Revalida)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions_expansion_revalida (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
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

-- Índices de Alta Performance: questions_expansion_revalida
CREATE INDEX IF NOT EXISTS idx_exp_revalida_esp_year ON public.questions_expansion_revalida(especialidade, year);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_esp_tema ON public.questions_expansion_revalida(especialidade, tema);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_banca_year ON public.questions_expansion_revalida(banca, year);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_institution ON public.questions_expansion_revalida(institution);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_difficulty ON public.questions_expansion_revalida(difficulty);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_type ON public.questions_expansion_revalida(type);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_modalidade ON public.questions_expansion_revalida(modalidade);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_correct_answer ON public.questions_expansion_revalida(correct_answer);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_is_anulada ON public.questions_expansion_revalida(is_anulada);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_has_gabarito ON public.questions_expansion_revalida(has_gabarito);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_tema ON public.questions_expansion_revalida(tema);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_foco ON public.questions_expansion_revalida(foco);
CREATE INDEX IF NOT EXISTS idx_exp_revalida_subfoco ON public.questions_expansion_revalida(subfoco);

-- RLS: questions_expansion_revalida
ALTER TABLE public.questions_expansion_revalida ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura homologada questions_expansion_revalida" ON public.questions_expansion_revalida;
CREATE POLICY "Permitir leitura homologada questions_expansion_revalida"
ON public.questions_expansion_revalida
FOR SELECT
TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());


-- ==============================================================================
-- 4. TABELA: questions_expansion_titulo_especialista (870 questões TEGO/TECM)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.questions_expansion_titulo_especialista (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code TEXT,
  institution TEXT,
  banca TEXT,
  year INT,
  tipo_prova TEXT,
  modalidade TEXT DEFAULT 'Título de Especialista',
  especialidade TEXT,
  tema TEXT,
  foco TEXT,
  subfoco TEXT,
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

-- Índices de Alta Performance: questions_expansion_titulo_especialista
CREATE INDEX IF NOT EXISTS idx_exp_titulo_esp_year ON public.questions_expansion_titulo_especialista(especialidade, year);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_esp_tema ON public.questions_expansion_titulo_especialista(especialidade, tema);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_banca_year ON public.questions_expansion_titulo_especialista(banca, year);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_institution ON public.questions_expansion_titulo_especialista(institution);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_difficulty ON public.questions_expansion_titulo_especialista(difficulty);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_type ON public.questions_expansion_titulo_especialista(type);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_modalidade ON public.questions_expansion_titulo_especialista(modalidade);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_correct_answer ON public.questions_expansion_titulo_especialista(correct_answer);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_is_anulada ON public.questions_expansion_titulo_especialista(is_anulada);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_has_gabarito ON public.questions_expansion_titulo_especialista(has_gabarito);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_tema ON public.questions_expansion_titulo_especialista(tema);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_foco ON public.questions_expansion_titulo_especialista(foco);
CREATE INDEX IF NOT EXISTS idx_exp_titulo_subfoco ON public.questions_expansion_titulo_especialista(subfoco);

-- RLS: questions_expansion_titulo_especialista
ALTER TABLE public.questions_expansion_titulo_especialista ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Permitir leitura homologada questions_expansion_titulo_especialista" ON public.questions_expansion_titulo_especialista;
CREATE POLICY "Permitir leitura homologada questions_expansion_titulo_especialista"
ON public.questions_expansion_titulo_especialista
FOR SELECT
TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());

COMMIT;

