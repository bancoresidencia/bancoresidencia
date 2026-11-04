-- ==============================================================================
-- BANCO RESIDÊNCIA — MIGRAÇÃO 005: PROTEÇÃO ANTI-SCRAPING & SEGURANÇA DE STORAGE
-- Data: Outubro/2026
-- Objetivo:
--   1. Proteger os gabaritos oficiais e comentários do acervo de 133k questões contra raspagem via PostgREST/anon key.
--   2. Bloquear enumeração e download em massa dos 341 livros médicos no Supabase Storage.
--   3. Garantir integridade de RLS na tabela de respostas dos estudantes (user_answers).
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. PROTEÇÃO DE COLUNAS CRÍTICAS DA TABELA 'questions' (Column-Level Security)
-- ------------------------------------------------------------------------------
-- O cliente web público (anon) não deve conseguir projetar 'correct_answer' e 'commentary'
-- diretamente via PostgREST (ex: client.from('questions').select('*')).
-- As resoluções agora são entregues exclusivamente sob demanda via /api/questions/solve
-- com controle de taxa (Rate Limit) e Service Role.

DO $$
BEGIN
  -- Garante permissão base nas colunas públicas da questão para usuários não autenticados e autenticados
  GRANT SELECT (
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
    images,
    created_at
  ) ON public.questions TO anon, authenticated;

  -- Revoga expressamente a projeção de correct_answer e commentary da role 'anon'
  -- Obs: Usuários anônimos e scrapers recebem erro 42501 se tentarem extrair correct_answer em lote
  REVOKE SELECT (correct_answer, commentary) ON public.questions FROM anon;

EXCEPTION WHEN OTHERS THEN
  RAISE NOTICE 'Nota sobre permissões de colunas: %', SQLERRM;
END $$;


-- ------------------------------------------------------------------------------
-- 2. POLÍTICA RLS PARA A TABELA 'questions'
-- ------------------------------------------------------------------------------
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Política de leitura geral de questões
DROP POLICY IF EXISTS "Permitir leitura de questões públicas" ON public.questions;
CREATE POLICY "Permitir leitura de questões públicas"
ON public.questions
FOR SELECT
TO anon, authenticated
USING (true);

-- Bloqueio total de mutação (INSERT, UPDATE, DELETE) por clientes anon ou usuários comuns
DROP POLICY IF EXISTS "Bloquear mutações de questões por usuários comuns" ON public.questions;
CREATE POLICY "Bloquear mutações de questões por usuários comuns"
ON public.questions
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);


-- ------------------------------------------------------------------------------
-- 3. SEGURANÇA DO BUCKET 'medical-knowledge' (Supabase Storage)
-- ------------------------------------------------------------------------------
-- Garante que o bucket dos 341 livros médicos seja privado e não permita download direto
-- via cliente web com chave anon. Todo acesso deve ser intermediado pela rota /api/knowledge/book.

UPDATE storage.buckets
SET public = false
WHERE id = 'medical-knowledge';

-- Remove eventuais políticas permissivas de leitura anônima direta no bucket
DROP POLICY IF EXISTS "Acesso público ao acervo médico" ON storage.objects;
DROP POLICY IF EXISTS "Permitir leitura pública medical-knowledge" ON storage.objects;
DROP POLICY IF EXISTS "Public Access medical-knowledge" ON storage.objects;

-- Cria política restritiva: Apenas Service Role ou administradores podem ler/escrever no bucket
CREATE POLICY "Acesso restrito ao bucket medical-knowledge"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'medical-knowledge' 
  AND (auth.jwt() -> 'app_metadata' ->> 'role') IN ('admin', 'curador', 'superadmin')
);


-- ------------------------------------------------------------------------------
-- 4. POLÍTICAS RLS PARA A TABELA 'user_answers'
-- ------------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
  selected_option VARCHAR(10) NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ DEFAULT now(),
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

-- Aluno só pode consultar suas próprias respostas
DROP POLICY IF EXISTS "Aluno consulta apenas suas respostas" ON public.user_answers;
CREATE POLICY "Aluno consulta apenas suas respostas"
ON public.user_answers
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Aluno só pode registrar/atualizar respostas em seu próprio nome
DROP POLICY IF EXISTS "Aluno grava apenas suas respostas" ON public.user_answers;
CREATE POLICY "Aluno grava apenas suas respostas"
ON public.user_answers
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Aluno atualiza apenas suas respostas" ON public.user_answers;
CREATE POLICY "Aluno atualiza apenas suas respostas"
ON public.user_answers
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Índices de alto desempenho para consulta de histórico do aluno
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON public.user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_question_id ON public.user_answers(question_id);
