'use client';

import React, { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  Search,
  Filter,
  DollarSign,
  TrendingUp,
  Zap,
  RotateCcw,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui';

interface AdminOrder {
  id: string;
  user_id: string;
  userName: string;
  userEmail: string;
  plan_id: string;
  plan_name: string;
  amount: number;
  currency: string;
  installments: number;
  payment_method: string | null;
  status: string;
  mp_payment_id: string | null;
  created_at: string;
}

interface PaymentMetrics {
  totalGmv: number;
  approvedOrders: number;
  ticketMedio: number;
  pixCount: number;
  cardCount: number;
  pendingCount: number;
  refundedCount: number;
}

export const AdminPaymentsManagement: React.FC = () => {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [metrics, setMetrics] = useState<PaymentMetrics>({
    totalGmv: 0,
    approvedOrders: 0,
    ticketMedio: 0,
    pixCount: 0,
    cardCount: 0,
    pendingCount: 0,
    refundedCount: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Sync state
  const [syncingOrderId, setSyncingOrderId] = useState<string | null>(null);
  const [syncFeedback, setSyncFeedback] = useState<{ id: string; message: string; isError?: boolean } | null>(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        status: statusFilter,
        payment_method: methodFilter
      });
      const res = await fetch(`/api/admin/payments?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setOrders(data.orders || []);
        if (data.metrics) setMetrics(data.metrics);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Falha ao carregar pagamentos:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, methodFilter]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleSyncPayment = async (orderId: string, mpPaymentId: string | null) => {
    setSyncingOrderId(orderId);
    setSyncFeedback(null);
    try {
      const res = await fetch('/api/admin/payments/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, mpPaymentId: mpPaymentId || undefined })
      });
      const data = await res.json();
      if (data.success) {
        setSyncFeedback({
          id: orderId,
          message: `Sincronizado! Status no gateway: ${data.payment?.status}`
        });
        fetchOrders();
      } else {
        setSyncFeedback({
          id: orderId,
          message: data.error || 'Falha ao conciliar pagamento.',
          isError: true
        });
      }
    } catch {
      setSyncFeedback({
        id: orderId,
        message: 'Erro de comunicação ao sincronizar.',
        isError: true
      });
    } finally {
      setSyncingOrderId(null);
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
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
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
            <CreditCard className="w-7 h-7 text-emerald-600" />
            Gestão Financeira & Conciliação de Pagamentos
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Histórico completo de transações, integração com Mercado Pago, conciliação e faturamento.
          </p>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link href="/admin/planos">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/10"
            >
              <DollarSign className="w-3.5 h-3.5" />
              <span>Preços dos Planos</span>
            </Button>
          </Link>
          <Button
            onClick={() => fetchOrders()}
            variant="outline"
            size="sm"
            className="gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            Atualizar Pedidos
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/20 bg-emerald-500/5 shadow-xs col-span-2">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">
            Total Faturado (GMV)
          </p>
          <p className="text-2xl sm:text-3xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            {formatCurrency(metrics.totalGmv)}
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Aprovados</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{metrics.approvedOrders}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-500/20 bg-blue-500/5 shadow-xs">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Ticket Médio</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{formatCurrency(metrics.ticketMedio)}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">PIX vs Cartão</p>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-2">
            <span className="text-emerald-500 font-bold">{metrics.pixCount}</span> PIX • <span className="text-blue-500 font-bold">{metrics.cardCount}</span> Card
          </p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Pendentes / Estornos</p>
          <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 mt-2">
            <span className="text-amber-500 font-bold">{metrics.pendingCount}</span> pend • <span className="text-rose-500 font-bold">{metrics.refundedCount}</span> est
          </p>
        </div>
      </div>

      {/* Filters Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder="Buscar por ID da ordem, ID Mercado Pago ou plano..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">Todos os Status</option>
            <option value="approved">Aprovados</option>
            <option value="pending">Pendentes</option>
            <option value="cancelled">Cancelados</option>
            <option value="refunded">Reembolsados / Estornados</option>
          </select>

          <select
            value={methodFilter}
            onChange={(e) => { setMethodFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">Todos os Métodos</option>
            <option value="pix">PIX</option>
            <option value="credit_card">Cartão de Crédito</option>
          </select>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
            <tr>
              <th className="px-4 py-3">Data & ID</th>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Plano & Valor</th>
              <th className="px-4 py-3">Método</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Gateway ID</th>
              <th className="px-4 py-3 text-right">Ação</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-zinc-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-emerald-500" />
                  Carregando pagamentos...
                </td>
              </tr>
            ) : orders.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-10 text-zinc-500">
                  Nenhum pedido localizado para os critérios aplicados.
                </td>
              </tr>
            ) : (
              orders.map((ord) => {
                const isApproved = ord.status === 'approved';
                const isPix = ord.payment_method === 'pix' || ord.payment_method === 'account_money';
                const isSyncing = syncingOrderId === ord.id;
                const feedback = syncFeedback?.id === ord.id ? syncFeedback : null;

                return (
                  <tr key={ord.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-medium text-zinc-900 dark:text-zinc-100">{formatDate(ord.created_at)}</div>
                      <div className="font-mono text-[11px] text-zinc-400 mt-0.5 truncate max-w-[120px]">{ord.id}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{ord.userName}</div>
                      <div className="text-xs text-zinc-500">{ord.userEmail}</div>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="font-bold text-zinc-900 dark:text-zinc-100">{formatCurrency(ord.amount)}</div>
                      <div className="text-[11px] text-zinc-500">
                        {ord.plan_name || ord.plan_id}
                        {ord.installments > 1 && ` (${ord.installments}x)`}
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                        isPix
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                      }`}>
                        {isPix ? <Zap className="w-3 h-3" /> : <CreditCard className="w-3 h-3" />}
                        {isPix ? 'PIX' : 'Cartão'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        isApproved
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : ord.status === 'pending'
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}>
                        {ord.status === 'approved'
                          ? 'Aprovado'
                          : ord.status === 'pending'
                          ? 'Pendente'
                          : ord.status === 'refunded'
                          ? 'Estornado'
                          : ord.status}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 font-mono text-xs text-zinc-600 dark:text-zinc-400">
                      {ord.mp_payment_id || '—'}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        onClick={() => handleSyncPayment(ord.id, ord.mp_payment_id)}
                        disabled={isSyncing}
                        variant="outline"
                        size="sm"
                        className="text-xs gap-1"
                      >
                        <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin' : ''}`} />
                        Conciliar
                      </Button>
                      {feedback && (
                        <div className={`text-[10px] mt-1 font-medium ${
                          feedback.isError ? 'text-rose-500' : 'text-emerald-500'
                        }`}>
                          {feedback.message}
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        {/* Pagination Bar */}
        <div className="px-4 py-3 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between text-xs text-zinc-500">
          <div>
            Total: <strong>{totalCount}</strong> transações • Página {page} de {totalPages}
          </div>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="px-2 py-1"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="px-2 py-1"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
