-- ==============================================================================
-- MIGRAÇÃO 012: PAGAMENTOS, ORDERS E ASSINATURAS MERCADO PAGO
-- Banco Residência Médica
-- ==============================================================================

-- 1. Adicionar colunas de assinatura e garantia na tabela public.profiles se não existirem
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'pro', 'premium')),
  ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'inactive' CHECK (subscription_status IN ('active', 'trialing', 'canceled', 'past_due', 'inactive', 'refunded')),
  ADD COLUMN IF NOT EXISTS subscription_duration TEXT CHECK (subscription_duration IN ('monthly', 'semiannual', 'annual', 'biennial')),
  ADD COLUMN IF NOT EXISTS subscription_started_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS subscription_expires_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS guarantee_expires_at TIMESTAMPTZ;

CREATE INDEX IF NOT EXISTS idx_profiles_subscription_status ON public.profiles(subscription_status);
CREATE INDEX IF NOT EXISTS idx_profiles_subscription_expires ON public.profiles(subscription_expires_at);

-- 2. Criação da Tabela de Ordens / Pagamentos (public.orders)
CREATE TABLE IF NOT EXISTS public.orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  mp_order_id TEXT,
  mp_payment_id TEXT,
  plan_id TEXT NOT NULL CHECK (plan_id IN ('monthly', 'semiannual', 'annual', 'biennial')),
  plan_name TEXT NOT NULL,
  amount NUMERIC(10, 2) NOT NULL,
  currency TEXT DEFAULT 'BRL',
  installments INTEGER DEFAULT 1,
  payment_method TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'approved', 'rejected', 'cancelled', 'refunded')),
  qr_code TEXT,
  qr_code_base64 TEXT,
  ticket_url TEXT,
  refund_id TEXT,
  refund_requested_at TIMESTAMPTZ,
  refunded_at TIMESTAMPTZ,
  guarantee_expires_at TIMESTAMPTZ,
  raw_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices essenciais para consultas de pedidos e webhooks
CREATE INDEX IF NOT EXISTS idx_orders_user_id ON public.orders(user_id);
CREATE INDEX IF NOT EXISTS idx_orders_mp_order_id ON public.orders(mp_order_id);
CREATE INDEX IF NOT EXISTS idx_orders_mp_payment_id ON public.orders(mp_payment_id);
CREATE INDEX IF NOT EXISTS idx_orders_status ON public.orders(status);

-- 3. Habilitação de RLS em public.orders
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Ordens visíveis pelo titular ou admin" ON public.orders;
CREATE POLICY "Ordens visíveis pelo titular ou admin"
  ON public.orders FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id OR public.is_admin());

-- Apenas o service_role / backend tem permissão de escrita direta (INSERT/UPDATE/DELETE)
-- garantindo que o cliente não possa alterar status de pagamento por conta própria.

