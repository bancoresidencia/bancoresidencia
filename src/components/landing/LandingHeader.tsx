'use client';

import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { ThemeSelector } from '@/components/ThemeSelector';
import { useTheme } from '@/context/ThemeContext';

interface LandingHeaderProps {
  onOpenAuth: (mode?: 'login' | 'register', planTitle?: string) => void;
  onScrollToSection: (sectionId: string) => void;
}

const NAV_ITEMS: { id: string; label: string }[] = [
  { id: 'neuroanatomia', label: 'Metodologia' },
  { id: 'questoes', label: 'Banco de Questões' },
  { id: 'material-estudo', label: 'Ecossistema' },
  { id: 'flashcards', label: 'Flashcards FSRS' },
  { id: 'planos', label: 'Planos' },
  { id: 'faq', label: 'FAQ' },
  { id: 'suporte', label: 'Atendimento' }
];

export const LandingHeader: React.FC<LandingHeaderProps> = ({
  onOpenAuth,
  onScrollToSection
}) => {
  const { accentConfig } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    onScrollToSection(id);
  };

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-white/85 dark:bg-[var(--bg-page)]/85 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
        {/* Marca Oficial Hippocampus (Botão semântico acessível via teclado) */}
        <button
          type="button"
          onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
          title="Voltar ao topo"
          className="flex items-center cursor-pointer group select-none py-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary-color)]"
        >
          <Logo
            variant="full"
            className="h-10 sm:h-11 w-auto max-w-[240px] sm:max-w-[280px] shrink-0 transition-transform group-hover:scale-[1.015] duration-200"
            glow
          />
        </button>

        {/* Navegação Central Desktop */}
        <nav aria-label="Navegação principal" className="hidden lg:flex items-center gap-1">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavClick(item.id)}
              className="px-3 py-1.5 rounded-lg text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/90 dark:hover:bg-zinc-800/70 transition-colors duration-150 cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Ações à Direita: Tema + Entrar + Testar Grátis + Menu Mobile */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          <ThemeSelector compact={true} />

          <button
            type="button"
            data-landing-auth
            onClick={() => onOpenAuth('login')}
            className="hidden sm:inline-flex items-center justify-center h-9 px-3.5 rounded-xl text-xs sm:text-[13px] font-semibold text-zinc-700 dark:text-zinc-200 hover:text-zinc-950 dark:hover:text-white bg-zinc-100/90 dark:bg-zinc-800/80 hover:bg-zinc-200/80 dark:hover:bg-zinc-700/80 border border-zinc-200/70 dark:border-zinc-700/60 transition-all cursor-pointer"
          >
            Entrar
          </button>

          <button
            type="button"
            data-landing-auth
            onClick={() => onOpenAuth('register')}
            className="inline-flex items-center justify-center h-9 px-3.5 sm:px-4 rounded-xl text-xs sm:text-[13px] font-bold transition-all shadow-xs hover:opacity-95 active:scale-[0.98] cursor-pointer"
            style={{
              backgroundColor: accentConfig.primaryHex,
              color: accentConfig.primaryContrastHex
            }}
          >
            Testar Grátis
          </button>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden h-9 w-9 inline-flex items-center justify-center rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
            aria-label={mobileMenuOpen ? 'Fechar menu' : 'Abrir menu'}
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Menu Mobile com transição fluida */}
      <div
        aria-hidden={!mobileMenuOpen}
        className={`lg:hidden grid transition-[grid-template-rows,opacity] duration-200 ease-out ${
          mobileMenuOpen ? 'grid-rows-[1fr] opacity-100 border-t border-zinc-200 dark:border-zinc-800' : 'grid-rows-[0fr] opacity-0 pointer-events-none'
        }`}
      >
        <div className="overflow-hidden bg-white dark:bg-[var(--bg-card)]">
          <div className="px-4 py-3.5 space-y-1">
            {NAV_ITEMS.map((item) => (
              <button
                key={item.id}
                type="button"
                tabIndex={mobileMenuOpen ? 0 : -1}
                onClick={() => handleNavClick(item.id)}
                className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                {item.label}
              </button>
            ))}

            <div className="pt-2.5 mt-2 border-t border-zinc-200 dark:border-zinc-800 grid grid-cols-2 gap-2">
              <button
                type="button"
                tabIndex={mobileMenuOpen ? 0 : -1}
                data-landing-auth
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="py-2.5 rounded-xl text-sm font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-center cursor-pointer"
              >
                Entrar
              </button>
              <button
                type="button"
                tabIndex={mobileMenuOpen ? 0 : -1}
                data-landing-auth
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="py-2.5 rounded-xl text-sm font-bold text-center shadow-xs cursor-pointer"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  color: accentConfig.primaryContrastHex
                }}
              >
                Testar Grátis
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
