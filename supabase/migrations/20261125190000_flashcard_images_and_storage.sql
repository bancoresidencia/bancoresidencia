-- ==============================================================================
-- MIGRAÇÃO: SUPORTE A IMAGENS EM FLASHCARDS AUTORAIS E IMPORTAÇÃO ANKI
-- Plataforma Banco Residência Médica — Supabase PostgreSQL & Storage
-- ==============================================================================

BEGIN;

-- ------------------------------------------------------------------------------
-- 1. COLUNAS DE IMAGEM EM public.user_created_flashcards
-- ------------------------------------------------------------------------------
ALTER TABLE public.user_created_flashcards
  ADD COLUMN IF NOT EXISTS image_front_url TEXT,
  ADD COLUMN IF NOT EXISTS image_url TEXT;

-- ------------------------------------------------------------------------------
-- 2. BUCKET 'flashcard-media' NO SUPABASE STORAGE (MÍDIAS WEBP DOS ALUNOS)
-- ------------------------------------------------------------------------------
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'flashcard-media',
  'flashcard-media',
  true,
  5242880,
  ARRAY['image/webp', 'image/png', 'image/jpeg', 'image/gif']
)
ON CONFLICT (id) DO UPDATE
SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

DROP POLICY IF EXISTS "Leitura pública de mídias de flashcards" ON storage.objects;
CREATE POLICY "Leitura pública de mídias de flashcards"
  ON storage.objects
  FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'flashcard-media');

DROP POLICY IF EXISTS "Aluno envia mídia para sua própria pasta em flashcard-media" ON storage.objects;
CREATE POLICY "Aluno envia mídia para sua própria pasta em flashcard-media"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'flashcard-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Aluno atualiza mídia em sua própria pasta em flashcard-media" ON storage.objects;
CREATE POLICY "Aluno atualiza mídia em sua própria pasta em flashcard-media"
  ON storage.objects
  FOR UPDATE
  TO authenticated
  USING (
    bucket_id = 'flashcard-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  )
  WITH CHECK (
    bucket_id = 'flashcard-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

DROP POLICY IF EXISTS "Aluno remove mídia de sua própria pasta em flashcard-media" ON storage.objects;
CREATE POLICY "Aluno remove mídia de sua própria pasta em flashcard-media"
  ON storage.objects
  FOR DELETE
  TO authenticated
  USING (
    bucket_id = 'flashcard-media'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

COMMIT;

NOTIFY pgrst, 'reload schema';
