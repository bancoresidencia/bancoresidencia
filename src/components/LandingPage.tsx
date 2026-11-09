'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeSelector } from '@/components/ThemeSelector';
import { Logo } from '@/components/Logo';
import {
  Sparkles,
  ArrowRight,
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
  BarChart3,
  CheckCircle2,
  FileCheck2,
  Target,
  FolderKanban
} from 'lucide-react';
import { LandingDemoQuestionsSection } from '@/components/LandingDemoQuestionsSection';

const WhatsAppIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.652-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.888 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
  </svg>
);


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
    billingText: 'R$ 179,40 em pagamento único ou até 6x de R$ 29,90 (sujeito à taxas)',
    periodLabel: 'por mês',
    savings: 'ECONOMIZE R$ 120,00',
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
    badge: 'MAIS ESCOLHIDO • 1 ANO',
    pricePerMonth: '25,90',
    billingText: 'R$ 310,80 em pagamento único ou até 12x de R$ 25,90 (sujeito à taxas)',
    periodLabel: 'por mês',
    savings: 'ECONOMIZE R$ 288,00',
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
    badge: 'MAIS RECOMENDADO • MAIOR ECONOMIA',
    isPopular: true,
    pricePerMonth: '19,90',
    billingText: 'R$ 477,60 em pagamento único ou até 12x de R$ 39,80 (sujeito à taxas)',
    periodLabel: 'por mês',
    savings: 'ECONOMIZE R$ 720,00',
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
  const [fsrsFeedback, setFsrsFeedback] = useState<string | null>(null);

  const handleFsrsRate = (e: React.MouseEvent, interval: string) => {
    e.stopPropagation();
    setFsrsFeedback(`Revisão agendada para ${interval} • Intervalo calibrado pelo FSRS`);
    setTimeout(() => {
      setFsrsFeedback(null);
    }, 3500);
  };

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
    <div className="min-h-screen bg-zinc-50 dark:bg-[var(--bg-page)] text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-[var(--primary-color)] selection:text-white transition-colors duration-200 overflow-x-clip">
      {/* =========================================================================
          BANNER PROMOCIONAL SUPERIOR (ACESSO ANTECIPADO - CONDIÇÕES ESPECIAIS)
          ========================================================================= */}
      <aside
        aria-label="Acesso Antecipado"
        onClick={() => scrollToSection('planos')}
        className="w-full bg-[#08080a] text-white border-b border-zinc-800 py-2 sm:py-2.5 cursor-pointer relative overflow-hidden group select-none transition-all duration-200 hover:bg-black"
        style={{
          boxShadow: `0 2px 15px ${accentConfig.bgRgba || 'rgba(0,0,0,0.3)'}`
        }}
      >
        {/* Glow sutil de fundo adaptado ao tema */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 transition-colors"
          style={{
            background: `linear-gradient(90deg, ${accentConfig.primaryHex}20, transparent, ${accentConfig.primaryHex}20)`
          }}
        />

        {/* Fades laterais para efeito infinito nas bordas */}
        <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-r from-[#08080a] via-[#08080a]/80 to-transparent z-10" />
        <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-12 sm:w-24 bg-gradient-to-l from-[#08080a] via-[#08080a]/80 to-transparent z-10" />

        {/* Track Animado Ticker (Andando suavemente, pausa no hover) */}
        <div className="animate-marquee-banner flex items-center gap-8 sm:gap-12 select-none relative z-10">
          {[0, 1, 2, 3].map((idx) => (
            <div key={idx} className="flex items-center gap-2.5 sm:gap-4 shrink-0 whitespace-nowrap">
              {/* Badge Acesso Antecipado */}
              <span
                className="font-extrabold uppercase tracking-wider flex items-center gap-1.5 shrink-0 text-xs sm:text-[13px]"
                style={{ color: accentConfig.primaryHex }}
              >
                <Sparkles className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                <span>ACESSO ANTECIPADO</span>
              </span>

              <span className="text-zinc-600 text-xs select-none opacity-80 shrink-0">•</span>

              {/* Mensagem de Lançamento */}
              <span className="font-bold text-white tracking-tight shrink-0 text-xs sm:text-[13px]">
                CONDIÇÕES EXCLUSIVAS DE LANÇAMENTO LIBERADAS
              </span>

              <span className="text-zinc-600 text-xs select-none opacity-80 shrink-0">•</span>

              {/* Tag Destaque */}
              <span className="bg-white/10 text-zinc-200 border border-white/20 px-2.5 py-0.5 rounded-full font-bold text-[10px] sm:text-[11px] uppercase tracking-wider shrink-0">
                LOTE PROMOCIONAL
              </span>

              {/* Link Ver Planos */}
              <span
                className="inline-flex items-center gap-1 font-bold group-hover:underline transition-colors ml-1 shrink-0 text-xs sm:text-[13px]"
                style={{ color: accentConfig.primaryHex }}
              >
                <span>VER PLANOS</span>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
          
          {/* Lado Esquerdo: Logo do BancoResidência + Nome em 2 linhas (Inter, bold) */}
          <div
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="flex items-center gap-3.5 cursor-pointer group select-none"
          >
            <Logo size={46} className="w-11.5 h-11.5 sm:w-12 sm:h-12 shrink-0 transition-transform group-hover:scale-105 duration-200" glow />
            <div className="flex flex-col justify-center leading-none">
              <span
                className="text-[20px] sm:text-[22px] font-bold text-zinc-950 dark:text-white leading-[1.05] tracking-tight"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                Banco
              </span>
              <span
                className="text-[20px] sm:text-[22px] font-bold text-zinc-950 dark:text-white leading-[1.05] tracking-tight -mt-0.5"
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
              onClick={() => scrollToSection('planos')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/90 dark:hover:bg-zinc-800/80 transition-all duration-150 cursor-pointer"
            >
              Planos & Preços
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
              onClick={() => scrollToSection('suporte')}
              className="px-3.5 py-2 rounded-xl text-xs sm:text-[13px] font-semibold text-zinc-600 dark:text-zinc-300 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100/90 dark:hover:bg-zinc-800/80 transition-all duration-150 cursor-pointer"
            >
              Suporte
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
                scrollToSection('planos');
                setMobileMenuOpen(false);
              }}
              className="w-full text-left px-3.5 py-2.5 rounded-xl text-sm font-semibold text-zinc-700 dark:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
            >
              Planos & Preços
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
          HERO SECTION PRINCIPAL (ASSIMÉTRICO: +130 MIL QUESTÕES + 3 PILARES INTERATIVOS)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-16 sm:pb-20 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-gradient-to-b from-white via-zinc-50 to-zinc-100 dark:from-[var(--bg-input)] dark:via-[var(--bg-page)] dark:to-black">
        {/* Glow de fundo na cor do tema */}
        <div
          className="absolute top-1/4 left-1/3 -translate-x-1/2 -translate-y-1/2 w-[650px] sm:w-[900px] h-[320px] rounded-full blur-3xl opacity-15 dark:opacity-25 pointer-events-none transition-colors duration-500"
          style={{ backgroundColor: accentConfig.primaryHex }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          
          {/* Grid Assimétrico: 2 Colunas */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
            
            {/* Coluna Esquerda: +130 MIL QUESTÕES (Tipografia Bebas Neue Ampliada + Flash Beam) + Botão VER PLANOS */}
            <div className="lg:col-span-7 flex flex-col justify-center text-left">
              <div className="group/title relative cursor-default select-none overflow-hidden inline-block py-1 pr-4">
                {/* Feixe de Flash de Luz no hover passando de um lado para o outro */}
                <div
                  aria-hidden="true"
                  className="hover-flash-beam z-20 pointer-events-none"
                />

                <h1
                  className="font-bebas text-7xl sm:text-8xl md:text-9xl lg:text-[112px] xl:text-[124px] tracking-wide text-zinc-950 dark:text-white leading-[0.92] text-left transition-all duration-300 relative z-10"
                  style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                >
                  <span
                    className="inline-block transition-transform duration-300 group-hover/title:scale-[1.01] origin-left bg-clip-text text-transparent bg-gradient-to-r"
                    style={{
                      backgroundImage: `linear-gradient(135deg, ${accentConfig.primaryHex} 0%, ${accentConfig.hoverHex || accentConfig.primaryHex} 100%)`
                    }}
                  >
                    +130 MIL
                  </span>
                  <br />
                  <span className="text-zinc-950 dark:text-white group-hover/title:text-zinc-700 dark:group-hover/title:text-zinc-300 transition-colors duration-300">
                    QUESTÕES
                  </span>
                </h1>

                {/* Subtítulo posicionado logo abaixo e bem próximo ao título */}
                <p className="mt-1 sm:mt-1.5 text-xs sm:text-sm md:text-base font-semibold text-zinc-600 dark:text-zinc-400 max-w-lg leading-snug">
                  Resoluções comentadas com base em diretrizes
                </p>
              </div>

              {/* Botão de Ação Único: VER PLANOS (Maior, Rounded-full, Sombra Projetada Intensa e Animação de Luz) */}
              <div className="mt-7 sm:mt-8 flex items-center">
                <div className="relative group">
                  {/* Halo de luz difusa e sombra projetada intensa com a cor do tema */}
                  <div
                    className="absolute -inset-1 rounded-full blur-xl opacity-50 group-hover:opacity-85 transition-opacity duration-300 pointer-events-none -z-10"
                    style={{
                      background: `radial-gradient(ellipse at center, ${accentConfig.primaryHex} 0%, transparent 75%)`
                    }}
                  />

                  <button
                    type="button"
                    onClick={() => scrollToSection('planos')}
                    className="relative px-9 sm:px-11 py-4 sm:py-4.5 rounded-full text-sm sm:text-base font-black text-white transition-all duration-300 hover:scale-[1.03] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center gap-3 tracking-wider uppercase overflow-hidden"
                    style={{
                      backgroundColor: accentConfig.primaryHex,
                      boxShadow: `0 18px 40px -8px ${accentConfig.bgRgba || 'rgba(0,0,0,0.45)'}, 0 8px 16px -4px rgba(0,0,0,0.3)`
                    }}
                  >
                    {/* Feixe de reflexo brilhante passando pelo botão no hover */}
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] pointer-events-none"
                    />

                    <span className="relative z-10">VER PLANOS</span>
                    <ArrowRight className="w-4.5 h-4.5 sm:w-5 sm:h-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1.5" />
                  </button>
                </div>
              </div>
            </div>

            {/* Coluna Direita: O Trio de Destaque Interativo (Cor do Tema, Animação de Luz de Ver Planos e 100% Funcional) */}
            <div className="lg:col-span-5 flex flex-col justify-center gap-3.5">
              {/* Item 1: Flashcards */}
              <div
                onClick={() => scrollToSection('flashcards')}
                className="relative p-4 sm:p-4.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center gap-3.5 sm:gap-4 text-left group overflow-hidden select-none"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 14px 32px -6px ${accentConfig.bgRgba || 'rgba(0,0,0,0.4)'}, 0 6px 14px -3px rgba(0,0,0,0.25)`
                }}
              >
                {/* Feixe de reflexo brilhante passando pelo card no hover */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] pointer-events-none"
                />

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white relative z-10 transition-transform duration-200 group-hover:scale-105">
                  <Brain className="w-5 h-5 shrink-0" />
                </div>
                <p
                  className="text-xs sm:text-[13px] md:text-sm font-extrabold uppercase tracking-wider text-white leading-snug relative z-10"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    color: accentConfig.primaryContrastHex || '#ffffff'
                  }}
                >
                  FLASHCARDS QUE ESTARÃO COM CERTEZA NA SUA PROVA.
                </p>
              </div>

              {/* Item 2: Materiais */}
              <div
                onClick={() => scrollToSection('material-estudo')}
                className="relative p-4 sm:p-4.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center gap-3.5 sm:gap-4 text-left group overflow-hidden select-none"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 14px 32px -6px ${accentConfig.bgRgba || 'rgba(0,0,0,0.4)'}, 0 6px 14px -3px rgba(0,0,0,0.25)`
                }}
              >
                {/* Feixe de reflexo brilhante passando pelo card no hover */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] pointer-events-none"
                />

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white relative z-10 transition-transform duration-200 group-hover:scale-105">
                  <BookOpen className="w-5 h-5 shrink-0" />
                </div>
                <p
                  className="text-xs sm:text-[13px] md:text-sm font-extrabold uppercase tracking-wider text-white leading-snug relative z-10"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    color: accentConfig.primaryContrastHex || '#ffffff'
                  }}
                >
                  MATERIAIS COM BASE EM DIRETRIZES E EM QUESTÕES DAS PROVAS DE RESIDÊNCIA.
                </p>
              </div>

              {/* Item 3: Desempenho */}
              <div
                onClick={() => scrollToSection('questoes')}
                className="relative p-4 sm:p-4.5 rounded-2xl transition-all duration-300 hover:scale-[1.02] hover:-translate-y-0.5 active:scale-[0.98] cursor-pointer flex items-center gap-3.5 sm:gap-4 text-left group overflow-hidden select-none"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  boxShadow: `0 14px 32px -6px ${accentConfig.bgRgba || 'rgba(0,0,0,0.4)'}, 0 6px 14px -3px rgba(0,0,0,0.25)`
                }}
              >
                {/* Feixe de reflexo brilhante passando pelo card no hover */}
                <div
                  aria-hidden="true"
                  className="absolute inset-0 -translate-x-full group-hover:translate-x-[250%] transition-transform duration-700 ease-out bg-gradient-to-r from-transparent via-white/35 to-transparent skew-x-[-20deg] pointer-events-none"
                />

                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 bg-white/20 text-white relative z-10 transition-transform duration-200 group-hover:scale-105">
                  <BarChart3 className="w-5 h-5 shrink-0" />
                </div>
                <p
                  className="text-xs sm:text-[13px] md:text-sm font-extrabold uppercase tracking-wider text-white leading-snug relative z-10"
                  style={{
                    fontFamily: 'var(--font-inter), sans-serif',
                    color: accentConfig.primaryContrastHex || '#ffffff'
                  }}
                >
                  DESEMPENHO PERSONALIZADO PARA ACOMPANHAR A EVOLUÇÃO.
                </p>
              </div>
            </div>

          </div>

          {/* =========================================================================
              CARROSSEL INFINITO (MARQUEE) COM AS PRINCIPAIS BANCAS DO ACERVO
              ========================================================================= */}
          <div className="relative w-full overflow-hidden mt-12 sm:mt-16 pt-5 border-t border-zinc-200/60 dark:border-zinc-800/60">
            <div className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-3 text-center sm:text-left">
              Provas Oficiais & Bancas Examinadoras no Acervo:
            </div>

            {/* Fades laterais para profundidade */}
            <div className="pointer-events-none absolute left-0 top-8 bottom-0 w-16 sm:w-28 bg-gradient-to-r from-zinc-50 via-zinc-50/90 to-transparent dark:from-[var(--bg-page)] dark:via-[var(--bg-page)]/90 to-transparent z-10" />
            <div className="pointer-events-none absolute right-0 top-8 bottom-0 w-16 sm:w-28 bg-gradient-to-l from-zinc-50 via-zinc-50/90 to-transparent dark:from-[var(--bg-page)] dark:via-[var(--bg-page)]/90 to-transparent z-10" />

            {/* Track animado contínuo */}
            <div className="animate-marquee flex items-center gap-3 select-none py-1">
              {[...TOP_FEATURED_BANCAS, ...TOP_FEATURED_BANCAS].map((banca, idx) => (
                <div
                  key={`${banca.id}-${idx}`}
                  onClick={() => onOpenAuth('register')}
                  className="h-10 sm:h-11 px-4 rounded-xl bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs border border-zinc-200/80 dark:border-zinc-800 hover:scale-105 transition-all duration-150 cursor-pointer flex items-center justify-center shrink-0 whitespace-nowrap group"
                  title={banca.name}
                >
                  {banca.logoSlug ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={`/images/institutions/${banca.logoSlug}.webp`}
                      alt={banca.name}
                      loading="lazy"
                      className="h-6 sm:h-7 w-auto max-w-[90px] object-contain group-hover:scale-105 transition-transform"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = 'none';
                        const fallback = (e.target as HTMLElement).nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'inline-block';
                      }}
                    />
                  ) : null}
                  <span
                    className={`font-heading font-black text-xs tracking-wider uppercase text-zinc-800 dark:text-zinc-200 group-hover:text-zinc-950 dark:group-hover:text-white transition-colors ${
                      banca.logoSlug ? 'hidden' : 'inline-block'
                    }`}
                  >
                    {banca.logo}
                  </span>
                </div>
              ))}
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
          SEÇÃO: MATERIAIS BASEADOS EM DIRETRIZES (FUNDO ABSTRACT + CARDS COM COR & DETALHES)
          ========================================================================= */}
      <section id="material-estudo" className="scroll-mt-24 py-20 sm:py-28 relative overflow-hidden bg-[#08080a] text-white border-t border-zinc-800/80">
        {/* Fundo Abstract: Mesh Gradient + Glow Orbs + Geometric Grid Lines */}
        <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden select-none">
          {/* Ambient Glow Orbs com as cores do tema */}
          <div
            className="absolute -top-32 left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-[450px] rounded-full blur-[140px] opacity-25 transition-colors duration-500"
            style={{ backgroundColor: accentConfig.primaryHex }}
          />
          <div
            className="absolute -bottom-32 right-5 w-[500px] h-[400px] rounded-full blur-[130px] opacity-20 transition-colors duration-500"
            style={{ backgroundColor: accentConfig.hoverHex || accentConfig.primaryHex }}
          />

          {/* Abstract Geometric Grid Pattern */}
          <div
            className="absolute inset-0 opacity-[0.04] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_50%,#000_60%,transparent_100%)]"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
              backgroundSize: '32px 32px'
            }}
          />

          {/* Abstract Curved Wave Lines (SVG) */}
          <svg
            className="absolute inset-0 w-full h-full opacity-15"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 1440 600"
            fill="none"
            preserveAspectRatio="none"
          >
            <path
              d="M-50 220 C 350 420, 650 50, 1050 280 C 1250 400, 1400 240, 1550 320"
              stroke={accentConfig.primaryHex}
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            <path
              d="M-50 320 C 400 120, 800 480, 1150 180 C 1350 110, 1450 360, 1550 260"
              stroke={accentConfig.primaryHex}
              strokeWidth="1"
              opacity="0.6"
            />
          </svg>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10">
          <div className="text-center max-w-4xl mx-auto mb-12 sm:mb-16">
            <h2
              className="font-bebas text-4xl sm:text-6xl md:text-7xl tracking-wide text-white leading-[0.98] drop-shadow-sm"
              style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
            >
              Materiais baseados em Diretrizes que vão cair na prova
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-7 max-w-5xl mx-auto">
            {/* Card 1: Diretrizes Atualizadas */}
            <div className="relative rounded-2xl p-6 sm:p-7 bg-[#121216]/95 border border-zinc-800/90 shadow-2xl backdrop-blur-xl hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group flex flex-col justify-between overflow-hidden text-left">
              {/* Glow sutil na borda superior */}
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px] opacity-80 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`
                }}
              />

              <div>
                {/* Top Bar: Ícone Colorido + Badge com detalhes */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-300 shrink-0"
                    style={{
                      backgroundColor: accentConfig.primaryHex,
                      boxShadow: `0 8px 24px -4px ${accentConfig.bgRgba || 'rgba(0,0,0,0.5)'}`
                    }}
                  >
                    <FileCheck2 className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-zinc-700/60 bg-zinc-800/70 text-zinc-300">
                    Consensos Oficiais
                  </span>
                </div>

                <h3
                  className="font-bebas text-2xl sm:text-3xl tracking-wide text-white mb-2 leading-tight"
                  style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                >
                  Diretrizes Atualizadas
                </h3>

                <p
                  className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal mb-5"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  Materiais produzidos com base nas principais diretrizes.
                </p>
              </div>

              {/* Detalhes & Tags Clínicas na base do card */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-1.5 flex-wrap text-[11px] font-semibold text-zinc-400">
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">SBC</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">SBPT</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">FEBRASGO</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">CFM</span>
              </div>
            </div>

            {/* Card 2: Engenharia Reversa */}
            <div className="relative rounded-2xl p-6 sm:p-7 bg-[#121216]/95 border border-zinc-800/90 shadow-2xl backdrop-blur-xl hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group flex flex-col justify-between overflow-hidden text-left">
              {/* Glow sutil na borda superior */}
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px] opacity-80 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`
                }}
              />

              <div>
                {/* Top Bar: Ícone Colorido + Badge com detalhes */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-300 shrink-0"
                    style={{
                      backgroundColor: accentConfig.primaryHex,
                      boxShadow: `0 8px 24px -4px ${accentConfig.bgRgba || 'rgba(0,0,0,0.5)'}`
                    }}
                  >
                    <Target className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-zinc-700/60 bg-zinc-800/70 text-zinc-300">
                    Incidência Real
                  </span>
                </div>

                <h3
                  className="font-bebas text-2xl sm:text-3xl tracking-wide text-white mb-2 leading-tight"
                  style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                >
                  Engenharia Reversa
                </h3>

                <p
                  className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal mb-5"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  Materiais montados com base em TUDO que é cobrado nas questões.
                </p>
              </div>

              {/* Detalhes & Tags Clínicas na base do card */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-1.5 flex-wrap text-[11px] font-semibold text-zinc-400">
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">ENARE</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">USP-SP</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">SUS-SP</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">PSU-MG</span>
              </div>
            </div>

            {/* Card 3: Organização */}
            <div className="relative rounded-2xl p-6 sm:p-7 bg-[#121216]/95 border border-zinc-800/90 shadow-2xl backdrop-blur-xl hover:border-zinc-700 transition-all duration-300 hover:scale-[1.02] hover:-translate-y-1 group flex flex-col justify-between overflow-hidden text-left">
              {/* Glow sutil na borda superior */}
              <div
                className="absolute top-0 left-0 right-0 h-[2.5px] opacity-80 group-hover:opacity-100 transition-opacity"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`
                }}
              />

              <div>
                {/* Top Bar: Ícone Colorido + Badge com detalhes */}
                <div className="flex items-center justify-between gap-3 mb-5">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110 duration-300 shrink-0"
                    style={{
                      backgroundColor: accentConfig.primaryHex,
                      boxShadow: `0 8px 24px -4px ${accentConfig.bgRgba || 'rgba(0,0,0,0.5)'}`
                    }}
                  >
                    <FolderKanban className="w-6 h-6" />
                  </div>

                  <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border border-zinc-700/60 bg-zinc-800/70 text-zinc-300">
                    Estudo Integrado
                  </span>
                </div>

                <h3
                  className="font-bebas text-2xl sm:text-3xl tracking-wide text-white mb-2 leading-tight"
                  style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                >
                  Organização
                </h3>

                <p
                  className="text-xs sm:text-sm text-zinc-400 leading-relaxed font-normal mb-5"
                  style={{ fontFamily: 'var(--font-inter), sans-serif' }}
                >
                  Material organizado com base no banco de questões, para você treinar enquanto estuda.
                </p>
              </div>

              {/* Detalhes & Tags Clínicas na base do card */}
              <div className="pt-4 border-t border-zinc-800/80 flex items-center gap-1.5 flex-wrap text-[11px] font-semibold text-zinc-400">
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">Cadernos</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">Simulados</span>
                <span className="px-2 py-0.5 rounded-md bg-zinc-800/80 text-zinc-300 border border-zinc-700/50">Filtros</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO: FLASHCARDS COM REPETIÇÃO ESPAÇADA (FSRS)
          ========================================================================= */}
      <section id="flashcards" className="scroll-mt-24 py-16 sm:py-20 border-t border-zinc-200/80 dark:border-zinc-800/80">
        <div className="max-w-6xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
            {/* Texto Explicativo */}
            <div className="lg:col-span-6 space-y-4 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold">
                <Brain className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                <span>Repetição Espaçada FSRS</span>
              </div>
              <h2
                className="font-bebas text-4xl sm:text-5xl md:text-6xl tracking-wide text-zinc-950 dark:text-white leading-[1.02]"
                style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
              >
                Flashcards com TUDO que já caiu em provas.
              </h2>
              <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed font-normal">
                Os flashcards do banco residência são produzidos baseados nas questões passadas de residência e reforçadas nas principais diretrizes atualizadas.
              </p>

              <div className="space-y-2.5 pt-1 text-xs font-medium text-zinc-700 dark:text-zinc-300 text-left">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Algoritmo de intervalos calibrado para a data da sua prova</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Método Cloze com omissão de drogas de escolha e critérios diagnósticos</span>
                </div>
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>Sincronização imediata com o seu Caderno de Erros</span>
                </div>
              </div>
            </div>

            {/* Demonstração Interativa do Flashcard com Efeito 3D e FSRS */}
            <div className="lg:col-span-6 flex flex-col items-center justify-center relative">
              {/* Feedback Pill Flutuante do FSRS */}
              {fsrsFeedback && (
                <div className="mb-3 px-4 py-2 rounded-full bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 text-xs font-bold shadow-lg border border-zinc-800 dark:border-zinc-200 flex items-center gap-2 animate-in fade-in slide-in-from-top-2 duration-200 z-20">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                  <span>{fsrsFeedback}</span>
                </div>
              )}

              <div className="w-full max-w-md [perspective:1000px] min-h-[360px] sm:min-h-[380px] relative select-none">
                <div
                  className={`w-full h-full min-h-[360px] sm:min-h-[380px] relative transition-transform duration-500 [transform-style:preserve-3d] ${
                    demoFlashcardFlipped ? '[transform:rotateY(180deg)]' : ''
                  }`}
                >
                  {/* FRENTE DO CARD (Pergunta) */}
                  <div
                    onClick={() => setDemoFlashcardFlipped(true)}
                    className="absolute inset-0 w-full h-full [backface-visibility:hidden] p-6 sm:p-7 rounded-2xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800 shadow-xl hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors cursor-pointer flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider mb-4" style={{ color: accentConfig.primaryHex }}>
                        <span>Cirurgia Vascular • ENARE / USP</span>
                        <span className="flex items-center gap-1.5 text-zinc-400 font-semibold text-[10px] bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md group-hover:text-zinc-600 dark:group-hover:text-zinc-200 transition-colors">
                          <RotateCcw className="w-3 h-3 group-hover:rotate-180 transition-transform duration-300" />
                          Clique para virar
                        </span>
                      </div>

                      <div className="space-y-3 pt-2">
                        <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400">
                          Pergunta do Card:
                        </span>
                        <p className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white leading-snug">
                          Qual é a tríade clínica clássica da Síndrome de Leriche e qual é o nível anatômico da obstrução arterial?
                        </p>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-xs text-zinc-500">
                      <span className="font-medium text-[11px]">Frente do card • Simulado de Prova</span>
                      <span className="font-bold text-[11px] flex items-center gap-1 group-hover:translate-x-1 transition-transform" style={{ color: accentConfig.primaryHex }}>
                        Ver Resposta Padrão-Ouro →
                      </span>
                    </div>
                  </div>

                  {/* VERSO DO CARD (Resposta + Botões FSRS) */}
                  <div
                    onClick={() => setDemoFlashcardFlipped(false)}
                    className="absolute inset-0 w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] p-6 sm:p-7 rounded-2xl bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800 shadow-xl flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div className="flex items-center justify-between text-[11px] font-extrabold uppercase tracking-wider mb-3 text-emerald-600 dark:text-emerald-400">
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resposta Padrão-Ouro
                        </span>
                        <span
                          onClick={(e) => {
                            e.stopPropagation();
                            setDemoFlashcardFlipped(false);
                          }}
                          className="flex items-center gap-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 font-semibold text-[10px] bg-zinc-100 dark:bg-zinc-800/80 px-2 py-1 rounded-md transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          Voltar à Pergunta
                        </span>
                      </div>

                      <div className="text-xs sm:text-sm font-medium text-zinc-800 dark:text-zinc-200 leading-relaxed space-y-1.5">
                        <p>
                          <strong className="text-zinc-950 dark:text-white font-bold">Tríade de Leriche:</strong>
                        </p>
                        <ol className="list-decimal list-inside space-y-0.5 text-zinc-700 dark:text-zinc-300 text-xs">
                          <li>Claudicação de nádegas e coxas;</li>
                          <li>Diminuição ou ausência de pulsos femorais;</li>
                          <li>Disfunção erétil no homem.</li>
                        </ol>
                        <p className="text-xs pt-1">
                          <strong className="text-zinc-950 dark:text-white font-bold">Nível anatômico:</strong> Oclusão da bifurcação aortoilíaca (aorta distal e artérias ilíacas).
                        </p>
                      </div>
                    </div>

                    {/* Botões de Classificação FSRS */}
                    <div className="pt-3 border-t border-zinc-100 dark:border-zinc-800/80">
                      <div className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 mb-2 flex items-center justify-between">
                        <span>Classifique para agendar (FSRS):</span>
                        <span className="text-zinc-400 font-normal">Clique para testar</span>
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
                        <button
                          type="button"
                          onClick={(e) => handleFsrsRate(e, '1 dia')}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/50 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
                        >
                          <span className="text-[11px] font-extrabold leading-tight">Errei</span>
                          <span className="text-[10px] font-medium opacity-80">1 dia</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleFsrsRate(e, '3 dias')}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 hover:bg-amber-100 dark:hover:bg-amber-900/50 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
                        >
                          <span className="text-[11px] font-extrabold leading-tight">Difícil</span>
                          <span className="text-[10px] font-medium opacity-80">3 dias</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleFsrsRate(e, '7 dias')}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50 dark:bg-blue-950/30 text-blue-700 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
                        >
                          <span className="text-[11px] font-extrabold leading-tight">Bom</span>
                          <span className="text-[10px] font-medium opacity-80">7 dias</span>
                        </button>
                        <button
                          type="button"
                          onClick={(e) => handleFsrsRate(e, '14 dias')}
                          className="flex flex-col items-center justify-center py-2 px-1 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 hover:scale-[1.03] active:scale-[0.97] transition-all cursor-pointer"
                        >
                          <span className="text-[11px] font-extrabold leading-tight">Fácil</span>
                          <span className="text-[10px] font-medium opacity-80">14 dias</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO DE PLANOS DE PAGAMENTO (MENSAL, SEMESTRAL, ANUAL, BIENAL)
          ========================================================================= */}
      <section id="planos" className="scroll-mt-24 py-16 sm:py-20 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-white/60 dark:bg-[var(--bg-page)]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700/80 text-zinc-700 dark:text-zinc-300 text-xs font-bold mb-3 shadow-xs">
              <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: accentConfig.primaryHex }} />
              <span>BLACK DE LANÇAMENTO • CONDIÇÕES EXCLUSIVAS</span>
            </div>
            <h2
              className="font-bebas text-4xl sm:text-6xl md:text-7xl tracking-wide text-zinc-950 dark:text-white leading-none"
              style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
            >
              Planos do Banco Residência
            </h2>
            <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400">
              todos os planos incluem 100% das ferramentas da plataforma.
            </p>
          </div>

          {/* Recursos Inclusos (Inline, fora do card, elegante) */}
          <div className="mb-10 max-w-5xl mx-auto px-4">
            <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2.5 text-xs sm:text-[13px]">
              <span className="font-extrabold text-zinc-950 dark:text-white mr-1 flex items-center gap-1.5">
                Plano Completo
              </span>
              {[
                '+130 mil questões',
                'Flashcards',
                'Materiais teóricos',
                'Desempenho e Evolução',
                'TRI',
                'Caderno de Erros',
                'Suporte humano',
              ].map((item) => (
                <div key={item} className="inline-flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
                  <Check className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400 shrink-0" />
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Grid com os 4 Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 items-stretch pt-4">
            {PRICING_PLANS.map((plan) => {
              const isAnual = plan.id === 'annual' || plan.id === 'anual';
              const isBienal = plan.id === 'biennial' || plan.id === 'bienal';

              return (
                <div key={plan.id} className="relative flex flex-col group">
                  {/* Brilho no fundo para o Plano Bienal (Destaque Maior) */}
                  {isBienal && (
                    <div
                      className="absolute -inset-2 rounded-3xl opacity-40 dark:opacity-55 blur-2xl pointer-events-none transition duration-500 group-hover:opacity-70"
                      style={{ background: `radial-gradient(circle at 50% 30%, ${accentConfig.primaryHex} 0%, transparent 70%)` }}
                    />
                  )}

                  {/* Brilho no fundo para o Plano Anual (Destaque) */}
                  {isAnual && (
                    <div
                      className="absolute -inset-2 rounded-3xl opacity-30 dark:opacity-40 blur-2xl pointer-events-none transition duration-500 group-hover:opacity-60"
                      style={{ background: 'radial-gradient(circle at 50% 30%, #6366f1 0%, transparent 70%)' }}
                    />
                  )}

                  <div
                    className={`relative rounded-2xl p-6 flex flex-col justify-between flex-1 transition-all duration-300 ${
                      isBienal
                        ? 'bg-white dark:bg-zinc-900 border-2 shadow-2xl lg:-translate-y-4 z-10'
                        : isAnual
                        ? 'bg-white dark:bg-zinc-900 border-2 border-indigo-500/80 dark:border-indigo-500/80 shadow-xl lg:-translate-y-2 z-10'
                        : 'bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xs hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                    style={isBienal ? { borderColor: accentConfig.primaryHex } : undefined}
                  >
                    {/* Selo de Destaque Superior */}
                    {plan.badge && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap">
                        <span
                          className="text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full text-white shadow-md"
                          style={{
                            backgroundColor: isBienal ? accentConfig.primaryHex : isAnual ? '#6366f1' : '#059669'
                          }}
                        >
                          {plan.badge}
                        </span>
                      </div>
                    )}

                    <div>
                      {/* Cabeçalho do Card */}
                      <div className="pt-1">
                        <h3
                          className="font-bebas text-3xl sm:text-4xl tracking-wide text-zinc-950 dark:text-white leading-none"
                          style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                        >
                          {plan.name}
                        </h3>
                      </div>

                      {/* Preço de Destaque */}
                      <div className="mt-4 pb-4 border-b border-zinc-100 dark:border-zinc-800">
                        <div className="flex items-baseline gap-1">
                          <span
                            className="font-bebas text-2xl sm:text-3xl text-zinc-400 leading-none"
                            style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                          >
                            R$
                          </span>
                          <span
                            className="font-bebas text-5xl sm:text-6xl md:text-7xl font-bold text-zinc-950 dark:text-white tracking-tight tabular-nums leading-none"
                            style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                          >
                            {plan.pricePerMonth}
                          </span>
                          <span className="text-xs sm:text-sm font-semibold text-zinc-500 ml-1">
                            {plan.periodLabel}
                          </span>
                        </div>

                        {/* Selo Black de Lançamento */}
                        <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-amber-500/10 dark:bg-amber-400/10 border border-amber-500/20 text-amber-700 dark:text-amber-400 text-[10px] font-bold mt-2">
                          <Sparkles className="w-3 h-3 text-amber-500 shrink-0" />
                          <span>Preço de Black de Lançamento</span>
                        </div>

                        {/* Linha de parcelamento e cobrança com aviso de taxas */}
                        <div className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400 mt-2 leading-relaxed">
                          {plan.billingText}
                        </div>

                        {/* Bloco Dedicado de Economia (Bebas Neue) */}
                        <div className="mt-3.5">
                          {plan.savings ? (
                            <div
                              className="py-2 px-3 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bebas text-lg sm:text-xl text-center tracking-wider leading-none shadow-2xs"
                              style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                            >
                              {plan.savings}
                            </div>
                          ) : (
                            <div
                              className="py-2 px-3 rounded-xl bg-zinc-100/70 dark:bg-zinc-800/40 border border-zinc-200/60 dark:border-zinc-700/40 text-zinc-500 dark:text-zinc-400 font-bebas text-base sm:text-lg text-center tracking-wider leading-none"
                              style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                            >
                              SEM FIDELIDADE
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botão de Ação do Plano */}
                    <div className="mt-6 pt-2">
                      <button
                        type="button"
                        onClick={() => handleStartPlanCheckout(plan.id, 'register')}
                        className={`w-full py-3 px-4 rounded-xl text-xs sm:text-sm font-extrabold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          isBienal
                            ? 'text-white shadow-xl hover:opacity-95'
                            : isAnual
                            ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-md'
                            : 'bg-zinc-900 dark:bg-zinc-800 hover:bg-zinc-800 dark:hover:bg-zinc-700 text-white shadow-sm'
                        }`}
                        style={isBienal ? { backgroundColor: accentConfig.primaryHex } : undefined}
                      >
                        <span>Assinar {plan.name}</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Garantia Simples com Ícone */}
          <div className="mt-10 flex items-center justify-center gap-2 text-zinc-600 dark:text-zinc-400 text-xs sm:text-sm font-semibold">
            <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>Garantia Incondicional de 7 Dias</span>
          </div>
        </div>
      </section>

      {/* =========================================================================
          SEÇÃO: PERGUNTAS FREQUENTES (FAQ)
          ========================================================================= */}
      <section id="faq" className="scroll-mt-24 py-16 sm:py-20 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/20">
        <div className="max-w-3xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10 sm:mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 text-xs font-bold mb-3">
              <HelpCircle className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
              <span>Tire Suas Dúvidas</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-zinc-950 dark:text-white">
              Perguntas Frequentes (FAQ)
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-zinc-600 dark:text-zinc-400">
              Tire suas dúvidas sobre o funcionamento, recursos clínicos, metodologia e planos do Banco Residência.
            </p>
          </div>

          <div className="space-y-3">
            {[
              {
                id: 'faq-1',
                q: 'Como funcionam as condições de Acesso Antecipado?',
                a: 'Durante a fase de lançamento, os planos semestral, anual e bienal contam com descontos progressivos de até 60% já aplicados na tabela de preços. O valor promocional contratado é garantido e concede acesso irrestrito a todo o acervo de questões comentadas, simulados na íntegra, flashcards FSRS e base médica.'
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
                a: 'Se dentro de 7 dias corridos após a contratação você achar que a plataforma não atende às suas expectativas, basta solicitar o reembolso pelo suporte para receber 100% do valor de volta, sem burocracia.'
              },
              {
                id: 'faq-7',
                q: 'Como funciona o Programa de Embaixadores?',
                a: 'Estudantes cadastrados podem se afiliar para recomendar a plataforma a colegas de faculdade e internato. Cada indicação confirmada concede 10% de desconto para o colega e gera 15% de comissão via PIX para você. Ao atingir 10 indicações, o valor da sua anuidade é integralmente reembolsado.'
              }
            ].map((item) => {
              const isOpen = openFaqId === item.id;
              return (
                <div
                  key={item.id}
                  className="rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 overflow-hidden transition-all duration-200 shadow-xs"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaqId(isOpen ? null : item.id)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-zinc-50/50 dark:hover:bg-zinc-800/50 transition-colors"
                  >
                    <span className="font-heading text-sm sm:text-base font-bold text-zinc-950 dark:text-white">
                      {item.q}
                    </span>
                    <span className="p-1 rounded-lg text-zinc-400 shrink-0">
                      {isOpen ? <ChevronUp className="w-4 h-4" style={{ color: accentConfig.primaryHex }} /> : <ChevronDown className="w-4 h-4" />}
                    </span>
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-800/60 animate-in fade-in duration-150">
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
          SEÇÃO DE SUPORTE & CONTATO (LANDING PAGE)
          ========================================================================= */}
      <section id="suporte" className="py-12 sm:py-16 max-w-5xl mx-auto px-4 sm:px-6 w-full scroll-mt-24">
        <div className="rounded-2xl p-6 sm:p-10 bg-white dark:bg-zinc-900 border border-zinc-200/90 dark:border-zinc-800 shadow-xl relative overflow-hidden transition-all duration-300">
          {/* Glow de fundo */}
          <div
            className="absolute -right-20 -bottom-20 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
            style={{ backgroundColor: '#25D366' }}
          />

          <div className="flex flex-col md:flex-row items-center justify-between gap-6 relative z-10 text-center md:text-left">
            <div className="space-y-2 max-w-xl">
              <span className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 inline-block">
                Atendimento Rápido
              </span>
              <h2
                className="font-bebas text-4xl sm:text-5xl md:text-6xl tracking-wide text-zinc-950 dark:text-white uppercase leading-none"
                style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
              >
                CONTATO
              </h2>
              <p
                className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 font-normal leading-relaxed"
                style={{ fontFamily: 'var(--font-inter), sans-serif' }}
              >
                Quer tirar alguma dúvida ou resolver algum problema? Entre em contato.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href="https://wa.me/5588999903641?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20Banco%20Resid%C3%AAncia."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-white bg-[#25D366] hover:bg-[#20ba59] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-bold"
                title="Iniciar conversa no WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                <span
                  className="font-bebas text-xl sm:text-2xl tracking-wider leading-none"
                  style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                >
                  CONTATO 1
                </span>
              </a>

              <a
                href="https://wa.me/5588999082917?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20Banco%20Resid%C3%AAncia."
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-xl text-white bg-[#25D366] hover:bg-[#20ba59] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-bold"
                title="Iniciar conversa no WhatsApp"
              >
                <WhatsAppIcon className="w-5 h-5 shrink-0" />
                <span
                  className="font-bebas text-xl sm:text-2xl tracking-wider leading-none"
                  style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
                >
                  CONTATO 2
                </span>
              </a>
            </div>
          </div>
        </div>
      </section>

{/* =========================================================================
          BANNER INFERIOR: CHAMADA FINAL CIRÚRGICA
          ========================================================================= */}
      <section className="py-16 sm:py-20 max-w-5xl mx-auto px-4 sm:px-6 w-full text-center">
        <div
          className="rounded-2xl p-8 sm:p-12 bg-zinc-900 border border-zinc-800 text-white shadow-2xl relative overflow-hidden"
          style={{
            boxShadow: `0 20px 50px -15px ${accentConfig.bgRgba || 'rgba(0,0,0,0.5)'}`
          }}
        >
          {/* Glow de fundo */}
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[250px] rounded-full blur-3xl opacity-20 pointer-events-none"
            style={{ backgroundColor: accentConfig.primaryHex }}
          />

          <div className="relative z-10 max-w-2xl mx-auto space-y-4">
            <span
              className="text-[11px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border border-white/10 bg-white/5"
              style={{ color: accentConfig.primaryHex }}
            >
              Comece a sua Preparação
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-white">
              A ferramenta de estudo mais completa e objetiva para a sua prova.
            </h2>
            <p className="text-xs sm:text-sm text-zinc-400 font-normal leading-relaxed">
              Responda questões das principais bancas do Brasil, revise com flashcards FSRS e acompanhe seu percentil calibrado sem distrações.
            </p>
            <div className="pt-3 flex flex-wrap items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => scrollToSection('planos')}
                className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-extrabold text-white transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer shadow-lg"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                Garantir Meu Acesso
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="px-6 py-3.5 rounded-xl text-xs sm:text-sm font-bold text-zinc-300 bg-white/5 hover:bg-white/10 border border-white/15 transition-all cursor-pointer"
              >
                Criar Conta Gratuita
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* =========================================================================
          RODAPÉ DA PÁGINA INICIAL
          ========================================================================= */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white dark:bg-[var(--bg-card)] py-8 sm:py-10 text-xs text-zinc-500 dark:text-zinc-400 mt-auto transition-colors">
        {/* Bloco de Suporte & Contato no Rodapé */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-8 pb-8 border-b border-zinc-200/80 dark:border-zinc-800/80 flex flex-col md:flex-row items-center justify-between gap-6 text-center md:text-left">
          <div className="space-y-1.5 max-w-xl">
            <h3
              className="font-bebas text-2xl sm:text-3xl tracking-wide text-zinc-950 dark:text-white uppercase leading-none"
              style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
            >
              CONTATO
            </h3>
            <p
              className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed"
              style={{ fontFamily: 'var(--font-inter), sans-serif' }}
            >
              Quer tirar alguma dúvida ou resolver algum problema? Entre em contato.
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center md:justify-end gap-3 shrink-0">
            <a
              href="https://wa.me/5588999903641?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20Banco%20Resid%C3%AAncia."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-white bg-[#25D366] hover:bg-[#20ba59] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-bold"
              title="Iniciar conversa no WhatsApp"
            >
              <WhatsAppIcon className="w-4.5 h-4.5 shrink-0" />
              <span
                className="font-bebas text-lg sm:text-xl tracking-wider leading-none"
                style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
              >
                CONTATO 1
              </span>
            </a>

            <a
              href="https://wa.me/5588999082917?text=Ol%C3%A1%2C%20gostaria%20de%20tirar%20uma%20d%C3%BAvida%20sobre%20o%20Banco%20Resid%C3%AAncia."
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 sm:px-5 sm:py-3 rounded-xl text-white bg-[#25D366] hover:bg-[#20ba59] shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer font-bold"
              title="Iniciar conversa no WhatsApp"
            >
              <WhatsAppIcon className="w-4.5 h-4.5 shrink-0" />
              <span
                className="font-bebas text-lg sm:text-xl tracking-wider leading-none"
                style={{ fontFamily: 'var(--font-bebas), "Bebas Neue", sans-serif' }}
              >
                CONTATO 2
              </span>
            </a>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Logo className="w-8 h-8 shrink-0" />
            <div className="flex flex-col justify-center leading-none">
              <span className="font-bold text-sm text-zinc-900 dark:text-zinc-100" style={{ fontFamily: 'var(--font-inter), sans-serif' }}>
                Banco Residência
              </span>
              <span className="block text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">
                Plataforma médica de preparação e questões para Residência e Revalida
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => scrollToSection('questoes')}
              className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              Banco de Questões
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('material-estudo')}
              className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              Material de Estudo
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('flashcards')}
              className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              Flashcards
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('faq')}
              className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              FAQ
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('planos')}
              className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              Planos & Preços
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => {
                setOpenFaqId('faq-7');
                scrollToSection('faq');
              }}
              className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors text-zinc-400 hover:underline"
            >
              Embaixadores
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('suporte')}
              className="hover:text-zinc-900 dark:hover:text-white cursor-pointer transition-colors"
            >
              Suporte
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL DE ASSINATURA / INTENÇÃO DE PLANO (ESTRUTURA PARA MERCADO PAGO)
          ========================================================================= */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[var(--bg-card)] border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-6 relative space-y-4 animate-in fade-in zoom-in-95 duration-150">
            {/* Botão Fechar */}
            <button
              type="button"
              onClick={() => setSelectedPlanModal(null)}
              className="absolute top-4 right-4 p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Cabeçalho do Modal */}
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 text-[11px] font-bold">
                <CreditCard className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
                <span>Assinatura Selecionada</span>
              </div>
              <h3 className="font-heading text-lg font-black text-zinc-950 dark:text-white">
                {selectedPlanModal.name}
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                {selectedPlanModal.description}
              </p>
            </div>

            {/* Resumo do Valor */}
            <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">Valor do Plano:</span>
                <div className="text-right">
                  <span className="text-xs font-bold text-zinc-400">R$ </span>
                  <span className="font-heading text-2xl font-black text-zinc-950 dark:text-white tabular-nums">
                    {selectedPlanModal.pricePerMonth}
                  </span>
                  <span className="text-xs font-medium text-zinc-400"> /mês</span>
                </div>
              </div>
              <div className="text-[11px] font-medium text-zinc-500 mt-1 text-right">
                {selectedPlanModal.billingText}
              </div>
              {selectedPlanModal.savings && (
                <div className="mt-2 pt-2 border-t border-zinc-200/60 dark:border-zinc-800 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center justify-between">
                  <span>Desconto aplicado:</span>
                  <span>{selectedPlanModal.savings}</span>
                </div>
              )}
            </div>

            {/* Benefícios inclusos */}
            <div className="space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300">
              <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-400 block mb-1">
                Todas as funções liberadas:
              </span>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>+130k questões com resoluções comentadas</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Provas oficiais na íntegra de 2018 a 2026</span>
              </div>
              <div className="flex items-center gap-2">
                <Check className="w-3.5 h-3.5 text-emerald-500" />
                <span>Repetição espaçada com flashcards FSRS</span>
              </div>
            </div>

            {/* Ações para Prosseguir */}
            <div className="pt-2 space-y-2">
              <button
                type="button"
                onClick={() => {
                  setSelectedPlanModal(null);
                  handleStartPlanCheckout(selectedPlanModal.id, 'register');
                }}
                className="w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-md transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer flex items-center justify-center gap-2"
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
                className="w-full py-2 px-4 rounded-xl text-xs font-medium text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all cursor-pointer text-center"
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
                  className="text-[11px] font-medium text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 underline cursor-pointer"
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
