-- ==============================================================================
-- ETAPA 1 (LEVE E INSTANTÂNEA): CRIAÇÃO DAS 4 TABELAS VAZIAS NO SUPABASE
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL SQL Editor: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
--
-- Duração estimada: ~1 a 2 segundos
-- Uso de CPU: < 1% (Cria apenas as tabelas com Primary Key, sem índices pesados)
-- ==============================================================================

BEGIN;

-- 1. questions_direto
CREATE TABLE IF NOT EXISTS public.questions_direto (
  id TEXT PRIMARY KEY,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.questions_direto ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura homologada questions_direto" ON public.questions_direto;
CREATE POLICY "Permitir leitura homologada questions_direto"
ON public.questions_direto FOR SELECT TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());

-- 2. questions_rplus
CREATE TABLE IF NOT EXISTS public.questions_rplus (
  id TEXT PRIMARY KEY,
  code TEXT,
  institution TEXT,
  banca TEXT,
  year INT,
  tipo_prova TEXT,
  modalidade TEXT DEFAULT 'R+ Especialidades',
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.questions_rplus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura homologada questions_rplus" ON public.questions_rplus;
CREATE POLICY "Permitir leitura homologada questions_rplus"
ON public.questions_rplus FOR SELECT TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());

-- 3. questions_revalida
CREATE TABLE IF NOT EXISTS public.questions_revalida (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.questions_revalida ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura homologada questions_revalida" ON public.questions_revalida;
CREATE POLICY "Permitir leitura homologada questions_revalida"
ON public.questions_revalida FOR SELECT TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());

-- 4. questions_titulo
CREATE TABLE IF NOT EXISTS public.questions_titulo (
  id TEXT PRIMARY KEY,
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE public.questions_titulo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura homologada questions_titulo" ON public.questions_titulo;
CREATE POLICY "Permitir leitura homologada questions_titulo"
ON public.questions_titulo FOR SELECT TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());

-- Concessão de Privilégios
GRANT ALL ON public.questions_direto TO service_role;
GRANT ALL ON public.questions_rplus TO service_role;
GRANT ALL ON public.questions_revalida TO service_role;
GRANT ALL ON public.questions_titulo TO service_role;

GRANT SELECT ON public.questions_direto TO anon, authenticated;
GRANT SELECT ON public.questions_rplus TO anon, authenticated;
GRANT SELECT ON public.questions_revalida TO anon, authenticated;
GRANT SELECT ON public.questions_titulo TO anon, authenticated;

COMMIT;

