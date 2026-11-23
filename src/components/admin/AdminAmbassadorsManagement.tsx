'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Gift,
  DollarSign,
  Copy,
  Check,
  RefreshCw,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
  X,
  AlertCircle,
  Award
} from 'lucide-react';
import { Button, Badge } from '@/components/ui';

interface Withdrawal {
  id: string;
  user_id: string;
  userName: string;
  userEmail: string;
  referralCode: string;
  amount: number;
  pix_key: string;
  pix_key_type: string;
  valid_referrals_count: number;
  status: 'pending' | 'processing' | 'completed' | 'rejected';
  receipt_url: string | null;
  admin_notes: string | null;
  requested_at: string;
  processed_at: string | null;
}

interface RefundRequest {
  id: string;
  user_id: string;
  userName: string;
  userEmail: string;
  referralCode: string;
  valid_referrals_count: number;
  status: 'pending' | 'approved' | 'rejected';
  requested_at: string;
  processed_at: string | null;
}

interface TopAmbassador {
  id: string;
  name: string;
  email: string;
  referralCode: string;
  totalReferrals: number;
  completedReferrals: number;
  totalEarnings: number;
}

interface AmbassadorMetrics {
  pendingWithdrawalsCount: number;
  pendingWithdrawalsAmount: number;
  completedWithdrawalsCount: number;
  completedWithdrawalsAmount: number;
  pendingRefundsCount: number;
}

export const AdminAmbassadorsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'withdrawals' | 'refunds' | 'ranking'>('withdrawals');
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [refundRequests, setRefundRequests] = useState<RefundRequest[]>([]);
  const [topAmbassadors, setTopAmbassadors] = useState<TopAmbassador[]>([]);
  const [metrics, setMetrics] = useState<AmbassadorMetrics>({
    pendingWithdrawalsCount: 0,
    pendingWithdrawalsAmount: 0,
    completedWithdrawalsCount: 0,
    completedWithdrawalsAmount: 0,
    pendingRefundsCount: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modal de Liquidação de Saque
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [payoutAction, setPayoutAction] = useState<'complete' | 'reject'>('complete');
  const [receiptUrl, setReceiptUrl] = useState<string>('');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionFeedback, setActionFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal de Reembolso Anuidade
  const [selectedRefund, setSelectedRefund] = useState<RefundRequest | null>(null);
  const [refundAction, setRefundAction] = useState<'approve' | 'reject'>('approve');

  const fetchAmbassadorData = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/ambassador/payouts');
      const data = await res.json();
      if (data.success) {
        setWithdrawals(data.withdrawals || []);
        setRefundRequests(data.refundRequests || []);
        setTopAmbassadors(data.topAmbassadors || []);
        if (data.metrics) setMetrics(data.metrics);
      }
    } catch (err) {
      console.error('Falha ao carregar dados do programa de embaixadores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAmbassadorData();
  }, [fetchAmbassadorData]);

  const handleCopyPixKey = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleProcessPayout = async () => {
    if (!selectedWithdrawal) return;
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/ambassador/payouts/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          withdrawalId: selectedWithdrawal.id,
          action: payoutAction,
          receiptUrl: receiptUrl.trim() || undefined,
          adminNotes: adminNotes.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({ type: 'success', message: data.message || 'Saque processado!' });
        setTimeout(() => {
          setSelectedWithdrawal(null);
          setActionFeedback(null);
          setReceiptUrl('');
          setAdminNotes('');
          fetchAmbassadorData();
        }, 1200);
      } else {
        setActionFeedback({ type: 'error', message: data.error || 'Erro ao processar saque.' });
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'Falha de comunicação com o servidor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const handleProcessRefund = async () => {
    if (!selectedRefund) return;
    setActionLoading(true);
    setActionFeedback(null);
    try {
      const res = await fetch('/api/admin/ambassador/refunds/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          refundRequestId: selectedRefund.id,
          action: refundAction,
          adminNotes: adminNotes.trim() || undefined
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionFeedback({ type: 'success', message: data.message || 'Reembolso processado!' });
        setTimeout(() => {
          setSelectedRefund(null);
          setActionFeedback(null);
          setAdminNotes('');
          fetchAmbassadorData();
        }, 1200);
      } else {
        setActionFeedback({ type: 'error', message: data.error || 'Erro ao processar reembolso.' });
      }
    } catch {
      setActionFeedback({ type: 'error', message: 'Falha de comunicação com o servidor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val);
  };

  const formatDate = (isoDate: string) => {
    try {
      return new Date(isoDate).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Gift className="w-7 h-7 text-amber-500" />
            Embaixadores, Saques PIX & Reembolsos
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Liquidação de comissões PIX (Meta 3), aprovação de estorno integral (Meta 10) e ranking.
          </p>
        </div>
        <Button
          onClick={() => fetchAmbassadorData()}
          variant="outline"
          size="sm"
          className="gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Dados
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-amber-500/20 bg-amber-500/5 shadow-xs">
          <p className="text-xs font-semibold text-amber-600 dark:text-amber-400 uppercase tracking-wider">
            Saques PIX Pendentes
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">
              {formatCurrency(metrics.pendingWithdrawalsAmount)}
            </p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-700 dark:text-amber-300">
              {metrics.pendingWithdrawalsCount} solicitações
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/20 bg-emerald-500/5 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Total Liquidado aos Embaixadores
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(metrics.completedWithdrawalsAmount)}
            </p>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              {metrics.completedWithdrawalsCount} pagos
            </span>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-purple-500/20 bg-purple-500/5 shadow-xs">
          <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">
            Reembolso Anuidade (Meta 10)
          </p>
          <div className="flex items-baseline justify-between mt-1">
            <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {metrics.pendingRefundsCount}
            </p>
            <span className="text-xs text-purple-600 dark:text-purple-400">
              Aguardando homologação
            </span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 text-sm font-semibold">
        <button
          onClick={() => setActiveTab('withdrawals')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'withdrawals'
              ? 'bg-amber-500 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Fila de Saques PIX ({withdrawals.filter((w) => w.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('refunds')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'refunds'
              ? 'bg-purple-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Reembolso Anuidade ({refundRequests.filter((r) => r.status === 'pending').length})
        </button>
        <button
          onClick={() => setActiveTab('ranking')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'ranking'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
          }`}
        >
          Ranking de Embaixadores
        </button>
      </div>

      {/* Tab 1: Saques PIX */}
      {activeTab === 'withdrawals' && (
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Embaixador</th>
                <th className="px-4 py-3">Valor</th>
                <th className="px-4 py-3">Chave PIX</th>
                <th className="px-4 py-3">Indicações Válidas</th>
                <th className="px-4 py-3">Data</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-zinc-500">
                    <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-amber-500" />
                    Carregando solicitações de saque...
                  </td>
                </tr>
              ) : withdrawals.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-zinc-500">
                    Nenhuma solicitação de saque PIX registrada.
                  </td>
                </tr>
              ) : (
                withdrawals.map((w) => (
                  <tr key={w.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{w.userName}</div>
                      <div className="text-xs text-zinc-500">{w.userEmail}</div>
                      <div className="font-mono text-[11px] text-amber-600 dark:text-amber-400 mt-0.5">
                        Cupom: {w.referralCode || '—'}
                      </div>
                    </td>
                    <td className="px-4 py-3.5 font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(w.amount)}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded-md">
                          {w.pix_key}
                        </span>
                        <button
                          onClick={() => handleCopyPixKey(w.pix_key)}
                          className="p-1 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition"
                          title="Copiar Chave PIX"
                        >
                          {copiedKey === w.pix_key ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <span className="text-[10px] text-zinc-400 uppercase tracking-wider">{w.pix_key_type}</span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {w.valid_referrals_count} válidas (7+ dias)
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                      {formatDate(w.requested_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        w.status === 'completed'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : w.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {w.status === 'completed' ? 'Concluído' : w.status === 'pending' ? 'Pendente' : w.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {w.status === 'pending' ? (
                        <Button
                          onClick={() => {
                            setSelectedWithdrawal(w);
                            setPayoutAction('complete');
                            setReceiptUrl('');
                            setAdminNotes('');
                          }}
                          size="sm"
                          className="bg-amber-500 hover:bg-amber-600 text-white text-xs"
                        >
                          Liquidar Saque
                        </Button>
                      ) : (
                        <span className="text-xs text-zinc-400">Processado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 2: Reembolso Anuidade */}
      {activeTab === 'refunds' && (
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Aluno</th>
                <th className="px-4 py-3">Indicações Válidas</th>
                <th className="px-4 py-3">Data Solicitação</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Ação</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {refundRequests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-10 text-zinc-500">
                    Nenhuma solicitação de reembolso de anuidade (Meta 10) pendente.
                  </td>
                </tr>
              ) : (
                refundRequests.map((r) => (
                  <tr key={r.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{r.userName}</div>
                      <div className="text-xs text-zinc-500">{r.userEmail}</div>
                      <div className="font-mono text-[11px] text-purple-600 dark:text-purple-400 mt-0.5">
                        Cupom: {r.referralCode}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20">
                        <Award className="w-3.5 h-3.5" />
                        {r.valid_referrals_count} vendas válidas
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                      {formatDate(r.requested_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        r.status === 'approved'
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : r.status === 'pending'
                          ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {r.status === 'approved' ? 'Aprovado' : r.status === 'pending' ? 'Pendente' : r.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      {r.status === 'pending' ? (
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            onClick={() => {
                              setSelectedRefund(r);
                              setRefundAction('approve');
                            }}
                            size="sm"
                            className="bg-purple-600 hover:bg-purple-700 text-white text-xs"
                          >
                            Homologar Reembolso
                          </Button>
                        </div>
                      ) : (
                        <span className="text-xs text-zinc-400">Processado</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Tab 3: Ranking de Top Embaixadores */}
      {activeTab === 'ranking' && (
        <div className="overflow-x-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
              <tr>
                <th className="px-4 py-3">Posição</th>
                <th className="px-4 py-3">Embaixador</th>
                <th className="px-4 py-3">Cupom</th>
                <th className="px-4 py-3">Total de Indicações</th>
                <th className="px-4 py-3">Vendas Válidas</th>
                <th className="px-4 py-3 text-right">Comissões Acumuladas</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
              {topAmbassadors.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-zinc-500">
                    Ainda não há embaixadores com vendas registradas.
                  </td>
                </tr>
              ) : (
                topAmbassadors.map((amb, idx) => (
                  <tr key={amb.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3.5 font-bold">
                      {idx === 0 ? '🥇 1º' : idx === 1 ? '🥈 2º' : idx === 2 ? '🥉 3º' : `${idx + 1}º`}
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{amb.name}</div>
                      <div className="text-xs text-zinc-500">{amb.email}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
                        {amb.referralCode}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-400 font-medium">
                      {amb.totalReferrals}
                    </td>
                    <td className="px-4 py-3.5 font-bold text-emerald-600 dark:text-emerald-400">
                      {amb.completedReferrals}
                    </td>
                    <td className="px-4 py-3.5 text-right font-bold text-zinc-900 dark:text-zinc-100">
                      {formatCurrency(amb.totalEarnings)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal de Liquidação de Saque PIX */}
      {selectedWithdrawal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Processar Saque PIX
                </h3>
                <p className="text-xs text-zinc-500">
                  {selectedWithdrawal.userName} • {formatCurrency(selectedWithdrawal.amount)}
                </p>
              </div>
              <button
                onClick={() => setSelectedWithdrawal(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-3 bg-zinc-50 dark:bg-zinc-800/60 rounded-xl space-y-1 text-xs">
              <div className="text-zinc-500">Chave PIX ({selectedWithdrawal.pix_key_type}):</div>
              <div className="font-mono font-bold text-zinc-900 dark:text-zinc-100 text-sm select-all">
                {selectedWithdrawal.pix_key}
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">Decisão:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPayoutAction('complete')}
                  className={`p-2 rounded-xl border text-center font-medium transition ${
                    payoutAction === 'complete'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  Confirmar Liquidação
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutAction('reject')}
                  className={`p-2 rounded-xl border text-center font-medium transition ${
                    payoutAction === 'reject'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  Rejeitar Saque
                </button>
              </div>
            </div>

            {payoutAction === 'complete' && (
              <div className="text-xs space-y-1">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                  Link / URL do Comprovante PIX (Opcional):
                </label>
                <input
                  type="text"
                  value={receiptUrl}
                  onChange={(e) => setReceiptUrl(e.target.value)}
                  placeholder="https://storage.../comprovante.pdf"
                  className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
                />
              </div>
            )}

            <div className="text-xs space-y-1">
              <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                Observações Administrativas:
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ex: Pago via banco PJ no dia..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {actionFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}>
                {actionFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{actionFeedback.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedWithdrawal(null)}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleProcessPayout}
                disabled={actionLoading}
                className={payoutAction === 'complete' ? 'bg-emerald-600 hover:bg-emerald-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}
              >
                {actionLoading ? 'Processando...' : payoutAction === 'complete' ? 'Liquidar PIX' : 'Rejeitar Saque'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Homologação de Reembolso Anuidade */}
      {selectedRefund && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-md bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Homologar Reembolso Integral
                </h3>
                <p className="text-xs text-zinc-500">
                  {selectedRefund.userName} • Conquista Meta 10
                </p>
              </div>
              <button
                onClick={() => setSelectedRefund(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-600 dark:text-zinc-300">
              O aluno atingiu <strong>{selectedRefund.valid_referrals_count} indicações válidas</strong> com permanência de 7+ dias.
              Ao aprovar, o estorno de 100% da anuidade é deferido conforme as diretrizes do Programa de Embaixadores.
            </p>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">Decisão:</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setRefundAction('approve')}
                  className={`p-2 rounded-xl border text-center font-medium transition ${
                    refundAction === 'approve'
                      ? 'border-purple-600 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  Aprovar Estorno 100%
                </button>
                <button
                  type="button"
                  onClick={() => setRefundAction('reject')}
                  className={`p-2 rounded-xl border text-center font-medium transition ${
                    refundAction === 'reject'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'border-zinc-200 dark:border-zinc-800'
                  }`}
                >
                  Indeferir Pedido
                </button>
              </div>
            </div>

            <div className="text-xs space-y-1">
              <label className="font-semibold text-zinc-600 dark:text-zinc-400 block">
                Observações Administrativas:
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ex: Estorno solicitado via Mercado Pago ID..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100"
              />
            </div>

            {actionFeedback && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                actionFeedback.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
              }`}>
                {actionFeedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{actionFeedback.message}</span>
              </div>
            )}

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedRefund(null)}
                disabled={actionLoading}
              >
                Cancelar
              </Button>
              <Button
                size="sm"
                onClick={handleProcessRefund}
                disabled={actionLoading}
                className={refundAction === 'approve' ? 'bg-purple-600 hover:bg-purple-700 text-white' : 'bg-rose-600 hover:bg-rose-700 text-white'}
              >
                {actionLoading ? 'Processando...' : refundAction === 'approve' ? 'Aprovar Estorno' : 'Indeferir'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
