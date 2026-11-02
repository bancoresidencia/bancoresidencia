'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Logo } from '@/components/Logo';
import {
  Sparkles,
  ArrowRight,
  BookOpenCheck,
  BarChart3,
  HelpCircle,
  ShieldCheck,
  Check,
  X,
  CreditCard,
  UserCheck,
  Menu,
  ChevronDown,
  ChevronUp,
  RotateCcw,
  BookOpen,
  Brain,
  Layers,
  Gift,
  Award,
  Wallet,
  CheckCircle2
} from 'lucide-react';
import { LandingDemoQuestionsSection } from '@/components/LandingDemoQuestionsSection';

export interface PricingPlan {
  id: 'monthly' | 'semiannual' | 'annual' | 'biennial' | 'mensal' | 'semestral' | 'anual' | 'bienal';
  name: string;
  badge?: string;
  isPopular?: boolean;
  pricePerMonth: string;
  billingText: string;
  periodLabel: string;
  savings?: string;
  description: string;
  features: string[];
}

const PRICING_PLANS: PricingPlan[] = [
  {
    id: 'monthly',
    name: 'Plano Mensal',
    pricePerMonth: '49,90',
    billingText: 'Cobrado mensalmente',
    periodLabel: 'por mês',
    description: 'Flexibilidade total para você estudar no seu próprio ritmo, sem fidelidade.',
    features: [
      'Acesso completo a +130.000 questões comentadas',
      'Caderno com todas as provas oficiais na íntegra',
      'Resoluções comentadas alternativa por alternativa',
      'Acompanhamento detalhado e diagnóstico de pontos fracos',
      'Criação ilimitada de cadernos e pastas personalizadas',
      'Simulados ilimitados com cronômetro de prova real',
      'Ranking Oficial e percentil calibrado',
      'Acesso liberado no celular, tablet e computador'
    ]
  },
  {
    id: 'semiannual',
    name: 'Plano Semestral',
    badge: 'RETA FINAL',
    pricePerMonth: '29,90',
    billingText: 'R$ 179,40 em até 6x de R$ 29,90',
    periodLabel: 'por mês',
    savings: 'Economize 40%',
    description: 'Planejado para o semestre de reta final e resolução intensa de provas.',
    features: [
      'Acesso completo a +130.000 questões comentadas',
      'Caderno com todas as provas oficiais na íntegra',
      'Resoluções comentadas alternativa por alternativa',
      'Acompanhamento detalhado e diagnóstico de pontos fracos',
      'Criação ilimitada de cadernos e pastas personalizadas',
      'Simulados ilimitados com cronômetro de prova real',
      'Ranking Oficial e percentil calibrado',
      'Acesso liberado no celular, tablet e computador'
    ]
  },
  {
    id: 'annual',
    name: 'Plano Anual',
    badge: 'MAIS ESCOLHIDO',
    isPopular: true,
    pricePerMonth: '25,90',
    billingText: 'R$ 310,80 por ano em até 12x de R$ 25,90',
    periodLabel: 'por mês',
    savings: 'Economize 48%',
    description: 'A preparação completa de 1 ano para garantir sua vaga na residência dos sonhos.',
    features: [
      'Acesso completo a +130.000 questões comentadas',
      'Caderno com todas as provas oficiais na íntegra',
      'Resoluções comentadas alternativa por alternativa',
      'Acompanhamento detalhado e diagnóstico de pontos fracos',
      'Criação ilimitada de cadernos e pastas personalizadas',
      'Simulados ilimitados com cronômetro de prova real',
      'Ranking Oficial e percentil calibrado',
      'Acesso liberado no celular, tablet e computador'
    ]
  },
  {
    id: 'biennial',
    name: 'Plano Bienal',
    badge: 'MAIOR ECONOMIA',
    pricePerMonth: '19,90',
    billingText: 'R$ 477,60 a cada 2 anos (ou 24x de R$ 19,90)',
    periodLabel: 'por mês',
    savings: 'Economize 60%',
    description: 'Perfeito para o internato (5º e 6º ano). Máxima economia até a sua aprovação.',
    features: [
      'Acesso completo a +130.000 questões comentadas',
      'Caderno com todas as provas oficiais na íntegra',
      'Resoluções comentadas alternativa por alternativa',
      'Acompanhamento detalhado e diagnóstico de pontos fracos',
      'Criação ilimitada de cadernos e pastas personalizadas',
      'Simulados ilimitados com cronômetro de prova real',
      'Ranking Oficial e percentil calibrado',
      'Acesso liberado no celular, tablet e computador'
    ]
  }
];

interface FeaturedBanca {
  id: string;
  name: string;
  logo: string;
  logoSlug?: string;
}

const TOP_FEATURED_BANCAS: FeaturedBanca[] = [
  { id: 'enare', name: 'ENARE', logo: 'ENARE', logoSlug: 'enare' },
  { id: 'usp-sp', name: 'USP-SP', logo: 'USP-SP', logoSlug: 'hcfmusp' },
  { id: 'unicamp', name: 'UNICAMP', logo: 'UNICAMP', logoSlug: 'hc-unicamp' },
  { id: 'amrigs', name: 'AMRIGS', logo: 'AMRIGS', logoSlug: 'amrigs' },
  { id: 'sus-sp', name: 'SUS-SP', logo: 'SUS-SP', logoSlug: 'sus-sp' },
  { id: 'psu-mg', name: 'PSU-MG', logo: 'PSU-MG', logoSlug: 'aremg' },
  { id: 'iamspe', name: 'IAMSPE', logo: 'IAMSPE', logoSlug: 'hspe-fmo' },
  { id: 'uerj', name: 'UERJ', logo: 'UERJ', logoSlug: 'hupe' },
  { id: 'ufrj', name: 'UFRJ', logo: 'UFRJ' },
  { id: 'einstein', name: 'EINSTEIN', logo: 'EINSTEIN', logoSlug: 'einstein-hiae' },
  { id: 'santa-casa-sp', name: 'Santa Casa SP', logo: 'SANTA CASA', logoSlug: 'santa-casa-sp' },
  { id: 'psu-ce', name: 'PSU-CE / SURCE', logo: 'PSU-CE' },
  { id: 'ses-pe', name: 'SES-PE', logo: 'SES-PE', logoSlug: 'ses-pe' },
  { id: 'ses-df', name: 'SES-DF', logo: 'SES-DF', logoSlug: 'ses-df' },
  { id: 'unifesp', name: 'UNIFESP', logo: 'UNIFESP', logoSlug: 'unifesp-epm' },
  { id: 'hcpa', name: 'HCPA', logo: 'HCPA', logoSlug: 'hcpa' },
  { id: 'fmabc', name: 'FMABC', logo: 'FMABC', logoSlug: 'fmabc' },
  { id: 'uel', name: 'UEL', logo: 'UEL', logoSlug: 'hu-uel' },
  { id: 'revalida', name: 'Revalida INEP', logo: 'REVALIDA', logoSlug: 'inep-revalida' },
  { id: 'amp', name: 'AMP', logo: 'AMP', logoSlug: 'amp' }
];

const QUICK_NAV_BUTTONS = [
  { id: 'questoes', label: 'BANCO DE QUESTÕES' },
  { id: 'flashcards', label: 'FLASHCARDS' },
  { id: 'material-estudo', label: 'MATERIAIS COMPLETOS' },
  { id: 'estatisticas', label: 'ESTATÍSTICAS' },
];

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register', planTitle?: string) => void;
  onLoginDemo?: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onLoginDemo }) => {
  const { accentConfig } = useTheme();
  const [selectedPlanModal, setSelectedPlanModal] = useState<PricingPlan | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaqId, setOpenFaqId] = useState<string | null>('faq-1');
  const [demoFlashcardFlipped, setDemoFlashcardFlipped] = useState(false);
  const [hoveredNavBtn, setHoveredNavBtn] = useState<string | null>(null);

  const handleStartPlanCheckout = (planId: string, mode: 'register' | 'login' = 'register') => {
    if (typeof window !== 'undefined') {
      try {
        sessionStorage.setItem('pending_checkout_plan', planId);
        localStorage.setItem('pending_checkout_plan', planId);
        const url = new URL(window.location.href);
        url.searchParams.set('plan', planId);
        url.searchParams.set('checkout', '1');
        window.history.replaceState({}, '', url.toString());
      } catch {
        // ignore
      }
    }
    onOpenAuth(mode, planId);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-[var(--bg-page)] text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-[var(--primary-color)] selection:text-white transition-colors duration-200">
      {/* =========================================================================
          BANNER PROMOCIONAL SUPERIOR (BLACK DE LANÇAMENTO - TICKER ANDANDO SUAVE)
          ========================================================================= */}
      <aside
        aria-label="Promoção Black de Lançamento"
        onClick={() => scrollToSection('planos')}
        className="w-full bg-[#08080a] text-white border-b border-amber-500/30 py-2 sm:py-2.5 cursor-pointer relative overflow-hidden group select-none transition-all duration-200 hover:bg-black"
        style={{
          boxShadow: '0 2px 15px rgba(245, 158, 11, 0.14)'
        }}
      >
        {/* Glow sutil de fundo dourado/amber */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-500/10 via-transparent to-amber-500/10 pointer-events-none" />

        {/* Fades laterais para efeito infinito nas bordas */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#08080a] via-[#08080a]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#08080a] via-[#08080a]/80 to-transparent z-10" />

        {/* Track Animado Ticker (Andando Infinitamente, pausa no hover) */}
        <div className="animate-marquee-banner flex items-center gap-8 sm:gap-12 select-none relative z-10">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="flex items-center gap-2.5 sm:gap-4 shrink-0 whitespace-nowrap">
              {/* Badge Black de Lançamento com Sparkle */}
              <span className="font-extrabold uppercase tracking-wider text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)] flex items-center gap-1.5 shrink-0 text-xs sm:text-[13px] md:text-sm">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0 animate-pulse" />
                <span>BLACK DE LANÇAMENTO</span>
              </span>

              <span className="text-amber-400 text-xs select-none opacity-80 shrink-0">✳</span>

              {/* Texto 40% de Desconto */}
              <span className="font-extrabold text-white tracking-tight shrink-0 drop-shadow-xs text-xs sm:text-[13px] md:text-sm">
                40% DE DESCONTO EM TODOS OS PLANOS
              </span>

              <span className="text-amber-400 text-xs select-none opacity-80 shrink-0">✳</span>

              {/* Data limite */}
              <span className="font-bold text-amber-300 shrink-0 text-xs sm:text-[13px] md:text-sm">
                ATÉ O DIA 30/11
              </span>

              <span className="text-amber-400 text-xs select-none opacity-80 shrink-0">✳</span>

              {/* Tag 50 Primeiros */}
              <span className="bg-gradient-to-r from-amber-400/20 to-amber-500/15 text-amber-200 border border-amber-400/50 px-2.5 py-0.5 rounded-full font-black text-[10px] sm:text-[11px] uppercase tracking-wider shadow-[0_0_10px_rgba(251,191,36,0.25)] shrink-0">
                50 PRIMEIROS
              </span>

              {/* Link Ver Ofertas */}
              <span className="inline-flex items-center gap-1 font-bold text-amber-400 group-hover:text-amber-200 transition-colors ml-1 shrink-0 text-xs sm:text-[13px] md:text-sm underline decoration-amber-400/50 underline-offset-2">
                <span>VER OFERTAS</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
          ))}
        </div>
      </aside>

      {/* =========================================================================
          CABEÇALHO OFICIAL (MINIMALISTA, ELEGANTE E TOTALMENTE FUNCIONAL)
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/90 dark:bg-[var(--bg-page)]/90 border-b border-zinc-200/80 dark:border-zinc-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          
          {/* Lado Esquerdo: Logo do BancoResidência + Nome em 2 linhas (Inter, bold) */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <Logo className="w-10 h-10 shrink-0 transition-transform group-hover:scale-105 duration-200" glow />
            <div className="flex flex-col justify-center leading-none">
              <span
                className="text-[18px] sm:text-[20px] font-bold text-zinc-950 dark:text-white leading-[1.05] tracking-tight"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                Banco
              </span>
              <span
                className="text-[18px] sm:text-[20px] font-bold text-zinc-950 dark:text-white leading-[1.05] tracking-tight -mt-0.5"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                Residência
              </span>
            </div>
          </div>

          {/* Cards Centrais de Navegação: Banco de Questões; Material de Estudo; Flashcards; FAQ; Embaixadores */}
          <nav className="hidden lg:flex items-center gap-1.5 xl:gap-2">
            <button
              type="button"
              onClick={() => scrollToSection('questoes')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/90 dark:hover:bg-zinc-800/80 transition-all duration-150 cursor-pointer"
            >
              Banco de Questões
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('material-estudo')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/90 dark:hover:bg-zinc-800/80 transition-all duration-150 cursor-pointer"
            >
              Material de Estudo
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('flashcards')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/90 dark:hover:bg-zinc-800/80 transition-all duration-150 cursor-pointer"
            >
              Flashcards
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/90 dark:hover:bg-zinc-800/80 transition-all duration-150 cursor-pointer"
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('embaixadores')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/90 dark:hover:bg-zinc-800/80 transition-all duration-150 cursor-pointer"
            >
              Embaixadores
            </button>
          </nav>

          {/* Lado Direito: ThemeSelector + Criar Conta (simples, sem estrela) + Entrar (simples) + Menu Mobile */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeSelector compact={true} />

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="hidden sm:inline-flex px-3.5 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800/80 hover:bg-zinc-200/90 dark:hover:bg-zinc-700/80 transition-all cursor-pointer"
            >
              Criar Conta
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="px-4 sm:px-5 py-2 rounded-xl text-xs sm:text-sm font-bold text-white transition-all shadow-xs hover:opacity-95 hover:scale-[1.02] cursor-pointer"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              Entrar
            </button>

            {/* Botão Hambúrguer Mobile */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              aria-label="Abrir menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Menu Mobile Drawer / Dropdown */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[var(--bg-card)] px-4 py-4 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150 shadow-xl">
            <button
              type="button"
              onClick={() => {
                scrollToSection('questoes');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Banco de Questões
            </button>
            <button
              type="button"
              onClick={() => {
                scrollToSection('material-estudo');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Material de Estudo
            </button>
            <button
              type="button"
              onClick={() => {
                scrollToSection('flashcards');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Flashcards
            </button>
            <button
              type="button"
              onClick={() => {
                scrollToSection('faq');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              FAQ
            </button>
            <button
              type="button"
              onClick={() => {
                scrollToSection('embaixadores');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Embaixadores
            </button>

            <div className="pt-2 border-t border-zinc-200 dark:border-zinc-800 flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('register');
                }}
                className="w-full py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 text-center"
              >
                Criar Conta
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth('login');
                }}
                className="w-full py-2.5 rounded-xl text-sm font-bold text-white text-center shadow-xs"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                Entrar
              </button>
            </div>
          </div>
        )}
      </header>

      {/* =========================================================================
          HERO SECTION PRINCIPAL (FRASE DE IMPACTO + VISUAL DE ESTUDO)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-white via-zinc-50 to-zinc-100 dark:from-[var(--bg-input)] dark:via-[var(--bg-page)] dark:to-black">
        {/* Glow de fundo */}
        <div
          className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] sm:w-[950px] h-[350px] rounded-full blur-3xl opacity-20 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: accentConfig.primaryHex }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* =========================================================================
              HEADLINE HERO CENTRALIZADA (AMPLIADA, COM BRILHO DIFUSO NA COR DO TEMA)
              ========================================================================= */}
          <div className="relative flex justify-center items-center w-full max-w-6xl mx-auto px-2 sm:px-4 select-none py-1">
            {/* Brilho suave diretamente atrás da headline na cor do tema */}
            <div
              className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-[980px] h-[190px] sm:h-[260px] rounded-full blur-3xl pointer-events-none transition-all duration-500 opacity-20 dark:opacity-30"
              style={{
                background: `radial-gradient(ellipse at center, ${accentConfig.primaryHex} 0%, ${accentConfig.primaryHex}33 45%, transparent 75%)`
              }}
            />

            {/* Dark Mode: SVG ampliado (1110px) com brilho nativo */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Headline_130_Mil.svg"
              alt="+130 MIL QUESTÕES — Filtros detalhados, Flashcards e Materiais"
              className="relative z-10 hidden dark:block w-full max-w-[1080px] lg:max-w-[1140px] h-auto object-contain mx-auto pointer-events-none"
              loading="eager"
            />
            {/* Light Mode: SVG ampliado (1110px) */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/images/Headline_130_Mil_light.svg"
              alt="+130 MIL QUESTÕES — Filtros detalhados, Flashcards e Materiais"
              className="relative z-10 block dark:hidden w-full max-w-[1080px] lg:max-w-[1140px] h-auto object-contain mx-auto pointer-events-none"
              loading="eager"
            />
          </div>

          {/* =========================================================================
              4 BOTÕES DE NAVEGAÇÃO RÁPIDA (ADAPTADOS À TEMÁTICA, MAIÚSCULOS E SUAVES)
              ========================================================================= */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-3.5 mt-8 sm:mt-10 w-full max-w-4xl mx-auto relative z-10">
            {QUICK_NAV_BUTTONS.map((btn) => {
              const isHovered = hoveredNavBtn === btn.id;
              return (
                <button
                  key={btn.id}
                  type="button"
                  onClick={() => scrollToSection(btn.id)}
                  onMouseEnter={() => setHoveredNavBtn(btn.id)}
                  onMouseLeave={() => setHoveredNavBtn(null)}
                  className="h-11 sm:h-12 px-3 sm:px-5 rounded-full bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md text-zinc-700 dark:text-zinc-200 border transition-all duration-200 cursor-pointer flex items-center justify-center text-center font-bold text-[11px] sm:text-xs tracking-wider uppercase active:scale-[0.98]"
                  style={{
                    borderColor: isHovered ? accentConfig.primaryHex : 'rgba(160, 174, 192, 0.25)',
                    color: isHovered ? accentConfig.primaryHex : undefined,
                    backgroundColor: isHovered ? `${accentConfig.primaryHex}15` : undefined,
                    boxShadow: isHovered
                      ? `0 0 20px -2px ${accentConfig.primaryHex}45, 0 4px 12px -2px ${accentConfig.bgRgba}`
                      : '0 1px 3px rgba(0, 0, 0, 0.05)',
                  }}
                >
                  {btn.label}
                </button>
              );
            })}
          </div>

          {/* =========================================================================
              CARROSSEL INFINITO (MARQUEE) COM AS PRINCIPAIS BANCAS DO ACERVO
              ========================================================================= */}
          <div className="relative w-full overflow-hidden mt-10 sm:mt-14 py-3">
            {/* Fade lateral esquerdo para efeito de profundidade infinito */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-r from-zinc-50 via-zinc-50/80 to-transparent dark:from-[var(--bg-page)] dark:via-[var(--bg-page)]/80 to-transparent z-10" />

            {/* Fade lateral direito */}
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 sm:w-32 bg-gradient-to-l from-zinc-50 via-zinc-50/80 to-transparent dark:from-[var(--bg-page)] dark:via-[var(--bg-page)]/80 to-transparent z-10" />

            {/* Track animado contínuo (Duplicado para loop perfeito) */}
            <div className="animate-marquee flex items-center gap-3.5 select-none py-1">
              {[...TOP_FEATURED_BANCAS, ...TOP_FEATURED_BANCAS].map((banca, idx) => (
                <div
                  key={`${banca.id}-${idx}`}
                  onClick={() => onOpenAuth('register')}
                  className="h-12 sm:h-14 px-4 sm:px-6 rounded-2xl bg-white dark:bg-white text-slate-900 shadow-md shadow-slate-200/50 dark:shadow-black/60 border border-slate-200/90 dark:border-white/20 hover:border-blue-500 hover:scale-105 transition-all duration-200 cursor-pointer flex items-center justify-center shrink-0 whitespace-nowrap group"
                  title={banca.name}
                >
                  {banca.logoSlug ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`https://www.medevo.com.br/assets/pulso/institutions/${banca.logoSlug}-192.webp`}
                      alt={banca.name}
                      loading="lazy"
                      className="h-7 sm:h-8 w-auto max-w-[110px] object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'inline-block';
                      }}
                    />
                  ) : null}
                  <span
                    className={`font-heading font-black text-xs sm:text-sm tracking-wider uppercase text-slate-900 group-hover:text-blue-600 transition-colors ${
                      banca.logoSlug ? 'hidden' : 'inline-block'
                    }`}
                  >
                    {banca.logo}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Botões de Ação Imediata */}
          <div className="mt-8 sm:mt-10 flex flex-wrap items-center justify-center gap-3.5 sm:gap-4">
            <button
              type="button"
              onClick={() => scrollToSection('planos')}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-xs sm:text-sm font-extrabold text-white shadow-xl transition-all hover:scale-103 cursor-pointer flex items-center gap-2.5"
              style={{
                backgroundColor: accentConfig.primaryHex,
                boxShadow: `0 12px 30px -6px ${accentConfig.bgRgba}`
              }}
            >
              <span>Ver Planos e Assinar</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-102 cursor-pointer flex items-center gap-2.5 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Começar Gratuitamente</span>
            </button>
          </div>

          {/* Faixa de Métricas Essenciais */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[var(--bg-card)]/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-heading">
                +130.000
              </div>
              <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                Questões no Acervo
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[var(--bg-card)]/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-heading">
                100%
              </div>
              <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                Provas Oficiais na Íntegra
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[var(--bg-card)]/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white font-heading">
                5 Áreas
              </div>
              <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                Especialidades & Subfocos
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[var(--bg-card)]/90 border border-zinc-200/80 dark:border-zinc-800/80 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                0% Ruído
              </div>
              <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mt-0.5">
                Sem Distrações
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO DE QUESTÕES REAIS DA PLATAFORMA (BANCO DE QUESTÕES)
          ========================================================================= */}
      <div id="questoes" className="scroll-mt-24">
        <LandingDemoQuestionsSection
          onLoginDemo={onLoginDemo}
          onOpenAuth={onOpenAuth}
        />
      </div>

      {/* =========================================================================
          SEÇÃO: MATERIAL DE ESTUDO (341 LIVROS, CONDUTAS & ALGORITMOS)
          ========================================================================= */}
      <section id="material-estudo" className="scroll-mt-24 py-16 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-extrabold mb-3">
              <BookOpen className="w-3.5 h-3.5" />
              <span>Conhecimento Clínico Estruturado</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Material de Estudo Focado e Direto ao Ponto
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Mais de 341 livros médicos de referência catalogados por especialidade, algoritmos de tratamento e sínteses para fixação rápida dos temas mais cobrados nas provas.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Card 1 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white mb-5 transition-transform group-hover:scale-105 duration-200"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-base font-extrabold text-slate-900 dark:text-white mb-2">
                341 Livros Médicos
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Base indexada com os clássicos da medicina: Harrison, Sabiston, Nelson, Zugaib e Rouquayrol com busca inteligente por tema clínico.
              </p>
            </div>

            {/* Card 2 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-indigo-600 mb-5 transition-transform group-hover:scale-105 duration-200">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-base font-extrabold text-slate-900 dark:text-white mb-2">
                Algoritmos de Conduta
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Fluxogramas passo a passo de urgências, emergências e condutas ambulatoriais para acertar questões de conduta imediata.
              </p>
            </div>

            {/* Card 3 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-emerald-600 mb-5 transition-transform group-hover:scale-105 duration-200">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-base font-extrabold text-slate-900 dark:text-white mb-2">
                Fatores de Risco & Ddx
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Tabelas comparativas de diagnósticos diferenciais para eliminar as pegadinhas mais capciosas da USP, ENARE e Revalida.
              </p>
            </div>

            {/* Card 4 */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 group">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-amber-500 mb-5 transition-transform group-hover:scale-105 duration-200">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="font-heading text-base font-extrabold text-slate-900 dark:text-white mb-2">
                Take-Home Pearls
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Pontos de virada e mensagens finais de cada tema que resumem o que a banca realmente quer de você na hora da prova.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO: FLASHCARDS COM REPETIÇÃO ESPAÇADA (FSRS)
          ========================================================================= */}
      <section id="flashcards" className="scroll-mt-24 py-16 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 sm:gap-12 items-center">
            {/* Texto Explicativo */}
            <div className="lg:col-span-6 space-y-5 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800/80 text-purple-700 dark:text-purple-300 text-xs font-extrabold">
                <Brain className="w-3.5 h-3.5" />
                <span>Repetição Espaçada de Alta Retenção</span>
              </div>
              <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">
                Flashcards Inteligentes: memorização ativa sem esforço
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Baseados no modelo psicométrico FSRS, os flashcards do Banco Residência se adaptam à sua curva de esquecimento. O que você erra nas questões vira card de revisão imediata no seu caderno.
              </p>

              <div className="space-y-3 pt-2 text-xs font-semibold text-slate-700 dark:text-slate-200 text-left">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Algoritmo de intervalos calibrado para o dia da sua prova</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Modo Cloze (omissão de conceitos e drogas de escolha)</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sincronização automática com seu Caderno de Erros</span>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-3 rounded-xl text-xs font-extrabold text-white shadow-md transition-all hover:scale-102 cursor-pointer inline-flex items-center gap-2"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  <span>Experimentar Flashcards</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Demonstração Interativa do Flashcard */}
            <div className="lg:col-span-6 flex justify-center">
              <div className="w-full max-w-md">
                <div
                  onClick={() => setDemoFlashcardFlipped(!demoFlashcardFlipped)}
                  className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[var(--bg-card)] border-2 border-dashed border-zinc-300 dark:border-zinc-700 hover:border-purple-500 dark:hover:border-purple-400 shadow-xl transition-all duration-300 cursor-pointer min-h-[260px] flex flex-col justify-between group"
                >
                  <div>
                    <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider text-purple-600 dark:text-purple-400 mb-4">
                      <span>Cirurgia Vascular • ENARE / USP</span>
                      <span className="flex items-center gap-1 text-slate-400 font-semibold text-[10px]">
                        <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                        Clique para virar
                      </span>
                    </div>

                    {!demoFlashcardFlipped ? (
                      <div className="space-y-3">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                          Pergunta do Card:
                        </span>
                        <p className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                          Qual é a tríade clínica clássica da Síndrome de Leriche e qual é o nível anatômico da obstrução arterial?
                        </p>
                      </div>
                    ) : (
                      <div className="space-y-3 animate-in fade-in zoom-in-95 duration-150">
                        <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                          Resposta Padrão-Ouro:
                        </span>
                        <div className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-100 leading-relaxed">
                          <strong>Tríade de Leriche:</strong><br />
                          1. Claudicação de nádegas e coxas;<br />
                          2. Diminuição ou ausência de pulsos femorais;<br />
                          3. Disfunção erétil no homem.<br />
                          <strong>Nível anatômico:</strong> Oclusão da bifurcação aortoilíaca (aorta distal e artérias ilíacas).
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-slate-500">
                    <span className="font-semibold">
                      {demoFlashcardFlipped ? 'Verso do card (Resposta)' : 'Frente do card (Pergunta)'}
                    </span>
                    <span className="text-purple-600 dark:text-purple-400 font-bold group-hover:underline">
                      {demoFlashcardFlipped ? 'Ver Pergunta' : 'Ver Resposta →'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO DOS 3 PILARES ESSENCIAIS (RECURSOS DA PLATAFORMA)
          ========================================================================= */}
      <section id="recursos" className="py-16 sm:py-24 max-w-6xl mx-auto px-4 sm:px-6 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="text-xs font-extrabold uppercase tracking-wider text-blue-600 dark:text-blue-400 mb-2">
            Simplicidade & Poder
          </div>
          <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Tudo o que você precisa. Nada a mais.
          </h2>
          <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Três pilares projetados para elevar sua nota na residência sem perda de tempo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
          {/* PILAR 1: FUNÇÃO DAS QUESTÕES */}
          <div id="recurso-questoes" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div
                className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105 duration-200"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <HelpCircle className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400">
                  +130.000 Questões
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Banco de Questões Completo
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Filtros inteligentes por especialidade, tema, subfoco, banca e ano. Resoluções comentadas alternativa por alternativa por médicos especialistas para fixação definitiva.
              </p>
            </div>

            <ul className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Filtros cirúrgicos por tema e subfoco</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Explicações completas em cada alternativa</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Modo estudo ou modo prova sem distrações</span>
              </li>
            </ul>
          </div>

          {/* PILAR 2: CADERNO DE TODAS AS PROVAS */}
          <div id="provas" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-indigo-600 shadow-md transition-transform group-hover:scale-105 duration-200">
                <BookOpenCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-950/70 text-indigo-700 dark:text-indigo-400">
                  Provas na Íntegra
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Caderno de Todas as Provas
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Resolva os exames na íntegra das principais bancas do Brasil: ENARE, USP, UNIFESP, SUS-SP, AMP, AMRIGS, SURCE, UERJ e dezenas de outras com contagem regressiva oficial.
              </p>
            </div>

            <ul className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Exames oficiais na íntegra de 2018 a 2026</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Simulação idêntica ao dia da prova</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Crie cadernos personalizados por instituição</span>
              </li>
            </ul>
          </div>

          {/* PILAR 3: ACOMPANHAMENTO DETALHADO */}
          <div id="estatisticas" className="scroll-mt-24 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white bg-emerald-600 shadow-md transition-transform group-hover:scale-105 duration-200">
                <BarChart3 className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                  Métricas Precisas
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  Acompanhamento Detalhado
                </h3>
              </div>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                Diagnóstico inteligente dos seus pontos fracos por tema, taxa de acerto por especialidade, tempo médio por questão e ranking oficial comparativo para guiar seus estudos.
              </p>
            </div>

            <ul className="mt-6 pt-5 border-t border-slate-100 dark:border-slate-800/80 space-y-2 text-xs font-semibold text-slate-600 dark:text-slate-300">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Mapeamento exato de temas que você mais erra</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Percentil e Ranking Oficial comparativo</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Metas diárias de questões com streak de constância</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO DE PLANOS DE PAGAMENTO (MENSAL, SEMESTRAL, ANUAL, BIENAL)
          ========================================================================= */}
      <section id="planos" className="scroll-mt-24 py-16 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-[var(--bg-page)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-black mb-3 shadow-xs">
              <span className="text-amber-500">⚡</span>
              <span>BLACK DE LANÇAMENTO — 40% OFF APLICADO EM TODOS OS PLANOS (50 PRIMEIROS)</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-zinc-900 dark:text-white">
              Escolha o plano ideal para a sua jornada
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
              Sem pegadinhas ou recursos bloqueados: todos os planos incluem 100% das funções da plataforma.
            </p>
          </div>

          {/* Grid com os 4 Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {PRICING_PLANS.map((plan) => {
              const isAnual = plan.id === 'annual' || plan.id === 'anual';
              const isBienal = plan.id === 'biennial' || plan.id === 'bienal';

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                    isAnual
                      ? 'bg-white dark:bg-[var(--bg-card)] border-2 border-blue-500 shadow-xl shadow-blue-500/10 lg:-translate-y-2'
                      : isBienal
                      ? 'bg-white dark:bg-[var(--bg-card)] border-2 border-emerald-500/80 shadow-lg shadow-emerald-500/5'
                      : 'bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-lg'
                  }`}
                >
                  {/* Selo de Destaque Superior */}
                  {plan.badge && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                      <span
                        className={`text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full text-white shadow-sm ${
                          isAnual
                            ? 'bg-blue-600'
                            : isBienal
                            ? 'bg-emerald-600'
                            : 'bg-indigo-600'
                        }`}
                      >
                        {plan.badge}
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Cabeçalho do Card */}
                    <div className="pt-1">
                      <h3 className="font-heading text-lg font-extrabold text-slate-900 dark:text-white">
                        {plan.name}
                      </h3>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 min-h-[36px]">
                        {plan.description}
                      </p>
                    </div>

                    {/* Preço de Destaque */}
                    <div className="mt-5 pb-5 border-b border-slate-100 dark:border-slate-800/80">
                      <div className="flex items-baseline gap-1">
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">R$</span>
                        <span className="font-heading text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
                          {plan.pricePerMonth}
                        </span>
                        <span className="text-xs font-bold text-slate-500 dark:text-slate-400">
                          {plan.periodLabel}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 flex items-center justify-between">
                        <span>{plan.billingText}</span>
                        {plan.savings && (
                          <span className="font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-1.5 py-0.5 rounded-md">
                            {plan.savings}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Lista de Recursos Inclusos (Todas as Funções) */}
                    <div className="mt-5 space-y-2.5">
                      <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block">
                        Tudo incluso no plano:
                      </span>
                      {plan.features.map((feature, idx) => (
                        <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                          <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                          <span className="leading-tight">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Botão de Ação do Plano */}
                  <div className="mt-8 pt-4">
                    <button
                      type="button"
                      onClick={() => handleStartPlanCheckout(plan.id, 'register')}
                      className={`w-full py-3 px-4 rounded-xl text-xs font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                        isAnual
                          ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-500/25'
                          : isBienal
                          ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                          : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 text-white'
                      }`}
                    >
                      <span>Assinar {plan.name}</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Garantia e Informações de Segurança */}
          <div className="mt-12 p-6 rounded-3xl bg-slate-100/80 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800/80 max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white">
                  Garantia Incondicional de 7 Dias
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Experimente todas as funções. Se não for o melhor banco para sua preparação, devolvemos 100% do seu dinheiro.
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Cadastre-se Grátis</span>
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO: PERGUNTAS FREQUENTES (FAQ)
          ========================================================================= */}
      <section id="faq" className="scroll-mt-24 py-16 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-extrabold mb-3">
              <HelpCircle className="w-3.5 h-3.5" />
              <span>Tire Suas Dúvidas</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Tudo o que você precisa saber sobre a Black de Lançamento, recursos e funcionamento do Banco Residência.
            </p>
          </div>

          <div className="space-y-3.5">
            {[
              {
                id: 'faq-1',
                q: 'Como funciona o desconto de 40% da Black de Lançamento?',
                a: 'A promoção de lançamento garante 40% de desconto imediato em qualquer plano contratado para os 50 primeiros estudantes até 30/11. O valor com desconto é fixado na contratação e você aproveita acesso irrestrito a todas as mais de 130 mil questões, provas na íntegra, flashcards e materiais.'
              },
              {
                id: 'faq-2',
                q: 'O Banco de Questões tem resoluções comentadas para todas as alternativas?',
                a: 'Sim, 100% das resoluções são detalhadas alternativa por alternativa (A, B, C, D e E). Não entregamos apenas qual é a certa: explicamos o erro de cada distrator, a fisiopatologia clínica, condutas atualizadas e as referências oficiais exigidas pelas bancas.'
              },
              {
                id: 'faq-3',
                q: 'Quais bancas e provas oficiais estão disponíveis na íntegra?',
                a: 'Disponibilizamos todos os cadernos oficiais das maiores bancas do Brasil: ENARE, USP-SP, UNIFESP, SUS-SP, AMP, AMRIGS, SURCE, UERJ, SES-PE, PSU-MG, IAMSPE, Revalida INEP e muitas outras, com cronômetro real de prova e gabaritos auditados.'
              },
              {
                id: 'faq-4',
                q: 'Como funcionam os Flashcards e o Material de Estudo?',
                a: 'O sistema de flashcards utiliza o algoritmo moderno FSRS (Repetição Espaçada Otimizada) com cards atômicos e método Cloze. Além disso, as questões que você erra nas provas são sincronizadas automaticamente no seu caderno de revisão. Na aba de Material de Estudo, você tem acesso a 341 livros médicos indexados, algoritmos de conduta e tabelas de diagnósticos diferenciais.'
              },
              {
                id: 'faq-5',
                q: 'Posso acessar a plataforma no celular, tablet e computador?',
                a: 'Sim! O Banco Residência é totalmente responsivo e otimizado para navegadores mobile e desktop. Seu histórico de resoluções, cadernos e streak de estudo são sincronizados em tempo real na nuvem.'
              },
              {
                id: 'faq-6',
                q: 'Como funciona a garantia incondicional de 7 dias?',
                a: 'Se dentro de 7 dias corridos após a contratação você achar que a plataforma não atende às suas expectativas, basta solicitar o reembolso que devolvemos 100% do seu dinheiro, sem complicações.'
              },
              {
                id: 'faq-7',
                q: 'Como funciona o Programa de Embaixadores?',
                a: 'Qualquer estudante cadastrado pode participar. Você recebe um link exclusivo que concede 10% de desconto para seus colegas de faculdade e ganha 15% de comissão direta via PIX por cada matrícula. Ao atingir 10 indicações, sua própria anuidade é 100% reembolsada.'
              }
            ].map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-2xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 overflow-hidden transition-all duration-200"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="w-full p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="font-heading text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                      {item.q}
                    </span>
                    <span className="p-1 rounded-lg text-slate-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-5 h-5 text-blue-600 dark:text-blue-400" /> : <ChevronDown className="w-5 h-5" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 animate-in fade-in duration-150">
                      {item.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO: PROGRAMA DE EMBAIXADORES (15% PIX + 10% CUPOM + 100% REEMBOLSO)
          ========================================================================= */}
      <section id="embaixadores" className="scroll-mt-24 py-16 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-700 dark:text-emerald-300 text-xs font-extrabold mb-3">
              <Gift className="w-3.5 h-3.5" />
              <span>Ganhe Comissões & Estude Grátis</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Programa de Embaixadores Banco Residência
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-600 dark:text-slate-400">
              Compartilhe a melhor plataforma de questões com seus amigos de turma e internato. Ganhe comissões em dinheiro via PIX e libere seu plano gratuitamente.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {/* Card 1: 15% Comissão */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-5">
                  <Wallet className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/70 text-emerald-700 dark:text-emerald-400">
                  Dinheiro na Conta
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  15% de Comissão via PIX
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  A cada indicação confirmada com seu link, você recebe 15% de comissão em dinheiro depositada diretamente na sua chave PIX.
                </p>
              </div>
            </div>

            {/* Card 2: 10% Desconto */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-5">
                  <Gift className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400">
                  Vantagem Real
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  10% OFF para Colegas
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Seus amigos de internato ou faculdade ganham 10% de desconto imediato em qualquer plano ao assinar usando seu cupom.
                </p>
              </div>
            </div>

            {/* Card 3: 100% Reembolso */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200/90 dark:border-zinc-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-5">
                  <Award className="w-6 h-6" />
                </div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/70 text-amber-700 dark:text-amber-400">
                  Plano Gratuito
                </span>
                <h3 className="font-heading text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white mt-2">
                  100% de Reembolso do Plano
                </h3>
                <p className="mt-2 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Ao bater a meta de 10 vendas indicadas, você recebe o Selo de Embaixador Oficial e o reembolso de 100% do valor do seu plano.
                </p>
              </div>
            </div>
          </div>

          {/* CTA Embaixador */}
          <div className="mt-12 text-center">
            <button
              type="button"
              onClick={() => onOpenAuth('register')}
              className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold text-white shadow-lg transition-all hover:scale-102 cursor-pointer inline-flex items-center gap-2"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <span>Quero ser um Embaixador</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* =========================================================================
          BANNER INFERIOR: SEM DISTRAÇÕES, APENAS ESTUDO
          ========================================================================= */}
      <section className="py-16 sm:py-20 max-w-6xl mx-auto px-4 sm:px-6 w-full text-center">
        <div className="rounded-3xl p-8 sm:p-12 bg-gradient-to-r from-blue-600 to-indigo-700 text-white shadow-2xl relative overflow-hidden">
          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span className="text-[11px] font-extrabold uppercase tracking-widest bg-white/20 px-3 py-1 rounded-full">
              Preparação de Alta Eficiência
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-black">
              Sua aprovação na residência médica começa aqui.
            </h2>
            <p className="text-xs sm:text-sm text-blue-100 font-medium">
              Pare de perder tempo com plataformas confusas e cheias de ruído. Tenha acesso a mais de 130 mil questões com as melhores resoluções do mercado.
            </p>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => scrollToSection('planos')}
                className="px-6 py-3.5 rounded-xl text-xs font-extrabold text-blue-700 bg-white hover:bg-blue-50 transition-all hover:scale-103 cursor-pointer shadow-lg"
              >
                Garantir Meu Acesso
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-6 py-3.5 rounded-xl text-xs font-extrabold text-white bg-white/15 hover:bg-white/25 border border-white/20 transition-all cursor-pointer"
              >
                Testar sem compromisso
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RODAPÉ DA PÁGINA INICIAL
          ========================================================================= */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[var(--bg-card)] py-8 text-xs text-zinc-500 dark:text-zinc-400 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 shrink-0" />
            <div className="flex flex-col justify-center leading-none">
              <span className="font-bold text-sm text-slate-800 dark:text-slate-200" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                Banco Residência
              </span>
              <span className="block text-[11px] text-slate-400 mt-0.5">
                +130.000 Questões • Provas Oficiais • Sem Distrações
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => scrollToSection('questoes')}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Banco de Questões
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('material-estudo')}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Material de Estudo
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('flashcards')}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Flashcards
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              FAQ
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('embaixadores')}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Embaixadores
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('planos')}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Planos & Preços
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL DE ASSINATURA / INTENÇÃO DE PLANO (ESTRUTURA PARA MERCADO PAGO)
          ========================================================================= */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
            {/* Botão Fechar */}
            <button
              type="button"
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-5 right-5 p-1.5 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-400 text-[11px] font-extrabold">
                <CreditCard className="w-3.5 h-3.5" />
                <span>Assinatura Selecionada</span>
              </div>
              <h3 className="font-heading text-xl font-black text-slate-900 dark:text-white">
                {selectedPlanModal.name}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {selectedPlanModal.description}
              </p>
            </div>

            {/* Resumo do Valor */}
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-200/80 dark:border-slate-800/80">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Valor do Plano:</span>
                <div className="text-right">
                  <span className="text-xs font-bold text-slate-400">R$ </span>
                  <span className="font-heading text-2xl font-black text-slate-900 dark:text-white">
                    {selectedPlanModal.pricePerMonth}
                  </span>
                  <span className="text-xs font-bold text-slate-400"> /mês</span>
                </div>
              </div>
              <div className="text-[11px] font-semibold text-slate-500 mt-1 text-right">
                {selectedPlanModal.billingText}
              </div>
              {selectedPlanModal.savings && (
                <div className="mt-2 pt-2 border-t border-slate-200/60 dark:border-slate-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span>Desconto aplicado:</span>
                  <span>{selectedPlanModal.savings}</span>
                </div>
              )}
            </div>

            {/* Benefícios inclusos */}
            <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-1">
                Todas as funções liberadas:
              </span>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>+130.000 questões com resoluções comentadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Caderno de todas as provas oficiais na íntegra</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Acompanhamento detalhado e diagnóstico de erros</span>
              </div>
            </div>

            {/* Ações para Prosseguir */}
            <div className="pt-2 space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanModal(null);
                  handleStartPlanCheckout(selectedPlanModal.id, 'register');
                }}
                className="w-full py-3 px-4 rounded-xl text-xs font-extrabold text-white shadow-lg transition-all hover:scale-102 cursor-pointer flex items-center justify-center gap-2"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                <UserCheck className="w-4 h-4" />
                <span>Criar Conta para Assinar</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setSelectedPlanModal(null);
                  handleStartPlanCheckout(selectedPlanModal.id, 'login');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer text-center"
              >
                Já tenho conta (Fazer Login)
              </button>

              <div className="pt-1 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedPlanModal(null);
                    onOpenAuth('register');
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Ou criar uma conta gratuita agora
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
