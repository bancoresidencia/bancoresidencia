-- ==============================================================================
-- MIGRAÇÃO 20261123160000: AUTO-GERAÇÃO DETERMINÍSTICA DE REFERRAL_CODE NO CADASTRO
-- E HARDENING DE LIQUIDAÇÃO DE SAQUES PIX (PROGRAMA DE EMBAIXADORES)
-- ==============================================================================

-- 1. Função utilitária para gerar código de indicação determinístico
CREATE OR REPLACE FUNCTION public.generate_deterministic_referral_code(p_id uuid, p_name text, p_email text)
RETURNS text LANGUAGE plpgsql IMMUTABLE AS $$
DECLARE
  v_first_name text;
  v_id_part text;
  v_code text;
BEGIN
  v_first_name := UPPER(REGEXP_REPLACE(SPLIT_PART(COALESCE(NULLIF(TRIM(p_name), ''), split_part(p_email, '@', 1), 'ALUNO'), ' ', 1), '[^A-Za-z0-9]', '', 'g'));
  IF LENGTH(v_first_name) < 2 THEN
    v_first_name := 'ALUNO';
  END IF;
  v_id_part := UPPER(SUBSTRING(REPLACE(p_id::text, '-', ''), 1, 3));
  v_code := 'MED-' || v_first_name || '-' || v_id_part;
  RETURN v_code;
END;
$$;

-- 2. Atualizar trigger handle_new_user para provisionar referral_code no ato do signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  v_generated_code text;
  v_effective_code text;
  v_collision_count integer;
BEGIN
  v_generated_code := public.generate_deterministic_referral_code(
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.email
  );

  -- Verifica colisão de código (se já existe outro perfil com o mesmo código)
  SELECT COUNT(*) INTO v_collision_count FROM public.profiles WHERE referral_code = v_generated_code AND id <> NEW.id;
  IF v_collision_count > 0 THEN
    v_effective_code := v_generated_code || '-' || UPPER(SUBSTRING(MD5(NEW.id::text), 1, 2));
  ELSE
    v_effective_code := v_generated_code;
  END IF;

  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    specialty_target,
    college,
    graduation_year,
    avatar_url,
    referral_code,
    referred_by_code
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
    ),
    v_effective_code,
    NEW.raw_user_meta_data->>'referred_by_code'
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
    referral_code = COALESCE(
      profiles.referral_code,
      EXCLUDED.referral_code
    ),
    referred_by_code = COALESCE(
      profiles.referred_by_code,
      EXCLUDED.referred_by_code
    ),
    updated_at = NOW();

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Backfill seguro para perfis legados que ainda possuem referral_code nulo
DO $$
DECLARE
  r RECORD;
  v_code text;
  v_collision integer;
BEGIN
  FOR r IN SELECT id, name, email FROM public.profiles WHERE referral_code IS NULL LOOP
    v_code := public.generate_deterministic_referral_code(r.id, r.name, r.email);
    SELECT COUNT(*) INTO v_collision FROM public.profiles WHERE referral_code = v_code AND id <> r.id;
    IF v_collision > 0 THEN
      v_code := v_code || '-' || UPPER(SUBSTRING(MD5(r.id::text), 1, 2));
    END IF;
    UPDATE public.profiles SET referral_code = v_code WHERE id = r.id;
  END LOOP;
END $$;

-- 4. Garantir que administradores tenham acesso de leitura e atualização nas tabelas financeiras de embaixadores
DROP POLICY IF EXISTS "Administradores gerenciam solicitações de saque" ON public.ambassador_withdrawals;
CREATE POLICY "Administradores gerenciam solicitações de saque"
  ON public.ambassador_withdrawals
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

DROP POLICY IF EXISTS "Administradores gerenciam solicitações de reembolso" ON public.ambassador_refund_requests;
CREATE POLICY "Administradores gerenciam solicitações de reembolso"
  ON public.ambassador_refund_requests
  FOR ALL
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
