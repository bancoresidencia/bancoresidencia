'use client';

import React from 'react';
import Link from 'next/link';
import { ChevronDown, HelpCircle, ArrowRight, MessageCircle } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { useTheme } from '@/context/ThemeContext';
import { LANDING_FAQ_ITEMS } from './landingData';
import { useScrollReveal } from './useScrollReveal';

const WhatsAppSvg: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.652-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);

interface LandingFaqAndFooterProps {
  openFaqId: string | null;
  onToggleFaq: (id: string) => void;
  onOpenAuth: (mode?: 'login' | 'register') => void;
  onScrollToSection: (sectionId: string) => void;
}

export const LandingFaqAndFooter: React.FC<LandingFaqAndFooterProps> = ({
  openFaqId,
  onToggleFaq,
  onOpenAuth,
  onScrollToSection
}) => {
  const { accentConfig } = useTheme();
  const { ref: faqRef, isVisible: faqVisible } = useScrollReveal<HTMLDivElement>(0.08);
  const { ref: supportRef, isVisible: supportVisible } = useScrollReveal<HTMLDivElement>(0.1);

  return (
    <>
      {/* =========================================================================
          PERGUNTAS FREQUENTES (Acordeão Fluido em CSS Grid)
          ========================================================================= */}
      <section
        id="faq"
        className="scroll-mt-20 py-18 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80"
      >
        <div
          ref={faqRef}
          className={`max-w-3xl mx-auto px-4 sm:px-6 reveal-up ${faqVisible ? 'is-visible' : ''}`}
        >
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 text-xs font-bold mb-3">
              <HelpCircle className="w-3.5 h-3.5 shrink-0" />
              <span>Dúvidas Frequentes</span>
            </div>
            <h2 className="text-3xl sm:text-4xl font-black tracking-[-0.035em] text-zinc-950 dark:text-white">
              Perguntas Frequentes
            </h2>
            <p className="mt-2.5 text-sm text-zinc-600 dark:text-zinc-400">
              Tudo o que você precisa saber sobre metodologia, acervo e planos do Hippocampus.
            </p>
          </div>

          <div className="space-y-2.5">
            {LANDING_FAQ_ITEMS.map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => onToggleFaq(item.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/70 dark:hover:bg-zinc-800/40 transition-colors"
                  >
                    <span className="text-sm sm:text-[15px] font-bold text-zinc-950 dark:text-white leading-snug">
                      {item.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-500 dark:text-zinc-400 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180 text-zinc-950 dark:text-white' : ''
                      }`}
                    />
                  </button>

                  <div
                    className={`grid transition-[grid-template-rows,opacity] duration-250 ease-out ${
                      isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'
                    }`}
                  >
                    <div className="overflow-hidden">
                      <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/70">
                        {item.answer}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO ÚNICA DE ATENDIMENTO HUMANO + CHAMADA FINAL DE APROVAÇÃO
          ========================================================================= */}
      <section
        id="suporte"
        className="scroll-mt-20 py-14 sm:py-20 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/80 dark:bg-[#0b0b0e]"
      >
        <div
          ref={supportRef}
          className={`max-w-5xl mx-auto px-4 sm:px-6 space-y-8 reveal-up ${supportVisible ? 'is-visible' : ''}`}
        >
          {/* Card Único e Refinado de Atendimento Humano no WhatsApp (Sem duplicação no rodapé) */}
          <div className="rounded-2xl p-6 sm:p-8 bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-1.5 max-w-xl">
              <div className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                <MessageCircle className="w-3.5 h-3.5 shrink-0" />
                <span>Atendimento Humano Direto</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-zinc-950 dark:text-white">
                Ficou com alguma dúvida sobre os planos ou recursos?
              </h2>
              <p className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Nossa equipe responde rapidamente pelo WhatsApp para ajudar na escolha do plano ou suporte à plataforma.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto shrink-0">
              <a
                href="https://wa.me/5588999903641?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20os%20planos%20do%20Hippocampus."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold bg-emerald-700 hover:bg-emerald-800 text-white shadow-xs transition-all cursor-pointer"
              >
                <WhatsAppSvg className="w-4 h-4 shrink-0" />
                <span>Consultor de Planos</span>
              </a>

              <a
                href="https://wa.me/5588999082917?text=Ol%C3%A1%2C%20preciso%20de%20suporte%20na%20plataforma%20Hippocampus."
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs sm:text-sm font-bold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 transition-all cursor-pointer"
              >
                <WhatsAppSvg className="w-4 h-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Suporte ao Aluno</span>
              </a>
            </div>
          </div>

          {/* Card Final de Conversão */}
          <div className="rounded-2xl p-8 sm:p-12 bg-zinc-900 dark:bg-[#141418] border border-zinc-800 text-white shadow-xl relative overflow-hidden text-center">
            <div
              aria-hidden="true"
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[480px] h-[220px] rounded-full blur-[110px] opacity-20 pointer-events-none"
              style={{ backgroundColor: accentConfig.primaryHex }}
            />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-2xl sm:text-4xl font-black tracking-[-0.035em] text-white leading-tight">
                Comece hoje sua preparação de alta retenção no Hippocampus.
              </h2>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Treine nas +200 mil questões das maiores bancas do país, revise com FSRS e acompanhe sua evolução pela psicometria TRI.
              </p>

              <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold transition-all hover:opacity-95 active:scale-[0.98] cursor-pointer shadow-lg"
                  style={{
                    backgroundColor: accentConfig.primaryHex,
                    color: accentConfig.primaryContrastHex
                  }}
                >
                  <span>Testar Grátis Agora</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={() => onScrollToSection('planos')}
                  className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-semibold text-zinc-200 bg-white/8 hover:bg-white/14 border border-white/15 transition-all cursor-pointer"
                >
                  Ver Planos e Descontos
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RODAPÉ INSTITUCIONAL COMPLETO (Com Links Legais /privacidade e /termos)
          ========================================================================= */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[#09090b] py-10 text-xs text-zinc-600 dark:text-zinc-400 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-5">
            <Logo variant="full" className="h-9 sm:h-10 w-auto max-w-[240px] shrink-0" />

            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 font-semibold">
              <button
                type="button"
                onClick={() => onScrollToSection('questoes')}
                className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Banco de Questões
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection('material-estudo')}
                className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Ecossistema
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection('flashcards')}
                className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Flashcards FSRS
              </button>
              <button
                type="button"
                onClick={() => onScrollToSection('planos')}
                className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Planos
              </button>
              <button
                type="button"
                onClick={() => {
                  onToggleFaq('faq-7');
                  onScrollToSection('faq');
                }}
                className="hover:text-zinc-950 dark:hover:text-white transition-colors cursor-pointer"
              >
                Programa de Embaixadores
              </button>
              <Link
                href="/termos"
                className="hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                Termos de Uso
              </Link>
              <Link
                href="/privacidade"
                className="hover:text-zinc-950 dark:hover:text-white transition-colors"
              >
                Política de Privacidade (LGPD)
              </Link>
            </div>
          </div>

          <div className="pt-5 border-t border-zinc-200/70 dark:border-zinc-800/70 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-zinc-500 dark:text-zinc-400 text-center sm:text-left">
            <p>© {new Date().getFullYear()} Hippocampus — Questões de Residência Médica. Todos os direitos reservados.</p>
            <p>Preparação científica para Residência Médica, Revalida e R+.</p>
          </div>
        </div>
      </footer>
    </>
  );
};
