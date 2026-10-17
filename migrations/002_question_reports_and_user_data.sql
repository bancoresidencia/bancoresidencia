-- ============================================================
-- Migration 002: Question Reports, User Progress & RLS Policies
-- Banco Residência Médica
-- ============================================================

-- 1. Tabela de Denúncias e Auditoria de Questões (Report de Alunos)
CREATE TABLE IF NOT EXISTS public.question_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id TEXT NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reason TEXT NOT NULL DEFAULT 'Erro no gabarito ou enunciado',
  details TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_review', 'resolved', 'dismissed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  resolved_at TIMESTAMPTZ,
  resolved_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Habilitar RLS em question_reports
ALTER TABLE public.question_reports ENABLE ROW LEVEL SECURITY;

-- Permitir qualquer usuário (anônimo ou logado) enviar denúncia
CREATE POLICY "Qualquer usuário pode registrar denúncia"
  ON public.question_reports
  FOR INSERT
  WITH CHECK (true);

-- Apenas admins e curadores podem visualizar denúncias
CREATE POLICY "Admins e curadores podem ler denúncias"
  ON public.question_reports
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'curator')
    )
  );

-- Apenas admins e curadores podem atualizar status de denúncias
CREATE POLICY "Admins e curadores podem atualizar denúncias"
  ON public.question_reports
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'curator')
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'curator')
    )
  );

-- 2. Tabela de Histórico de Respostas do Usuário (Sincronização entre dispositivos)
CREATE TABLE IF NOT EXISTS public.user_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  selected_option TEXT,
  is_correct BOOLEAN NOT NULL DEFAULT false,
  time_spent_seconds INTEGER DEFAULT 0,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas suas próprias respostas"
  ON public.user_answers
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 3. Tabela de Questões Favoritas do Usuário (Sincronização entre dispositivos)
CREATE TABLE IF NOT EXISTS public.user_bookmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  bookmarked_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  UNIQUE(user_id, question_id)
);

ALTER TABLE public.user_bookmarks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuário acessa apenas seus próprios favoritos"
  ON public.user_bookmarks
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Índices para alta performance nas consultas do dashboard e filtros
CREATE INDEX IF NOT EXISTS idx_question_reports_status ON public.question_reports(status);
CREATE INDEX IF NOT EXISTS idx_question_reports_question_id ON public.question_reports(question_id);
CREATE INDEX IF NOT EXISTS idx_user_answers_user_id ON public.user_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_user_bookmarks_user_id ON public.user_bookmarks(user_id);
