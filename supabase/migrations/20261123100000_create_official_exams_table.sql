-- Migration: 20261123100000_create_official_exams_table.sql
-- Description: Criação da tabela official_exams para governança relacional dos cadernos de provas integrais certificados

CREATE TABLE IF NOT EXISTS public.official_exams (
  id text PRIMARY KEY,
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  institution_slug text NOT NULL,
  institution_name text NOT NULL,
  banca text,
  year integer NOT NULL,
  modality text NOT NULL,
  modality_key text NOT NULL DEFAULT 'acesso_direto',
  booklet text,
  total_questions integer NOT NULL,
  duration_minutes integer NOT NULL DEFAULT 240,
  question_ids jsonb NOT NULL DEFAULT '[]'::jsonb,
  is_certified boolean NOT NULL DEFAULT true,
  status text NOT NULL DEFAULT 'integral_certificada',
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Indexes de alta performance para catálogo e filtros
CREATE INDEX IF NOT EXISTS idx_official_exams_institution_slug ON public.official_exams(institution_slug);
CREATE INDEX IF NOT EXISTS idx_official_exams_year ON public.official_exams(year);
CREATE INDEX IF NOT EXISTS idx_official_exams_modality_key ON public.official_exams(modality_key);
CREATE INDEX IF NOT EXISTS idx_official_exams_slug ON public.official_exams(slug);

-- Governança de RLS (Row Level Security)
ALTER TABLE public.official_exams ENABLE ROW LEVEL SECURITY;

-- Leitura pública para estudantes autenticados e anônimos
CREATE POLICY "Public read official exams"
  ON public.official_exams
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Controle total para papéis privilegiados e service_role
CREATE POLICY "Admin write official exams"
  ON public.official_exams
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

GRANT SELECT ON public.official_exams TO anon, authenticated;
GRANT ALL ON public.official_exams TO service_role;

NOTIFY pgrst, 'reload schema';
