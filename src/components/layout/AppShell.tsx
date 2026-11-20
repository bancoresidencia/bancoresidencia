'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import {
  Menu,
  X,
  Sparkles,
  Crown,
  ShieldCheck,
  Flag,
  ShieldAlert,
  ChevronRight,
  LogOut,
  Flame,
  LayoutDashboard,
  FileQuestion,
  AlertOctagon,
  Brain,
  Cloud,
  CloudOff,
  RefreshCw
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
import { Logo } from '@/components/Logo';
import { GlobalSearchBar } from '@/components/GlobalSearchBar';
import { HeaderStudyTimer } from '@/components/HeaderStudyTimer';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Button, Badge } from '@/components/ui';
import dynamic from 'next/dynamic';

const KeyboardShortcutsModal = dynamic(
  () => import('@/components/KeyboardShortcutsModal').then((mod) => mod.KeyboardShortcutsModal),
  { ssr: false }
);
const OnboardingModal = dynamic(
  () => import('@/components/OnboardingModal').then((mod) => mod.OnboardingModal),
  { ssr: false }
);
const SubscriptionModal = dynamic(
  () => import('@/components/SubscriptionModal').then((mod) => mod.SubscriptionModal),
  { ssr: false }
);
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useSubscription } from '@/context/SubscriptionContext';
import { useStudentData } from '@/context/StudentDataContext';
import { ActiveTab } from '@/types';
import { AdminTabToggle } from '@/components/layout/AdminTabToggle';
import { TabFeatureGuard } from '@/components/layout/TabFeatureGuard';
import {
  getCloudSyncSnapshot,
  subscribeCloudSync,
  requestImmediateCloudSync,
  CloudSyncSnapshot
} from '@/utils/crossDeviceSync';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAdmin, logout } = useAuth();
  const { accentConfig } = useTheme();
  const {
    plan,
    isUpgradeModalOpen,
    closeUpgradeModal,
    isSubscriptionExpired
  } = useSubscription();

  const {
    stats,
    pendingErrorsCount,
    lists,
    performanceFilters
  } = useStudentData();

  // Barra lateral retrátil (persistida no localStorage)
  const [sidebarCollapsed, setSidebarCollapsed] = useState<boolean>(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Bloqueia rolagem do body quando drawer mobile estiver aberto
  useEffect(() => {
    if (mobileMenuOpen) {
      const origOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = origOverflow;
      };
    }
  }, [mobileMenuOpen]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('bancoresidencia_sidebar_collapsed');
      if (saved !== null) {
        setSidebarCollapsed(saved === 'true');
      }
    } catch { }
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bancoresidencia_sidebar_collapsed', String(next));
      } catch { }
      return next;
    });
  };

  // Dropdown de perfil e status de sincronização multi-dispositivo
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [syncSnapshot, setSyncSnapshot] = useState<CloudSyncSnapshot>(() => getCloudSyncSnapshot());

  useEffect(() => {
    setSyncSnapshot(getCloudSyncSnapshot());
    return subscribeCloudSync((next) => setSyncSnapshot(next));
  }, []);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Atalhos de teclado
  const [isShortcutsModalOpen, setIsShortcutsModalOpen] = useState(false);
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.key === '?' || (e.shiftKey && e.key === '/')) && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault();
        setIsShortcutsModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Onboarding para primeiro acesso
  const [isOnboardingOpen, setIsOnboardingOpen] = useState(false);
  useEffect(() => {
    if (user?.id) {
      try {
        const isCompleted = localStorage.getItem(`onboarding_completed_${user.id}`);
        if (!isCompleted && !user.college && !user.targetExamName) {
          setIsOnboardingOpen(true);
        }
      } catch { }
    }
  }, [user]);

  const isUserFree = !user?.subscriptionPlan || user?.subscriptionPlan === 'free' || isSubscriptionExpired;

  return (
    <div className="min-h-screen bg-[var(--bg-page,#fafafa)] dark:bg-[var(--background,#09090b)] text-[var(--foreground,#18181b)] flex font-sans transition-colors duration-200">
      {/* 1. Barra Lateral de Navegação (Desktop) */}
      <Sidebar
        modalidade={performanceFilters.modalidade}
        streakDays={stats.streakDays}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={handleToggleSidebar}
        pendingErrorsCount={pendingErrorsCount}
      />

      {/* 2. Container Principal à Direita da Sidebar */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-clip">
        {/* Cabeçalho Fixo Superior com Glassmorphism */}
        <header className="sticky top-0 z-30 bg-[var(--bg-card,#ffffff)]/85 dark:bg-[var(--card,#121215)]/85 backdrop-blur-md border-b border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]/80 transition-colors duration-200 pt-[env(safe-area-inset-top,0px)]">
          <div className="max-w-7xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
            {/* Botão Mobile para abrir navegação */}
            <div className="md:hidden flex items-center shrink-0">
              <Button
                variant="outline"
                size="icon-sm"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-label="Abrir menu de navegação"
              >
                {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
              </Button>
            </div>

            {/* Cronômetro de Estudo (Fixo no cabeçalho ao lado esquerdo da barra de pesquisa) */}
            <HeaderStudyTimer />

            {/* Barra de Pesquisa Global */}
            <GlobalSearchBar
              onNavigate={(tab: ActiveTab) => {
                const targetRoutes: Record<string, string> = {
                  home: '/dashboard',
                  agenda: '/agenda',
                  banco: '/questoes',
                  provas: '/provas',
                  simulados: '/simulados',
                  caderno_erros: '/caderno-de-erros',
                  flashcards: '/flashcards',
                  resumos: '/resumos',
                  listas: '/listas',
                  stats: '/desempenho',
                  ranking: '/ranking',
                  configuracoes: '/configuracoes',
                  curadoria: '/admin/curadoria',
                  reportes: '/admin/reportes',
                  auditoria_medevo: '/admin/medevo'
                };
                router.push(targetRoutes[tab] || '/dashboard');
                setMobileMenuOpen(false);
              }}
              onSearchQuestions={(searchTerm) => {
                router.push(`/questoes?search=${encodeURIComponent(searchTerm)}`);
              }}
              onSelectSpecialty={(specialty, tema) => {
                router.push(
                  `/questoes?especialidade=${encodeURIComponent(specialty)}${tema ? `&tema=${encodeURIComponent(tema)}` : ''
                  }`
                );
              }}
              onSelectInstitution={(inst) => {
                router.push(`/questoes?instituicao=${encodeURIComponent(inst)}`);
              }}
              onSelectList={(listId) => {
                router.push(`/questoes?listId=${encodeURIComponent(listId)}`);
              }}
              onSelectQuestion={(questionId) => {
                router.push(`/questoes?id=${encodeURIComponent(questionId)}`);
              }}
              lists={lists}
            />

            {/* Controles da Direita: Tema + Botão PRO Sóbrio + Perfil */}
            <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
              <ThemeSelector compact={true} />

              {/* Botão Ver Planos */}
              {isUserFree && !isAdmin ? (
                <Link href="/checkout" prefetch={false}>
                  <Button
                    variant="primary"
                    size="sm"
                    className="px-2.5 sm:px-3 shadow-sm font-bold touch-manipulation"
                    title="Conhecer Planos e Desbloquear Acesso Completo"
                  >
                    <span className="tracking-tight whitespace-nowrap">
                      Ver Planos
                    </span>
                  </Button>
                </Link>
              ) : !isUserFree && !isAdmin ? (
                <Badge
                  variant="warning"
                  size="md"
                  className="hidden sm:inline-flex"
                  icon={<Crown className="w-3.5 h-3.5 text-amber-500 fill-amber-500/30" />}
                >
                  Plano {plan?.toUpperCase() || 'PRO'}
                </Badge>
              ) : isAdmin ? (
                <Badge
                  variant="theme"
                  size="md"
                  className="hidden sm:inline-flex"
                  icon={<ShieldCheck className="w-3.5 h-3.5" />}
                >
                  Curadoria
                </Badge>
              ) : null}

              {/* Controle de Ativação de Aba no Canto Superior para Administrador */}
              <AdminTabToggle />

              {/* Perfil do Aluno com Dropdown e Indicador de Sincronização */}
              {user && (
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="relative flex items-center justify-center p-0.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer group touch-manipulation"
                    title={`${user.name} • ${stats.streakDays} dias seguidos`}
                  >
                    {user.avatarUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={user.avatarUrl}
                        alt={user.name}
                        className="w-8 h-8 rounded-lg object-cover border-2 shadow-xs transition-transform group-hover:scale-105 shrink-0"
                        style={{ borderColor: accentConfig.primaryHex }}
                      />
                    ) : (
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-[11px] shadow-xs shrink-0"
                        style={{ backgroundColor: accentConfig.primaryHex, color: accentConfig.primaryContrastHex }}
                      >
                        {(user.name || 'LR').slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    {syncSnapshot.state === 'offline' && (
                      <span
                        title="Modo offline: dados salvos neste aparelho"
                        className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-amber-500 ring-2 ring-white dark:ring-[#121215]"
                      />
                    )}
                    {syncSnapshot.state === 'syncing' && (
                      <span
                        title="Sincronizando dados em nuvem..."
                        className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse ring-2 ring-white dark:ring-[#121215]"
                      />
                    )}
                  </button>

                  {/* Menu Dropdown Padronizado (seguro contra overflow em telas estreitas) */}
                  {profileDropdownOpen && (
                    <div className="fixed left-3 right-3 top-[calc(4.25rem+env(safe-area-inset-top,0px))] sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-68 bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] rounded-2xl border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex items-center gap-3 p-2 border-b border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]/80">
                        {user.avatarUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={user.avatarUrl}
                            alt={user.name}
                            className="w-10 h-10 rounded-xl object-cover border-2 shrink-0"
                            style={{ borderColor: accentConfig.primaryHex }}
                          />
                        ) : (
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs text-white shrink-0"
                            style={{ backgroundColor: accentConfig.primaryHex }}
                          >
                            {(user.name || 'LR').slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">
                            {user.name}
                          </div>
                          <div className="flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400 mt-0.5">
                            <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span>{stats.streakDays} dias seguidos</span>
                          </div>
                        </div>
                      </div>

                      {/* Status de Sincronização Multi-Dispositivo */}
                      <div className="my-2 px-2.5 py-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/80 border border-zinc-200/70 dark:border-zinc-800 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          {syncSnapshot.state === 'offline' ? (
                            <CloudOff className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <Cloud
                              className={`w-3.5 h-3.5 shrink-0 ${
                                syncSnapshot.state === 'error'
                                  ? 'text-rose-500'
                                  : syncSnapshot.state === 'syncing'
                                  ? 'text-sky-500'
                                  : 'text-emerald-500'
                              }`}
                            />
                          )}
                          <span className="text-[11px] font-semibold text-zinc-600 dark:text-zinc-300 truncate">
                            {syncSnapshot.state === 'offline'
                              ? 'Offline (salvo local)'
                              : syncSnapshot.state === 'syncing'
                              ? 'Sincronizando...'
                              : syncSnapshot.state === 'error'
                              ? 'Pendente de envio'
                              : 'Sincronizado na nuvem'}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => requestImmediateCloudSync()}
                          disabled={syncSnapshot.state === 'syncing'}
                          title="Sincronizar dados com todos os seus dispositivos agora"
                          className="p-1.5 rounded-lg hover:bg-zinc-200/70 dark:hover:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <RefreshCw
                            className={`w-3.5 h-3.5 ${syncSnapshot.state === 'syncing' ? 'animate-spin text-sky-500' : ''}`}
                          />
                        </button>
                      </div>

                      <div className="pt-2 space-y-1">
                        {isAdmin && (
                          <>
                            <Link
                              href="/admin/curadoria"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldCheck className="w-3.5 h-3.5 text-indigo-500" />
                                <span>Curadoria de Gabaritos</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                            </Link>

                            <Link
                              href="/admin/reportes"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <Flag className="w-3.5 h-3.5 text-amber-500" />
                                <span>Questões Reportadas</span>
                              </div>
                              <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                            </Link>

                            <Link
                              href="/admin/medevo"
                              onClick={() => setProfileDropdownOpen(false)}
                              className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-all cursor-pointer"
                            >
                              <div className="flex items-center gap-2">
                                <ShieldAlert className="w-3.5 h-3.5 text-rose-500" />
                                <span>Higienização MedEvo</span>
                              </div>
                              <Badge variant="destructive" size="sm" className="font-bold">
                                410
                              </Badge>
                            </Link>
                          </>
                        )}

                        <Link
                          href="/configuracoes"
                          onClick={() => setProfileDropdownOpen(false)}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 hover:text-zinc-900 dark:hover:text-white transition-all cursor-pointer"
                        >
                          <span>Ajustar Perfil</span>
                          <ChevronRight className="w-3.5 h-3.5 text-zinc-400" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => {
                            logout();
                            setProfileDropdownOpen(false);
                            router.push('/');
                          }}
                          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-all cursor-pointer"
                        >
                          <span>Sair da Conta</span>
                          <LogOut className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        {/* 3. Conteúdo da Página da Rota Ativa */}
        <main className="flex-1 min-w-0 pb-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:pb-0">
          <TabFeatureGuard>{children}</TabFeatureGuard>
        </main>
      </div>

      {/* Barra de Navegação Inferior Fixa para Dispositivos Móveis */}
      <nav
        aria-label="Navegação inferior mobile"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card,#ffffff)]/95 dark:bg-[var(--card,#121215)]/95 backdrop-blur-xl border-t border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]/80 px-1 pt-1 pb-[max(env(safe-area-inset-bottom,0px),0.45rem)] flex items-center justify-around gap-0.5 md:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_-4px_24px_rgba(0,0,0,0.55)] transition-colors select-none touch-manipulation"
      >
        <Link
          href="/dashboard"
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] active:scale-95 touch-manipulation ${pathname === '/dashboard' || pathname === '/'
              ? 'font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
            }`}
          style={{
            color: pathname === '/dashboard' || pathname === '/' ? accentConfig.primaryHex : undefined,
            backgroundColor: pathname === '/dashboard' || pathname === '/' ? accentConfig.bgRgba : undefined
          }}
        >
          <LayoutDashboard className="w-5 h-5 stroke-[1.9] shrink-0" />
          <span className="text-[10px] tracking-tight leading-none truncate max-w-full">Início</span>
        </Link>

        <Link
          href="/questoes"
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] active:scale-95 touch-manipulation ${pathname?.startsWith('/questoes')
              ? 'font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
            }`}
          style={{
            color: pathname?.startsWith('/questoes') ? accentConfig.primaryHex : undefined,
            backgroundColor: pathname?.startsWith('/questoes') ? accentConfig.bgRgba : undefined
          }}
        >
          <FileQuestion className="w-5 h-5 stroke-[1.9] shrink-0" />
          <span className="text-[10px] tracking-tight leading-none truncate max-w-full">Questões</span>
        </Link>

        <Link
          href="/caderno-de-erros"
          prefetch={false}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] relative active:scale-95 touch-manipulation ${pathname?.startsWith('/caderno-de-erros')
              ? 'font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
            }`}
          style={{
            color: pathname?.startsWith('/caderno-de-erros') ? accentConfig.primaryHex : undefined,
            backgroundColor: pathname?.startsWith('/caderno-de-erros') ? accentConfig.bgRgba : undefined
          }}
        >
          <div className="relative">
            <AlertOctagon className="w-5 h-5 stroke-[1.9] shrink-0" />
            {pendingErrorsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#09090b]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight leading-none truncate max-w-full">Erros</span>
        </Link>

        <Link
          href="/flashcards"
          prefetch={false}
          className={`flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] active:scale-95 touch-manipulation ${pathname?.startsWith('/flashcards')
              ? 'font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
            }`}
          style={{
            color: pathname?.startsWith('/flashcards') ? accentConfig.primaryHex : undefined,
            backgroundColor: pathname?.startsWith('/flashcards') ? accentConfig.bgRgba : undefined
          }}
        >
          <Brain className="w-5 h-5 stroke-[1.9] shrink-0" />
          <span className="text-[10px] tracking-tight leading-none truncate max-w-full">Flashcards</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex-1 min-w-0 flex flex-col items-center justify-center gap-0.5 py-1 px-1 rounded-xl transition-all cursor-pointer min-h-[44px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white active:scale-95 touch-manipulation"
          aria-label="Abrir menu completo"
        >
          <Menu className="w-5 h-5 stroke-[1.9] shrink-0" />
          <span className="text-[10px] tracking-tight leading-none truncate max-w-full">Mais</span>
        </button>
      </nav>

      {/* 4. Menu Lateral Retrátil para Telas Mobile (com Safe-Area superior e inferior) */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-76 max-w-[84vw] h-full bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] px-4 pt-[max(1rem,env(safe-area-inset-top,0px))] pb-[max(1.5rem,env(safe-area-inset-bottom,0px))] shadow-2xl overflow-y-auto overscroll-contain"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-3.5 border-b border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]">
              <Logo variant="full" className="h-7 w-auto max-w-[160px] shrink-0" />
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 dark:bg-zinc-800/80 text-zinc-500 dark:text-zinc-300 hover:text-zinc-900 dark:hover:text-white active:scale-95 cursor-pointer touch-manipulation"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="pt-3">
              <Sidebar
                isCollapsed={false}
                isMobileDrawer={true}
                modalidade={performanceFilters.modalidade}
                streakDays={stats.streakDays}
                pendingErrorsCount={pendingErrorsCount}
                onNavigate={() => setMobileMenuOpen(false)}
              />
            </div>
          </div>
        </div>
      )}

      {/* 5. Modais Globais do Sistema */}
      {isShortcutsModalOpen && (
        <KeyboardShortcutsModal
          isOpen={isShortcutsModalOpen}
          onClose={() => setIsShortcutsModalOpen(false)}
        />
      )}

      {isOnboardingOpen && (
        <OnboardingModal
          isOpen={isOnboardingOpen}
          onClose={() => setIsOnboardingOpen(false)}
          onComplete={(action) => {
            setIsOnboardingOpen(false);
            if (action === 'plans') {
              router.push('/checkout');
            } else if (action === 'questions') {
              router.push('/questoes');
            } else {
              router.push('/dashboard');
            }
          }}
        />
      )}

      {isUpgradeModalOpen && (
        <SubscriptionModal
          isOpen={isUpgradeModalOpen}
          onClose={closeUpgradeModal}
          currentPlan={plan}
        />
      )}
    </div>
  );
};
