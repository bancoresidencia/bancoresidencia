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
  Brain
} from 'lucide-react';
import { Sidebar } from '@/components/Sidebar';
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
    } catch {}
  }, []);

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('bancoresidencia_sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  // Dropdown de perfil
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);

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
      } catch {}
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
          <div className="max-w-6xl mx-auto px-3 sm:px-6 h-16 flex items-center justify-between gap-2 sm:gap-3">
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
                  `/questoes?especialidade=${encodeURIComponent(specialty)}${
                    tema ? `&tema=${encodeURIComponent(tema)}` : ''
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

              {/* Botão PRO: Sóbrio, Elegante e com Alto Destaque */}
              {isUserFree && !isAdmin ? (
                <Link href="/checkout">
                  <Button
                    variant="primary"
                    size="sm"
                    className="gap-1.5 shadow-sm font-bold"
                    leftIcon={<Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300/30" />}
                    title="Conhecer Planos e Desbloquear Acesso Completo"
                  >
                    <span className="tracking-tight whitespace-nowrap">Seja PRO</span>
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

              {/* Perfil do Aluno com Dropdown */}
              {user && (
                <div ref={profileRef} className="relative">
                  <button
                    type="button"
                    onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                    className="flex items-center justify-center p-0.5 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-800 transition-all cursor-pointer group"
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
                  </button>

                  {/* Menu Dropdown Padronizado */}
                  {profileDropdownOpen && (
                    <div className="absolute right-0 top-full mt-2 w-64 bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] rounded-2xl border border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
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
        <main className="flex-1 min-w-0 pb-20 md:pb-0">
          <TabFeatureGuard>{children}</TabFeatureGuard>
        </main>
      </div>

      {/* Barra de Navegação Inferior Fixa para Dispositivos Móveis */}
      <nav
        aria-label="Navegação inferior mobile"
        className="fixed bottom-0 left-0 right-0 z-40 bg-[var(--bg-card,#ffffff)]/95 dark:bg-[var(--card,#121215)]/95 backdrop-blur-lg border-t border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]/80 px-2 pt-1.5 pb-[max(env(safe-area-inset-bottom,0px),0.5rem)] flex items-center justify-around md:hidden shadow-lg transition-colors select-none"
      >
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[44px] ${
            pathname === '/dashboard' || pathname === '/'
              ? 'font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
          style={{
            color: pathname === '/dashboard' || pathname === '/' ? accentConfig.primaryHex : undefined
          }}
        >
          <LayoutDashboard className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight">Início</span>
        </Link>

        <Link
          href="/questoes"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[44px] ${
            pathname?.startsWith('/questoes')
              ? 'font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
          style={{
            color: pathname?.startsWith('/questoes') ? accentConfig.primaryHex : undefined
          }}
        >
          <FileQuestion className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight">Questões</span>
        </Link>

        <Link
          href="/caderno-de-erros"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[44px] relative ${
            pathname?.startsWith('/caderno-de-erros')
              ? 'font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
          style={{
            color: pathname?.startsWith('/caderno-de-erros') ? accentConfig.primaryHex : undefined
          }}
        >
          <div className="relative">
            <AlertOctagon className="w-5 h-5 stroke-[1.8]" />
            {pendingErrorsCount > 0 && (
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#09090b]" />
            )}
          </div>
          <span className="text-[10px] tracking-tight">Erros</span>
        </Link>

        <Link
          href="/flashcards"
          className={`flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[44px] ${
            pathname?.startsWith('/flashcards')
              ? 'font-bold'
              : 'text-zinc-500 dark:text-zinc-400'
          }`}
          style={{
            color: pathname?.startsWith('/flashcards') ? accentConfig.primaryHex : undefined
          }}
        >
          <Brain className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight">Flashcards</span>
        </Link>

        <button
          type="button"
          onClick={() => setMobileMenuOpen(true)}
          className="flex flex-col items-center justify-center gap-1 py-1 px-2.5 rounded-xl transition-all cursor-pointer min-w-[56px] min-h-[44px] text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white"
          aria-label="Abrir menu completo"
        >
          <Menu className="w-5 h-5 stroke-[1.8]" />
          <span className="text-[10px] tracking-tight">Mais</span>
        </button>
      </nav>

      {/* 4. Menu Lateral Retrátil para Telas Mobile */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div
            className="w-72 max-w-[80vw] h-full bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#121215)] p-4 shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]">
              <span className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                Banco Residência
              </span>
              <button
                type="button"
                onClick={() => setMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 active:scale-95 cursor-pointer"
                aria-label="Fechar menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="pt-4">
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
