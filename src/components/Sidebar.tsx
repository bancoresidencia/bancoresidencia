'use client';

import React from 'react';
import {
  Home,
  Database,
  ListFilter,
  FileCheck2,
  BarChart2,
  Trophy,
  Stethoscope,
  ChevronRight,
  Settings,
  BookOpen
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
  isCollapsed = false,
  onToggleCollapse
}) => {
  const { accentConfig } = useTheme();

  const menuItems = [
    { id: 'home', label: 'Início', icon: Home, badge: undefined },
    { id: 'banco', label: 'Banco de Questões', icon: Database, badge: '5.2k+' },
    { id: 'listas', label: 'Listas & Pastas', icon: ListFilter, badge: undefined },
    { id: 'provas', label: 'Provas na Íntegra', icon: BookOpen, badge: 'Oficiais' },
    { id: 'simulados', label: 'Simulados', icon: FileCheck2, badge: 'Oficial' },
    { id: 'stats', label: 'Meu Desempenho', icon: BarChart2, badge: undefined },
    { id: 'ranking', label: 'Ranking Oficial', icon: Trophy, badge: '2026.1' },
    { id: 'configuracoes', label: 'Perfil & Ajustes', icon: Settings, badge: undefined }
  ];

  return (
    <aside
      className={`${
        isCollapsed ? 'w-20' : 'w-68'
      } bg-white dark:bg-[#070d18] border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 h-screen max-h-screen sticky top-0 self-start z-40 hidden md:flex transition-all duration-300 ease-in-out select-none overflow-hidden`}
    >
      {/* 1. Topo: Clicar na Logo da Plataforma Abre/Recolhe a Barra Lateral (Sem botões extras) */}
      <div
        className={`h-20 ${
          isCollapsed ? 'px-3 justify-center' : 'px-5 justify-start'
        } border-b border-slate-100 dark:border-slate-800/80 flex items-center transition-all`}
      >
        <button
          type="button"
          onClick={onToggleCollapse}
          className={`w-full flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-start gap-3'
          } p-1.5 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-900/60 transition-all cursor-pointer group text-left`}
          title={isCollapsed ? 'Clique na logo para expandir a barra lateral' : 'Clique na logo para recolher a barra lateral'}
          aria-label={isCollapsed ? 'Expandir barra lateral' : 'Recolher barra lateral'}
        >
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0 transition-transform group-hover:scale-105"
            style={{
              backgroundColor: accentConfig.primaryHex,
              boxShadow: `0 6px 16px -3px ${accentConfig.bgRgba}`
            }}
          >
            <Stethoscope className="w-5.5 h-5.5" />
          </div>

          {!isCollapsed && (
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-heading text-base font-extrabold text-slate-900 dark:text-white tracking-tight truncate group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors">
                  Banco Residência
                </span>
                <span
                  className="w-2 h-2 rounded-full animate-pulse shrink-0"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span
                  className="text-[10px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md inline-block"
                  style={{
                    backgroundColor: accentConfig.bgRgba,
                    color: accentConfig.primaryHex
                  }}
                >
                  {modalidade}
                </span>
              </div>
            </div>
          )}
        </button>
      </div>

      {/* 2. Navegação Principal */}
      <div className={`flex-1 ${isCollapsed ? 'py-4 px-2' : 'py-4 px-3.5'} space-y-1.5 overflow-y-auto`}>
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
            Plataforma de Estudos
          </div>
        )}
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ActiveTab)}
              aria-current={isActive ? 'page' : undefined}
              title={isCollapsed ? item.label : undefined}
              className={`w-full flex items-center ${
                isCollapsed ? 'justify-center p-3' : 'justify-between px-3.5 py-2.5'
              } rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer group relative ${
                isActive
                  ? 'text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
              style={{
                backgroundColor: isActive ? accentConfig.primaryHex : undefined,
                boxShadow: isActive ? `0 6px 18px -3px ${accentConfig.bgRgba}` : undefined
              }}
            >
              <div className={`flex items-center ${isCollapsed ? 'justify-center' : 'gap-3 min-w-0'}`}>
                <Icon
                  className={`w-4.5 h-4.5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                  }`}
                />
                {!isCollapsed && <span className="tracking-tight truncate">{item.label}</span>}
              </div>

              {!isCollapsed && (
                <div className="flex items-center gap-1.5 shrink-0">
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                  {isActive && <ChevronRight className="w-4 h-4 text-white/90" />}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
