'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { PLANS, PlanDefinition } from '@/config/plans';
import { MercadoPagoCheckout } from '@/components/MercadoPagoCheckout';
import {
  getAppliedReferralCode,
  getUserReferralCode,
  computeDiscountedPlan,
  AppliedReferral
} from '@/config/ambassadorConfig';
import {
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Zap,
  ArrowRight,
  Lock,
  X,
  Crown,
  CreditCard,
  QrCode
} from 'lucide-react';

interface EmbeddedCheckoutScreenProps {
  initialPlan: PlanDefinition;
  onSuccess: () => void;
  onTestFree: () => void;
  onBackToLanding?: () => void;
}

export const EmbeddedCheckoutScreen: React.FC<EmbeddedCheckoutScreenProps> = ({
  initialPlan,
  onSuccess,
  onTestFree,
  onBackToLanding
}) => {
  const { user } = useAuth();
  const { accentConfig } = useTheme();

  const currentUserCode = getUserReferralCode(user);
  const [appliedReferral, setAppliedReferral] = useState<AppliedReferral | null>(() =>
    getAppliedReferralCode(currentUserCode, user)
  );

  const discountPercent = appliedReferral?.discountPercent || 0;
  const hasDiscount = discountPercent > 0;

  // Plano atualmente selecionado para pagamento
  const [selectedPlan, setSelectedPlan] = useState<PlanDefinition>(initialPlan);
  const effectiveSelectedPlan = hasDiscount
    ? computeDiscountedPlan(selectedPlan, discountPercent)
    : selectedPlan;

  // Estado de controle do PopUP Modal de pagamento (PIX / Cartão)
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Fecha o modal ao pressionar Escape
  useEffect(() => {
    if (!isPaymentModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsPaymentModalOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPaymentModalOpen]);

  // Trava scroll da página ao abrir o PopUP
  useEffect(() => {
    if (isPaymentModalOpen) {
      const orig = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = orig;
      };
    }
  }, [isPaymentModalOpen]);

  // Lista dos 4 planos em ordem crescente de duração
  const planList: PlanDefinition[] = [
    PLANS.monthly,
    PLANS.semiannual,
    PLANS.annual,
    PLANS.biennial
  ];

  const fullName = user?.name ? user.name.trim() : '';

  const handleOpenCheckoutModal = (plan: PlanDefinition) => {
    setSelectedPlan(plan);
    setIsPaymentModalOpen(true);
  };

  return (
    <div className="min-h-full bg-[var(--bg-page)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-200">
      {/* Sub-barra de Progresso do Checkout & Segurança */}
      <div className="w-full border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/70 dark:bg-zinc-900/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex items-center justify-between gap-4">
          {/* Stepper (Desktop) */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Escolha o Plano</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">›</span>
            <div
              className="flex items-center gap-1.5 font-bold px-2.5 py-1 rounded-xl"
              style={{
                backgroundColor: accentConfig.bgRgba,
                color: accentConfig.primaryHex
              }}
            >
              <Sparkles className="w-4 h-4" />
              <span>2. Pagamento (PIX ou Cartão)</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">›</span>
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500">
              <Zap className="w-4 h-4" />
              <span>3. Acesso Instantâneo</span>
            </div>
          </div>

          {/* Badge Ambiente Seguro */}
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-white dark:bg-zinc-800/90 px-3 py-1 rounded-xl border border-slate-200/80 dark:border-zinc-700/80 shadow-xs">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Ambiente Seguro</span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          CONTEÚDO PRINCIPAL (OS 4 PLANOS LADO A LADO)
          ========================================================================= */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-12 space-y-10">
        {/* Título de Boas-Vindas */}
        <div className="text-center max-w-3xl mx-auto space-y-2">
          <h1 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Olá{fullName ? `, ${fullName}` : ''}! Escolha o melhor plano para você!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-medium">
            Todos os planos contam com acesso irrestrito às questões, flashcards e inteligência de estudos.
          </p>
        </div>

        {/* =========================================================================
            GRID DE 4 CARTÕES LADO A LADO (RESPONSIVO COM ALTO DESTAQUE)
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 lg:gap-4 xl:gap-6 items-stretch pt-4">
          {planList.map((p) => {
            const effectiveP = hasDiscount ? computeDiscountedPlan(p, discountPercent) : p;
            const isAnnual = p.id === 'annual';
            const isBiennial = p.id === 'biennial';
            const isSelected = selectedPlan.id === p.id;

            const durationBadgeText =
              p.durationMonths === 1
                ? '1 mês de acesso'
                : p.durationMonths === 12
                  ? '12 meses (1 ano)'
                  : p.durationMonths === 24
                    ? '24 meses (2 anos)'
                    : `${p.durationMonths} meses`;

            return (
              <div
                key={p.id}
                onClick={() => handleOpenCheckoutModal(p)}
                className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 cursor-pointer group ${isAnnual
                    ? 'border-2 shadow-xl lg:-translate-y-2.5 bg-gradient-to-b from-white via-white to-zinc-50/50 dark:from-zinc-900 dark:via-zinc-900 dark:to-zinc-950 ring-2 ring-blue-500/20 dark:ring-blue-500/30'
                    : isBiennial
                      ? 'border-2 border-emerald-500/90 dark:border-emerald-500/70 shadow-lg lg:-translate-y-1 bg-gradient-to-b from-white via-white to-emerald-50/20 dark:from-zinc-900 dark:via-zinc-900 dark:to-emerald-950/20 ring-1 ring-emerald-500/20'
                      : 'border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm hover:shadow-md'
                  }`}
                style={
                  isAnnual
                    ? { borderColor: accentConfig.primaryHex }
                    : {}
                }
              >
                {/* 1. BADGES FLUTUANTES SUPERIORES */}
                {isAnnual ? (
                  <div
                    className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md flex items-center gap-1.5 shrink-0"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Mais Popular</span>
                  </div>
                ) : isBiennial ? (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-white bg-emerald-600 shadow-md flex items-center gap-1.5 shrink-0">
                    <Crown className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
                    <span>Melhor Custo-Benefício</span>
                  </div>
                ) : null}

                {/* 2. CABEÇALHO DO CARD (NOME & DURAÇÃO) */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      {durationBadgeText}
                    </span>
                    {hasDiscount ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {discountPercent}% OFF
                      </span>
                    ) : p.savingsPercentage > 0 ? (
                      <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800">
                        {p.savingsPercentage}% OFF
                      </span>
                    ) : (
                      <span className="text-[10px] font-semibold text-slate-400 dark:text-slate-500">
                        Sem Fidelidade
                      </span>
                    )}
                  </div>

                  <h3 className="font-heading font-black text-xl text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {p.name}
                  </h3>

                  {/* 3. BLOCO DE PREÇO COM ALTO DESTAQUE */}
                  <div className="pt-2 pb-1 border-y border-zinc-100 dark:border-zinc-800/80">
                    <div className="flex items-baseline gap-1">
                      <span className="text-xs font-extrabold text-slate-400 dark:text-slate-500">
                        R$
                      </span>
                      <span
                        className={`font-heading font-black tracking-tight ${isAnnual || isBiennial
                            ? 'text-3xl sm:text-4xl text-slate-900 dark:text-white'
                            : 'text-2xl sm:text-3xl text-slate-800 dark:text-slate-100'
                          }`}
                      >
                        {effectiveP.monthlyEquivalent.toFixed(2).replace('.', ',')}
                      </span>
                      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                        /mês
                      </span>
                    </div>

                    <div className="text-[11px] font-medium text-slate-500 dark:text-slate-400 mt-1">
                      {effectiveP.maxInstallments > 1 ? (
                        <span>
                          em até <strong className="text-slate-800 dark:text-slate-200">{effectiveP.maxInstallments}x de R$ {effectiveP.installmentValue.toFixed(2).replace('.', ',')}</strong>
                          <br />
                          ou R$ {effectiveP.totalPrice.toFixed(2).replace('.', ',')} à vista
                        </span>
                      ) : (
                        <span>
                          R$ <strong className="text-slate-800 dark:text-slate-200">{effectiveP.totalPrice.toFixed(2).replace('.', ',')}</strong> à vista no PIX ou Cartão
                        </span>
                      )}
                    </div>
                  </div>

                  {/* 4. BENEFÍCIOS (PADRONIZADOS EM TODOS OS CARDS) */}
                  <div className="pt-2 space-y-2.5">
                    <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                      Incluso no plano:
                    </div>
                    {p.features.map((feat, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 text-xs font-medium text-slate-700 dark:text-slate-300"
                      >
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="leading-tight">{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 5. BOTÃO DE AÇÃO (CTA) */}
                <div className="pt-6">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOpenCheckoutModal(p);
                    }}
                    className={`w-full py-3.5 px-4 rounded-2xl font-bold text-xs transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 shadow-sm group-hover:scale-[1.02] active:scale-[0.98] ${isAnnual
                        ? 'text-white shadow-md'
                        : isBiennial
                          ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-md'
                          : 'bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900'
                      }`}
                    style={
                      isAnnual
                        ? {
                          backgroundColor: accentConfig.primaryHex,
                          color: accentConfig.primaryContrastHex
                        }
                        : {}
                    }
                  >
                    <span>
                      {isAnnual
                        ? 'Assinar Plano Anual'
                        : isBiennial
                          ? 'Assinar Plano Bienal'
                          : `Escolher ${p.name.replace('Plano ', '')}`}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center justify-center gap-1.5 text-[10px] font-semibold text-slate-400 dark:text-slate-500 mt-2">
                    <Zap className="w-3 h-3 text-amber-500 shrink-0" />
                    <span>PIX ou Cartão • Acesso Imediato</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            SEÇÃO INFERIOR: GARANTIA DE 7 DIAS COM REEMBOLSO INSTANTÂNEO & DEGUSTAÇÃO
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 pt-4 items-center">
          {/* Card de Garantia Horizontal Amplo */}
          <div className="lg:col-span-8 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent border-2 border-emerald-500/30 dark:border-emerald-500/20 shadow-sm space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Risco Zero para Você
                </span>
                <h4 className="font-heading text-base font-extrabold text-slate-900 dark:text-white">
                  Garantia Incondicional de 7 Dias com Reembolso Instantâneo
                </h4>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
              Você tem 7 dias completos para resolver questões, criar simulados e testar todos os recursos. Se por qualquer motivo decidir não continuar, <strong>basta 1 clique no menu da sua conta para estornar 100% do valor na mesma hora</strong> no seu PIX ou cartão de crédito.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-between gap-2 text-xs font-bold text-emerald-800 dark:text-emerald-300 border-t border-emerald-500/20">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5" />
                Estorno Imediato Sem Perguntas
              </span>
              <span>Conforme Art. 49 do Código de Defesa do Consumidor</span>
            </div>
          </div>

          {/* Opção Degustação Gratuita */}
          <div className="lg:col-span-4 p-6 rounded-3xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 space-y-4">
            <div>
              <h4 className="font-heading text-sm font-bold text-slate-800 dark:text-slate-200">
                Prefere conhecer antes de assinar?
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Modo degustação com 10 questões gratuitas por dia, sem cartão de crédito.
              </p>
            </div>

            <button
              type="button"
              onClick={onTestFree}
              className="w-full px-4 py-2.5 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <span>Testar Modo Grátis</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </main>

      {/* =========================================================================
          POPUP MODAL DE PAGAMENTO (PIX & CARTÃO MERCADO PAGO)
          ========================================================================= */}
      {isPaymentModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-checkout-title"
          className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto overscroll-contain animate-in fade-in duration-200"
          onClick={() => setIsPaymentModalOpen(false)}
        >
          <div
            className="relative w-full max-w-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl overflow-hidden my-auto animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Cabeçalho do PopUp */}
            <div className="p-4 sm:p-6 border-b border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3 bg-zinc-50/70 dark:bg-zinc-900/40">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-xs shrink-0"
                  style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
                >
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <h3
                    id="modal-checkout-title"
                    className="font-heading font-black text-base sm:text-lg text-slate-900 dark:text-white"
                  >
                    Pagamento Seguro • {effectiveSelectedPlan.name}
                  </h3>
                  <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                    Selecione PIX (aprovação instantânea) ou Cartão de Crédito
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsPaymentModalOpen(false)}
                className="w-9 h-9 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Fechar janela de pagamento"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Alternador Rápido de Plano dentro do PopUp */}
            <div className="px-4 sm:px-6 pt-3.5 pb-2.5 bg-zinc-50/40 dark:bg-zinc-900/30 border-b border-zinc-100 dark:border-zinc-800/60">
              <div className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1.5">
                Trocar plano se desejar:
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {planList.map((p) => {
                  const isSelected = p.id === selectedPlan.id;
                  const pEff = hasDiscount ? computeDiscountedPlan(p, discountPercent) : p;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlan(p)}
                      className={`p-2 rounded-xl text-left transition-all cursor-pointer border ${isSelected
                          ? 'border-2 shadow-xs bg-white dark:bg-zinc-800'
                          : 'border-zinc-200/90 dark:border-zinc-800 bg-transparent opacity-70 hover:opacity-100'
                        }`}
                      style={isSelected ? { borderColor: accentConfig.primaryHex } : {}}
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-slate-900 dark:text-white truncate">
                          {p.name.replace('Plano ', '')}
                        </span>
                        {p.id === 'annual' && (
                          <span
                            className="w-2 h-2 rounded-full shrink-0"
                            style={{ backgroundColor: accentConfig.primaryHex }}
                          />
                        )}
                      </div>
                      <div className="text-[11px] font-extrabold text-slate-700 dark:text-slate-300 mt-0.5">
                        R$ {pEff.monthlyEquivalent.toFixed(2).replace('.', ',')}
                        <span className="text-[9px] font-normal text-slate-400">/m</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Resumo do Plano Selecionado no PopUp */}
            <div className="px-4 sm:px-6 py-3 bg-blue-50/40 dark:bg-blue-950/20 border-b border-blue-100/70 dark:border-blue-900/30 flex items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2 min-w-0">
                <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0" />
                <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  <strong>{effectiveSelectedPlan.name}</strong> • {effectiveSelectedPlan.durationMonths} {effectiveSelectedPlan.durationMonths === 1 ? 'mês' : 'meses'} de acesso
                </span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-heading font-black text-slate-900 dark:text-white text-sm">
                  R$ {effectiveSelectedPlan.totalPrice.toFixed(2).replace('.', ',')}
                </span>
                {effectiveSelectedPlan.maxInstallments > 1 && (
                  <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                    até {effectiveSelectedPlan.maxInstallments}x de R$ {effectiveSelectedPlan.installmentValue.toFixed(2).replace('.', ',')}
                  </div>
                )}
              </div>
            </div>

            {/* Formulário de Pagamento Mercado Pago (PIX e Cartão) */}
            <div className="p-4 sm:p-6 max-h-[calc(85vh-200px)] overflow-y-auto overscroll-contain">
              <MercadoPagoCheckout
                plan={selectedPlan}
                appliedReferral={appliedReferral}
                onCouponChange={setAppliedReferral}
                onBack={() => setIsPaymentModalOpen(false)}
                onSuccess={() => {
                  setIsPaymentModalOpen(false);
                  onSuccess();
                }}
              />
            </div>

            {/* Rodapé com Selos de Confiança */}
            <div className="px-4 sm:px-6 py-3 bg-zinc-50 dark:bg-zinc-900/80 border-t border-zinc-200/80 dark:border-zinc-800/80 flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400">
              <div className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                <span>Garantia de 7 dias com estorno imediato</span>
              </div>
              <div className="flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                <span>Pagamento Criptografado</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
