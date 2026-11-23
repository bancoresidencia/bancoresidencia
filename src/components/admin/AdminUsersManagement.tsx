'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
  Users,
  Search,
  Filter,
  Shield,
  Sparkles,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Clock,
  MoreVertical,
  X,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  UserCheck
} from 'lucide-react';
import { Badge, Button } from '@/components/ui';

interface AdminUser {
  id: string;
  name: string | null;
  email: string | null;
  role: string;
  specialty_target: string | null;
  college: string | null;
  graduation_year: number | null;
  avatar_url: string | null;
  subscription_plan: string;
  subscription_status: string;
  subscription_duration: string | null;
  subscription_started_at: string | null;
  subscription_expires_at: string | null;
  referral_code: string | null;
  referred_by_code: string | null;
  created_at: string;
}

interface UserMetrics {
  totalUsers: number;
  activePro: number;
  trialFree: number;
  churned: number;
  conversionRate: number;
}

export const AdminUsersManagement: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [metrics, setMetrics] = useState<UserMetrics>({
    totalUsers: 0,
    activePro: 0,
    trialFree: 0,
    churned: 0,
    conversionRate: 0
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalCount, setTotalCount] = useState<number>(0);

  // Modal State
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [modalAction, setModalAction] = useState<'grant_pro' | 'extend' | 'cancel' | 'set_role'>('grant_pro');
  const [targetPlan, setTargetPlan] = useState<'pro' | 'premium'>('pro');
  const [durationDays, setDurationDays] = useState<number>(30);
  const [targetRole, setTargetRole] = useState<'student' | 'curator' | 'admin'>('student');
  const [adminNotes, setAdminNotes] = useState<string>('');
  const [actionLoading, setActionLoading] = useState<boolean>(false);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: String(page),
        limit: '15',
        search,
        role: roleFilter,
        plan: planFilter,
        status: statusFilter
      });
      const res = await fetch(`/api/admin/users?${params.toString()}`);
      const data = await res.json();
      if (data.success) {
        setUsers(data.users || []);
        if (data.metrics) setMetrics(data.metrics);
        if (data.pagination) {
          setTotalPages(data.pagination.totalPages || 1);
          setTotalCount(data.pagination.total || 0);
        }
      }
    } catch (err) {
      console.error('Falha ao carregar lista de usuários:', err);
    } finally {
      setLoading(false);
    }
  }, [page, search, roleFilter, planFilter, statusFilter]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleApplySubscriptionUpdate = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    setActionMessage(null);
    try {
      const res = await fetch('/api/admin/users/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: selectedUser.id,
          action: modalAction,
          plan: modalAction === 'grant_pro' ? targetPlan : undefined,
          durationDays: modalAction === 'grant_pro' || modalAction === 'extend' ? durationDays : undefined,
          role: modalAction === 'set_role' ? targetRole : undefined,
          adminNotes
        })
      });
      const data = await res.json();
      if (data.success) {
        setActionMessage({ type: 'success', text: data.message || 'Atualizado com sucesso!' });
        setTimeout(() => {
          setSelectedUser(null);
          setActionMessage(null);
          fetchUsers();
        }, 1200);
      } else {
        setActionMessage({ type: 'error', text: data.error || 'Erro ao processar alteração.' });
      }
    } catch {
      setActionMessage({ type: 'error', text: 'Falha de comunicação com o servidor.' });
    } finally {
      setActionLoading(false);
    }
  };

  const formatDate = (isoDate: string | null) => {
    if (!isoDate) return '—';
    try {
      return new Date(isoDate).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
    } catch {
      return '—';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Title */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Users className="w-7 h-7 text-blue-600" />
            Gerenciamento de Usuários & Assinaturas
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400 mt-1">
            Controle de alunos, planos ativos, permissões e concessão de acessos da plataforma.
          </p>
        </div>
        <Button
          onClick={() => fetchUsers()}
          variant="outline"
          size="sm"
          className="gap-1.5 self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          Atualizar Lista
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 sm:gap-4">
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Total de Alunos</p>
          <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-1">{metrics.totalUsers}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-emerald-500/20 bg-emerald-500/5 shadow-xs">
          <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Assinantes PRO</p>
          <p className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">{metrics.activePro}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Gratuitos / Trial</p>
          <p className="text-2xl font-bold text-zinc-700 dark:text-zinc-300 mt-1">{metrics.trialFree}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
          <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Cancelados / Churn</p>
          <p className="text-2xl font-bold text-zinc-500 mt-1">{metrics.churned}</p>
        </div>
        <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-blue-500/20 bg-blue-500/5 shadow-xs col-span-2 md:col-span-1">
          <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Conversão</p>
          <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">{metrics.conversionRate}%</p>
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
            placeholder="Buscar por nome, e-mail, faculdade ou cupom..."
            className="w-full pl-9 pr-4 py-2 text-sm rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400 focus:outline-hidden focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <select
            value={roleFilter}
            onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">Todos os Papéis</option>
            <option value="student">Aluno</option>
            <option value="curator">Curador Médico</option>
            <option value="admin">Administrador</option>
          </select>

          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">Todos os Planos</option>
            <option value="free">Gratuito (Free)</option>
            <option value="pro">Plano PRO</option>
            <option value="premium">Plano Premium</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            className="px-3 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 text-zinc-800 dark:text-zinc-200"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Ativo</option>
            <option value="inactive">Inativo</option>
            <option value="canceled">Cancelado</option>
            <option value="refunded">Reembolsado</option>
          </select>
        </div>
      </div>

      {/* Table Container */}
      <div className="overflow-x-auto rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs">
        <table className="w-full text-left text-xs sm:text-sm">
          <thead className="bg-zinc-50 dark:bg-zinc-800/50 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 uppercase tracking-wider font-semibold text-[11px]">
            <tr>
              <th className="px-4 py-3">Aluno</th>
              <th className="px-4 py-3">Papel</th>
              <th className="px-4 py-3">Plano & Status</th>
              <th className="px-4 py-3">Expiração</th>
              <th className="px-4 py-3">Código Embaixador</th>
              <th className="px-4 py-3 text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-zinc-500">
                  <RefreshCw className="w-6 h-6 animate-spin mx-auto mb-2 text-blue-500" />
                  Carregando usuários...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-10 text-zinc-500">
                  Nenhum usuário encontrado para os filtros selecionados.
                </td>
              </tr>
            ) : (
              users.map((u) => {
                const isProActive = u.subscription_status === 'active' && u.subscription_plan !== 'free';
                return (
                  <tr key={u.id} className="hover:bg-zinc-50/60 dark:hover:bg-zinc-800/30 transition">
                    <td className="px-4 py-3.5">
                      <div className="font-semibold text-zinc-900 dark:text-zinc-100">{u.name || 'Sem Nome'}</div>
                      <div className="text-xs text-zinc-500">{u.email}</div>
                      {u.college && <div className="text-[11px] text-zinc-400 mt-0.5">{u.college}</div>}
                    </td>
                    <td className="px-4 py-3.5">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                        u.role === 'admin'
                          ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                          : u.role === 'curator' || u.role === 'curador'
                          ? 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                      }`}>
                        {u.role === 'admin' ? 'Admin' : u.role === 'curator' || u.role === 'curador' ? 'Curador' : 'Aluno'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold ${
                          isProActive
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                            : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}>
                          {u.subscription_plan.toUpperCase()}
                        </span>
                        <span className="text-[11px] text-zinc-500">
                          {u.subscription_status === 'active' ? 'Ativo' : u.subscription_status}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-zinc-600 dark:text-zinc-300">
                      {formatDate(u.subscription_expires_at)}
                    </td>
                    <td className="px-4 py-3.5">
                      {u.referral_code ? (
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-md">
                          {u.referral_code}
                        </span>
                      ) : (
                        <span className="text-zinc-400 text-xs">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-right">
                      <Button
                        onClick={() => {
                          setSelectedUser(u);
                          setModalAction('grant_pro');
                          setAdminNotes('');
                        }}
                        variant="outline"
                        size="sm"
                        className="text-xs"
                      >
                        Gerenciar
                      </Button>
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
            Total: <strong>{totalCount}</strong> usuários • Página {page} de {totalPages}
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

      {/* Modal de Gestão de Usuário */}
      {selectedUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
              <div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-zinc-100">
                  Gerenciar Aluno: {selectedUser.name || 'Sem Nome'}
                </h3>
                <p className="text-xs text-zinc-500">{selectedUser.email}</p>
              </div>
              <button
                onClick={() => setSelectedUser(null)}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Seleção da Ação */}
            <div className="space-y-2">
              <label className="text-xs font-semibold text-zinc-600 dark:text-zinc-400">Tipo de Intervenção:</label>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <button
                  type="button"
                  onClick={() => setModalAction('grant_pro')}
                  className={`p-2 rounded-xl border text-left font-medium transition ${
                    modalAction === 'grant_pro'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  Conceder PRO
                </button>
                <button
                  type="button"
                  onClick={() => setModalAction('extend')}
                  className={`p-2 rounded-xl border text-left font-medium transition ${
                    modalAction === 'extend'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  Estender Dias
                </button>
                <button
                  type="button"
                  onClick={() => setModalAction('set_role')}
                  className={`p-2 rounded-xl border text-left font-medium transition ${
                    modalAction === 'set_role'
                      ? 'border-blue-500 bg-blue-500/10 text-blue-600 dark:text-blue-400'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  Alterar Papel
                </button>
                <button
                  type="button"
                  onClick={() => setModalAction('cancel')}
                  className={`p-2 rounded-xl border text-left font-medium transition ${
                    modalAction === 'cancel'
                      ? 'border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                  }`}
                >
                  Cancelar Assinatura
                </button>
              </div>
            </div>

            {/* Campos dinâmicos conforme a ação */}
            {modalAction === 'grant_pro' && (
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Plano:</label>
                  <select
                    value={targetPlan}
                    onChange={(e) => setTargetPlan(e.target.value as 'pro' | 'premium')}
                    className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  >
                    <option value="pro">PRO</option>
                    <option value="premium">Premium</option>
                  </select>
                </div>
                <div>
                  <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Duração (dias):</label>
                  <select
                    value={durationDays}
                    onChange={(e) => setDurationDays(Number(e.target.value))}
                    className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                  >
                    <option value={7}>7 dias (Trial)</option>
                    <option value={30}>30 dias (1 mês)</option>
                    <option value={90}>90 dias (3 meses)</option>
                    <option value={180}>180 dias (6 meses)</option>
                    <option value={365}>365 dias (1 ano)</option>
                  </select>
                </div>
              </div>
            )}

            {modalAction === 'extend' && (
              <div className="text-xs">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Adicionar Dias:</label>
                <select
                  value={durationDays}
                  onChange={(e) => setDurationDays(Number(e.target.value))}
                  className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                >
                  <option value={15}>+ 15 dias</option>
                  <option value={30}>+ 30 dias (1 mês)</option>
                  <option value={60}>+ 60 dias (2 meses)</option>
                  <option value={90}>+ 90 dias (3 meses)</option>
                </select>
              </div>
            )}

            {modalAction === 'set_role' && (
              <div className="text-xs">
                <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">Novo Papel de Acesso:</label>
                <select
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value as 'student' | 'curator' | 'admin')}
                  className="w-full p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700"
                >
                  <option value="student">Aluno (Padrão)</option>
                  <option value="curator">Curador Médico</option>
                  <option value="admin">Administrador (Super)</option>
                </select>
              </div>
            )}

            {/* Observações Administrativas */}
            <div className="text-xs">
              <label className="font-semibold text-zinc-600 dark:text-zinc-400 block mb-1">
                Motivo / Observações Administrativas:
              </label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ex: Concessão de cortesia para monitoria, ajuste de suporte..."
                rows={2}
                className="w-full p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
              />
            </div>

            {actionMessage && (
              <div className={`p-3 rounded-xl text-xs flex items-center gap-2 ${
                actionMessage.type === 'success'
                  ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                  : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
              }`}>
                {actionMessage.type === 'success' ? <CheckCircle2 className="w-4 h-4 shrink-0" /> : <AlertCircle className="w-4 h-4 shrink-0" />}
                <span>{actionMessage.text}</span>
              </div>
            )}

            {/* Botões do Modal */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-zinc-200 dark:border-zinc-800">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedUser(null)}
                disabled={actionLoading}
              >
                Fechar
              </Button>
              <Button
                size="sm"
                onClick={handleApplySubscriptionUpdate}
                disabled={actionLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {actionLoading ? 'Processando...' : 'Confirmar Alteração'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
