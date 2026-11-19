'use client';

import React, { useState, useCallback } from 'react';
import {
  LandingDemoQuestionsSection,
  ExternalDemoSelection
} from '@/components/LandingDemoQuestionsSection';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingIntroSection } from '@/components/landing/LandingIntroSection';
import { LandingBrainHero } from '@/components/LandingBrainHero';
import { LandingMetricsAndAuthorityStrip } from '@/components/landing/LandingMetricsAndAuthorityStrip';
import { LandingInstitutionsStrip } from '@/components/landing/LandingInstitutionsStrip';
import { LandingEcosystemShowcase } from '@/components/landing/LandingEcosystemShowcase';
import { LandingFlashcardsAndThemesSection } from '@/components/landing/LandingFlashcardsAndThemesSection';
import { LandingPricingSection } from '@/components/landing/LandingPricingSection';
import { LandingFaqAndFooter } from '@/components/landing/LandingFaqAndFooter';
import { DemoTabKey } from '@/components/landing/landingData';

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register', planTitle?: string) => void;
  onLoginDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onLoginDemo }) => {
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [demoSelection, setDemoSelection] = useState<ExternalDemoSelection | null>(null);

  const scrollToSection = useCallback((id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  const handleSelectBancaDemo = useCallback(
    (tab: DemoTabKey, questionIndex: number, bancaLabel: string) => {
      setDemoSelection({
        tab,
        questionIndex,
        bancaLabel,
        nonce: Date.now()
      });
      scrollToSection('questoes');
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
      className="font-inter min-h-screen bg-zinc-50 dark:bg-[var(--bg-page)] text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-[var(--primary-color)] selection:text-[var(--primary-contrast)] transition-colors duration-200 overflow-x-clip"
      style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}
    >
      <LandingHeader onOpenAuth={onOpenAuth} onScrollToSection={scrollToSection} />

      <main id="conteudo-principal" className="flex-1 flex flex-col">
        <LandingIntroSection
          onOpenAuth={onOpenAuth}
          onScrollToSection={scrollToSection}
        />

        <div id="neuroanatomia" className="scroll-mt-16">
          <LandingBrainHero
            onOpenAuth={onOpenAuth}
            onScrollToSection={scrollToSection}
          />
        </div>

        <LandingMetricsAndAuthorityStrip />

        <div id="questoes" className="scroll-mt-20">
          <LandingDemoQuestionsSection
            key={demoSelection ? `${demoSelection.tab}-${demoSelection.nonce}` : 'default'}
            onLoginDemo={onLoginDemo}
            onOpenAuth={onOpenAuth}
            initialTab={demoSelection?.tab}
            initialQuestionIndex={demoSelection?.questionIndex}
            bancaLabel={demoSelection?.bancaLabel}
          />
        </div>

        <LandingEcosystemShowcase onOpenAuth={onOpenAuth} />

        <LandingFlashcardsAndThemesSection />

        <LandingInstitutionsStrip
          onSelectBanca={(banca) =>
            handleSelectBancaDemo(banca.targetTab, banca.targetQuestionIdx, banca.shortLabel)
          }
        />

        <LandingPricingSection onSelectPlan={handleStartPlanCheckout} />

        <LandingFaqAndFooter
          openFaqId={openFaqId}
          onToggleFaq={handleToggleFaq}
          onOpenAuth={onOpenAuth}
          onScrollToSection={scrollToSection}
        />
      </main>
    </div>
  );
};
