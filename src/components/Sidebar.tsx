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
  Flame
} from 'lucide-react';
import { ActiveTab, Modalidade } from '@/types';
import { useTheme } from '@/context/ThemeContext';
import { ThemeSelector } from './ThemeSelector';

interface SidebarProps {
  activeTab: ActiveTab;
  onNavigate: (tab: ActiveTab) => void;
  modalidade: Modalidade;
  streakDays: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onNavigate,
  modalidade,
  streakDays
}) => {
  const { accentConfig } = useTheme();

  const menuItems = [
    { id: 'home', label: 'Início', icon: Home, badge: undefined },
    { id: 'banco', label: 'Banco de Questões', icon: Database, badge: '5.2k+' },
    { id: 'listas', label: 'Listas & Pastas', icon: ListFilter, badge: undefined },
    { id: 'simulados', label: 'Simulados', icon: FileCheck2, badge: 'Oficial' },
    { id: 'stats', label: 'Meu Desempenho', icon: BarChart2, badge: undefined },
    { id: 'ranking', label: 'Ranking Oficial', icon: Trophy, badge: '2026.1' }
  ];

  return (
    <aside className="w-68 bg-white dark:bg-[#070d18] border-r border-slate-200 dark:border-slate-800/80 flex flex-col shrink-0 min-h-screen sticky top-0 z-40 hidden md:flex transition-colors duration-200 select-none">
      {/* Topo com Logo e Marca */}
      <div className="h-20 px-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform hover:scale-105 duration-200"
            style={{
              backgroundColor: accentConfig.primaryHex,
              boxShadow: `0 8px 20px -4px ${accentConfig.bgRgba}`
            }}
          >
            <Stethoscope className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading text-base font-extrabold text-slate-900 dark:text-white tracking-tight">
                Banco Residência
              </span>
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentConfig.primaryHex }} />
            </div>
            <span
              className="text-[11px] font-bold tracking-wide uppercase px-2 py-0.5 rounded-md inline-block mt-0.5"
              style={{
                backgroundColor: accentConfig.bgRgba,
                color: accentConfig.primaryHex
              }}
            >
              {modalidade}
            </span>
          </div>
        </div>
      </div>

      {/* Navegação Principal */}
      <div className="flex-1 py-6 px-4 space-y-1.5 overflow-y-auto">
        <div className="px-3 pb-2 text-[11px] font-extrabold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
          Plataforma de Estudos
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ActiveTab)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-sm font-semibold transition-all duration-200 cursor-pointer group relative ${
                isActive
                  ? 'text-white shadow-md'
                  : 'text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-900/60'
              }`}
              style={{
                backgroundColor: isActive ? accentConfig.primaryHex : undefined,
                boxShadow: isActive ? `0 6px 18px -3px ${accentConfig.bgRgba}` : undefined
              }}
            >
              <div className="flex items-center gap-3">
                <Icon
                  className={`w-4 h-4 transition-transform duration-200 group-hover:scale-110 ${
                    isActive ? 'text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-200'
                  }`}
                />
                <span className="tracking-tight">{item.label}</span>
              </div>

              <div className="flex items-center gap-1.5">
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
            </button>
          );
        })}
      </div>

      {/* Seletor de Tema e Estilo */}
      <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/30">
        <ThemeSelector />
      </div>

      {/* Perfil do Aluno e Sequência de Estudos */}
      <div className="p-4 m-3 bg-slate-50 dark:bg-[#0c1424] rounded-2xl border border-slate-200/80 dark:border-slate-800/80 shadow-sm">
        <div className="flex items-center gap-3">
          <div
            className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm transition-transform hover:scale-105"
            style={{
              backgroundColor: accentConfig.bgRgba,
              color: accentConfig.primaryHex,
              border: `1.5px solid ${accentConfig.primaryHex}`
            }}
          >
            LR
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
              Dr. Lucas Rocha
            </div>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-400">
                <Flame className="w-3.5 h-3.5 fill-amber-500 text-amber-500 animate-pulse" />
                <span>{streakDays} dias seguidos</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
