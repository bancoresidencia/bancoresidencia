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

interface SidebarProps {
  activeTab?: ActiveTab;
  onNavigate?: (tab: ActiveTab) => void;
  modalidade?: Modalidade;
  streakDays?: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingErrorsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  modalidade = 'Residência Médica',
  streakDays = 1,
  isCollapsed = true,
  onToggleCollapse,
  pendingErrorsCount = 0
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
      className={`${
        isCollapsed ? 'w-16' : 'w-60'
      } bg-white dark:bg-[#09090b] border-r border-slate-200 dark:border-zinc-800 flex flex-col shrink-0 h-screen max-h-screen sticky top-0 self-start z-40 hidden md:flex transition-all duration-200 ease-in-out select-none overflow-hidden`}
      aria-label="Navegação Principal"
    >
      {/* 1. Topo: Logo Flat + Botão de Toggle */}
      <div
        className={`h-16 w-full border-b border-slate-100 dark:border-zinc-800/80 flex items-center ${
          isCollapsed ? 'justify-center' : 'justify-between px-3.5'
        }`}
      >
        <Link
          href="/dashboard"
          onClick={() => onNavigate?.('home')}
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer group min-w-0"
          title={`Banco Residência • ${modalidade}`}
          aria-label="Ir para a página inicial"
        >
          <Logo className="w-8.5 h-8.5 shrink-0 transition-transform duration-200 group-hover:scale-105" />

          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <span className="font-heading font-black text-xs sm:text-sm text-slate-900 dark:text-zinc-100 tracking-tight block leading-tight truncate">
                Banco Residência
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider block">
                {modalidade}
              </span>
            </div>
          )}
        </Link>

        {!isCollapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            title="Recolher barra lateral"
            aria-label="Recolher barra lateral"
          >
            <PanelLeftClose className="w-4 h-4 stroke-[1.8]" />
          </button>
        )}
      </div>

      {/* 2. Navegação Principal Flat */}
      <div
        className={`flex-1 py-3 space-y-1 overflow-y-auto w-full flex flex-col ${
          isCollapsed ? 'items-center px-2' : 'px-2.5'
        }`}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = pathname
            ? pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href))
            : activeTab === item.id;

          return (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => onNavigate?.(item.id as ActiveTab)}
              aria-current={isActive ? 'page' : undefined}
              title={isCollapsed ? item.label : undefined}
              aria-label={item.label}
              className={`rounded-lg flex items-center transition-colors duration-150 cursor-pointer group relative ${
                isCollapsed ? 'w-10 h-10 justify-center' : 'w-full px-2.5 py-2 gap-2.5 justify-start'
              } ${
                isActive
                  ? 'shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/80 dark:hover:bg-zinc-900'
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
                      : 'text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-200'
                  }`}
                />
                {isCollapsed && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#09090b]" />
                )}
              </div>

              {!isCollapsed && (
                <>
                  <span
                    className={`text-xs font-bold tracking-tight truncate ${
                      isActive
                        ? ''
                        : 'text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-zinc-100'
                    }`}
                  >
                    {item.label}
                  </span>

                  {!isTabActive(item.id as PlatformTabKey) && (
                    <span
                      className={`ml-auto text-[9px] font-bold px-1.5 py-0.2 rounded-md ${
                        isActive
                          ? 'bg-black/20 text-white'
                          : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border border-amber-500/20'
                      }`}
                    >
                      Em breve
                    </span>
                  )}

                  {item.badge !== undefined && isTabActive(item.id as PlatformTabKey) && (
                    <span
                      className={`ml-auto text-[10px] font-extrabold px-1.5 py-0.2 rounded-md font-mono ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border border-rose-500/25'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </>
              )}
            </Link>
          );
        })}
      </div>

      {/* 3. Rodapé com Botão Flat de Expandir/Recolher */}
      {onToggleCollapse && (
        <div
          className={`p-2.5 border-t border-slate-100 dark:border-zinc-800/80 w-full flex ${
            isCollapsed ? 'justify-center' : 'justify-between items-center'
          }`}
        >
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex items-center gap-2 rounded-lg text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer ${
              isCollapsed ? 'p-2' : 'px-2.5 py-1.5 w-full text-xs font-semibold'
            }`}
            title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-4 h-4 stroke-[1.8]" />
            ) : (
              <>
                <PanelLeftClose className="w-3.5 h-3.5 shrink-0 stroke-[1.8] text-slate-400" />
                <span className="truncate text-xs">Recolher barra</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};
