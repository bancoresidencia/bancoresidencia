'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  CalendarDays,
  FileQuestion,
  FolderOpen,
  ClipboardCheck,
  BarChart3,
  Trophy,
  Sliders,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  AlertOctagon,
  Flag,
  Brain,
  FileText,
  ShieldAlert
} from 'lucide-react';
import { ActiveTab, Modalidade } from '@/types';
import { useTabAvailability } from '@/context/TabAvailabilityContext';
import { PlatformTabKey } from '@/types/tabAvailability';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Logo } from '@/components/Logo';
import { Badge, Tooltip } from '@/components/ui';

interface SidebarProps {
  activeTab?: ActiveTab;
  onNavigate?: (tab: ActiveTab) => void;
  modalidade?: Modalidade;
  streakDays?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingErrorsCount?: number;
  isMobileDrawer?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  modalidade = 'Residência Médica',
  streakDays = 1,
  isCollapsed = true,
  onToggleCollapse,
  pendingErrorsCount = 0,
  isMobileDrawer = false
}) => {
  const pathname = usePathname();
  const { accentConfig } = useTheme();
  const { isAdmin } = useAuth();
  const { isTabActive } = useTabAvailability();

  const menuItems = [
    { id: 'home', label: 'Início', icon: LayoutDashboard, href: '/dashboard' },
    { id: 'agenda', label: 'Agenda', icon: CalendarDays, href: '/agenda' },
    { id: 'banco', label: 'Banco de Questões', icon: FileQuestion, href: '/questoes' },
    {
      id: 'caderno_erros',
      label: 'Caderno de Erros',
      icon: AlertOctagon,
      href: '/caderno-de-erros',
      badge: pendingErrorsCount > 0 ? pendingErrorsCount : undefined
    },
    { id: 'flashcards', label: 'Flashcards', icon: Brain, href: '/flashcards' },
    { id: 'resumos', label: 'Resumos Clínicos', icon: BookOpen, href: '/resumos' },
    { id: 'listas', label: 'Listas & Pastas', icon: FolderOpen, href: '/listas' },
    { id: 'provas', label: 'Provas na Íntegra', icon: FileText, href: '/provas' },
    { id: 'simulados', label: 'Simulados Oficiais', icon: ClipboardCheck, href: '/simulados' },
    { id: 'stats', label: 'Meu Desempenho', icon: BarChart3, href: '/desempenho' },
    { id: 'ranking', label: 'Ranking Oficial', icon: Trophy, href: '/ranking' },
    { id: 'configuracoes', label: 'Perfil & Ajustes', icon: Sliders, href: '/configuracoes' },
    ...(isAdmin
      ? [
          { id: 'curadoria' as ActiveTab, label: 'Curadoria de Gabaritos', icon: ShieldCheck, href: '/admin/curadoria' },
          { id: 'reportes' as ActiveTab, label: 'Questões Reportadas', icon: Flag, href: '/admin/reportes' },
          { id: 'auditoria_medevo' as ActiveTab, label: 'Higienização MedEvo', icon: ShieldAlert, href: '/admin/medevo', badge: 410 }
        ]
      : [])
  ];

  return (
    <aside
      className={
        isMobileDrawer
          ? 'w-full flex flex-col select-none'
          : `${
              isCollapsed ? 'w-16' : 'w-60'
            } bg-[var(--bg-card,#ffffff)] dark:bg-[var(--card,#09090b)] border-r border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)] flex flex-col shrink-0 h-screen max-h-screen sticky top-0 self-start z-40 hidden md:flex transition-all duration-200 ease-in-out select-none overflow-hidden`
      }
      aria-label="Navegação Principal"
    >
      {/* 1. Topo: Logo Flat + Botão de Toggle */}
      {!isMobileDrawer && (
        <div
          className={`h-16 w-full border-b border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]/80 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between px-3.5'
          }`}
        >
          <Link
            href="/dashboard"
            onClick={() => onNavigate?.('home')}
            className="flex items-center gap-2.5 p-1 rounded-xl hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer group min-w-0"
            title={`Banco Residência • ${modalidade}`}
            aria-label="Ir para a página inicial"
          >
            <Logo className="w-8 h-8 shrink-0 transition-transform duration-200 group-hover:scale-105" />

            {!isCollapsed && (
              <div className="text-left overflow-hidden">
                <span className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 tracking-tight block leading-tight truncate">
                  Banco Residência
                </span>
                <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider block">
                  {modalidade}
                </span>
              </div>
            )}
          </Link>

          {!isCollapsed && onToggleCollapse && (
            <button
              type="button"
              onClick={onToggleCollapse}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              title="Recolher barra lateral"
              aria-label="Recolher barra lateral"
            >
              <PanelLeftClose className="w-4 h-4 stroke-[1.8]" />
            </button>
          )}
        </div>
      )}

      {/* 2. Navegação Principal Flat */}
      <div
        className={`flex-1 py-3 space-y-1 w-full flex flex-col ${
          isMobileDrawer
            ? 'px-0 overflow-visible'
            : isCollapsed
            ? 'items-center px-2 overflow-y-auto no-scrollbar'
            : 'px-2.5 overflow-y-auto no-scrollbar'
        }`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname
            ? pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            : activeTab === item.id;

          const linkContent = (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onNavigate?.(item.id as ActiveTab)}
              aria-current={isActive ? 'page' : undefined}
              title={isCollapsed ? undefined : item.label}
              aria-label={item.label}
              className={`rounded-xl flex items-center transition-all duration-150 cursor-pointer group relative ${
                isCollapsed
                  ? 'w-10 h-10 justify-center'
                  : isMobileDrawer
                  ? 'w-full px-3 py-2.5 min-h-[44px] gap-3 justify-start'
                  : 'w-full px-2.5 py-2 gap-2.5 justify-start'
              } ${
                isActive
                  ? 'shadow-xs font-semibold'
                  : 'text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100/80 dark:hover:bg-zinc-800/60'
              }`}
              style={{
                backgroundColor: isActive ? accentConfig.primaryHex : undefined,
                color: isActive ? accentConfig.primaryContrastHex : undefined
              }}
            >
              <div className="relative">
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 stroke-[1.8] ${
                    isActive
                      ? ''
                      : 'text-zinc-500 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-200'
                  }`}
                />
                {isCollapsed && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#09090b]" />
                )}
              </div>

              {!isCollapsed && (
                <>
                  <span
                    className={`text-xs font-medium tracking-tight truncate ${
                      isActive
                        ? 'font-bold'
                        : 'text-zinc-700 dark:text-zinc-300 group-hover:text-zinc-900 dark:group-hover:text-zinc-100'
                    }`}
                  >
                    {item.label}
                  </span>

                  {!isTabActive(item.id as PlatformTabKey) && (
                    <Badge variant="warning" size="sm" className="ml-auto text-[9px] px-1.5 py-0.2">
                      Em breve
                    </Badge>
                  )}

                  {item.badge !== undefined && isTabActive(item.id as PlatformTabKey) && (
                    <Badge
                      variant={isActive ? 'default' : 'destructive'}
                      size="sm"
                      className={`ml-auto font-mono text-[10px] px-1.5 py-0.2 ${
                        isActive ? 'bg-white/20 text-white border-transparent' : ''
                      }`}
                    >
                      {item.badge}
                    </Badge>
                  )}
                </>
              )}
            </Link>
          );

          if (isCollapsed && !isMobileDrawer) {
            return (
              <Tooltip key={item.id} content={item.label} position="right">
                {linkContent}
              </Tooltip>
            );
          }

          return linkContent;
        })}
      </div>

      {/* 3. Rodapé com Botão Flat de Expandir/Recolher */}
      {!isMobileDrawer && onToggleCollapse && (
        <div
          className={`p-2.5 border-t border-[var(--card-border,#e4e4e7)] dark:border-[var(--card-border,#27272a)]/80 w-full flex ${
            isCollapsed ? 'justify-center' : 'justify-between items-center'
          }`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex items-center gap-2 rounded-xl text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800/80 transition-colors cursor-pointer ${
              isCollapsed ? 'p-2' : 'px-2.5 py-1.5 w-full text-xs font-semibold'
            }`}
            title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 stroke-[1.8]" />
            ) : (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 shrink-0 stroke-[1.8] text-zinc-400" />
                <span className="truncate text-xs">Recolher barra</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};
