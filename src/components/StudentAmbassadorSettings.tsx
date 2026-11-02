'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import {
  AMBASSADOR_CONFIG,
  getUserReferralCode,
  setUserReferralCode,
  getAmbassadorStats,
  saveAmbassadorPixKey,
  requestAmbassadorPixWithdrawal,
  requestAmbassadorPlanRefund,
  simulateAmbassadorSale,
  AmbassadorStats
} from '@/config/ambassadorConfig';
import {
  Gift,
  Share2,
  Copy,
  Check,
  Award,
  Wallet,
  ArrowUpRight,
  TrendingUp,
  RotateCcw,
  Sparkles,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  QrCode
} from 'lucide-react';

export const StudentAmbassadorSettings: React.FC = () => {
  const { user } = useAuth();
  const { accentConfig } = useTheme();

  const [stats, setStats] = useState<AmbassadorStats>(() =>
    getAmbassadorStats(user?.id || 'guest', user?.name)
  );

  const [copiedCode, setCopiedCode] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Edição de código
  const [isEditingCode, setIsEditingCode] = useState(false);
  const [newCodeInput, setNewCodeInput] = useState(stats.referralCode);
  const [codeFeedback, setCodeFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Saque PIX
  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [pixKeyType, setPixKeyType] = useState<'cpf' | 'email' | 'phone' | 'random'>(stats.pixKeyType || 'cpf');
  const [pixKeyValue, setPixKeyValue] = useState(stats.pixKey || '');
  const [withdrawAmount, setWithdrawAmount] = useState<string>('');
  const [withdrawFeedback, setWithdrawFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Reembolso do plano
  const [refundFeedback, setRefundFeedback] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const refreshStats = () => {
    if (user) {
      setStats(getAmbassadorStats(user.id, user.name));
    }
  };

  useEffect(() => {
    if (user) {
      setStats(getAmbassadorStats(user.id, user.name));
      setNewCodeInput(getUserReferralCode(user));
    }
  }, [user]);

  // Copiar Código
  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(stats.referralCode);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    } catch {
      // fallback
    }
  };

  // Copiar Link
  const handleCopyLink = async () => {
    try {
      const shareUrl = typeof window !== 'undefined'
        ? `${window.location.origin}?ref=${stats.referralCode}`
        : `https://bancoresidencia.com.br?ref=${stats.referralCode}`;
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  // Compartilhar WhatsApp
  const handleShareWhatsApp = () => {
    const shareUrl = typeof window !== 'undefined'
      ? `${window.location.origin}?ref=${stats.referralCode}`
      : `https://bancoresidencia.com.br?ref=${stats.referralCode}`;
    const text = encodeURIComponent(
      `Oi! Estou usando o Banco Residência para estudar com mais de 133k questões comentadas e provas oficiais. Usa meu código ${stats.referralCode} pra garantir 10% de desconto no plano completo: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Salvar novo código
  const handleSaveCode = (e: React.FormEvent) => {
    e.preventDefault();
    setCodeFeedback(null);
    if (!user) return;
    const res = setUserReferralCode(user.id, newCodeInput);
    if (res.success) {
      setCodeFeedback({ type: 'success', text: res.message });
      setIsEditingCode(false);
      refreshStats();
    } else {
      setCodeFeedback({ type: 'error', text: res.message });
    }
  };

  // Submeter Saque PIX
  const handleWithdrawPix = (e: React.FormEvent) => {
    e.preventDefault();
    setWithdrawFeedback(null);
    if (!user) return;

    if (!pixKeyValue.trim()) {
      setWithdrawFeedback({ type: 'error', text: 'Informe a sua chave PIX para receber o valor.' });
      return;
    }

    const val = parseFloat(withdrawAmount) || stats.availableBalance;
    if (val <= 0) {
      setWithdrawFeedback({ type: 'error', text: 'Informe um valor válido para o saque.' });
      return;
    }

    saveAmbassadorPixKey(user.id, pixKeyValue, pixKeyType);
    const res = requestAmbassadorPixWithdrawal(user.id, val, pixKeyValue);
    if (res.success) {
      setWithdrawFeedback({ type: 'success', text: res.message });
      setIsWithdrawing(false);
      setWithdrawAmount('');
      refreshStats();
    } else {
      setWithdrawFeedback({ type: 'error', text: res.message });
    }
  };

  // Solicitar Reembolso do Plano (Meta 10)
  const handleRequestPlanRefund = () => {
    setRefundFeedback(null);
    if (!user) return;
    const res = requestAmbassadorPlanRefund(user.id);
    if (res.success) {
      setRefundFeedback({ type: 'success', text: res.message });
      refreshStats();
    } else {
      setRefundFeedback({ type: 'error', text: res.message });
    }
  };

  // Simular Venda (Teste)
  const handleSimulateSale = () => {
    if (!user) return;
    simulateAmbassadorSale(user.id, 'annual');
    refreshStats();
  };

  const progressPix = Math.min(100, (stats.salesCount / AMBASSADOR_CONFIG.minSalesForPixWithdrawal) * 100);
  const progressAmbassador = Math.min(100, (stats.salesCount / AMBASSADOR_CONFIG.minSalesForAmbassadorBadge) * 100);

  return (
    <div className="space-y-6">
      {/* HEADER DO PROGRAMA */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Programa de Indicação & Embaixadores Banco Residência
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
            Todo estudante pode indicar e monetizar
          </h2>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Compartilhe seu código com colegas de faculdade e internato. Seus amigos ganham{' '}
            <strong className="text-emerald-400">10% de desconto</strong> em qualquer plano e você recebe{' '}
            <strong className="text-emerald-400">15% de comissão via PIX</strong> em cada venda!
          </p>

          <div className="mt-4 flex flex-wrap gap-2.5 text-[11px] font-semibold text-slate-200">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Sem critérios de elegibilidade: aberto para todos
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              Saque PIX liberado com apenas 3 vendas (sem valor mínimo)
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-purple-400" />
              10 indicações: Selo Oficial + Reembolso 100% do seu plano
            </span>
          </div>
        </div>
      </div>

      {/* CARD DO CÓDIGO DO ALUNO */}
      <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-slate-400">
              Seu Código de Indicação Oficial
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
              Seus indicados garantem 10% de desconto e as vendas caem automaticamente na sua conta.
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsEditingCode(!isEditingCode)}
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
          >
            {isEditingCode ? 'Cancelar edição' : 'Personalizar código'}
          </button>
        </div>

        {isEditingCode ? (
          <form onSubmit={handleSaveCode} className="flex gap-2 max-w-md mb-4">
            <input
              type="text"
              value={newCodeInput}
              onChange={(e) => setNewCodeInput(e.target.value.toUpperCase())}
              placeholder="Ex: DR-LUCAS-10"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono font-bold text-xs uppercase text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-sm transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              Salvar
            </button>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 font-mono font-black text-lg text-slate-900 dark:text-white tracking-widest text-center sm:text-left flex items-center justify-center sm:justify-start gap-2.5">
              <Gift className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{stats.referralCode}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-md"
              >
                <Share2 className="w-4 h-4" />
                <span>Enviar no WhatsApp</span>
              </button>
            </div>
          </div>
        )}

        {codeFeedback && (
          <div
            className={`mt-3 p-3 rounded-xl text-xs flex items-center gap-2 ${
              codeFeedback.type === 'success'
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
            }`}
          >
            {codeFeedback.type === 'success' ? (
              <Check className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{codeFeedback.text}</span>
          </div>
        )}
      </div>

      {/* CARDS DE MÉTRICAS & REGRAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD 1: META DE 3 VENDAS (SAQUE PIX) */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                1. Regra de Saque PIX
              </span>
              {stats.canWithdrawPix ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                  <Unlock className="w-3 h-3" />
                  Liberado
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  <Lock className="w-3 h-3" />
                  {stats.salesNeededForPix} venda(s) restante(s)
                </span>
              )}
            </div>

            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.salesCount} / {AMBASSADOR_CONFIG.minSalesForPixWithdrawal} vendas
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${progressPix}%`,
                  backgroundColor: stats.canWithdrawPix ? '#10b981' : accentConfig.primaryHex
                }}
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
              {stats.canWithdrawPix ? (
                <strong className="text-emerald-600 dark:text-emerald-400">
                  Parabéns! Você atingiu 3 vendas e pode sacar qualquer valor disponível via PIX sem valor mínimo!
                </strong>
              ) : (
                <span>
                  Faça <strong>3 vendas com seu código</strong> para desbloquear a solicitação de saques via PIX. Não há valor mínimo de saque!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* CARD 2: META DE 10 VENDAS (SELOS + REEMBOLSO) */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                2. Selo Oficial & Reembolso
              </span>
              {stats.hasAmbassadorBadge ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30">
                  <Award className="w-3 h-3 text-amber-500" />
                  Embaixador Oficial
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500">
                  {stats.salesNeededForAmbassador} restante(s)
                </span>
              )}
            </div>

            <div className="text-2xl font-black text-slate-900 dark:text-white">
              {stats.salesCount} / {AMBASSADOR_CONFIG.minSalesForAmbassadorBadge} indicações
            </div>

            <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 mt-3 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-amber-500 to-yellow-400"
                style={{ width: `${progressAmbassador}%` }}
              />
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-2.5 leading-relaxed">
              {stats.hasAmbassadorBadge ? (
                <strong className="text-amber-600 dark:text-amber-400">
                  Selo de Embaixador Oficial conquistado! Você tem direito ao estorno/reembolso de 100% do plano que contratou!
                </strong>
              ) : (
                <span>
                  Ao fazer <strong>10 indicações</strong>, além dos 15% de comissão, você ganha o <strong>Selo de Embaixador</strong> e o <strong>reembolso integral</strong> do seu plano contratado!
                </span>
              )}
            </p>
          </div>
        </div>

        {/* CARD 3: SALDO EM COMISSÕES & SAQUE */}
        <div className="p-5 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
                Saldo Disponível (15% Comissão)
              </span>
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              R$ {stats.availableBalance.toFixed(2).replace('.', ',')}
            </div>

            <div className="text-[11px] text-slate-400 mt-1">
              Total já sacado: R$ {stats.withdrawnBalance.toFixed(2).replace('.', ',')}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <button
              type="button"
              disabled={!stats.canWithdrawPix || stats.availableBalance <= 0}
              onClick={() => setIsWithdrawing(true)}
              className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <ArrowUpRight className="w-4 h-4" />
              <span>Solicitar Saque via PIX</span>
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO DE REEMBOLSO DO PLANO CONTRATADO (META 10) */}
      {stats.canRequestPlanRefund && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-purple-500/10 border-2 border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-sm sm:text-base text-slate-900 dark:text-white">
                  Reembolso Integral do seu Plano Conquistado!
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500 text-white shadow-xs">
                  10+ Indicações
                </span>
              </div>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                Você bateu a meta máxima de embaixador. Solicite o estorno total do plano contratado e mantenha seu acesso liberado.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={stats.planRefundRequested}
            onClick={handleRequestPlanRefund}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-transform hover:scale-105 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {stats.planRefundRequested ? 'Reembolso Solicitado ✓' : 'Pedir Reembolso do Meu Plano'}
          </button>
        </div>
      )}

      {refundFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{refundFeedback.text}</span>
        </div>
      )}

      {/* MODAL / FORM DE SAQUE PIX */}
      {isWithdrawing && (
        <div className="p-5 sm:p-6 rounded-3xl border-2 border-blue-500/30 bg-blue-50/20 dark:bg-blue-950/20 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-blue-500" />
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Solicitação de Saque PIX (Disponível: R$ {stats.availableBalance.toFixed(2).replace('.', ',')})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsWithdrawing(false)}
              className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleWithdrawPix} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Tipo de Chave
              </label>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as typeof pixKeyType)}
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-900 dark:text-white focus:outline-none"
              >
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Celular</option>
                <option value="random">Chave Aleatória</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Chave PIX
              </label>
              <input
                type="text"
                value={pixKeyValue}
                onChange={(e) => setPixKeyValue(e.target.value)}
                placeholder="Informe sua chave PIX..."
                className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-1">
                Valor do Saque (R$)
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  step="0.01"
                  max={stats.availableBalance}
                  value={withdrawAmount}
                  onChange={(e) => setWithdrawAmount(e.target.value)}
                  placeholder={`Máx: ${stats.availableBalance.toFixed(2)}`}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs text-slate-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-sm hover:opacity-90 cursor-pointer shrink-0"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  Sacar
                </button>
              </div>
            </div>
          </form>

          {withdrawFeedback && (
            <div
              className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                withdrawFeedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/30'
              }`}
            >
              {withdrawFeedback.type === 'success' ? (
                <Check className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{withdrawFeedback.text}</span>
            </div>
          )}
        </div>
      )}

      {/* EXTRATO DE VENDAS & HISTÓRICO */}
      <div className="p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
              Histórico de Vendas com seu Código
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Cada plano vendido gera 15% de comissão líquida direta para você.
            </p>
          </div>

          {/* Botão de Simular Venda (Teste) */}
          <button
            type="button"
            onClick={handleSimulateSale}
            className="px-3.5 py-1.5 rounded-xl border border-dashed border-indigo-400 text-indigo-600 dark:text-indigo-400 text-[11px] font-bold hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-colors flex items-center gap-1.5 cursor-pointer"
            title="Adiciona uma venda de demonstração para testar as metas"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Simular Venda (Teste)</span>
          </button>
        </div>

        {stats.sales.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl">
            <Gift className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Nenhuma indicação registrada ainda
            </div>
            <p className="text-[11px] text-slate-400 mt-1 max-w-sm mx-auto">
              Compartilhe seu código <strong>{stats.referralCode}</strong> com seus colegas de turma ou clique em &quot;Simular Venda (Teste)&quot; acima para ver o extrato em ação!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800/80 text-slate-400 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Estudante</th>
                  <th className="py-2.5 px-3">Plano</th>
                  <th className="py-2.5 px-3">Valor Líquido</th>
                  <th className="py-2.5 px-3">Sua Comissão (15%)</th>
                  <th className="py-2.5 px-3">Data</th>
                  <th className="py-2.5 px-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {stats.sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">
                      {sale.studentName}
                      <span className="block text-[10px] text-slate-400 font-normal">
                        {sale.studentEmailMasked}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-medium">
                      {sale.planName}
                    </td>
                    <td className="py-3 px-3 font-medium text-slate-600 dark:text-slate-300">
                      R$ {sale.netAmount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      + R$ {sale.commissionAmount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-3 text-slate-400">
                      {sale.date}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        <Check className="w-3 h-3" />
                        Confirmada
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

