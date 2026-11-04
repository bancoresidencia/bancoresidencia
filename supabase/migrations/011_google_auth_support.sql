-- ==============================================================================
-- MIGRAÇÃO 011: SUPORTE COMPLETO A AUTENTICAÇÃO VIA GOOGLE OAUTH
-- Banco Residência Médica
-- ==============================================================================

-- 1. Atualização da função de provisionamento automático de perfil (handle_new_user)
-- Mapeia full_name e picture/avatar_url retornados pelo provedor Google OAuth
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
    graduation_year,
    avatar_url
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.email,
    COALESCE(NEW.raw_app_meta_data->>'role', 'student'),
    COALESCE(NEW.raw_user_meta_data->>'specialty_target', 'Clínica Médica'),
    NEW.raw_user_meta_data->>'college',
    NULLIF(NEW.raw_user_meta_data->>'graduation_year', '')::INTEGER,
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    )
  )
  ON CONFLICT (id) DO UPDATE SET
    name = COALESCE(
      EXCLUDED.name,
      profiles.name
    ),
    avatar_url = COALESCE(
      NULLIF(EXCLUDED.avatar_url, ''),
      profiles.avatar_url
    ),
    updated_at = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
