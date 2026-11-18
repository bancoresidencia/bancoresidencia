'use client';

import React, { useState, useCallback } from 'react';
import {
  LandingDemoQuestionsSection,
  ExternalDemoSelection
} from '@/components/LandingDemoQuestionsSection';
import { LandingHeader } from '@/components/landing/LandingHeader';
import { LandingHeroSection } from '@/components/landing/LandingHeroSection';
import { LandingMetricsAndAuthorityStrip } from '@/components/landing/LandingMetricsAndAuthorityStrip';
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
    <div className="min-h-screen bg-zinc-50 dark:bg-[var(--bg-page)] text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-[var(--primary-color)] selection:text-[var(--primary-contrast)] transition-colors duration-200 overflow-x-clip">
      <LandingHeader onOpenAuth={onOpenAuth} onScrollToSection={scrollToSection} />

      <main id="conteudo-principal" className="flex-1 flex flex-col">
        <LandingHeroSection
          onOpenAuth={onOpenAuth}
          onScrollToSection={scrollToSection}
          onSelectBancaDemo={handleSelectBancaDemo}
        />

        <LandingMetricsAndAuthorityStrip />

        <div id="questoes" className="scroll-mt-20">
          <LandingDemoQuestionsSection
            onLoginDemo={onLoginDemo}
            onOpenAuth={onOpenAuth}
            externalSelection={demoSelection}
          />
        </div>

        <LandingEcosystemShowcase onOpenAuth={onOpenAuth} />

        <LandingFlashcardsAndThemesSection />

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
