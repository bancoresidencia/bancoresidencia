'use client';

import React, { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Lock,
  ArrowRight,
  LayoutDashboard,
  FileQuestion,
  EyeOff,
  Unlock
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { useTabAvailability } from '@/context/TabAvailabilityContext';

interface TabFeatureGuardProps {
  children: React.ReactNode;
}

export const TabFeatureGuard: React.FC<TabFeatureGuardProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { isAdmin } = useAuth();
  const { accentConfig } = useTheme();
  const {
    isTabActive,
    toggleTab,
    previewAsStudent,
    setPreviewAsStudent,
    getTabByPath
  } = useTabAvailability();

  const currentTab = getTabByPath(pathname);
  const isCurrentActive = currentTab ? isTabActive(currentTab.key) : true;
  const isBlocked = !isCurrentActive && (!isAdmin || previewAsStudent);

  // Bloqueia rigorosamente a rolagem da página quando o aviso estiver ativo
  useEffect(() => {
    if (isBlocked) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = originalOverflow;
      };
    }
  }, [isBlocked]);

  // Se a rota não for uma aba gerenciável (ex: /admin/curadoria), exibe normalmente
  if (!currentTab) {
    return <>{children}</>;
  }

  // Caso 1: Aba está ativa para todos
  if (isCurrentActive) {
    return <>{children}</>;
  }

  // Caso 2: Aba está em "Em Breve" (Desativada)
  // Se for Administrador e NÃO estiver simulando como aluno: exibe conteúdo com tarja informativa
  if (isAdmin && !previewAsStudent) {
    return (
      <div className="relative">
        {/* Banner Superior de Informação do Administrador */}
        <div className="bg-amber-500/10 dark:bg-amber-500/15 border-b border-amber-500/30 px-4 py-2.5 text-xs text-amber-800 dark:text-amber-300 flex flex-wrap items-center justify-between gap-3 sticky top-18 z-20 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500 shrink-0" />
            <span>
              <strong>Modo Administrador:</strong> A aba <u>{currentTab.label}</u> está bloqueada para os alunos (Em Breve). Você tem acesso irrestrito para testes e curadoria.
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewAsStudent(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 font-bold text-[11px] shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <EyeOff className="w-3.5 h-3.5" />
              Ver Tela Bloqueada dos Alunos
            </button>

            <button
              type="button"
              onClick={() => toggleTab(currentTab.key, true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] shadow-xs hover:scale-102 active:scale-98 transition-all cursor-pointer"
            >
              <Unlock className="w-3.5 h-3.5" />
              Ativar para Alunos
            </button>
          </div>
        </div>

        {/* Conteúdo da aba visível para o admin */}
        {children}
      </div>
    );
  }

  // Caso 3: Aluno (ou Administrador simulando visão de aluno) em aba desativada
  return (
    <div className="relative h-[calc(100vh-4.5rem)] max-h-[calc(100vh-4.5rem)] overflow-hidden flex flex-col">
      {/* 1. Conteúdo original no fundo totalmente borrado e opaco, sem interação e sem scroll */}
      <div
        className="filter blur-2xl opacity-15 pointer-events-none select-none max-h-full overflow-hidden transition-all duration-300"
        aria-hidden="true"
        tabIndex={-1}
      >
        {children}
      </div>

      {/* 2. Plano de Fundo Totalmente Borrado e Opaco com Card Perfeitamente Centralizado e Fixo */}
      <div className="fixed inset-0 z-40 flex items-center justify-center p-4 sm:p-6 backdrop-blur-2xl bg-white/80 dark:bg-[#09090b]/85 select-none transition-all duration-300 animate-in fade-in duration-200">
        <div className="max-w-md w-full bg-white dark:bg-zinc-900/95 border border-zinc-200 dark:border-zinc-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl text-center space-y-5 animate-in zoom-in-95 duration-200 relative overflow-hidden">
          {/* Efeito Glow com o acento cromático do estudante */}
          <div
            className="absolute -top-20 -left-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: accentConfig.primaryHex }}
          />
          <div
            className="absolute -bottom-20 -right-20 w-48 h-48 rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: accentConfig.primaryHex }}
          />

          {/* Badge Superior sem o símbolo conforme solicitado */}
          <div className="inline-flex items-center px-3.5 py-1 rounded-full text-xs font-black uppercase tracking-wider bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700">
            <span>Em Implementação</span>
          </div>

          {/* Título Principal */}
          <div className="space-y-2">
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-zinc-900 dark:text-zinc-100 tracking-tight">
              Em Breve
            </h2>
            <p className="text-sm font-semibold text-zinc-600 dark:text-zinc-300">
              {currentTab.label}
            </p>
          </div>

          {/* Texto Explicativo Amigável */}
          <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
            Estamos estruturando e calibrando esta funcionalidade com máxima precisão médica para a sua preparação. Estará disponível em breve!
          </p>

          {/* Botões de Navegação para o Aluno */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-2.5">
            <button
              type="button"
              onClick={() => router.push('/questoes')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs shadow-md transition-all hover:scale-102 active:scale-98 cursor-pointer"
              style={{
                backgroundColor: accentConfig.primaryHex,
                color: accentConfig.primaryContrastHex
              }}
            >
              <FileQuestion className="w-4 h-4" />
              <span>Ir para o Banco de Questões</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard')}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl font-semibold text-xs text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 transition-colors cursor-pointer"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Ir para o Início</span>
            </button>
          </div>

          {/* Painel de Controle Exclusivo do Administrador no Bloqueio */}
          {isAdmin && (
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 space-y-2">
              <button
                type="button"
                onClick={async () => {
                  await toggleTab(currentTab.key, true);
                  setPreviewAsStudent(false);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-bold text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-md transition-all hover:scale-102 active:scale-98 cursor-pointer"
              >
                <Unlock className="w-4 h-4" />
                <span>Reativar {currentTab.label} (Liberar aos Alunos)</span>
              </button>

              <button
                type="button"
                onClick={() => setPreviewAsStudent(false)}
                className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5" />
                <span>Voltar ao Modo Curadoria (Editar Conteúdo)</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
