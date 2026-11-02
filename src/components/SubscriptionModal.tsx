'use client';

import React, { useState } from 'react';
import {
  X,
  Check,
  Sparkles,
  Zap,
  ShieldCheck,
  AlertCircle,
  Gift,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useAuth as useUserAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { PlanType } from '@/hooks/useSubscription';
import { PLANS, PlanDefinition } from '@/config/plans';
import { MercadoPagoCheckout } from '@/components/MercadoPagoCheckout';
import {
  getAppliedReferralCode,
  applyReferralCode,
  removeAppliedReferralCode,
  getUserReferralCode,
  AppliedReferral
} from '@/config/ambassadorConfig';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: PlanType;
  initialPlan?: PlanDefinition | null;
  limitReached?: boolean;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  initialPlan = null,
  limitReached = false
}) => {
  const { user } = useUserAuth();
  const { accentConfig } = useTheme();
  const [selectedPlanOverride, setSelectedPlanOverride] = useState<PlanDefinition | null | 'NONE'>(null);

  const currentUserCode = getUserReferralCode(user);

  // Estado de Cupom de Indicação
  const [appliedReferral, setAppliedReferral] = useState<AppliedReferral | null>(() => getAppliedReferralCode(currentUserCode, user));
  const [couponInput, setCouponInput] = useState<string>('');
  const [couponFeedback, setCouponFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [prevIsOpen, setPrevIsOpen] = useState(isOpen);

  if (isOpen !== prevIsOpen) {
    setPrevIsOpen(isOpen);
    if (isOpen) {
      setAppliedReferral(getAppliedReferralCode(currentUserCode, user));
      setCouponFeedback(null);
    }
  }

  if (!isOpen) return null;

  const handleApplyCoupon = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setCouponFeedback(null);
    if (!couponInput.trim()) {
      setCouponFeedback({ type: 'error', text: 'Informe um código de indicação válido.' });
      return;
    }

    const res = applyReferralCode(couponInput, currentUserCode, user?.id, user);
    if (res.success && res.referral) {
      setAppliedReferral(res.referral);
      setCouponFeedback({ type: 'success', text: `Cupom ${res.referral.code} aplicado com sucesso! 10% de desconto ativado.` });
      setCouponInput('');
    } else {
      setCouponFeedback({ type: 'error', text: res.message });
    }
  };

  const handleRemoveCoupon = () => {
    removeAppliedReferralCode();
    setAppliedReferral(null);
    setCouponFeedback({ type: 'success', text: 'Cupom de indicação removido.' });
  };

  const discountPercent = appliedReferral ? appliedReferral.discountPercent : 0;
  const hasDiscount = discountPercent > 0;

  // Aplica o desconto proporcional no plano escolhido para o Checkout apenas se houver cupom
  const computeDiscountedPlan = (basePlan: PlanDefinition): PlanDefinition => {
    if (!hasDiscount) return basePlan;
    const discountFactor = 1 - discountPercent / 100;
    const discountedTotal = parseFloat((basePlan.totalPrice * discountFactor).toFixed(2));
    const discountedMonthly = parseFloat((basePlan.monthlyEquivalent * discountFactor).toFixed(2));
    const discountedInstallment = parseFloat((discountedTotal / basePlan.maxInstallments).toFixed(2));

    return {
      ...basePlan,
      totalPrice: discountedTotal,
      monthlyEquivalent: discountedMonthly,
      installmentValue: discountedInstallment
    };
  };

  const rawSelectedPlan = selectedPlanOverride === 'NONE'
    ? null
    : (selectedPlanOverride || initialPlan || null);

  const selectedPlanForCheckout = rawSelectedPlan ? computeDiscountedPlan(rawSelectedPlan) : null;

  const planList = [
    PLANS.biennial,
    PLANS.annual,
    PLANS.semiannual,
    PLANS.monthly
  ];

  const handleClose = () => {
    setSelectedPlanOverride(null);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md animate-in fade-in"
      onClick={handleClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-5 sm:p-8 max-h-[94vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={handleClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-10 cursor-pointer"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {limitReached && !selectedPlanForCheckout && (
          <div className="mb-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center gap-3 text-amber-700 dark:text-amber-400 text-xs font-semibold animate-in slide-in-from-top-2">
            <AlertCircle className="w-5 h-5 shrink-0 text-amber-500" />
            <div>
              <strong>Limite Diário Atingido:</strong> Você resolveu suas 10 questões gratuitas de hoje. Escolha um plano abaixo para ter resolução ilimitada, gabaritos comentados padrão-ouro e métricas TRI calibradas!
            </div>
          </div>
        )}

        {selectedPlanForCheckout ? (
          /* TELA DO CHECKOUT TRANSPARENTE MERCADO PAGO */
          <div className="max-w-2xl mx-auto py-2">
            <MercadoPagoCheckout
              plan={selectedPlanForCheckout}
              onBack={() => setSelectedPlanOverride('NONE')}
              onSuccess={() => {
                setSelectedPlanOverride(null);
                onClose();
              }}
            />
          </div>
        ) : (
          /* GRADE DE PLANOS COM CUPOM DE INDICAÇÃO DINÂMICO */
          <>
            {/* Cabeçalho */}
            <div className="text-center max-w-2xl mx-auto mb-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-xs font-bold mb-3 border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5" />
                Planos de Preparação Médica de Alto Rendimento 2026 / 2027
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                Acelere sua aprovação na residência médica
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-2">
                133k+ questões classificadas, psicometria TRI, gabaritos comentados cirúrgicos e provas na íntegra.
              </p>
            </div>

            {/* SEÇÃO DINÂMICA DE CÓDIGO DE INDICAÇÃO & DESCONTO 10% */}
            <div className="max-w-xl mx-auto mb-8">
              {appliedReferral ? (
                <div className="p-3.5 sm:p-4 rounded-2xl bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border-2 border-emerald-500/40 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-sm animate-in zoom-in-95">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow">
                      <Gift className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-black text-sm text-emerald-700 dark:text-emerald-300 tracking-wider">
                          {appliedReferral.code}
                        </span>
                        <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shadow-xs">
                          10% OFF Aplicado
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
                        Indicação de <strong>{appliedReferral.referrerName}</strong>. Desconto aplicado nos valores abaixo!
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleRemoveCoupon}
                    className="text-xs font-bold text-slate-500 hover:text-rose-500 underline transition-colors shrink-0 cursor-pointer"
                  >
                    Remover código
                  </button>
                </div>
              ) : (
                <div className="p-3 sm:p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2 mb-2">
                    <Tag className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                      Tem um código de indicação de colega ou embaixador?
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
                      placeholder="Digite o código (ex: MED-LUCAS-10)"
                      className="flex-1 px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-mono font-bold uppercase tracking-wider text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl text-xs font-extrabold text-white shadow-sm transition-all hover:opacity-95 flex items-center gap-1.5 cursor-pointer shrink-0"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      <span>Aplicar 10% OFF</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </form>
                </div>
              )}

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

            {/* GRADE DOS 4 PLANOS COM ESPAÇAMENTO REFORÇADO (SEM COBRIR NOME DO PLANO) */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {planList.map((plan) => {
                const isBiennial = plan.id === 'biennial';
                const isAnnual = plan.id === 'annual';
                const isHighlighted = isAnnual || isBiennial;

                // Valores originais
                const origTotal = plan.totalPrice;
                const origMonthly = plan.monthlyEquivalent;
                const origInstallment = plan.installmentValue;

                // Valores com 10% de desconto APENAS se cupom aplicado
                const discountFactor = 1 - discountPercent / 100;
                const discTotal = hasDiscount ? parseFloat((origTotal * discountFactor).toFixed(2)) : origTotal;
                const discMonthly = hasDiscount ? parseFloat((origMonthly * discountFactor).toFixed(2)) : origMonthly;
                const discInstallment = hasDiscount ? parseFloat((discTotal / plan.maxInstallments).toFixed(2)) : origInstallment;

                return (
                  <div
                    key={plan.id}
                    className={`flex flex-col pt-8 sm:pt-9 pb-5 px-5 rounded-3xl border transition-all relative ${
                      isHighlighted
                        ? 'border-2 shadow-xl bg-slate-900 text-white dark:bg-slate-950 ring-1 ring-white/10'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 text-slate-900 dark:text-white'
                    }`}
                    style={isHighlighted ? { borderColor: accentConfig.primaryHex } : {}}
                  >
                    {/* Badge com whitespace-nowrap e posicionamento elevado que NUNCA quebra em 2 linhas */}
                    {plan.badge && (
                      <div
                        className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[9.5px] sm:text-[10px] font-black uppercase tracking-wider text-white shadow-md whitespace-nowrap z-20 pointer-events-none select-none"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        {plan.badge}
                      </div>
                    )}

                    <div className="mb-4">
                      <div className="flex items-center justify-between gap-2 min-h-[44px]">
                        <h3 className={`text-base font-black ${isHighlighted ? 'text-white' : 'text-slate-900 dark:text-slate-100'}`}>
                          {plan.name}
                        </h3>
                        {hasDiscount && (
                          <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500 text-white shrink-0">
                            -10%
                          </span>
                        )}
                      </div>

                      {/* Equivalência Mensal */}
                      <div className="mt-2.5">
                        {hasDiscount && (
                          <div className="text-[11px] line-through text-slate-400 font-medium">
                            De R$ {origMonthly.toFixed(2).replace('.', ',')}/mês
                          </div>
                        )}
                        <div className="flex items-baseline gap-1">
                          <span className="text-xs text-slate-400 font-bold">R$ </span>
                          <span className={`text-3xl font-black tracking-tight ${hasDiscount ? 'text-emerald-400' : ''}`}>
                            {discMonthly.toFixed(2).replace('.', ',')}
                          </span>
                          <span className="text-xs text-slate-400">/mês</span>
                        </div>
                      </div>

                      {/* Parcelamento e Preço Total */}
                      <div className="text-[11px] text-slate-400 mt-1">
                        {plan.maxInstallments > 1 ? (
                          <>
                            {hasDiscount ? (
                              <div className="font-bold text-emerald-400">
                                {plan.maxInstallments}x de R$ {discInstallment.toFixed(2).replace('.', ',')}
                              </div>
                            ) : (
                              <div>
                                {plan.maxInstallments}x de R$ {origInstallment.toFixed(2).replace('.', ',')}
                              </div>
                            )}
                            <div className="text-[10px] mt-0.5">
                              {hasDiscount ? (
                                <span>
                                  <span className="line-through text-slate-500 mr-1.5">
                                    R$ {origTotal.toFixed(2).replace('.', ',')}
                                  </span>
                                  <strong className="text-emerald-400 font-bold">
                                    R$ {discTotal.toFixed(2).replace('.', ',')} à vista
                                  </strong>
                                </span>
                              ) : (
                                <span>(R$ {origTotal.toFixed(2).replace('.', ',')} à vista)</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <div>
                            {hasDiscount ? (
                              <span>
                                <span className="line-through text-slate-500 mr-1.5">
                                  R$ {origTotal.toFixed(2).replace('.', ',')}
                                </span>
                                <strong className="text-emerald-400 font-bold">
                                  R$ {discTotal.toFixed(2).replace('.', ',')}
                                </strong>
                              </span>
                            ) : (
                              'Cobrança mensal avulsa'
                            )}
                          </div>
                        )}
                      </div>

                      {plan.savingsPercentage > 0 && (
                        <div className="mt-2.5 inline-block px-2.5 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-black uppercase">
                          Economia de {plan.savingsPercentage}%
                        </div>
                      )}
                    </div>

                    {/* Features do Plano */}
                    <ul className="space-y-2 text-xs flex-1 my-3 text-slate-300 dark:text-slate-300">
                      {plan.features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-1.5 text-[11px]">
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span className={isHighlighted ? 'text-slate-200' : 'text-slate-600 dark:text-slate-300'}>
                            {feat}
                          </span>
                        </li>
                      ))}
                    </ul>

                    {/* Botão de Ação: "Assinar" por padrão, ou "Assinar com Desconto" se tiver cupom */}
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanOverride(plan);
                      }}
                      className={`w-full py-3 rounded-2xl font-black text-xs transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5 mt-2 cursor-pointer shadow-md ${
                        isHighlighted
                          ? 'text-white'
                          : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      }`}
                      style={isHighlighted ? { backgroundColor: accentConfig.primaryHex } : {}}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Assinar
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Rodapé e Garantias */}
            <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-bold text-slate-700 dark:text-slate-300">
                  Garantia Incondicional de 7 Dias:
                </span>
                <span>Reembolso 100% garantido diretamente no painel.</span>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-medium">
                <span>✓ PIX Instantâneo</span>
                <span>✓ Cartão em até 24x</span>
                <span>✓ Checkout Seguro</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
