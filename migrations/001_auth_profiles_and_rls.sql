-- ==============================================================================
-- MIGRAÇÃO 001: ESTRUTURA DE PERFIS, TRIGGER DE CADASTRO E RLS
-- Banco Residência Médica
-- ==============================================================================

-- 1. Criação da Tabela de Perfis Médicos (public.profiles)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL DEFAULT 'student' CHECK (role IN ('student', 'admin', 'curador')),
  specialty_target TEXT,
  college TEXT,
  graduation_year INTEGER,
  daily_goal INTEGER DEFAULT 30,
  phone TEXT,
  state TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices de consulta rápida
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);

-- 2. Habilitação de Row Level Security (RLS) em Perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Função auxiliar segura para checagem de Admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM public.profiles 
    WHERE id = auth.uid() AND role IN ('admin', 'curador')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Políticas de RLS para public.profiles
DROP POLICY IF EXISTS "Perfis visíveis pelo titular ou admin" ON public.profiles;
CREATE POLICY "Perfis visíveis pelo titular ou admin"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Usuário atualiza o próprio perfil" ON public.profiles;
CREATE POLICY "Usuário atualiza o próprio perfil"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    -- Impede auto-atribuição de role administrativo por um aluno comum
    AND (
      role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
      OR public.is_admin()
    )
  );

DROP POLICY IF EXISTS "Criação de perfil via service role ou trigger" ON public.profiles;
CREATE POLICY "Criação de perfil via service role ou trigger"
  ON public.profiles FOR INSERT
  WITH CHECK (true);

-- 3. Trigger Automático para Provisionamento de Perfil no Registro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    specialty_target,
    college,
    graduation_year
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'specialty_target',
    NEW.raw_user_meta_data->>'college',
    NULLIF(NEW.raw_user_meta_data->>'graduation_year', '')::INTEGER
  )
  ON CONFLICT (id) DO NOTHING;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. Habilitação de RLS e Proteção da Tabela de Questões (public.questions)
ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

-- Todos podem ler o banco de questões (alunos autenticados e visitantes)
DROP POLICY IF EXISTS "Leitura pública e irrestrita de questões" ON public.questions;
CREATE POLICY "Leitura pública e irrestrita de questões"
  ON public.questions FOR SELECT
  USING (true);

-- Apenas curadores e administradores autenticados podem alterar gabaritos e anulações
DROP POLICY IF EXISTS "Curadoria e atualização de gabaritos restrita a admins" ON public.questions;
CREATE POLICY "Curadoria e atualização de gabaritos restrita a admins"
  ON public.questions FOR UPDATE
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

-- Apenas administradores podem inserir novas questões
DROP POLICY IF EXISTS "Inserção de questões restrita a admins" ON public.questions;
CREATE POLICY "Inserção de questões restrita a admins"
  ON public.questions FOR INSERT
  TO authenticated
  WITH CHECK (public.is_admin());

-- 5. Atualização automática do timestamp updated_at
CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_profiles_updated_at ON public.profiles;
CREATE TRIGGER trg_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();
