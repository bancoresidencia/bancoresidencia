'use client';

import React from 'react';
import {
  LayoutDashboard,
  FileQuestion,
  FolderOpen,
  ClipboardCheck,
  BarChart3,
  Trophy,
  Stethoscope,
  Sliders,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen,
  ShieldCheck,
  AlertOctagon
} from 'lucide-react';
import { ActiveTab, Modalidade } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface SidebarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  modalidade: Modalidade;
  streakDays: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  pendingErrorsCount?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  modalidade,
  streakDays,
  isCollapsed = true,
  onToggleCollapse,
  pendingErrorsCount = 0
}) => {
  const { accentConfig } = useTheme();
  const { isAdmin } = useAuth();

  const menuItems = [
    { id: 'home', label: 'Início', icon: LayoutDashboard },
    { id: 'banco', label: 'Banco de Questões', icon: FileQuestion },
    {
      id: 'caderno_erros',
      label: 'Caderno de Erros',
      icon: AlertOctagon,
      badge: pendingErrorsCount > 0 ? pendingErrorsCount : undefined
    },
    { id: 'listas', label: 'Listas & Pastas', icon: FolderOpen },
    { id: 'provas', label: 'Provas na Íntegra', icon: BookOpen },
    { id: 'simulados', label: 'Simulados Oficiais', icon: ClipboardCheck },
    { id: 'stats', label: 'Meu Desempenho', icon: BarChart3 },
    { id: 'ranking', label: 'Ranking Oficial', icon: Trophy },
    { id: 'configuracoes', label: 'Perfil & Ajustes', icon: Sliders },
    ...(isAdmin ? [{ id: 'curadoria', label: 'Curadoria de Gabaritos', icon: ShieldCheck }] : [])
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-16' : 'w-60'
      } bg-white dark:bg-[#09090b] border-r border-slate-200 dark:border-zinc-800 flex flex-col shrink-0 h-screen max-h-screen sticky top-0 self-start z-40 hidden md:flex transition-all duration-200 ease-in-out select-none overflow-hidden`}
      aria-label="Navegação Principal"
    >
      {/* 1. Topo: Logo Flat + Botão de Toggle */}
      <div className={`h-16 w-full border-b border-slate-100 dark:border-zinc-800/80 flex items-center ${
        isCollapsed ? 'justify-center' : 'justify-between px-3.5'
      }`}>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-zinc-900 transition-colors cursor-pointer group min-w-0"
          title={`Banco Residência • ${modalidade}`}
          aria-label="Ir para a página inicial"
        >
          <div
            className="w-8.5 h-8.5 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
            style={{
              backgroundColor: accentConfig.primaryHex
            }}
          >
            <Stethoscope className="w-4.5 h-4.5 stroke-[1.8]" />
          </div>

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
        </button>

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
      <div className={`flex-1 py-3 space-y-1 overflow-y-auto w-full flex flex-col ${
        isCollapsed ? 'items-center px-2' : 'px-2.5'
      }`}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ActiveTab)}
              aria-current={isActive ? 'page' : undefined}
              title={isCollapsed ? item.label : undefined}
              aria-label={item.label}
              className={`rounded-lg flex items-center transition-colors duration-150 cursor-pointer group relative ${
                isCollapsed
                  ? 'w-10 h-10 justify-center'
                  : 'w-full px-2.5 py-2 gap-2.5 justify-start'
              } ${
                isActive
                  ? 'text-white shadow-xs'
                  : 'text-slate-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-zinc-100 hover:bg-slate-100/80 dark:hover:bg-zinc-900'
              }`}
              style={{
                backgroundColor: isActive ? accentConfig.primaryHex : undefined
              }}
            >
              <div className="relative">
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 stroke-[1.8] ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-zinc-400 group-hover:text-slate-900 dark:group-hover:text-zinc-200'
                  }`}
                />
                {isCollapsed && item.badge !== undefined && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#09090b]" />
                )}
              </div>

              {!isCollapsed && (
                <>
                  <span className={`text-xs font-bold tracking-tight truncate ${
                    isActive ? 'text-white' : 'text-slate-700 dark:text-zinc-300 group-hover:text-slate-900 dark:group-hover:text-zinc-100'
                  }`}>
                    {item.label}
                  </span>

                  {item.badge !== undefined && (
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
            </button>
          );
        })}
      </div>

      {/* 3. Rodapé com Botão Flat de Expandir/Recolher */}
      {onToggleCollapse && (
        <div className={`p-2.5 border-t border-slate-100 dark:border-zinc-800/80 w-full flex ${
          isCollapsed ? 'justify-center' : 'justify-between items-center'
        }`}>
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
