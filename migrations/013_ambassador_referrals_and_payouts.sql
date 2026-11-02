-- ==============================================================================
-- MIGRAÇÃO 013: PROGRAMA DE EMBAIXADORES, INDICAÇÕES E SAQUES PIX
-- Banco Residência Médica
-- ==============================================================================

-- 1. Adicionar colunas de código de indicação no perfil do aluno
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
  ADD COLUMN IF NOT EXISTS referred_by_code TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS idx_profiles_referred_by_code ON public.profiles(referred_by_code);

-- 2. Tabela de Indicações de Embaixadores (public.ambassador_referrals)
-- Regra de Negócio: O valor só é contabilizado e liberado para saque se o indicado
-- permanecer ativo por pelo menos 7 dias (período de garantia e permanência CDC).
CREATE TABLE IF NOT EXISTS public.ambassador_referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  student_name TEXT NOT NULL,
  student_email_masked TEXT NOT NULL,
  plan_name TEXT NOT NULL,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('monthly', 'semiannual', 'annual', 'biennial')),
  plan_amount NUMERIC(10, 2) NOT NULL,
  discount_applied NUMERIC(10, 2) NOT NULL DEFAULT 0,
  net_amount NUMERIC(10, 2) NOT NULL,
  commission_percent NUMERIC(5, 2) NOT NULL DEFAULT 15.00,
  commission_amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'refunded', 'cancelled')),
  retention_days INTEGER NOT NULL DEFAULT 7,
  confirmed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  matures_at TIMESTAMPTZ NOT NULL DEFAULT (NOW() + INTERVAL '7 days'),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_referrer_id ON public.ambassador_referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_referral_code ON public.ambassador_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_status ON public.ambassador_referrals(status);
CREATE INDEX IF NOT EXISTS idx_ambassador_referrals_matures_at ON public.ambassador_referrals(matures_at);

-- 3. Tabela de Solicitações de Saque PIX (public.ambassador_withdrawals)
-- Regra de Negócio: Desbloqueado exclusivamente ao atingir no mínimo 3 indicações
-- válidas que completaram os 7 dias de permanência.
CREATE TABLE IF NOT EXISTS public.ambassador_withdrawals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount NUMERIC(10, 2) NOT NULL,
  pix_key TEXT NOT NULL,
  pix_key_type TEXT NOT NULL CHECK (pix_key_type IN ('cpf', 'email', 'phone', 'random')),
  valid_referrals_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'rejected')),
  receipt_url TEXT,
  admin_notes TEXT,
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ambassador_withdrawals_user_id ON public.ambassador_withdrawals(user_id);
CREATE INDEX IF NOT EXISTS idx_ambassador_withdrawals_status ON public.ambassador_withdrawals(status);

-- 4. Tabela de Reembolso Total do Plano Conquistado (public.ambassador_refund_requests)
-- Regra de Negócio: Ao atingir 10 indicações válidas de 7+ dias, o aluno conquista o
-- Selo de Embaixador Oficial e tem direito ao estorno integral do plano contratado.
CREATE TABLE IF NOT EXISTS public.ambassador_refund_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  valid_referrals_count INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  requested_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ambassador_refund_requests_user ON public.ambassador_refund_requests(user_id);

-- 5. Row Level Security (RLS)
ALTER TABLE public.ambassador_referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_withdrawals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ambassador_refund_requests ENABLE ROW LEVEL SECURITY;

-- Políticas para ambassador_referrals
DROP POLICY IF EXISTS "Embaixador visualiza suas próprias indicações" ON public.ambassador_referrals;
CREATE POLICY "Embaixador visualiza suas próprias indicações"
  ON public.ambassador_referrals FOR SELECT
  TO authenticated
  USING (referrer_id = auth.uid() OR public.is_admin());

-- Políticas para ambassador_withdrawals
DROP POLICY IF EXISTS "Usuário visualiza seus saques solicitados" ON public.ambassador_withdrawals;
CREATE POLICY "Usuário visualiza seus saques solicitados"
  ON public.ambassador_withdrawals FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Usuário insere solicitação de saque" ON public.ambassador_withdrawals;
CREATE POLICY "Usuário insere solicitação de saque"
  ON public.ambassador_withdrawals FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Políticas para ambassador_refund_requests
DROP POLICY IF EXISTS "Usuário visualiza suas solicitações de reembolso de plano" ON public.ambassador_refund_requests;
CREATE POLICY "Usuário visualiza suas solicitações de reembolso de plano"
  ON public.ambassador_refund_requests FOR SELECT
  TO authenticated
  USING (user_id = auth.uid() OR public.is_admin());

DROP POLICY IF EXISTS "Usuário insere solicitação de reembolso de plano" ON public.ambassador_refund_requests;
CREATE POLICY "Usuário insere solicitação de reembolso de plano"
  ON public.ambassador_refund_requests FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
