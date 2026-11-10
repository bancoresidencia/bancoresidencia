-- ==============================================================================
-- MIGRAÇÃO 025: MERGE DAS 4 TABELAS DE EXPANSÃO SANEADAS NA TABELA PRINCIPAL 'questions'
-- Plataforma Banco Residência Médica — Supabase PostgreSQL
-- 
-- Volumes a Integrar (Sobra Líquida pós-recruzamento de alta precisão):
--   1. questions_expansion_titulo_especialista:    857 questões
--   2. questions_expansion_revalida:             1.465 questões
--   3. questions_expansion_r_plus:              45.055 questões
--   4. questions_expansion_direto:              49.483 questões
--   Total da Expansão a Integrar:               96.860 questões
--
-- Tabela Destino:
--   public.questions: 130.026 questões pré-existentes mantidas 100% intactas.
--   Meta Pós-Merge:   226.886 questões.
-- ==============================================================================

BEGIN;

-- 1. Inserir Título de Especialista (857 questões)
INSERT INTO public.questions (
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
  correct_answer,
  commentary,
  images,
  has_gabarito,
  created_at
)
SELECT
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
  correct_answer,
  commentary,
  images,
  has_gabarito,
  created_at
FROM public.questions_expansion_titulo_especialista
ON CONFLICT (id) DO NOTHING;

-- 2. Inserir Revalida (1.465 questões)
INSERT INTO public.questions (
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
  correct_answer,
  commentary,
  images,
  has_gabarito,
  created_at
)
SELECT
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
  correct_answer,
  commentary,
  images,
  has_gabarito,
  created_at
FROM public.questions_expansion_revalida
ON CONFLICT (id) DO NOTHING;

-- 3. Inserir R+ Especialidades (45.055 questões)
INSERT INTO public.questions (
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
  correct_answer,
  commentary,
  images,
  has_gabarito,
  created_at
)
SELECT
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
  correct_answer,
  commentary,
  images,
  has_gabarito,
  created_at
FROM public.questions_expansion_r_plus
ON CONFLICT (id) DO NOTHING;

-- 4. Inserir Residência Médica Acesso Direto (49.483 questões)
INSERT INTO public.questions (
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
  correct_answer,
  commentary,
  images,
  has_gabarito,
  created_at
)
SELECT
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
  correct_answer,
  commentary,
  images,
  has_gabarito,
  created_at
FROM public.questions_expansion_direto
ON CONFLICT (id) DO NOTHING;

COMMIT;

