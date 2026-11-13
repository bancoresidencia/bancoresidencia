-- ==============================================================================
-- MIGRAÇÃO 029: REORGANIZAÇÃO ESTRUTURAL E CONSOLIDAÇÃO CANÔNICA DAS QUESTÕES
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- URL SQL Editor: https://supabase.com/dashboard/project/ezluharxlmlqhdkqrjbz/sql/new
--
-- Objetivos:
--   1. Criar as 4 tabelas canônicas: questions_direto, questions_rplus, questions_revalida, questions_titulo.
--   2. Assimilar 'questions' + 'questions_expansion_direto' em 'questions_direto',
--      EXPURGANDO cirurgicamente 100% das questões de 'questions_revalida_base'.
--   3. Migrar 'questions_expansion_r_plus' para 'questions_rplus'.
--   4. Cruzar e unificar 'questions_revalida_base' + 'questions_expansion_revalida' em 'questions_revalida'.
--   5. Criar 'questions_titulo' assimilando 'questions_expansion_titulo_especialista'.
--   6. Atualizar as views públicas da plataforma garantindo Zero Downtime.
-- ==============================================================================

BEGIN;

-- ==============================================================================
-- PASSO 1: DDL — CRIAÇÃO DAS 4 TABELAS DEFINITIVAS COM ÍNDICES E RLS
-- ==============================================================================

-- 1.1 Tabela: questions_direto
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

ALTER TABLE public.questions_direto ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura homologada questions_direto" ON public.questions_direto;
CREATE POLICY "Permitir leitura homologada questions_direto"
ON public.questions_direto FOR SELECT TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());


-- 1.2 Tabela: questions_rplus
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

ALTER TABLE public.questions_rplus ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura homologada questions_rplus" ON public.questions_rplus;
CREATE POLICY "Permitir leitura homologada questions_rplus"
ON public.questions_rplus FOR SELECT TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());


-- 1.3 Tabela: questions_revalida
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

ALTER TABLE public.questions_revalida ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura homologada questions_revalida" ON public.questions_revalida;
CREATE POLICY "Permitir leitura homologada questions_revalida"
ON public.questions_revalida FOR SELECT TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());


-- 1.4 Tabela: questions_titulo
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

ALTER TABLE public.questions_titulo ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir leitura homologada questions_titulo" ON public.questions_titulo;
CREATE POLICY "Permitir leitura homologada questions_titulo"
ON public.questions_titulo FOR SELECT TO anon, authenticated
USING (has_gabarito = true OR public.is_admin());


-- ==============================================================================
-- PASSO 2: CARGA E CRUZAMENTO — questions_revalida
-- ==============================================================================

-- 2.1 Carga da Base Histórica Revalida (2.921 registros)
INSERT INTO public.questions_revalida (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
)
SELECT 
  id, code, institution, banca, year, tipo_prova, COALESCE(modalidade, 'Revalida'),
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
FROM public.questions_revalida_base
ON CONFLICT (id) DO NOTHING;

-- 2.2 Cruzamento com a Expansão do Revalida (1.437 registros)
-- Enriquecimento automático caso haja sobreposição de ID
INSERT INTO public.questions_revalida (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
)
SELECT 
  id::text, code, institution, banca, year, tipo_prova, COALESCE(modalidade, 'Revalida'),
  especialidade, tema, foco, subfoco, NULL::text AS sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
FROM public.questions_expansion_revalida
ON CONFLICT (id) DO UPDATE SET
  commentary = CASE 
    WHEN length(COALESCE(EXCLUDED.commentary, '')) > length(COALESCE(public.questions_revalida.commentary, '')) 
    THEN EXCLUDED.commentary 
    ELSE public.questions_revalida.commentary 
  END,
  correct_answer = COALESCE(public.questions_revalida.correct_answer, EXCLUDED.correct_answer),
  images = CASE 
    WHEN jsonb_typeof(EXCLUDED.images) = 'array' 
     AND (jsonb_typeof(public.questions_revalida.images) != 'array' OR jsonb_array_length(EXCLUDED.images) > jsonb_array_length(public.questions_revalida.images))
    THEN EXCLUDED.images 
    ELSE public.questions_revalida.images 
  END;


-- ==============================================================================
-- PASSO 3: CARGA E EXPURGO — questions_direto
-- ==============================================================================

-- 3.1 Carga da tabela 'questions' (excluindo qualquer item presente em Revalida Base)
INSERT INTO public.questions_direto (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
)
SELECT 
  q.id, q.code, q.institution, q.banca, q.year, q.tipo_prova, COALESCE(q.modalidade, 'Residência Médica'),
  q.especialidade, q.tema, q.foco, q.subfoco, q.sub_subfoco, q.difficulty, q.type,
  q.is_anulada, q.statement, q.options, q.correct_answer, q.commentary,
  q.images, q.has_gabarito, q.created_at
FROM public.questions q
WHERE q.id NOT IN (SELECT id FROM public.questions_revalida_base)
  AND q.statement NOT IN (SELECT statement FROM public.questions_revalida_base)
  AND (q.modalidade IS NULL OR q.modalidade NOT ILIKE '%revalida%')
  AND (q.banca IS NULL OR q.banca NOT IN ('INEP Revalida', 'UFMT Revalida', 'UEPA Revalida', 'UNIRG Revalida', 'FMRP-USP'))
  AND (q.institution IS NULL OR q.institution NOT ILIKE '%revalida%')
ON CONFLICT (id) DO NOTHING;

-- 3.2 Carga de 'questions_expansion_direto' (excluindo qualquer Revalida)
INSERT INTO public.questions_direto (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
)
SELECT 
  ed.id::text, ed.code, ed.institution, ed.banca, ed.year, ed.tipo_prova, COALESCE(ed.modalidade, 'Residência Médica'),
  ed.especialidade, ed.tema, ed.foco, ed.subfoco, NULL::text AS sub_subfoco, ed.difficulty, ed.type,
  ed.is_anulada, ed.statement, ed.options, ed.correct_answer, ed.commentary,
  ed.images, ed.has_gabarito, ed.created_at
FROM public.questions_expansion_direto ed
WHERE ed.id::text NOT IN (SELECT id FROM public.questions_revalida_base)
  AND ed.statement NOT IN (SELECT statement FROM public.questions_revalida_base)
  AND (ed.modalidade IS NULL OR ed.modalidade NOT ILIKE '%revalida%')
  AND (ed.banca IS NULL OR ed.banca NOT IN ('INEP Revalida', 'UFMT Revalida', 'UEPA Revalida', 'UNIRG Revalida', 'FMRP-USP'))
  AND (ed.institution IS NULL OR ed.institution NOT ILIKE '%revalida%')
ON CONFLICT (id) DO UPDATE SET
  commentary = CASE 
    WHEN length(COALESCE(EXCLUDED.commentary, '')) > length(COALESCE(public.questions_direto.commentary, '')) 
    THEN EXCLUDED.commentary 
    ELSE public.questions_direto.commentary 
  END,
  images = CASE 
    WHEN jsonb_typeof(EXCLUDED.images) = 'array' 
     AND (jsonb_typeof(public.questions_direto.images) != 'array' OR jsonb_array_length(EXCLUDED.images) > jsonb_array_length(public.questions_direto.images))
    THEN EXCLUDED.images 
    ELSE public.questions_direto.images 
  END;


-- ==============================================================================
-- PASSO 4: CARGA — questions_rplus
-- ==============================================================================
INSERT INTO public.questions_rplus (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
)
SELECT 
  id::text, code, institution, banca, year, tipo_prova, COALESCE(modalidade, 'R+ Especialidades'),
  especialidade, tema, foco, subfoco, NULL::text AS sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
FROM public.questions_expansion_r_plus
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- PASSO 5: CARGA — questions_titulo
-- ==============================================================================
INSERT INTO public.questions_titulo (
  id, code, institution, banca, year, tipo_prova, modalidade,
  especialidade, tema, foco, subfoco, sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
)
SELECT 
  id::text, code, institution, banca, year, tipo_prova, COALESCE(modalidade, 'Título de Especialista'),
  especialidade, tema, foco, subfoco, NULL::text AS sub_subfoco, difficulty, type,
  is_anulada, statement, options, correct_answer, commentary,
  images, has_gabarito, created_at
FROM public.questions_expansion_titulo_especialista
ON CONFLICT (id) DO NOTHING;


-- ==============================================================================
-- PASSO 6: VIEWS UNIFICADAS E CANÔNICAS (ZERO DOWNTIME)
-- ==============================================================================
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


-- ==============================================================================
-- PASSO 7: PERMISSÕES DE ACESSO
-- ==============================================================================
GRANT SELECT ON public.questions_direto TO anon, authenticated, service_role;
GRANT SELECT ON public.questions_rplus TO anon, authenticated, service_role;
GRANT SELECT ON public.questions_revalida TO anon, authenticated, service_role;
GRANT SELECT ON public.questions_titulo TO anon, authenticated, service_role;

GRANT ALL ON public.questions_direto TO service_role;
GRANT ALL ON public.questions_rplus TO service_role;
GRANT ALL ON public.questions_revalida TO service_role;
GRANT ALL ON public.questions_titulo TO service_role;

GRANT SELECT ON public.view_questions_acesso_direto TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_revalida TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_rplus TO anon, authenticated, service_role;
GRANT SELECT ON public.view_questions_titulo TO anon, authenticated, service_role;

COMMIT;
