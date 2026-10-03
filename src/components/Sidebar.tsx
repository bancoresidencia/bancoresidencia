'use client';

import React from 'react';
import {
  Home,
  FileQuestion,
  ListFilter,
  FileCheck2,
  BarChart2,
  Trophy,
  Stethoscope,
  Settings,
  BookOpen,
  PanelLeftClose,
  PanelLeftOpen
} from 'lucide-react';
import { ActiveTab, Modalidade } from '@/types';
import { useTheme } from '@/context/ThemeContext';

interface SidebarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  modalidade: Modalidade;
  streakDays: number;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  modalidade,
  isCollapsed = true,
  onToggleCollapse,
}) => {
  const { accentConfig } = useTheme();

  const menuItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'banco', label: 'Banco de Questões', icon: FileQuestion },
    { id: 'listas', label: 'Listas & Pastas', icon: ListFilter },
    { id: 'provas', label: 'Provas na Íntegra', icon: BookOpen },
    { id: 'simulados', label: 'Simulados Oficiais', icon: FileCheck2 },
    { id: 'stats', label: 'Meu Desempenho', icon: BarChart2 },
    { id: 'ranking', label: 'Ranking Oficial', icon: Trophy },
    { id: 'configuracoes', label: 'Perfil & Ajustes', icon: Settings }
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-64'
      } bg-white dark:bg-[#070d18] border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 h-screen max-h-screen sticky top-0 self-start z-40 hidden md:flex transition-all duration-300 ease-in-out select-none overflow-hidden`}
      aria-label="Navegação Principal"
    >
      {/* 1. Topo: Logo da Plataforma + Botão de Toggle */}
      <div className={`h-18 w-full border-b border-slate-100 dark:border-slate-800/80 flex items-center ${
        isCollapsed ? 'justify-center' : 'justify-between px-4'
      }`}>
        <button
          type="button"
          onClick={() => onNavigate('home')}
          className="flex items-center gap-3 p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-all cursor-pointer group min-w-0"
          title={`Banco Residência • ${modalidade}`}
          aria-label="Ir para a página inicial"
        >
          <div
            className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: accentConfig.primaryHex,
              boxShadow: `0 4px 14px -2px ${accentConfig.bgRgba}`
            }}
          >
            <Stethoscope className="w-5 h-5" />
          </div>

          {!isCollapsed && (
            <div className="text-left overflow-hidden">
              <span className="font-heading font-extrabold text-sm text-slate-900 dark:text-white tracking-tight block leading-tight truncate">
                Banco Residência
              </span>
              <span className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider block">
                {modalidade}
              </span>
            </div>
          )}
        </button>

        {!isCollapsed && onToggleCollapse && (
          <button
            type="button"
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition-colors cursor-pointer"
            title="Recolher barra lateral"
            aria-label="Recolher barra lateral"
          >
            <PanelLeftClose className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* 2. Navegação Principal */}
      <div className={`flex-1 py-4 space-y-1.5 overflow-y-auto w-full flex flex-col ${
        isCollapsed ? 'items-center px-2' : 'px-3'
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
              className={`rounded-2xl flex items-center transition-all duration-200 cursor-pointer group relative ${
                isCollapsed
                  ? 'w-12 h-12 justify-center'
                  : 'w-full px-3.5 py-2.5 gap-3 justify-start'
              } ${
                isActive
                  ? 'text-white shadow-md'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
              style={{
                backgroundColor: isActive ? accentConfig.primaryHex : undefined,
                boxShadow: isActive ? `0 6px 18px -3px ${accentConfig.bgRgba}` : undefined
              }}
            >
              <Icon
                className={`w-5 h-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                  isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                }`}
              />

              {!isCollapsed && (
                <span className={`text-xs sm:text-sm font-bold tracking-tight truncate ${
                  isActive ? 'text-white' : 'text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white'
                }`}>
                  {item.label}
                </span>
              )}

              {/* Indicador de barra ativa na lateral esquerda quando recolhido */}
              {isActive && isCollapsed && (
                <span
                  className="absolute left-0 top-3 bottom-3 w-1 rounded-r-full bg-white/90"
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Rodapé com Botão de Expandir/Recolher */}
      {onToggleCollapse && (
        <div className={`p-3 border-t border-slate-100 dark:border-slate-800/80 w-full flex ${
          isCollapsed ? 'justify-center' : 'justify-between items-center'
        }`}>
          <button
            type="button"
            onClick={onToggleCollapse}
            className={`flex items-center gap-2.5 rounded-xl text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-colors cursor-pointer ${
              isCollapsed ? 'p-2.5' : 'px-3 py-2 w-full text-xs font-semibold'
            }`}
            title={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
            aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
          >
            {isCollapsed ? (
              <PanelLeftOpen className="w-5 h-5" />
            ) : (
              <>
                <PanelLeftClose className="w-4 h-4 shrink-0 text-slate-400" />
                <span className="truncate">Recolher barra</span>
              </>
            )}
          </button>
        </div>
      )}
    </aside>
  );
};
