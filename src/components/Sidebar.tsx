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
  Flame,
  UserCheck
} from 'lucide-react';
import { ActiveTab, Modalidade } from '@/types';

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
  const menuItems = [
    { id: 'home', label: 'Início', icon: Home },
    { id: 'banco', label: 'Banco de Questões', icon: Database },
    { id: 'listas', label: 'Listas de Questões', icon: ListFilter },
    { id: 'simulados', label: 'Simulados', icon: FileCheck2 },
    { id: 'stats', label: 'Meu Desempenho', icon: BarChart2 },
    { id: 'ranking', label: 'Ranking', icon: Trophy }
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-slate-800/80 flex flex-col shrink-0 min-h-screen sticky top-0 z-40 hidden md:flex">
      {/* Topo com Logo */}
      <div className="h-16 px-5 border-b border-slate-800/80 flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
          <Stethoscope className="w-5 h-5" />
        </div>
        <div>
          <span className="text-sm font-bold text-white tracking-tight block">Banco Residência</span>
          <span className="text-[10px] text-blue-400 font-medium block">{modalidade}</span>
        </div>
      </div>

      {/* Navegação Principal */}
      <div className="flex-1 py-4 px-3 space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
          Menu Principal
        </div>
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id as ActiveTab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>
              {isActive && <ChevronRight className="w-3.5 h-3.5 opacity-80" />}
            </button>
          );
        })}
      </div>

      {/* Box do Usuário e Sequência no rodapé da Sidebar */}
      <div className="p-3 border-t border-slate-800/80 m-2 bg-slate-900/60 rounded-xl border border-slate-800/60">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-500/20 border border-blue-500/40 flex items-center justify-center text-blue-300 font-bold text-xs">
            LR
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-semibold text-white truncate">Dr. Lucas Rocha</div>
            <div className="flex items-center gap-1 text-[11px] text-amber-400 font-medium">
              <Flame className="w-3 h-3 fill-amber-400" />
              <span>{streakDays} dias de sequência</span>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};
