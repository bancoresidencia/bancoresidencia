'use client';

import React, { useState, useRef, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import {
  Lock,
  Unlock,
  SlidersHorizontal,
  Eye,
  EyeOff,
  RotateCcw,
  Loader2
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTabAvailability } from '@/context/TabAvailabilityContext';
import { PLATFORM_TABS } from '@/types/tabAvailability';

export const AdminTabToggle: React.FC = () => {
  const { isAdmin } = useAuth();
  const pathname = usePathname();
  const {
    tabStatus,
    isTabActive,
    toggleTab,
    resetAllTabs,
    previewAsStudent,
    setPreviewAsStudent,
    getTabByPath
  } = useTabAvailability();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [isPending, setIsPending] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fecha dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isAdmin) {
    return null;
  }

  const currentTab = getTabByPath(pathname);
  const isCurrentActive = currentTab ? isTabActive(currentTab.key) : true;
  const activeCount = Object.values(tabStatus).filter(Boolean).length;

  return (
    <div ref={dropdownRef} className="relative flex items-center">
      {/* Botão Principal no Canto Superior */}
      <div className="inline-flex items-center rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-xs p-1 text-xs font-semibold">
        {/* Toggle Rápido da Aba Atual */}
        {currentTab ? (
          <button
            type="button"
            disabled={isPending}
            onClick={async () => {
              try {
                setIsPending(true);
                if (isCurrentActive) {
                  // Bloqueia a aba e ativa visualização imediata da tela opaca
                  await toggleTab(currentTab.key, false);
                  setPreviewAsStudent(true);
                } else {
                  // Desbloqueia a aba e desativa a visualização de aluno
                  await toggleTab(currentTab.key, true);
                  setPreviewAsStudent(false);
                }
              } finally {
                setIsPending(false);
              }
            }}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              isCurrentActive
                ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/25 border border-emerald-500/20'
                : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/20'
            } ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
            title={`Clique para ${isCurrentActive ? 'bloquear (Em Breve)' : 'ativar'} a aba ${currentTab.label} para os alunos`}
          >
            {isPending ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin text-zinc-500" />
                <span className="font-bold">{currentTab.label}:</span>
                <span className="text-[11px] font-normal">Salvando...</span>
              </>
            ) : isCurrentActive ? (
              <>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="font-bold">{currentTab.label}:</span>
                <span className="text-[11px] font-normal">Ativa</span>
                <Unlock className="w-3.5 h-3.5 ml-0.5 opacity-70" />
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
                <span className="font-bold">{currentTab.label}:</span>
                <span className="text-[11px] font-normal">Em Breve</span>
                <Lock className="w-3.5 h-3.5 ml-0.5 text-amber-500" />
              </>
            )}
          </button>
        ) : (
          <div className="px-2 py-1 text-zinc-500 text-[11px]">
            Aba Administrativa
          </div>
        )}

        {/* Botão do Menu Dropdown de Todas as 11 Abas */}
        <button
          type="button"
          onClick={() => setDropdownOpen(!dropdownOpen)}
          className={`p-1 rounded-lg ml-0.5 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
            dropdownOpen ? 'bg-zinc-200 dark:bg-zinc-800' : ''
          }`}
          title="Gerenciar ativação de todas as 11 abas"
          aria-label="Gerenciar todas as abas"
        >
          <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      {/* Menu Dropdown de Gestão Global de Abas */}
      {dropdownOpen && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2.5 mb-2 border-b border-zinc-100 dark:border-zinc-800/80">
            <div>
              <h4 className="font-heading font-bold text-xs text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-zinc-500" />
                Controle de Abas ({activeCount}/11 ativas)
              </h4>
              <p className="text-[10px] text-zinc-500">
                Alunos não conseguem mexer em abas &quot;Em Breve&quot;.
              </p>
            </div>

            <button
              type="button"
              disabled={isPending}
              onClick={async () => {
                try {
                  setIsPending(true);
                  await resetAllTabs();
                } finally {
                  setIsPending(false);
                }
              }}
              className="text-[10px] text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 p-1 rounded hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer flex items-center gap-1"
              title="Restaurar todas as abas como ativas"
            >
              <RotateCcw className="w-3 h-3" />
              Restaurar
            </button>
          </div>

          {/* Botão de Pré-visualização como Aluno */}
          <div className="mb-2.5 p-2 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/60 dark:border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {previewAsStudent ? (
                <EyeOff className="w-4 h-4 text-amber-500" />
              ) : (
                <Eye className="w-4 h-4 text-zinc-400" />
              )}
              <div>
                <div className="text-[11px] font-semibold text-zinc-800 dark:text-zinc-200">
                  Visão de Aluno
                </div>
                <div className="text-[9px] text-zinc-500">
                  {previewAsStudent
                    ? 'Ativada: você vê o bloqueio'
                    : 'Desativada: você edita normalmente'}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setPreviewAsStudent(!previewAsStudent)}
              className={`px-2 py-1 rounded-lg text-[10px] font-bold cursor-pointer transition-all ${
                previewAsStudent
                  ? 'bg-amber-500 text-white shadow-xs'
                  : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
              }`}
            >
              {previewAsStudent ? 'Ativa' : 'Simular'}
            </button>
          </div>

          {/* Lista das 11 Abas da Plataforma */}
          <div className="space-y-1 max-h-64 overflow-y-auto pr-0.5 custom-scrollbar">
            {PLATFORM_TABS.map((tab) => {
              const active = isTabActive(tab.key);
              const isCurrent = currentTab?.key === tab.key;

              return (
                <div
                  key={tab.key}
                  className={`flex items-center justify-between p-1.5 rounded-xl transition-colors ${
                    isCurrent
                      ? 'bg-zinc-100/90 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700'
                      : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/50'
                  }`}
                >
                  <div className="flex items-center gap-2 min-w-0 pr-2">
                    <span
                      className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        active ? 'bg-emerald-500' : 'bg-amber-500'
                      }`}
                    />
                    <div className="min-w-0">
                      <div className="text-[11px] font-medium text-zinc-900 dark:text-zinc-100 truncate flex items-center gap-1">
                        {tab.label}
                        {isCurrent && (
                          <span className="text-[9px] px-1 py-0.2 rounded bg-zinc-200 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
                            Atual
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={isPending}
                    onClick={async () => {
                      const nextState = !active;
                      try {
                        setIsPending(true);
                        await toggleTab(tab.key, nextState);
                        if (isCurrent && !nextState) {
                          setPreviewAsStudent(true);
                        } else if (isCurrent && nextState) {
                          setPreviewAsStudent(false);
                        }
                      } finally {
                        setIsPending(false);
                      }
                    }}
                    className={`shrink-0 px-2 py-0.8 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-500/20'
                        : 'bg-amber-500/15 text-amber-700 dark:text-amber-400 hover:bg-amber-500/25 border border-amber-500/20'
                    } ${isPending ? 'opacity-70 pointer-events-none' : ''}`}
                  >
                    {active ? 'Ativa' : 'Em Breve'}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
