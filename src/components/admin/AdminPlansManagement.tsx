'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  DollarSign,
  Save,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Database,
  CreditCard,
  Sparkles,
  HelpCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import { Button } from '@/components/ui';
import { PlanId } from '@/config/plans';
import { PlatformPricingSettings, PlanPricingItem } from '@/types/planPricing';
import { getDefaultPricingSettings } from '@/config/planPricingDefaults';

export const AdminPlansManagement: React.FC = () => {
  const [settings, setSettings] = useState<PlatformPricingSettings>(getDefaultPricingSettings());
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [activePlanId, setActivePlanId] = useState<PlanId>('annual');
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Carregar dados da API
  const loadSettings = useCallback(async () => {
    setLoading(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/plans', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok && data.success && data.settings) {
        setSettings(data.settings);
      } else {
        throw new Error(data.error || 'Falha ao carregar planos.');
      }
    } catch (err) {
      console.error('Erro ao buscar planos:', err);
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Não foi possível carregar os planos.'
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadSettings();
  }, [loadSettings]);

  // Atualização atômica de campo de um plano
  const handleUpdatePlanField = (
    planId: PlanId,
    field: keyof PlanPricingItem,
    value: string | number | boolean
  ) => {
    setSettings((prev) => {
      const currentPlan = prev.plans[planId];
      if (!currentPlan) return prev;

      return {
        ...prev,
        plans: {
          ...prev.plans,
          [planId]: {
            ...currentPlan,
            [field]: value
          }
        }
      };
    });
  };

  // Recálculo inteligente da parcela e equivalência mensal
  const handleAutoCalculate = (planId: PlanId) => {
    setSettings((prev) => {
      const p = prev.plans[planId];
      if (!p) return prev;

      const total = Number(p.totalPrice) || 0;
      const months = Math.max(1, p.durationMonths || 1);
      const installments = Math.max(1, p.maxInstallments || 1);

      const autoMonthly = parseFloat((total / months).toFixed(2));
      const autoInstallment = parseFloat((total / installments).toFixed(2));

      // Calcula economia comparada ao plano mensal base
      const baseMonthlyPrice = prev.plans.monthly.totalPrice || 49.90;
      const fullValue = baseMonthlyPrice * months;
      const savingsPct = total < fullValue ? Math.round(((fullValue - total) / fullValue) * 100) : 0;
      const savingsAmount = total < fullValue ? (fullValue - total).toFixed(2).replace('.', ',') : '0,00';

      const billingText =
        installments > 1
          ? `R$ ${total.toFixed(2).replace('.', ',')} à vista ou até ${installments}x de R$ ${autoInstallment.toFixed(2).replace('.', ',')} (sujeito a taxas)`
          : 'Cobrança mensal avulsa • Cancele quando quiser';

      const savingsLabel =
        savingsPct > 0
          ? `Economize R$ ${savingsAmount} (${savingsPct}% OFF)`
          : 'Flexibilidade sem fidelidade';

      return {
        ...prev,
        plans: {
          ...prev.plans,
          [planId]: {
            ...p,
            monthlyEquivalent: autoMonthly,
            installmentValue: autoInstallment,
            savingsPercentage: savingsPct,
            hasSavings: savingsPct > 0,
            billingText,
            savingsLabel
          }
        }
      };
    });
  };

  // Salvar no backend / Supabase
  const handleSave = async () => {
    setSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/plans', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings)
      });
      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Erro ao salvar alterações no Supabase.');
      }

      setFeedback({
        type: 'success',
        message: 'Planos salvos com sucesso no Supabase e integrados ao Mercado Pago!'
      });

      if (data.settings) {
        setSettings(data.settings);
      }
    } catch (err) {
      setFeedback({
        type: 'error',
        message: err instanceof Error ? err.message : 'Falha ao salvar planos.'
      });
    } finally {
      setSaving(false);
    }
  };

  // Restaurar padrões
  const handleResetDefaults = () => {
    if (confirm('Tem certeza que deseja restaurar as configurações e preços padrões de fábrica?')) {
      const def = getDefaultPricingSettings();
      setSettings(def);
      setFeedback({
        type: 'success',
        message: 'Valores padrões restaurados. Clique em "Salvar Alterações" para aplicar no Supabase.'
      });
    }
  };

  const planOrder: PlanId[] = ['monthly', 'semiannual', 'annual', 'biennial'];
  const activePlan = settings.plans[activePlanId] || settings.plans.annual;

  return (
    <div className="space-y-6">
      {/* CABEÇALHO */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white tracking-tight">
                Gestão de Preços dos Planos
              </h1>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
                Altere os valores dos planos com sincronização automática no Supabase e cobrança no Mercado Pago.
              </p>
            </div>
          </div>
        </div>

        {/* CONTROLES GLOBAIS DE SALVAMENTO */}
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetDefaults}
            disabled={loading || saving}
            className="text-xs font-semibold gap-1.5"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Padrões de Fábrica</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handleSave}
            disabled={loading || saving}
            className="text-xs font-black gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-md"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Gravando...' : 'Salvar no Supabase & MP'}</span>
          </Button>
        </div>
      </div>

      {/* FEEDBACK BANNER */}
      {feedback && (
        <div
          className={`p-4 rounded-2xl text-xs sm:text-sm font-semibold flex items-center justify-between gap-3 animate-in fade-in ${
            feedback.type === 'success'
              ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300'
              : 'bg-rose-500/10 border border-rose-500/30 text-rose-700 dark:text-rose-300'
          }`}
        >
          <div className="flex items-center gap-2.5">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
            )}
            <span>{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback(null)}
            className="text-xs opacity-70 hover:opacity-100 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* CARDS DE STATUS E INTEGRAÇÃO */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* 1. VISIBILIDADE NO SITE */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Exibição no Site
              </span>
              {settings.showPricesOnSite ? (
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <Eye className="w-3 h-3" /> Visíveis
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400">
                  <EyeOff className="w-3 h-3" /> Ocultos
                </span>
              )}
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2">
              Controle se os valores (R$) aparecem na Landing Page e no modal de planos.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
            <button
              type="button"
              onClick={() =>
                setSettings((prev) => ({
                  ...prev,
                  showPricesOnSite: !prev.showPricesOnSite
                }))
              }
              className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                settings.showPricesOnSite
                  ? 'bg-amber-500/10 hover:bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-600 hover:bg-emerald-500 text-white'
              }`}
            >
              {settings.showPricesOnSite ? (
                <>
                  <EyeOff className="w-3.5 h-3.5" />
                  <span>Ocultar Preços no Site</span>
                </>
              ) : (
                <>
                  <Eye className="w-3.5 h-3.5" />
                  <span>Tornar Preços Visíveis no Site</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* 2. STATUS SUPABASE */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Banco de Dados Supabase
              </span>
              <Database className="w-4 h-4 text-emerald-500" />
            </div>
            <div className="text-base font-black text-zinc-900 dark:text-white mt-2">
              Tabela: platform_settings
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              Chave: <code className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">plan_pricing</code>
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-zinc-500">
            Última alteração: {new Date(settings.updatedAt).toLocaleString('pt-BR')}
          </div>
        </div>

        {/* 3. STATUS MERCADO PAGO */}
        <div className="p-5 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-wider">
                Mercado Pago / Mercado Livre
              </span>
              <CreditCard className="w-4 h-4 text-blue-500" />
            </div>
            <div className="text-base font-black text-zinc-900 dark:text-white mt-2">
              Cobrança Dinâmica PIX & Cartão
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1">
              O backend injeta automaticamente o valor atualizado no <code className="font-mono text-blue-500">transaction_amount</code>.
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800/80 text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Sincronização Ativa em Tempo Real</span>
          </div>
        </div>
      </div>

      {/* SELETOR DE PLANOS EM ABAS */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-zinc-200 dark:border-zinc-800">
        {planOrder.map((pid) => {
          const p = settings.plans[pid];
          const isSelected = activePlanId === pid;
          return (
            <button
              key={pid}
              type="button"
              onClick={() => setActivePlanId(pid)}
              className={`px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer whitespace-nowrap flex items-center gap-2 ${
                isSelected
                  ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-md'
                  : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <span>{p.name}</span>
              <span className="text-[11px] opacity-75 tabular-nums">
                R$ {p.totalPrice.toFixed(2).replace('.', ',')}
              </span>
            </button>
          );
        })}
      </div>

      {/* FORMULÁRIO DE EDIÇÃO DO PLANO SELECIONADO & PREVIEW */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* COLUNA ESQUERDA: FORMULÁRIO DE CAMPOS */}
        <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-zinc-950 border border-zinc-200/90 dark:border-zinc-800/90 shadow-sm space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-800">
            <div>
              <h2 className="text-base font-extrabold text-zinc-900 dark:text-white">
                Editar: {activePlan.name}
              </h2>
              <p className="text-xs text-zinc-500">ID canônico: {activePlan.id}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleAutoCalculate(activePlanId)}
              className="text-xs font-bold gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Calcular Parcela & Economia</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Nome do Plano */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Nome Comercial do Plano
              </label>
              <input
                type="text"
                value={activePlan.name}
                onChange={(e) => handleUpdatePlanField(activePlanId, 'name', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Selo / Badge */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Selo de Destaque (Badge)
              </label>
              <input
                type="text"
                value={activePlan.badge || ''}
                placeholder="Ex: Mais Escolhido • 1 Ano"
                onChange={(e) => handleUpdatePlanField(activePlanId, 'badge', e.target.value)}
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Preço Total à Vista */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Preço Total à Vista (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-400">R$</span>
                <input
                  type="number"
                  step="0.10"
                  min="1"
                  value={activePlan.totalPrice}
                  onChange={(e) =>
                    handleUpdatePlanField(activePlanId, 'totalPrice', parseFloat(e.target.value) || 0)
                  }
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Valor exato cobrado na transação do Mercado Pago.
              </p>
            </div>

            {/* Equivalência Mensal */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Equivalente Mensal (R$/mês)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-400">R$</span>
                <input
                  type="number"
                  step="0.10"
                  min="1"
                  value={activePlan.monthlyEquivalent}
                  onChange={(e) =>
                    handleUpdatePlanField(
                      activePlanId,
                      'monthlyEquivalent',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <p className="text-[10px] text-zinc-500 mt-1">
                Preço de vitrine exibido em destaque nos cards.
              </p>
            </div>

            {/* Parcelamento Máximo */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Parcelas Máximas (Cartão)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                max="36"
                value={activePlan.maxInstallments}
                onChange={(e) =>
                  handleUpdatePlanField(
                    activePlanId,
                    'maxInstallments',
                    parseInt(e.target.value, 10) || 1
                  )
                }
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Valor da Parcela */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Valor da Parcela (R$)
              </label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-zinc-400">R$</span>
                <input
                  type="number"
                  step="0.10"
                  min="1"
                  value={activePlan.installmentValue}
                  onChange={(e) =>
                    handleUpdatePlanField(
                      activePlanId,
                      'installmentValue',
                      parseFloat(e.target.value) || 0
                    )
                  }
                  className="w-full pl-9 pr-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Desconto / Economia % */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Economia Relativa (%)
              </label>
              <input
                type="number"
                step="1"
                min="0"
                max="100"
                value={activePlan.savingsPercentage}
                onChange={(e) =>
                  handleUpdatePlanField(
                    activePlanId,
                    'savingsPercentage',
                    parseInt(e.target.value, 10) || 0
                  )
                }
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Duração em Meses */}
            <div>
              <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
                Duração de Acesso (Meses)
              </label>
              <input
                type="number"
                step="1"
                min="1"
                value={activePlan.durationMonths}
                onChange={(e) =>
                  handleUpdatePlanField(
                    activePlanId,
                    'durationMonths',
                    parseInt(e.target.value, 10) || 1
                  )
                }
                className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Texto de Faturamento */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Texto de Faturamento Completo
            </label>
            <input
              type="text"
              value={activePlan.billingText}
              onChange={(e) => handleUpdatePlanField(activePlanId, 'billingText', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Selo de Economia */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Texto da Pílula de Economia
            </label>
            <input
              type="text"
              value={activePlan.savingsLabel}
              onChange={(e) => handleUpdatePlanField(activePlanId, 'savingsLabel', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Tag de Público */}
          <div>
            <label className="block text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-1">
              Subtítulo / Tag de Público
            </label>
            <input
              type="text"
              value={activePlan.audienceTag}
              onChange={(e) => handleUpdatePlanField(activePlanId, 'audienceTag', e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl text-xs sm:text-sm bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* COLUNA DIREITA: PREVIEW EM TEMPO REAL DO CARD */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-zinc-500">
              Pré-visualização do Card
            </span>
            <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
              {settings.showPricesOnSite ? 'Preços Ativos no Site' : 'Preços Ocultos no Site'}
            </span>
          </div>

          <div className="p-6 rounded-3xl bg-white dark:bg-zinc-950 border-2 border-emerald-500/40 dark:border-emerald-500/30 shadow-xl relative overflow-hidden">
            {activePlan.badge && (
              <div className="absolute top-3.5 right-4">
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-emerald-600 text-white shadow-xs">
                  {activePlan.badge}
                </span>
              </div>
            )}

            <div>
              <span className="text-[11px] font-semibold text-zinc-500">
                {activePlan.audienceTag}
              </span>
              <h3 className="text-xl font-black text-zinc-950 dark:text-white mt-0.5">
                {activePlan.name}
              </h3>
            </div>

            {/* PREÇO: EXIBIDO OU OCULTO */}
            <div className="mt-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
              {settings.showPricesOnSite ? (
                <>
                  <div className="flex items-baseline gap-1">
                    <span className="text-sm font-bold text-zinc-500">R$</span>
                    <span className="text-4xl font-black text-zinc-950 dark:text-white tabular-nums">
                      {activePlan.monthlyEquivalent.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-xs font-semibold text-zinc-500">/mês</span>
                  </div>

                  <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-2 leading-relaxed">
                    {activePlan.billingText}
                  </p>

                  <div className="mt-3">
                    <div className="py-1.5 px-3 rounded-xl text-xs font-extrabold text-center tracking-tight bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300">
                      {activePlan.savingsLabel}
                    </div>
                  </div>
                </>
              ) : (
                <div className="py-4 text-center rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-dashed border-zinc-300 dark:border-zinc-800">
                  <EyeOff className="w-5 h-5 text-zinc-400 mx-auto mb-1" />
                  <span className="text-xs font-bold text-zinc-500">
                    Preço Ocultado no Site
                  </span>
                  <p className="text-[10px] text-zinc-400 mt-0.5">
                    O valor será cobrado via Mercado Pago no checkout.
                  </p>
                </div>
              )}
            </div>

            <div className="mt-5 space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Acesso irrestrito por {activePlan.durationMonths} meses</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>+200 mil questões comentadas e simulados</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                <span>Garantia de 7 dias com reembolso instantâneo</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold bg-emerald-600 text-white flex items-center justify-center gap-2 shadow-md cursor-pointer hover:bg-emerald-500 transition-all"
              >
                <span>Assinar {activePlan.name}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
