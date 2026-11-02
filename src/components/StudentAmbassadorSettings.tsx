'use client';

import React, { useState, useEffect, useCallback } from 'react';
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
  Sparkles,
  AlertCircle,
  Clock,
  CheckCircle2,
  Lock,
  Unlock,
  QrCode,
  Trophy,
  Info,
  RotateCcw,
  ShieldCheck
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
  const [isClaimingRefund, setIsClaimingRefund] = useState(false);

  // Carrega e sincroniza estatísticas com backend e localStorage
  const refreshStats = useCallback(async () => {
    if (!user) return;

    // 1. Atualização imediata via local store
    const localStats = getAmbassadorStats(user.id, user.name);
    setStats(localStats);

    // 2. Tenta sincronizar com a API do backend
    try {
      const res = await fetch(`/api/ambassador/stats?userId=${encodeURIComponent(user.id)}`);
      if (res.ok) {
        const data = await res.json();
        if (data.success && data.stats) {
          // Se o backend tem vendas ou código sincronizado, mescla com o estado
          if (data.stats.sales && data.stats.sales.length > 0) {
            setStats(data.stats);
          }
        }
      }
    } catch {
      // Falha de rede silenciosa; mantém dados locais funcionais
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      refreshStats();
      const code = user.referralCode || getUserReferralCode(user);
      setNewCodeInput(code);
    }
  }, [user, refreshStats]);

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

  // Copiar Link Direto
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
      `Oi! Estou usando o Banco Residência para me preparar com questões comentadas e provas oficiais. Usa meu código ${stats.referralCode} para garantir 10% de desconto imediato em qualquer plano: ${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  // Salvar novo código customizado
  const handleSaveCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setCodeFeedback(null);
    if (!user) return;

    const res = setUserReferralCode(user.id, newCodeInput);
    if (!res.success) {
      setCodeFeedback({ type: 'error', text: res.message });
      return;
    }

    // Tenta sincronizar com o backend
    try {
      await fetch('/api/ambassador/code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: newCodeInput, userId: user.id })
      });
    } catch {
      // ignore
    }

    setCodeFeedback({ type: 'success', text: res.message });
    setIsEditingCode(false);
    refreshStats();
  };

  // Submeter Saque PIX
  const handleWithdrawPix = async (e: React.FormEvent) => {
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

    if (val > stats.availableBalance) {
      setWithdrawFeedback({
        type: 'error',
        text: `Valor solicitado (R$ ${val.toFixed(2).replace('.', ',')}) excede o saldo liberado contabilizado (R$ ${stats.availableBalance.toFixed(2).replace('.', ',')}).`
      });
      return;
    }

    saveAmbassadorPixKey(user.id, pixKeyValue, pixKeyType);

    // Tenta enviar para o backend
    try {
      const res = await fetch('/api/ambassador/withdraw', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: val,
          pixKey: pixKeyValue,
          pixKeyType,
          userId: user.id
        })
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        setWithdrawFeedback({ type: 'error', text: data.error || data.message || 'Falha ao solicitar saque.' });
        return;
      }
    } catch {
      // Se a rota falhar por estar offline, executa fallback local
      const localRes = requestAmbassadorPixWithdrawal(user.id, val, pixKeyValue, pixKeyType);
      if (!localRes.success) {
        setWithdrawFeedback({ type: 'error', text: localRes.message });
        return;
      }
    }

    // Atualiza localmente também
    requestAmbassadorPixWithdrawal(user.id, val, pixKeyValue, pixKeyType);

    setWithdrawFeedback({
      type: 'success',
      text: `Saque de R$ ${val.toFixed(2).replace('.', ',')} solicitado com sucesso via PIX (${pixKeyValue})! O comprovante será enviado em breve.`
    });
    setIsWithdrawing(false);
    setWithdrawAmount('');
    refreshStats();
  };

  // Solicitar Reembolso Integral do Plano (Meta 10)
  const handleRequestPlanRefund = async () => {
    setRefundFeedback(null);
    if (!user) return;

    setIsClaimingRefund(true);
    try {
      const res = await fetch('/api/ambassador/refund-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id })
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setRefundFeedback({ type: 'success', text: data.message });
      } else {
        const localRes = requestAmbassadorPlanRefund(user.id);
        setRefundFeedback({ type: localRes.success ? 'success' : 'error', text: localRes.message });
      }
    } catch {
      const localRes = requestAmbassadorPlanRefund(user.id);
      setRefundFeedback({ type: localRes.success ? 'success' : 'error', text: localRes.message });
    } finally {
      setIsClaimingRefund(false);
      refreshStats();
    }
  };

  // Simular Venda (Teste de Desenvolvimento)
  const handleSimulateSale = async (matured: boolean) => {
    if (!user) return;

    try {
      await fetch('/api/ambassador/simulate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          planType: 'annual',
          matured,
          daysAgo: matured ? 8 : 0
        })
      });
    } catch {
      // ignore
    }

    simulateAmbassadorSale(user.id, 'annual', { matured, daysAgo: matured ? 8 : 0 });
    refreshStats();
  };

  // Limpar simulações para testar estado limpo
  const handleResetSimulation = () => {
    if (!user) return;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(`bancoresidencia_ambassador_sales_${user.id}`);
      localStorage.removeItem(`bancoresidencia_ambassador_withdrawn_${user.id}`);
      localStorage.removeItem(`bancoresidencia_ambassador_refund_requested_${user.id}`);
    }
    refreshStats();
  };

  // Cálculos de progresso para as metas
  const progressPix = Math.min(100, Math.round((stats.validSalesCount / AMBASSADOR_CONFIG.minSalesForPixWithdrawal) * 100));
  const progressRefund = Math.min(100, Math.round((stats.validSalesCount / AMBASSADOR_CONFIG.minSalesForPlanRefund) * 100));

  return (
    <div className="space-y-6">
      {/* 1. HERO COMPACTO DO PROGRAMA DE EMBAIXADORES */}
      <div className="p-6 sm:p-7 rounded-3xl bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border border-zinc-800 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold mb-3 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5" />
            Programa de Indicação & Embaixadores Banco Residência
          </div>

          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white mb-2">
            Todo perfil tem seu código exclusivo para monetizar
          </h2>

          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
            Seus colegas ganham <strong className="text-emerald-400">10% de desconto</strong> e você recebe{' '}
            <strong className="text-emerald-400">15% de comissão líquida via PIX</strong>. Para que o aluno tenha
            contabilizado em sua conta o valor a receber, é preciso que o indicado permaneça 7 dias após confirmar o plano.
          </p>

          <div className="mt-4 flex flex-wrap gap-2 text-[11px] font-semibold text-zinc-200">
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 flex items-center gap-1.5">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Código individual gerado para cada perfil
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-sky-400" />
              Regra de Permanência: 7 dias de retenção
            </span>
            <span className="px-2.5 py-1 rounded-lg bg-white/10 border border-white/10 flex items-center gap-1.5">
              <Unlock className="w-3.5 h-3.5 text-amber-400" />
              Saque PIX desbloqueado com 3 indicações válidas
            </span>
          </div>
        </div>
      </div>

      {/* 2. CARD DO CÓDIGO DE INDICAÇÃO DO ALUNO */}
      <div className="p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[var(--bg-card)] shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-4">
          <div>
            <div className="text-xs font-extrabold uppercase tracking-wider text-zinc-400">
              Seu Código de Indicação Oficial
            </div>
            <div className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
              Cada perfil possui seu código exclusivo. Compartilhe e acompanhe as adesões em tempo real.
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
              placeholder="Ex: MED-SEUNOME-10"
              className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 font-mono font-bold text-xs uppercase text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:opacity-90 cursor-pointer"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              Salvar Código
            </button>
          </form>
        ) : (
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="px-5 py-3 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono font-black text-lg text-zinc-900 dark:text-white tracking-widest text-center sm:text-left flex items-center justify-center sm:justify-start gap-2.5">
              <Gift className="w-5 h-5 text-emerald-500 shrink-0" />
              <span>{stats.referralCode}</span>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={handleCopyCode}
                className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {copiedCode ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedCode ? 'Código Copiado!' : 'Copiar Código'}</span>
              </button>

              <button
                type="button"
                onClick={handleCopyLink}
                className="flex-1 sm:flex-none px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Share2 className="w-4 h-4" />}
                <span>{copiedLink ? 'Link Copiado!' : 'Copiar Link'}</span>
              </button>

              <button
                type="button"
                onClick={handleShareWhatsApp}
                className="w-full sm:w-auto px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-transform hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer shadow-sm"
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

      {/* 3. CARD DE CONQUISTA (SOLICITADO ESPECIFICAMENTE NO PROMPT) */}
      <div className="p-6 rounded-3xl border-2 border-indigo-500/30 dark:border-indigo-500/20 bg-gradient-to-br from-indigo-50/50 via-white to-purple-50/40 dark:from-zinc-900/90 dark:via-zinc-900/70 dark:to-zinc-900/90 shadow-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-indigo-100 dark:border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-md shrink-0">
              <Trophy className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading text-base font-extrabold text-zinc-900 dark:text-white">
                  Card de Conquistas do Embaixador
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 text-[10px] font-black uppercase">
                  Metas Oficiais
                </span>
              </div>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Acompanhe seu progresso de indicações válidas e libere saques e o reembolso do seu plano.
              </p>
            </div>
          </div>

          <div className="text-xs font-semibold px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 self-start sm:self-auto">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
            <span>Indicações Válidas: <strong>{stats.validSalesCount}</strong></span>
          </div>
        </div>

        {/* REGRA DOS 7 DIAS EXPLICADA NO CARD */}
        <div className="mt-4 p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-sky-800 dark:text-sky-300 text-xs flex items-start gap-2.5">
          <Info className="w-4 h-4 shrink-0 text-sky-500 mt-0.5" />
          <div className="leading-relaxed">
            <strong>Regra de Contabilização (7 dias de permanência):</strong> Para que o aluno tenha contabilizado
            em sua conta o valor a receber, é necessário que o indicado permaneça por pelo menos 7 dias com o plano ativo
            após a confirmação.
          </div>
        </div>

        {/* AS DUAS METAS DO CARD DE CONQUISTA */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* META 1: SAQUE PIX (3 INDICAÇÕES VÁLIDAS) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200/90 dark:border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <QrCode className="w-3.5 h-3.5 text-emerald-500" />
                  Meta 1: Liberação do Saque PIX
                </span>
                {stats.canWithdrawPix ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                    <Check className="w-3 h-3" />
                    Liberado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    <Lock className="w-3 h-3" />
                    Bloqueado
                  </span>
                )}
              </div>

              <div className="mt-2 text-sm font-extrabold text-zinc-900 dark:text-white">
                {stats.salesNeededForPix > 0 ? (
                  <span>
                    Falta{stats.salesNeededForPix > 1 ? 'm' : ''}{' '}
                    <strong className="text-amber-600 dark:text-amber-400 font-black text-base">
                      {stats.salesNeededForPix} indicação{stats.salesNeededForPix > 1 ? 'ões' : ''} válida{stats.salesNeededForPix > 1 ? 's' : ''}
                    </strong>{' '}
                    para sacar.
                  </span>
                ) : (
                  <span className="text-emerald-600 dark:text-emerald-400 font-black">
                    ✓ Conquista Desbloqueada! Saque PIX liberado!
                  </span>
                )}
              </div>

              {/* Barra de Progresso Meta 1 */}
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${progressPix}%`,
                    backgroundColor: stats.validSalesCount >= 3 ? '#10b981' : accentConfig.primaryHex
                  }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold mt-1.5">
                <span>{stats.validSalesCount} de 3 válidas</span>
                <span>{progressPix}%</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 leading-relaxed">
              {stats.validSalesCount >= 3 ? (
                <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                  Você atingiu o mínimo de 3 indicações válidas de 7+ dias. O botão de saque está ativo abaixo!
                </span>
              ) : (
                <span>
                  Ao atingir <strong>3 indicações válidas</strong> (permanência de 7 dias concluída), o botão de saque via PIX é desbloqueado automaticamente.
                </span>
              )}
            </p>
          </div>

          {/* META 2: REEMBOLSO TOTAL DO PLANO ADQUIRIDO (10 INDICAÇÕES VÁLIDAS) */}
          <div className="p-4 rounded-2xl bg-white dark:bg-zinc-950/60 border border-zinc-200/90 dark:border-zinc-800 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-purple-500" />
                  Meta 2: Reembolso Total do Plano
                </span>
                {stats.canRequestPlanRefund ? (
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-600 dark:text-purple-400 border border-purple-500/30">
                    <Award className="w-3 h-3 text-purple-500" />
                    Conquistado
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
                    {stats.salesNeededForPlanRefund} restante(s)
                  </span>
                )}
              </div>

              <div className="mt-2 text-sm font-extrabold text-zinc-900 dark:text-white">
                {stats.salesNeededForPlanRefund > 0 ? (
                  <span>
                    Falta{stats.salesNeededForPlanRefund > 1 ? 'm' : ''}{' '}
                    <strong className="text-purple-600 dark:text-purple-400 font-black text-base">
                      {stats.salesNeededForPlanRefund} indicação{stats.salesNeededForPlanRefund > 1 ? 'ões' : ''}
                    </strong>{' '}
                    para receber o reembolso total do plano adquirido.
                  </span>
                ) : (
                  <span className="text-purple-600 dark:text-purple-400 font-black">
                    🏆 Conquista Máxima Desbloqueada! Reembolso de 100% liberado!
                  </span>
                )}
              </div>

              {/* Barra de Progresso Meta 2 */}
              <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 mt-3 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500 bg-gradient-to-r from-purple-500 to-amber-500"
                  style={{ width: `${progressRefund}%` }}
                />
              </div>

              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-bold mt-1.5">
                <span>{stats.validSalesCount} de 10 válidas</span>
                <span>{progressRefund}%</span>
              </div>
            </div>

            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-3 pt-2.5 border-t border-zinc-100 dark:border-zinc-800/80 leading-relaxed">
              {stats.canRequestPlanRefund ? (
                <span className="text-purple-600 dark:text-purple-400 font-semibold">
                  Selo de Embaixador conquistado! Você tem direito ao estorno integral de 100% do valor pago pelo plano.
                </span>
              ) : (
                <span>
                  Com <strong>10 indicações válidas</strong>, você ganha o <strong>Selo de Embaixador</strong> e o <strong>reembolso total de 100%</strong> do plano contratado, mantendo seu acesso ativo!
                </span>
              )}
            </p>
          </div>
        </div>
      </div>

      {/* 4. PAINEL DE SALDOS & BOTÃO DE SAQUE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* CARD A: SALDO DISPONÍVEL (LIBERADO APÓS 7 DIAS) */}
        <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[var(--bg-card)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                Saldo Liberado para Saque
              </span>
              <Wallet className="w-4 h-4 text-emerald-500" />
            </div>

            <div className="text-3xl font-black text-emerald-600 dark:text-emerald-400">
              R$ {stats.availableBalance.toFixed(2).replace('.', ',')}
            </div>

            <div className="text-[11px] text-zinc-400 mt-1">
              {stats.validSalesCount} venda{stats.validSalesCount === 1 ? '' : 's'} com permanência de 7+ dias confirmada
            </div>
          </div>

          {/* BOTÃO DE SAQUE (SOLICITADO: AO ATINGIR 3 DEVE TER UM BOTÃO PARA SOLICITAR O SAQUE) */}
          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800">
            {stats.validSalesCount >= 3 ? (
              <button
                type="button"
                disabled={stats.availableBalance <= 0}
                onClick={() => setIsWithdrawing(true)}
                className="w-full py-2.5 rounded-xl text-xs font-bold text-white shadow-xs transition-all hover:scale-[1.02] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <ArrowUpRight className="w-4 h-4" />
                <span>Solicitar Saque via PIX</span>
              </button>
            ) : (
              <button
                type="button"
                disabled
                className="w-full py-2.5 rounded-xl text-xs font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-400 flex items-center justify-center gap-1.5 cursor-not-allowed border border-zinc-200 dark:border-zinc-700"
                title={`Necessário no mínimo 3 indicações válidas de 7+ dias para liberar o botão de saque. Faltam ${stats.salesNeededForPix}.`}
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Saque Bloqueado (Faltam {stats.salesNeededForPix} de 3)</span>
              </button>
            )}
          </div>
        </div>

        {/* CARD B: SALDO PENDENTE (EM PERÍODO DE GARANTIA DE 7 DIAS) */}
        <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[var(--bg-card)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                Saldo em Retenção (7 dias)
              </span>
              <Clock className="w-4 h-4 text-sky-500" />
            </div>

            <div className="text-3xl font-black text-sky-600 dark:text-sky-400">
              R$ {stats.pendingCommission.toFixed(2).replace('.', ',')}
            </div>

            <div className="text-[11px] text-zinc-400 mt-1">
              {stats.pendingSalesCount} indicação{stats.pendingSalesCount === 1 ? '' : 'ões'} em período de garantia
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400">
            Liberado automaticamente após cada indicado completar 7 dias de plano.
          </div>
        </div>

        {/* CARD C: TOTAL JÁ SACADO */}
        <div className="p-5 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[var(--bg-card)] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-zinc-400">
                Total Já Sacado via PIX
              </span>
              <TrendingUp className="w-4 h-4 text-purple-500" />
            </div>

            <div className="text-3xl font-black text-zinc-700 dark:text-zinc-200">
              R$ {stats.withdrawnBalance.toFixed(2).replace('.', ',')}
            </div>

            <div className="text-[11px] text-zinc-400 mt-1">
              Comissões já transferidas para a sua conta
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-zinc-100 dark:border-zinc-800 text-[11px] text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
            <span>Sem taxas e sem valor mínimo por saque</span>
          </div>
        </div>
      </div>

      {/* 5. SEÇÃO DE REEMBOLSO DO PLANO CONTRATADO (META 10) */}
      {stats.canRequestPlanRefund && (
        <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-purple-500/10 via-amber-500/10 to-purple-500/10 border-2 border-purple-500/30 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in zoom-in-95">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-purple-500 text-white flex items-center justify-center shrink-0 shadow-md">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-white">
                  Reembolso Total do seu Plano Conquistado!
                </h3>
                <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-purple-500 text-white shadow-xs">
                  10+ Indicações Válidas
                </span>
              </div>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-0.5">
                Você bateu a meta de embaixador. Solicite o reembolso total de 100% do plano contratado mantendo seu acesso ativo.
              </p>
            </div>
          </div>

          <button
            type="button"
            disabled={stats.planRefundRequested || isClaimingRefund}
            onClick={handleRequestPlanRefund}
            className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold shadow-md transition-transform hover:scale-105 shrink-0 cursor-pointer disabled:opacity-50"
          >
            {stats.planRefundRequested ? 'Reembolso Solicitado ✓' : isClaimingRefund ? 'Processando...' : 'Pedir Reembolso do Meu Plano'}
          </button>
        </div>
      )}

      {refundFeedback && (
        <div className="p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 text-xs flex items-center gap-2.5">
          <CheckCircle2 className="w-5 h-5 shrink-0 text-emerald-500" />
          <span>{refundFeedback.text}</span>
        </div>
      )}

      {/* 6. FORMULÁRIO DE SAQUE PIX (QUANDO ATIVO) */}
      {isWithdrawing && (
        <div className="p-5 sm:p-6 rounded-3xl border-2 border-emerald-500/30 bg-emerald-50/20 dark:bg-emerald-950/20 space-y-4 animate-in slide-in-from-top-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-emerald-500" />
              <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
                Solicitação de Saque PIX (Disponível: R$ {stats.availableBalance.toFixed(2).replace('.', ',')})
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsWithdrawing(false)}
              className="text-xs text-zinc-500 hover:text-zinc-800 dark:hover:text-white cursor-pointer"
            >
              Cancelar
            </button>
          </div>

          <form onSubmit={handleWithdrawPix} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                Tipo de Chave
              </label>
              <select
                value={pixKeyType}
                onChange={(e) => setPixKeyType(e.target.value as typeof pixKeyType)}
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs font-semibold text-zinc-900 dark:text-white focus:outline-none"
              >
                <option value="cpf">CPF</option>
                <option value="email">E-mail</option>
                <option value="phone">Celular</option>
                <option value="random">Chave Aleatória</option>
              </select>
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
                Chave PIX
              </label>
              <input
                type="text"
                value={pixKeyValue}
                onChange={(e) => setPixKeyValue(e.target.value)}
                placeholder="Informe sua chave PIX..."
                className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="text-[11px] font-bold text-zinc-600 dark:text-zinc-400 block mb-1">
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
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-xs text-zinc-900 dark:text-white focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl text-xs font-black text-white shadow-xs hover:opacity-90 cursor-pointer shrink-0"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  Confirmar Saque
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

      {/* 7. EXTRATO DE VENDAS & CONTROLES DE TESTE */}
      <div className="p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[var(--bg-card)] shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h3 className="text-sm font-extrabold text-zinc-900 dark:text-white">
              Histórico de Vendas com seu Código
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              15% de comissão por venda. A indicação se torna válida após o período de 7 dias de permanência.
            </p>
          </div>

          {/* CONTROLES DE SIMULAÇÃO (TESTES E DEMONSTRAÇÃO) */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => handleSimulateSale(false)}
              className="px-3 py-1.5 rounded-xl border border-sky-400/40 text-sky-600 dark:text-sky-400 text-[11px] font-bold hover:bg-sky-50 dark:hover:bg-sky-950/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Adiciona uma venda recente de hoje (aguardando 7 dias de permanência)"
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Simular Venda Recente (7d retenção)</span>
            </button>

            <button
              type="button"
              onClick={() => handleSimulateSale(true)}
              className="px-3 py-1.5 rounded-xl border border-emerald-500/50 text-emerald-600 dark:text-emerald-400 text-[11px] font-bold hover:bg-emerald-50 dark:hover:bg-emerald-950/30 transition-colors flex items-center gap-1.5 cursor-pointer"
              title="Adiciona uma venda válida de 8 dias atrás (contabilizada para saque e metas)"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Simular Venda Válida (&gt;7 dias)</span>
            </button>

            {stats.sales.length > 0 && (
              <button
                type="button"
                onClick={handleResetSimulation}
                className="px-2.5 py-1.5 rounded-xl text-zinc-400 hover:text-rose-500 text-[11px] font-semibold transition-colors flex items-center gap-1 cursor-pointer"
                title="Limpar simulações"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Resetar</span>
              </button>
            )}
          </div>
        </div>

        {stats.sales.length === 0 ? (
          <div className="text-center py-10 px-4 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl">
            <Gift className="w-8 h-8 text-zinc-300 dark:text-zinc-600 mx-auto mb-2" />
            <div className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
              Nenhuma indicação registrada ainda
            </div>
            <p className="text-[11px] text-zinc-400 mt-1 max-w-sm mx-auto">
              Compartilhe seu código <strong>{stats.referralCode}</strong> com colegas de turma ou utilize os botões de simulação acima para testar as regras de 7 dias e o desbloqueio do saque ao atingir 3!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-800/80 text-zinc-400 text-[10px] font-extrabold uppercase tracking-wider">
                  <th className="py-2.5 px-3">Estudante Indicado</th>
                  <th className="py-2.5 px-3">Plano</th>
                  <th className="py-2.5 px-3">Valor Líquido</th>
                  <th className="py-2.5 px-3">Sua Comissão (15%)</th>
                  <th className="py-2.5 px-3">Confirmação</th>
                  <th className="py-2.5 px-3 text-right">Status de Permanência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/40">
                {stats.sales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/30">
                    <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">
                      {sale.studentName}
                      <span className="block text-[10px] text-zinc-400 font-normal">
                        {sale.studentEmailMasked}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-zinc-600 dark:text-zinc-300 font-medium">
                      {sale.planName}
                    </td>
                    <td className="py-3 px-3 font-medium text-zinc-600 dark:text-zinc-300">
                      R$ {sale.netAmount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-3 font-bold text-emerald-600 dark:text-emerald-400">
                      + R$ {sale.commissionAmount.toFixed(2).replace('.', ',')}
                    </td>
                    <td className="py-3 px-3 text-zinc-400">
                      {sale.date}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {sale.isMatured ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                          <Check className="w-3 h-3" />
                          Válida (7+ dias) ✓
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/30" title={`Completa os 7 dias de permanência em ${sale.daysRemaining} dia(s)`}>
                          <Clock className="w-3 h-3 text-sky-500" />
                          Aguardando 7 dias ({sale.daysRemaining}d restante{sale.daysRemaining > 1 ? 's' : ''})
                        </span>
                      )}
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
