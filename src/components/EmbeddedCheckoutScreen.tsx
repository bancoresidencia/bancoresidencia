'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { Logo } from '@/components/Logo';
import { ThemeSelector } from '@/components/ThemeSelector';
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
  Lock
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
  const [appliedReferral, setAppliedReferral] = useState<AppliedReferral | null>(() => getAppliedReferralCode(currentUserCode, user));

  const discountPercent = appliedReferral?.discountPercent || 0;
  const hasDiscount = discountPercent > 0;

  // Permite trocar de plano na própria tela de checkout
  const [selectedPlan, setSelectedPlan] = useState<PlanDefinition>(initialPlan);
  const effectiveSelectedPlan = hasDiscount
    ? computeDiscountedPlan(selectedPlan, discountPercent)
    : selectedPlan;

  const planList: PlanDefinition[] = [
    PLANS.annual,
    PLANS.biennial,
    PLANS.semiannual,
    PLANS.monthly
  ];

  const firstName = user?.name ? user.name.trim().split(' ')[0] : '';

  return (
    <div className="min-h-screen bg-[var(--bg-page)] text-[var(--foreground)] flex flex-col font-sans transition-colors duration-200">
      {/* =========================================================================
          CABEÇALHO INTEGRADO (EMBEDDED HEADER)
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-[var(--bg-page)]/85 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            <Logo className="w-10 h-10 shrink-0 transition-transform hover:scale-105 duration-200" glow />
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Banco Residência
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  2026
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                Ativação Segura & Onboarding
              </p>
            </div>
          </div>

          {/* Stepper Central (Desktop) */}
          <div className="hidden md:flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>1. Plano Escolhido</span>
            </div>
            <span className="text-slate-300 dark:text-slate-700">›</span>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="w-4 h-4" />
              <span>2. Identificação</span>
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
              <span>3. Pagamento & Garantia</span>
            </div>
          </div>

          {/* Ações da Direita */}
          <div className="flex items-center gap-3">
            <ThemeSelector compact={true} />
            <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-slate-200/80 dark:border-zinc-700/80">
              <Lock className="w-3.5 h-3.5 text-emerald-500" />
              <span>Ambiente Seguro</span>
            </div>
          </div>
        </div>
      </header>

      {/* =========================================================================
          CONTEÚDO PRINCIPAL (SPLIT SCREEN INTEGRADO)
          ========================================================================= */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-10">
        {/* Título de Boas-Vindas e Confirmação */}
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-400 text-xs font-extrabold mb-2.5">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Conta Criada com Sucesso</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Olá{firstName ? `, ${firstName}` : ''}! Quase pronto para começar.
          </h1>
          <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 mt-1 max-w-2xl">
            Ative sua assinatura abaixo para ter acesso irrestrito às 133k+ questões, provas oficiais e inteligência clínica com <strong>garantia de reembolso instantâneo</strong>.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* =========================================================================
              COLUNA DA ESQUERDA (5 COLUNAS): RESUMO, GARANTIA & MODO DEGUSTAÇÃO
              ========================================================================= */}
          <div className="lg:col-span-5 space-y-5">
            {/* 1. SELETOR RÁPIDO DE PLANOS */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Selecione ou Troque de Plano
                </span>
                <span className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400">
                  {selectedPlan.name}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {planList.map((p) => {
                  const isCurrent = p.id === selectedPlan.id;
                  const effectiveP = hasDiscount ? computeDiscountedPlan(p, discountPercent) : p;
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => setSelectedPlan(p)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer relative ${
                        isCurrent
                          ? 'border-2 bg-slate-50 dark:bg-zinc-800/60 shadow-sm'
                          : 'border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700 bg-transparent'
                      }`}
                      style={isCurrent ? { borderColor: accentConfig.primaryHex } : {}}
                    >
                      {p.badge && (
                        <span
                          className="absolute -top-2 right-2 text-[9px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded text-white"
                          style={{ backgroundColor: accentConfig.primaryHex }}
                        >
                          {p.badge}
                        </span>
                      )}
                      <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
                        {p.name.replace('Plano ', '')}
                      </div>
                      <div className="text-sm font-black text-slate-900 dark:text-white mt-1">
                        R$ {effectiveP.monthlyEquivalent.toFixed(2).replace('.', ',')}
                        <span className="text-[10px] font-medium text-slate-500 dark:text-slate-400">/mês</span>
                      </div>
                      {hasDiscount ? (
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          {discountPercent}% OFF Cupom
                        </div>
                      ) : p.savingsPercentage > 0 ? (
                        <div className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Economia {p.savingsPercentage}%
                        </div>
                      ) : null}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. CARD DO PLANO SELECIONADO & ITENS INCLUSOS */}
            <div className="p-5 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-zinc-800/80">
                <div>
                  <h3 className="font-heading text-base font-extrabold text-slate-900 dark:text-white">
                    {selectedPlan.name}
                  </h3>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    Acesso completo e irrestrito por {selectedPlan.durationMonths} {selectedPlan.durationMonths === 1 ? 'mês' : 'meses'}
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-black text-slate-900 dark:text-white">
                    R$ {effectiveSelectedPlan.totalPrice.toFixed(2).replace('.', ',')}
                  </div>
                  {hasDiscount && (
                    <div className="text-[10px] font-semibold text-slate-400 line-through">
                      R$ {selectedPlan.totalPrice.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                  {effectiveSelectedPlan.maxInstallments > 1 && (
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                      em até {effectiveSelectedPlan.maxInstallments}x de R$ {effectiveSelectedPlan.installmentValue.toFixed(2).replace('.', ',')}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-xs font-medium text-slate-700 dark:text-slate-300">
                {selectedPlan.features.map((feat, idx) => (
                  <div key={idx} className="flex items-start gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span className="leading-tight">{feat}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* 3. CARD DE DESTAQUE MÁXIMO: REEMBOLSO INSTANTÂNEO & GARANTIA */}
            <div className="p-5 rounded-3xl bg-gradient-to-br from-emerald-500/15 via-emerald-500/5 to-transparent border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-md space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                    Risco Zero para Você
                  </span>
                  <h4 className="font-heading text-sm font-extrabold text-slate-900 dark:text-white">
                    Garantia de 7 Dias com Reembolso Instantâneo
                  </h4>
                </div>
              </div>

              <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                Você tem 7 dias completos para resolver questões, simular provas e testar a plataforma à vontade. Se por qualquer razão decidir que não quer continuar, <strong>basta 1 clique no menu da sua conta para estornar 100% do valor na mesma hora</strong> no seu PIX ou cartão de crédito.
              </p>

              <div className="pt-2 flex items-center justify-between text-[11px] font-bold text-emerald-800 dark:text-emerald-300 border-t border-emerald-500/20">
                <span className="flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Estorno Imediato Sem Perguntas
                </span>
                <span>Art. 49 CDC</span>
              </div>
            </div>

            {/* 4. OPÇÃO SECUNDÁRIA: TESTAR A VERSÃO GRATUITA (DEGUSTAÇÃO) */}
            <div className="p-4 rounded-3xl bg-slate-100/70 dark:bg-zinc-900/60 border border-slate-200/80 dark:border-zinc-800/80 flex items-center justify-between gap-3">
              <div>
                <h4 className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  Prefere conhecer a plataforma antes?
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Modo degustação com 10 questões/dia gratuitas, sem cartão.
                </p>
              </div>

              <button
                type="button"
                onClick={onTestFree}
                className="shrink-0 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-white dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 hover:bg-slate-50 dark:hover:bg-zinc-700 transition-all cursor-pointer flex items-center gap-1.5"
              >
                <span>Testar Grátis</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* =========================================================================
              COLUNA DA DIREITA (7 COLUNAS): CHECKOUT TRANSPARENTE MERCADO PAGO
              ========================================================================= */}
          <div className="lg:col-span-7">
            <div className="bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 rounded-3xl p-6 sm:p-8 shadow-xl">
              <MercadoPagoCheckout
                plan={selectedPlan}
                appliedReferral={appliedReferral}
                onCouponChange={setAppliedReferral}
                onBack={() => {
                  if (onBackToLanding) {
                    onBackToLanding();
                  } else {
                    onTestFree();
                  }
                }}
                onSuccess={onSuccess}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
