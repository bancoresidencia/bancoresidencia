'use client';

import React, { useState } from 'react';
import { X, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { PlanType } from '@/hooks/useSubscription';
import { PLANS, PlanDefinition } from '@/config/plans';
import { MercadoPagoCheckout } from '@/components/MercadoPagoCheckout';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: PlanType;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose
}) => {
  const { accentConfig } = useTheme();
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<PlanDefinition | null>(null);

  if (!isOpen) return null;

  const planList = [
    PLANS.biennial,
    PLANS.annual,
    PLANS.semiannual,
    PLANS.monthly
  ];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[92vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors z-10"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        {selectedPlanForCheckout ? (
          /* TELA DO CHECKOUT TRANSPARENTE MERCADO PAGO */
          <div className="max-w-2xl mx-auto py-2">
            <MercadoPagoCheckout
              plan={selectedPlanForCheckout}
              onBack={() => setSelectedPlanForCheckout(null)}
              onSuccess={() => {
                setSelectedPlanForCheckout(null);
                onClose();
              }}
            />
          </div>
        ) : (
          /* GRADE DE PLANOS */
          <>
            <div className="text-center max-w-2xl mx-auto mb-8">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold mb-3">
                <Sparkles className="w-3.5 h-3.5" />
                Planos de Preparação Médica 2026 / 2027
              </div>
              <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
                Acelere sua aprovação na residência médica
              </h2>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
                133k+ questões classificadas, métricas TRI, gabaritos comentados e provas na íntegra.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {planList.map((plan) => {
                const isBiennial = plan.id === 'biennial';
                const isAnnual = plan.id === 'annual';
                const isHighlighted = isAnnual || isBiennial;

                return (
                  <div
                    key={plan.id}
                    className={`flex flex-col p-5 rounded-2xl border transition-all relative ${
                      isHighlighted
                        ? 'border-2 shadow-xl bg-slate-900 text-white dark:bg-slate-950'
                        : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 text-slate-900 dark:text-white'
                    }`}
                    style={isHighlighted ? { borderColor: accentConfig.primaryHex } : {}}
                  >
                    {plan.badge && (
                      <div
                        className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow"
                        style={{ backgroundColor: accentConfig.primaryHex }}
                      >
                        {plan.badge}
                      </div>
                    )}

                    <div className="mb-4">
                      <h3 className={`text-base font-bold ${isHighlighted ? 'text-white' : 'text-slate-800 dark:text-slate-200'}`}>
                        {plan.name}
                      </h3>

                      <div className="mt-2">
                        <span className="text-xs text-slate-400">R$ </span>
                        <span className="text-3xl font-black">
                          {plan.monthlyEquivalent.toFixed(2).replace('.', ',')}
                        </span>
                        <span className="text-xs text-slate-400">/mês</span>
                      </div>

                      <div className="text-[11px] text-slate-400 mt-1">
                        {plan.maxInstallments > 1 ? (
                          <>
                            {plan.maxInstallments}x de R$ {plan.installmentValue.toFixed(2).replace('.', ',')}
                            <span className="block text-[10px] text-emerald-400 font-semibold mt-0.5">
                              (R$ {plan.totalPrice.toFixed(2).replace('.', ',')} à vista)
                            </span>
                          </>
                        ) : (
                          'Cobrança mensal avulsa'
                        )}
                      </div>

                      {plan.savingsPercentage > 0 && (
                        <div className="mt-2 inline-block px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-400 text-[10px] font-bold">
                          Economia de {plan.savingsPercentage}%
                        </div>
                      )}
                    </div>

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

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedPlanForCheckout(plan);
                      }}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs transition-transform hover:scale-[1.02] flex items-center justify-center gap-1.5 mt-2 ${
                        isHighlighted
                          ? 'text-white shadow-lg'
                          : 'bg-slate-900 text-white dark:bg-white dark:text-slate-900'
                      }`}
                      style={isHighlighted ? { backgroundColor: accentConfig.primaryHex } : {}}
                    >
                      <Zap className="w-3.5 h-3.5 fill-current" />
                      Assinar {plan.name.replace('Plano ', '')}
                    </button>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 pt-5 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span className="font-semibold text-slate-700 dark:text-slate-300">
                  Garantia Incondicional de 7 Dias:
                </span>
                <span>Reembolso 100% incontestável diretamente no painel.</span>
              </div>
              <div className="flex items-center gap-3 text-[11px]">
                <span>✓ PIX Instantâneo</span>
                <span>✓ Cartão em até 24x</span>
                <span>✓ Mercado Pago Seguro</span>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
