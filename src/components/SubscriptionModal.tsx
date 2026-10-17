'use client';

import React from 'react';
import { X, Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { PlanType } from '@/hooks/useSubscription';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentPlan?: PlanType;
}

export const SubscriptionModal: React.FC<SubscriptionModalProps> = ({
  isOpen,
  onClose,
  currentPlan = 'free'
}) => {
  const { accentConfig } = useTheme();

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-4xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white transition-colors"
          aria-label="Fechar modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center max-w-xl mx-auto mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-500 text-xs font-bold mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Planos de Preparação Médica 2026 / 2027
          </div>
          <h2 className="text-2xl sm:text-3xl font-heading font-black text-slate-900 dark:text-white tracking-tight">
            Acelere sua aprovação na residência
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Acesse o banco de 133k+ questões comentadas, simulados oficiais na íntegra e métricas psicométricas TRI calibradas.
          </p>
        </div>

        {/* Grade de Planos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Gratuito */}
          <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 relative">
            <div className="mb-4">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Acesso Básico</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">Gratuito</h3>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">R$ 0</div>
              <p className="text-xs text-slate-500 mt-1">Para degustação da plataforma</p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 flex-1 my-4">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                25 questões diárias
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                Filtros básicos por especialidade
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <X className="w-4 h-4 text-slate-400 shrink-0" />
                Sem cálculo de proficiência TRI
              </li>
              <li className="flex items-center gap-2 text-slate-400">
                <X className="w-4 h-4 text-slate-400 shrink-0" />
                Sem provas oficiais completas
              </li>
            </ul>
            <button
              type="button"
              disabled={currentPlan === 'free'}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 disabled:opacity-50"
            >
              {currentPlan === 'free' ? 'Plano Atual' : 'Plano Básico'}
            </button>
          </div>

          {/* Pro Residência */}
          <div
            className="flex flex-col p-6 rounded-2xl border-2 relative shadow-xl bg-slate-900 dark:bg-slate-950 text-white"
            style={{ borderColor: accentConfig.primaryHex }}
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white" style={{ backgroundColor: accentConfig.primaryHex }}>
              Mais Recomendado
            </div>
            <div className="mb-4">
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Acesso Completo</span>
              <h3 className="text-xl font-bold text-white mt-1">Pro Residência</h3>
              <div className="mt-2 text-3xl font-black text-white">
                R$ 59<span className="text-xs font-normal text-slate-400">/mês</span>
              </div>
              <p className="text-xs text-slate-400 mt-1">Todas as instituições de Acesso Direto</p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-200 flex-1 my-4">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                <strong>Questões Ilimitadas</strong> (133k+)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                Métricas Psicométricas TRI & Percentil
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                Provas Oficiais na Íntegra (ENARE, USP, etc.)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                Cadernos & Pastas de 3 níveis ilimitadas
              </li>
            </ul>
            <button
              type="button"
              onClick={() => {
                window.open('https://wa.me/5500000000000?text=Quero%20assinar%20o%20Plano%20Pro%20Banco%20Residência', '_blank');
              }}
              className="w-full py-3 rounded-xl font-bold text-xs text-white shadow-lg transition-transform hover:scale-[1.02] flex items-center justify-center gap-2"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Zap className="w-4 h-4 fill-white" />
              Assinar Plano Pro
            </button>
          </div>

          {/* Premium R+ */}
          <div className="flex flex-col p-6 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/40 relative">
            <div className="mb-4">
              <span className="text-xs font-bold text-amber-500 uppercase tracking-wider">Subespecialidades</span>
              <h3 className="text-xl font-bold text-slate-800 dark:text-slate-200 mt-1">R+ & Título</h3>
              <div className="mt-2 text-2xl font-black text-slate-900 dark:text-white">
                R$ 89<span className="text-xs font-normal text-slate-400">/mês</span>
              </div>
              <p className="text-xs text-slate-500 mt-1">Para quem vai prestar pré-requisito</p>
            </div>
            <ul className="space-y-2.5 text-xs text-slate-600 dark:text-slate-300 flex-1 my-4">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                Tudo do Plano Pro Residência
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                Provas de R+ Cirurgia, Pediatria, Clínica
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                Bancos de Provas de Título (CBO, TECM)
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                Suporte de Curadoria Prioritário
              </li>
            </ul>
            <button
              type="button"
              onClick={() => {
                window.open('https://wa.me/5500000000000?text=Quero%20assinar%20o%20Plano%20R+%20Banco%20Residência', '_blank');
              }}
              className="w-full py-2.5 rounded-xl font-bold text-xs bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 transition-colors"
            >
              Assinar Plano Premium
            </button>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-200 dark:border-slate-800 flex flex-wrap items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-4">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>Garantia de 7 dias com reembolso integral</span>
          </div>
          <div>Cancelamento transparente a qualquer momento</div>
        </div>
      </div>
    </div>
  );
};
