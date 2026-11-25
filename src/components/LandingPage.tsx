'use client';

import React, { memo, useState, useCallback } from 'react';
import dynamic from 'next/dynamic';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingBrainHero } from '@/components/LandingBrainHero';
import { LandingInstitutionsAndMapSection } from '@/components/landing/LandingInstitutionsAndMapSection';
import { LandingEcosystemShowcase } from '@/components/landing/LandingEcosystemShowcase';
import { LandingPricingSection } from '@/components/landing/LandingPricingSection';
import { LandingFaqAndFooter } from '@/components/landing/LandingFaqAndFooter';
import { LandingSections } from '@/components/landing/LandingSections';

const LandingInsidePlatformSection = dynamic(
  () => import('@/components/landing/LandingInsidePlatformSection').then((m) => m.LandingInsidePlatformSection),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-[500px] flex items-center justify-center bg-zinc-50 dark:bg-[var(--bg-page)] text-zinc-500">
        <div className="w-8 h-8 rounded-full border-2 border-zinc-400 border-t-transparent animate-spin" />
      </div>
    )
  }
);

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register', planTitle?: string) => void;
  onLoginDemo?: () => void;
}

export const LandingPage = memo(function LandingPage({ onOpenAuth }: LandingPageProps) {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [platformTab, setPlatformTab] = useState<'questoes' | 'flashcards' | 'resumos' | 'desempenho'>('questoes');

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleNavigateToPlatformTab = useCallback(
    (tab: 'questoes' | 'flashcards' | 'resumos' | 'desempenho') => {
      setPlatformTab(tab);
      scrollToSection('dentro-da-plataforma');
    },
    [scrollToSection]
  );

  const handleStartPlanCheckout = useCallback(
    (planId: string, mode: 'register' | 'login' = 'register') => {
      if (typeof window !== 'undefined') {
        try {
          sessionStorage.setItem('pending_checkout_plan', planId);
          localStorage.setItem('pending_checkout_plan', planId);
          const url = new URL(window.location.href);
          url.searchParams.set('plan', planId);
          url.searchParams.set('checkout', '1');
          window.history.replaceState({}, '', url.toString());
        } catch {
          // ignore storage errors
        }
      }
      onOpenAuth(mode, planId);
    },
    [onOpenAuth]
  );

  const handleToggleFaq = useCallback((id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  }, []);

  return (
    <div
      className="font-inter min-h-screen bg-[var(--bg-page,#f1f5f9)] dark:bg-[var(--bg-page,#09090b)] text-[var(--foreground,#09090b)] dark:text-[var(--foreground,#f4f4f5)] flex flex-col selection:bg-[var(--primary-color)] selection:text-[var(--primary-contrast)] transition-colors duration-200 overflow-x-clip"
      style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}
    >
      {/* 1. Header Fixo com Navegação */}
      <LandingHeader onOpenAuth={onOpenAuth} onScrollToSection={scrollToSection} />

      <main id="conteudo-principal" className="flex-1 flex flex-col">
        {/* 2. Dobras 1 e 2: Os 4 Pilares da Aprovação + Mensagem + Dissecção Anatômica do Cérebro */}
        <div id="neuroanatomia" className="scroll-mt-16">
          <LandingBrainHero
            onOpenAuth={onOpenAuth}
            onScrollToSection={scrollToSection}
            onNavigateToPlatformTab={handleNavigateToPlatformTab}
          />
        </div>

        <LandingSections>
          {/* 3. Nova Dobra: Estatísticas da Imagem 1 (sem 7 dias) + Mapa do Brasil das 27 UFs + Logos Oficiais */}
          <LandingInstitutionsAndMapSection
            onScrollToQuestions={() => scrollToSection('dentro-da-plataforma')}
          />

          {/* 4. Nova Categoria de Dobra: "Dentro da Plataforma" (5 Questões, 5 Flashcards, 3 Resumos, Desempenho) */}
          <LandingInsidePlatformSection
            onOpenAuth={onOpenAuth}
            activeTab={platformTab}
            onTabChange={setPlatformTab}
          />

          {/* 5. Recursos Adicionais: Idêntico à Imagem 2 (Provas na Íntegra na 1ª posição, TRI, Caderno de Erros, Google Agenda) */}
          <LandingEcosystemShowcase onOpenAuth={onOpenAuth} />

          {/* 6. Planos de Preços (Mantido como está) */}
          <LandingPricingSection onSelectPlan={handleStartPlanCheckout} />

          {/* 7. FAQ, Atendimento WhatsApp e Rodapé (Mantido como está) */}
          <LandingFaqAndFooter
            openFaqId={openFaqId}
            onToggleFaq={handleToggleFaq}
            onOpenAuth={onOpenAuth}
            onScrollToSection={scrollToSection}
          />
        </LandingSections>
      </main>
    </div>
  );
});

export default LandingPage;
