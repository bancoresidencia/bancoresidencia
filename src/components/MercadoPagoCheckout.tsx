'use client';

import React, { useState, useEffect } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Check, 
  Sparkles, 
  AlertCircle, 
  Lock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { PlanDefinition, PlanId } from '@/config/plans';
import { useDynamicPlans } from '@/hooks/useDynamicPlans';
import {
  getAppliedReferralCode,
  getUserReferralCode,
  computeDiscountedPlan,
  AppliedReferral
} from '@/config/ambassadorConfig';
import { CheckoutPixForm } from './CheckoutPixForm';
import { CheckoutPlanSummary } from './CheckoutPlanSummary';
import { useCheckoutTracker } from './useCheckoutTracker';
import { CheckoutCardForm } from './CheckoutCardForm';
import { initMercadoPago } from '@mercadopago/sdk-react';
import type { ICardPaymentFormData, ICardPaymentBrickPayer } from '@mercadopago/sdk-react/esm/bricks/cardPayment/type';


interface MercadoPagoCheckoutProps {
  plan: PlanDefinition;
  onBack: () => void;
  onSuccess: () => void;
  appliedReferral?: AppliedReferral | null;
  onCouponChange?: (referral: AppliedReferral | null) => void;
}

type CardPaymentSubmitData = ICardPaymentFormData<ICardPaymentBrickPayer>;


export function MercadoPagoCheckout(props: MercadoPagoCheckoutProps) {
  const { user, isLoading } = useAuth();
  if (isLoading) return <p role="status">Carregando sua conta…</p>;
  if (!user) return <a className="underline" href={`/login?next=${encodeURIComponent('/checkout?plan=' + props.plan.id)}`}>Entrar para continuar o pagamento</a>;
  return <PaymentForm key={user.id + props.plan.id} {...props} />;
}

const PaymentForm: React.FC<MercadoPagoCheckoutProps> = ({
  plan,
  onBack,
  onSuccess,
  appliedReferral: propAppliedReferral,
  onCouponChange
}) => {
  const { user } = useAuth();
  const { mode, accentConfig } = useTheme();

  const currentUserCode = getUserReferralCode(user);
  const [uncontrolledReferral, setUncontrolledReferral] = useState<AppliedReferral | null>(() => {
    return propAppliedReferral !== undefined ? propAppliedReferral : getAppliedReferralCode(currentUserCode, user);
  });

  const { plans } = useDynamicPlans();
  const appliedReferral = propAppliedReferral !== undefined ? propAppliedReferral : uncontrolledReferral;
  // Garante recuperação do plano base un-discounted a partir dos preços dinâmicos vigentes
  const basePlan = plans[plan.id as PlanId] || plan;
  const discountPercent = appliedReferral?.discountPercent || 0;
  const hasDiscount = discountPercent > 0;
  const effectivePlan = hasDiscount
    ? computeDiscountedPlan(basePlan, discountPercent)
    : basePlan;

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de retorno do PIX
  const { trackedId, notice, attemptKey, requestId, track, pixData, setPixData, isPaidSuccess } =
    useCheckoutTracker(plan.id, paymentMethod, appliedReferral?.code || '', setPaymentMethod, setErrorMessage);
  const mpPublicKey = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;

  // Inicializa o Mercado Pago SDK no cliente
  useEffect(() => {
    if (mpPublicKey && typeof window !== 'undefined') {
      try {
        initMercadoPago(mpPublicKey, { locale: 'pt-BR' });
      } catch (e) {
        console.warn('Erro ao inicializar SDK Mercado Pago:', e);
      }
    }
  }, [mpPublicKey]);

  // Gerar PIX
  const handleGeneratePix = async (cpf: string) => {
    const rawCpf = cpf.replace(/\D/g, '');
    if (rawCpf.length !== 11) {
      setErrorMessage('Por favor, informe um CPF válido com 11 dígitos para emissão do PIX.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const clientRequestId = requestId();

      const response = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          couponCode: appliedReferral?.code || undefined,
          clientRequestId,
          paymentData: {
            payment_method_id: 'pix',
            payer: {
              email: user?.email,
              first_name: user?.name?.split(' ')[0] || 'Dr(a).',
              last_name: user?.name?.split(' ').slice(1).join(' ') || 'Residente',
              identification: {
                type: 'CPF',
                number: rawCpf
              }
            }
          }
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.resetAttempt) sessionStorage.removeItem(attemptKey);
        throw new Error(data.error || 'Falha ao gerar cobrança PIX.');
      }

      if (!data.paymentId) throw new Error('Pagamento sem confirmação.');
      track(data.paymentId);
      if (data.pix?.qrCode || data.pix?.qrCodeBase64) setPixData(data.pix);

    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar PIX.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Processar Pagamento Seguro com Cartão de Crédito via CardPayment Brick
  const handleCardSubmit = async (cardFormData: CardPaymentSubmitData) => {
    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          couponCode: appliedReferral?.code || undefined,
          clientRequestId: requestId(),
          paymentData: {
            payment_method_id: cardFormData.payment_method_id,
            token: cardFormData.token,
            installments: cardFormData.installments,
            issuer_id: cardFormData.issuer_id,
            payer: {
              email: cardFormData.payer?.email || user?.email,
              first_name: (user?.name as string | undefined)?.split(' ')[0] || 'Dr(a).',
              last_name: (user?.name as string | undefined)?.split(' ').slice(1).join(' ') || 'Titular',
              identification: cardFormData.payer?.identification
            }
          }
        })
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        if (data.resetAttempt) sessionStorage.removeItem(attemptKey);
        throw new Error(data.error || 'Não foi possível autorizar o cartão.');
      }

      if (['approved', 'in_process', 'pending', 'authorized'].includes(data.status)) {
        track(data.paymentId);
      } else {
        sessionStorage.removeItem(attemptKey);
        const rejectReason =
          data.statusDetail === 'cc_rejected_bad_filled_security_code'
            ? 'Código de segurança (CVV) inválido.'
            : data.statusDetail === 'cc_rejected_bad_filled_date'
            ? 'Data de validade incorreta.'
            : data.statusDetail === 'cc_rejected_insufficient_amount'
            ? 'Saldo ou limite insuficiente no cartão.'
            : data.statusDetail === 'cc_rejected_call_for_authorize'
            ? 'Transação não autorizada. Ligue para a operadora do seu cartão.'
            : data.statusDetail === 'cc_rejected_card_disabled'
            ? 'Cartão desabilitado. Entre em contato com seu banco.'
            : (data.statusDetail || data.status || 'Cartão recusado pelo banco emissor.');
        setErrorMessage(`Não foi possível aprovar a transação: ${rejectReason}`);
      }
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha ao processar pagamento com cartão.');
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  };

  // TELA DE SUCESSO
  if (isPaidSuccess) {
    return (
      <div className="py-8 px-4 text-center max-w-lg mx-auto animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 rounded-full bg-emerald-500/20 text-emerald-500 mx-auto flex items-center justify-center mb-5 ring-8 ring-emerald-500/10">
          <Check className="w-8 h-8 stroke-[3]" />
        </div>
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Acesso Liberado Imediatamente
        </div>
        <h3 className="text-2xl font-black text-slate-900 dark:text-white">
          Parabéns, Dr(a). {user?.name?.split(' ')[0]}!
        </h3>
        <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
          Sua assinatura do <strong>{plan.name}</strong> está ativa. Você agora tem acesso ilimitado a todas as 133k+ questões, TRI e provas oficiais.
        </p>

        <div className="my-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 text-left text-xs text-slate-600 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-slate-800 dark:text-slate-200">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            Garantia Incondicional de 7 Dias Ativada
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Você tem 7 dias para testar à vontade. Caso não atenda às suas expectativas, solicite o reembolso com 1 clique na sua área de perfil.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            onSuccess();
          }}
          className="w-full py-3.5 rounded-2xl font-bold text-sm text-white shadow-xl transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
          style={{ backgroundColor: accentConfig.primaryHex }}
        >
          <Sparkles className="w-4 h-4" />
          Começar a Estudar Agora
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <CheckoutPlanSummary basePlan={basePlan} effectivePlan={effectivePlan} appliedReferral={appliedReferral}
        onCouponChange={onCouponChange || setUncontrolledReferral} onBack={onBack} />

      {/* Seletor de Meio de Pagamento */}
      <div className="grid grid-cols-2 gap-2.5 sm:gap-3">
        <button
          type="button"
          disabled={Boolean(trackedId) || isSubmitting}
          onClick={() => {
            setPaymentMethod('pix');
            setErrorMessage(null);
          }}
          className={`py-3 px-2.5 sm:px-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2.5 transition-all touch-manipulation cursor-pointer ${
            paymentMethod === 'pix'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <QrCode className="w-4 h-4 shrink-0" />
          <span className="truncate">PIX (Imediato)</span>
        </button>

        <button
          type="button"
          disabled={Boolean(trackedId) || isSubmitting}
          onClick={() => {
            setPaymentMethod('card');
            setErrorMessage(null);
          }}
          className={`py-3 px-2.5 sm:px-4 rounded-2xl border text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 sm:gap-2.5 transition-all touch-manipulation cursor-pointer ${
            paymentMethod === 'card'
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <CreditCard className="w-4 h-4 shrink-0" />
          <span className="truncate">Cartão<span className="hidden xs:inline"> de Crédito</span></span>
        </button>
      </div>

      {trackedId && <p role="status">{notice || 'Consultando pagamento…'}</p>}
      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {paymentMethod === 'pix' && (!trackedId || pixData) && (
        <CheckoutPixForm pixData={pixData} isSubmitting={isSubmitting} generate={handleGeneratePix} />
      )}

      {/* FLUXO CARTÃO DE CRÉDITO COM CARDPAYMENT BRICK OFICIAL (PCI-DSS COMPLIANT) */}
      {!trackedId && paymentMethod === 'card' && (
        <div className="space-y-4">
          {mpPublicKey ? (
            <div className="bg-slate-50/70 dark:bg-slate-950/60 p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2 mb-3 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Lock className="w-3.5 h-3.5 text-emerald-500" />
                <span>Dados do Cartão Criptografados de Ponta a Ponta (PCI-DSS Nível 1)</span>
              </div>
              <CheckoutCardForm key={effectivePlan.totalPrice + mode} amount={effectivePlan.totalPrice} email={user?.email}
                maxInstallments={effectivePlan.maxInstallments} dark={mode === 'dark'} color={accentConfig.primaryHex} onSubmit={handleCardSubmit} />
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>Chave pública do Mercado Pago não configurada no ambiente.</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
