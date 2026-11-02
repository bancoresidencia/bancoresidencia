'use client';

import React, { useState, useEffect, useRef } from 'react';
import { 
  ShieldCheck, 
  QrCode, 
  CreditCard, 
  Copy, 
  Check, 
  Loader2, 
  Sparkles, 
  AlertCircle, 
  ArrowLeft,
  Clock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { PlanDefinition, PlanId, PLANS } from '@/config/plans';
import {
  getAppliedReferralCode,
  applyReferralCode,
  removeAppliedReferralCode,
  getUserReferralCode,
  computeDiscountedPlan,
  AppliedReferral
} from '@/config/ambassadorConfig';
import { Tag, Gift, ArrowRight } from 'lucide-react';
import { initMercadoPago } from '@mercadopago/sdk-react';

interface MercadoPagoCheckoutProps {
  plan: PlanDefinition;
  onBack: () => void;
  onSuccess: () => void;
  appliedReferral?: AppliedReferral | null;
  onCouponChange?: (referral: AppliedReferral | null) => void;
}

export const MercadoPagoCheckout: React.FC<MercadoPagoCheckoutProps> = ({
  plan,
  onBack,
  onSuccess,
  appliedReferral: propAppliedReferral,
  onCouponChange
}) => {
  const { user, refreshUser } = useAuth();
  const { accentConfig } = useTheme();

  const currentUserCode = getUserReferralCode(user);
  const [uncontrolledReferral, setUncontrolledReferral] = useState<AppliedReferral | null>(() => {
    return propAppliedReferral !== undefined ? propAppliedReferral : getAppliedReferralCode(currentUserCode, user);
  });

  const appliedReferral = propAppliedReferral !== undefined ? propAppliedReferral : uncontrolledReferral;
  const [couponInput, setCouponInput] = useState('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Garante recuperação do plano base un-discounted para nunca aplicar desconto em dobro
  const basePlan = PLANS[plan.id as PlanId] || plan;
  const discountPercent = appliedReferral?.discountPercent || 0;
  const hasDiscount = discountPercent > 0;
  const effectivePlan = hasDiscount
    ? computeDiscountedPlan(basePlan, discountPercent)
    : basePlan;

  // Aplica cupom de desconto
  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponFeedback(null);
    if (!couponInput.trim()) {
      setCouponFeedback({ type: 'error', text: 'Informe um código de cupom ou indicação válido.' });
      return;
    }

    setIsApplyingCoupon(true);
    try {
      const res = applyReferralCode(couponInput, currentUserCode, user?.id, user);
      if (res.success && res.referral) {
        if (onCouponChange) {
          onCouponChange(res.referral);
        } else {
          setUncontrolledReferral(res.referral);
        }
        setUncontrolledReferral(res.referral);
        setCouponFeedback({
          type: 'success',
          text: `Cupom ${res.referral.code} aplicado com sucesso! ${res.referral.discountPercent}% de desconto ativado.`
        });
        setCouponInput('');
      } else {
        setCouponFeedback({ type: 'error', text: res.message });
      }
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  // Remove cupom de desconto
  const handleRemoveCoupon = () => {
    removeAppliedReferralCode();
    if (onCouponChange) {
      onCouponChange(null);
    } else {
      setUncontrolledReferral(null);
    }
    setUncontrolledReferral(null);
    setCouponFeedback({ type: 'success', text: 'Cupom removido.' });
  };

  const [paymentMethod, setPaymentMethod] = useState<'pix' | 'card'>('pix');
  const [cpf, setCpf] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Estados de retorno do PIX
  const [pixData, setPixData] = useState<{
    qrCode?: string;
    qrCodeBase64?: string;
    ticketUrl?: string;
    paymentId?: string;
  } | null>(null);
  const [copiedPix, setCopiedPix] = useState(false);
  const [isPaidSuccess, setIsPaidSuccess] = useState(false);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Estados do formulário de Cartão de Crédito
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [installments, setInstallments] = useState<number>(plan.maxInstallments);

  // Inicializa o Mercado Pago SDK no cliente
  useEffect(() => {
    const pk = process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY;
    if (pk && typeof window !== 'undefined') {
      try {
        initMercadoPago(pk, { locale: 'pt-BR' });
      } catch (e) {
        console.warn('Erro ao inicializar SDK Mercado Pago:', e);
      }
    }
  }, []);

  // Polling para checagem automática do PIX
  useEffect(() => {
    if (!pixData?.paymentId || isPaidSuccess) return;

    pollingIntervalRef.current = setInterval(async () => {
      try {
        const res = await fetch(`/api/checkout/status?paymentId=${pixData.paymentId}`);
        const data = await res.json();
        if (data.isApproved) {
          setIsPaidSuccess(true);
          if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
          await refreshUser();
        }
      } catch (err) {
        console.error('Erro no polling do PIX:', err);
      }
    }, 3500);

    return () => {
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [pixData?.paymentId, isPaidSuccess, refreshUser]);

  // Formatação de CPF
  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '');
    if (val.length > 11) val = val.slice(0, 11);
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d)/, '$1.$2');
    val = val.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    setCpf(val);
  };

  // Formatação de Cartão
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 16);
    val = val.replace(/(\d{4})(?=\d)/g, '$1 ');
    setCardNumber(val);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = `${val.slice(0, 2)}/${val.slice(2)}`;
    }
    setCardExpiry(val);
  };

  // Gerar PIX
  const handleGeneratePix = async () => {
    const rawCpf = cpf.replace(/\D/g, '');
    if (rawCpf.length !== 11) {
      setErrorMessage('Por favor, informe um CPF válido com 11 dígitos para emissão do PIX.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          couponCode: appliedReferral?.code || undefined,
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
        throw new Error(data.error || 'Falha ao gerar cobrança PIX.');
      }

      setPixData({
        qrCode: data.pix?.qrCode,
        qrCodeBase64: data.pix?.qrCodeBase64,
        ticketUrl: data.pix?.ticketUrl,
        paymentId: data.paymentId
      });

      if (data.status === 'approved') {
        setIsPaidSuccess(true);
        await refreshUser();
      }

    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Erro ao processar PIX.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Copiar código PIX
  const handleCopyPix = () => {
    if (pixData?.qrCode) {
      navigator.clipboard.writeText(pixData.qrCode);
      setCopiedPix(true);
      setTimeout(() => setCopiedPix(false), 3000);
    }
  };

  // Processar Cartão de Crédito
  const handleCardPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    const rawCpf = cpf.replace(/\D/g, '');
    const cleanCard = cardNumber.replace(/\D/g, '');

    if (cleanCard.length < 15) {
      setErrorMessage('Informe um número de cartão de crédito válido.');
      return;
    }
    if (!cardHolder.trim()) {
      setErrorMessage('Informe o nome impresso no cartão.');
      return;
    }
    if (cardExpiry.length < 5) {
      setErrorMessage('Informe a data de validade (MM/AA).');
      return;
    }
    if (cardCvv.length < 3) {
      setErrorMessage('Informe o código de segurança (CVV).');
      return;
    }
    if (rawCpf.length !== 11) {
      setErrorMessage('Informe um CPF válido para o titular.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const [expMonth, expYear] = cardExpiry.split('/');
      const fullYear = expYear.length === 2 ? `20${expYear}` : expYear;

      // Criação de token transparente via Mercado Pago JS SDK
      let cardToken = '';
      if (typeof window !== 'undefined' && (window as unknown as { MercadoPago: unknown }).MercadoPago) {
        const mpInstance = new ((window as unknown as { MercadoPago: new (key: string) => {
          createCardToken: (params: Record<string, unknown>) => Promise<{ id: string }>
        } }).MercadoPago)(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || '');

        const tokenResult = await mpInstance.createCardToken({
          cardNumber: cleanCard,
          cardholderName: cardHolder,
          cardExpirationMonth: expMonth,
          cardExpirationYear: fullYear,
          securityCode: cardCvv,
          identificationType: 'CPF',
          identificationNumber: rawCpf
        });

        cardToken = tokenResult.id;
      }

      // Envia cobrança para o backend
      const response = await fetch('/api/checkout/process-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          couponCode: appliedReferral?.code || undefined,
          paymentData: {
            payment_method_id: 'credit_card',
            token: cardToken || 'token_sandbox_direct',
            installments: Number(installments),
            payer: {
              email: user?.email,
              first_name: cardHolder.split(' ')[0],
              last_name: cardHolder.split(' ').slice(1).join(' ') || 'Titular',
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
        throw new Error(data.error || 'Não foi possível autorizar o cartão.');
      }

      if (data.status === 'approved') {
        setIsPaidSuccess(true);
        await refreshUser();
      } else {
        setErrorMessage(`Pagamento pendente de análise (${data.statusDetail || data.status}).`);
      }

    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Falha ao processar pagamento com cartão.');
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
      {/* Botão Voltar e Resumo do Plano */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Trocar de Plano
        </button>
        <div className="text-right">
          <div className="text-xs text-slate-400">Plano Selecionado</div>
          <div className="text-sm font-black text-slate-900 dark:text-white">{plan.name}</div>
        </div>
      </div>

      {/* Caixa de Resumo de Valor e Garantia */}
      <div className="p-4 rounded-2xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-900/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
              Total a ser pago
            </span>
            {hasDiscount && (
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                {discountPercent}% OFF
              </span>
            )}
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
            R$ {effectivePlan.totalPrice.toFixed(2).replace('.', ',')}
            {hasDiscount && (
              <span className="text-xs font-semibold text-slate-400 line-through ml-2">
                R$ {basePlan.totalPrice.toFixed(2).replace('.', ',')}
              </span>
            )}
            {effectivePlan.maxInstallments > 1 && (
              <span className="text-xs font-normal text-slate-500 ml-2">
                (em até {effectivePlan.maxInstallments}x de R$ {effectivePlan.installmentValue.toFixed(2).replace('.', ',')})
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-xl shrink-0">
          <ShieldCheck className="w-4 h-4" />
          Garantia 7 dias
        </div>
      </div>

      {/* SEÇÃO DINÂMICA DE CUPOM DE DESCONTO / CÓDIGO DE INDICAÇÃO */}
      {appliedReferral ? (
        <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/40 flex items-center justify-between gap-3 shadow-xs animate-in zoom-in-95">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow-sm">
              <Gift className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-mono font-black text-xs sm:text-sm text-emerald-700 dark:text-emerald-300 tracking-wider">
                  {appliedReferral.code}
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                  {appliedReferral.discountPercent}% OFF Aplicado
                </span>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 truncate mt-0.5">
                Cupom de <strong>{appliedReferral.referrerName}</strong>. Desconto aplicado no total!
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleRemoveCoupon}
            className="text-xs font-bold text-slate-500 hover:text-rose-500 underline transition-colors shrink-0 cursor-pointer"
          >
            Remover cupom
          </button>
        </div>
      ) : (
        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-zinc-900/60 border border-slate-200/90 dark:border-zinc-800">
          <div className="flex items-center gap-2 mb-2">
            <Tag className="w-4 h-4 text-amber-500 shrink-0" />
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
              Tem um cupom de desconto ou código de indicação?
            </span>
          </div>
          <form onSubmit={handleApplyCoupon} className="flex gap-2">
            <input
              type="text"
              value={couponInput}
              onChange={(e) => {
                setCouponInput(e.target.value.toUpperCase());
                setCouponFeedback(null);
              }}
              placeholder="Digite o cupom (ex: RESIDENCIA10)"
              className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={!couponInput.trim() || isApplyingCoupon}
              className="px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-sm transition-all hover:opacity-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5 cursor-pointer shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {isApplyingCoupon ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <>
                  <span>Aplicar</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {couponFeedback && (
            <div
              className={`mt-2 p-2.5 rounded-xl text-xs flex items-center gap-2 ${
                couponFeedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {couponFeedback.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{couponFeedback.text}</span>
            </div>
          )}
        </div>
      )}

      {/* Seletor de Meio de Pagamento */}
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={() => {
            setPaymentMethod('pix');
            setErrorMessage(null);
          }}
          className={`py-3 px-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
            paymentMethod === 'pix'
              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <QrCode className="w-4 h-4" />
          PIX (Imediato)
        </button>

        <button
          type="button"
          onClick={() => {
            setPaymentMethod('card');
            setErrorMessage(null);
          }}
          className={`py-3 px-4 rounded-2xl border text-sm font-bold flex items-center justify-center gap-2.5 transition-all ${
            paymentMethod === 'card'
              ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 shadow-sm'
              : 'border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/40'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          Cartão de Crédito
        </button>
      </div>

      {errorMessage && (
        <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* FLUXO PIX */}
      {paymentMethod === 'pix' && (
        <div className="space-y-4">
          {!pixData ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                  CPF do Titular (Exigido pelo Banco Central para PIX)
                </label>
                <input
                  type="text"
                  placeholder="000.000.000-00"
                  value={cpf}
                  onChange={handleCpfChange}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="text-xs text-slate-500 space-y-1">
                <p>• O código PIX tem validade de 30 minutos.</p>
                <p>• A aprovação é imediata e libera todas as questões automaticamente.</p>
              </div>

              <button
                type="button"
                onClick={handleGeneratePix}
                disabled={isSubmitting}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Gerando QR Code Oficial...
                  </>
                ) : (
                  <>
                    <QrCode className="w-4 h-4" />
                    Gerar Código PIX
                  </>
                )}
              </button>
            </div>
          ) : (
            <div className="p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/60 text-center space-y-4">
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                Aguardando Pagamento no seu App do Banco...
              </div>

              {/* QR Code Imagem */}
              {pixData.qrCodeBase64 && (
                <div className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-200">
                  <img
                    src={`data:image/png;base64,${pixData.qrCodeBase64}`}
                    alt="QR Code PIX Banco Residência"
                    className="w-48 h-48 mx-auto"
                  />
                </div>
              )}

              {/* Código Copia e Cola */}
              {pixData.qrCode && (
                <div className="space-y-2 text-left">
                  <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                    Código PIX Copia e Cola
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      readOnly
                      value={pixData.qrCode}
                      className="w-full px-3 py-2 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-700 dark:text-slate-300 truncate"
                    />
                    <button
                      type="button"
                      onClick={handleCopyPix}
                      className="px-4 py-2 rounded-xl bg-slate-900 dark:bg-white text-white dark:text-slate-900 text-xs font-bold flex items-center gap-1.5 shrink-0 hover:opacity-90"
                    >
                      {copiedPix ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400 dark:text-emerald-600" />
                          Copiado!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          Copiar
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              <div className="flex items-center justify-center gap-2 text-[11px] text-slate-400">
                <Clock className="w-3.5 h-3.5" />
                <span>O sistema reconhecerá o pagamento em tempo real sem precisar recarregar.</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* FLUXO CARTÃO DE CRÉDITO */}
      {paymentMethod === 'card' && (
        <form onSubmit={handleCardPayment} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Número do Cartão
            </label>
            <input
              type="text"
              placeholder="0000 0000 0000 0000"
              value={cardNumber}
              onChange={handleCardNumberChange}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
              Nome Impresso no Cartão
            </label>
            <input
              type="text"
              placeholder="Ex: LUCAS ROCHA"
              value={cardHolder}
              onChange={(e) => setCardHolder(e.target.value.toUpperCase())}
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Validade (MM/AA)
              </label>
              <input
                type="text"
                placeholder="12/28"
                value={cardExpiry}
                onChange={handleExpiryChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                CVV
              </label>
              <input
                type="password"
                maxLength={4}
                placeholder="123"
                value={cardCvv}
                onChange={(e) => setCardCvv(e.target.value.replace(/\D/g, ''))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                CPF do Titular
              </label>
              <input
                type="text"
                placeholder="000.000.000-00"
                value={cpf}
                onChange={handleCpfChange}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Parcelamento
              </label>
              <select
                value={installments}
                onChange={(e) => setInstallments(Number(e.target.value))}
                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {Array.from({ length: effectivePlan.maxInstallments }, (_, i) => i + 1).map((qty) => {
                  const val = effectivePlan.totalPrice / qty;
                  return (
                    <option key={qty} value={qty}>
                      {qty}x de R$ {val.toFixed(2).replace('.', ',')}
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-xl font-bold text-sm text-white shadow-lg transition-transform hover:scale-[1.01] flex items-center justify-center gap-2"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Processando Transação Segura...
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4" />
                Confirmar Assinatura (R$ {plan.totalPrice.toFixed(2).replace('.', ',')})
              </>
            )}
          </button>
        </form>
      )}
    </div>
  );
};

