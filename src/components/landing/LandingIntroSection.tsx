'use client';

import React, { useEffect, useRef, useState } from 'react';
import {
  ArrowRight,
  ChevronDown,
  BookOpenCheck,
  Layers,
  TrendingUp,
  CheckCircle2,
  Brain,
  Sparkles,
  Activity,
  LucideIcon
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';

export interface LandingIntroSectionProps {
  onOpenAuth: (mode?: 'login' | 'register', planTitle?: string) => void;
  onScrollToSection: (sectionId: string) => void;
  embeddedMode?: boolean;
}

interface PillarItem {
  id: string;
  headline: string;
  subtitle: string;
  cardText: string;
  icon: LucideIcon;
  glowColor: string;
  gradient: {
    from: string;
    via: string;
    to: string;
  };
}

const PILLARS: PillarItem[] = [
  {
    id: 'questoes',
    headline: '+200 MIL QUESTÕES',
    subtitle: 'A estrutura que consolida a sua aprovação.',
    cardText: 'Questões comentadas com base nas bancas de residência',
    icon: BookOpenCheck,
    glowColor: '#6366f1',
    gradient: {
      from: '#818cf8',
      via: '#c084fc',
      to: '#38bdf8'
    }
  },
  {
    id: 'flashcards',
    headline: 'FLASHCARDS',
    subtitle: 'Flashcards que estarão na sua prova.',
    cardText: 'Flashcards que estarão na sua prova',
    icon: Layers,
    glowColor: '#10b981',
    gradient: {
      from: '#34d399',
      via: '#10b981',
      to: '#06b6d4'
    }
  },
  {
    id: 'resumos',
    headline: 'RESUMOS',
    subtitle: 'Materiais com base nas diretrizes e nas questões de residência.',
    cardText: 'Materiais com base nas diretrizes e nas questões de residência',
    icon: BookOpenCheck,
    glowColor: '#f59e0b',
    gradient: {
      from: '#fbbf24',
      via: '#f59e0b',
      to: '#f97316'
    }
  },
  {
    id: 'desempenho',
    headline: 'AVALIAÇÃO DE DESEMPENHO',
    subtitle: 'Métricas reais e calibração TRI da sua evolução até a prova.',
    cardText: 'Evolução completa do seu desempenho com psicometria TRI',
    icon: TrendingUp,
    glowColor: '#06b6d4',
    gradient: {
      from: '#22d3ee',
      via: '#06b6d4',
      to: '#6366f1'
    }
  }
];

const SLIDE_DURATION_MS = 4500;
const FADE_OUT_DURATION_MS = 460;

export const LandingIntroSection: React.FC<LandingIntroSectionProps> = ({
  onOpenAuth,
  onScrollToSection,
  embeddedMode = false
}) => {
  const { accent, mode } = useTheme();
  const isDark = mode === 'dark';
  const isMonochrome = accent === 'neutral';
  const sectionRef = useRef<HTMLElement>(null);

  const [displayedIndex, setDisplayedIndex] = useState(0);
  const [fadeState, setFadeState] = useState<'visible' | 'fading'>('visible');
  const [scrollY, setScrollY] = useState(0);

  // Monitora o scroll para esvanecer suavemente na descida para a 2ª dobra (Cérebro 3D)
  useEffect(() => {
    let frame = 0;
    let previousScroll = -1;
    const updateScroll = () => {
      frame = 0;
      const nextScroll = Math.max(0, Math.min(window.scrollY, 320));
      if (nextScroll === previousScroll) return;
      previousScroll = nextScroll;
      setScrollY(nextScroll);
    };
    const handleScroll = () => {
      // A introdução já terminou de esvanecer após os primeiros 320px.
      if (!frame && !(previousScroll === 320 && window.scrollY >= 320)) {
        frame = requestAnimationFrame(updateScroll);
      }
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Transição 100% automática com esvaecimento (cross-dissolve suave)
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    let inView = typeof IntersectionObserver === 'undefined';
    let interval: number | undefined;
    let fadeTimer: number | undefined;

    const stopCarousel = () => {
      window.clearInterval(interval);
      window.clearTimeout(fadeTimer);
      interval = undefined;
      fadeTimer = undefined;
    };

    const syncCarousel = () => {
      const active = inView && !document.hidden;
      section.dataset.animationPaused = active ? 'false' : 'true';
      if (!active) {
        if (fadeTimer !== undefined) setFadeState('visible');
        stopCarousel();
        return;
      }
      if (interval !== undefined) return;

      interval = window.setInterval(() => {
        setFadeState('fading');
        fadeTimer = window.setTimeout(() => {
          fadeTimer = undefined;
          setDisplayedIndex((previous) => (previous + 1) % PILLARS.length);
          setFadeState('visible');
        }, FADE_OUT_DURATION_MS);
      }, SLIDE_DURATION_MS);
    };

    const observer = inView ? null : new IntersectionObserver(([entry]) => {
      inView = entry.intersectionRatio >= 0.01;
      syncCarousel();
    }, { rootMargin: '-64px 0px 0px', threshold: 0.01 });
    observer?.observe(section);
    if (inView) syncCarousel();
    document.addEventListener('visibilitychange', syncCarousel);
    return () => {
      stopCarousel();
      observer?.disconnect();
      document.removeEventListener('visibilitychange', syncCarousel);
    };
  }, []);

  const activePillar = PILLARS[displayedIndex];
  const CardIcon = activePillar.icon;

  // Transição suave no scroll vertical da página
  const scrollFadeOut = Math.min(1, Math.max(0, scrollY / 320));
  const containerOpacity = 1 - scrollFadeOut;
  const containerTranslateY = -24 * scrollFadeOut;

  // Estilo de esvaecimento suave (cross-fade gradual entre slides)
  const isFading = fadeState === 'fading';
  const slideTransitionStyle: React.CSSProperties = {
    opacity: isFading ? 0 : 1,
    transform: isFading ? 'translate3d(0, -8px, 0)' : 'translate3d(0, 0, 0)',
    filter: isFading ? 'blur(4px)' : 'blur(0px)',
    transition: isFading
      ? 'opacity 460ms cubic-bezier(0.4, 0, 1, 1), transform 460ms cubic-bezier(0.4, 0, 1, 1), filter 460ms ease'
      : 'opacity 580ms cubic-bezier(0.16, 1, 0.3, 1), transform 580ms cubic-bezier(0.16, 1, 0.3, 1), filter 580ms ease'
  };

  const highlightTextStyle: React.CSSProperties = isMonochrome
    ? {
        backgroundImage: isDark
          ? 'linear-gradient(110deg, rgba(255,255,255,0.98) 0%, rgba(161,161,170,0.75) 30%, rgba(255,255,255,1) 50%, rgba(113,113,122,0.75) 75%, rgba(255,255,255,0.98) 100%)'
          : 'linear-gradient(110deg, rgba(9,9,11,0.98) 0%, rgba(82,82,91,0.75) 30%, rgba(9,9,11,1) 50%, rgba(113,113,122,0.75) 75%, rgba(9,9,11,0.98) 100%)'
      }
    : {
        backgroundImage: `linear-gradient(110deg, ${activePillar.gradient.from} 0%, ${activePillar.gradient.via} 46%, ${activePillar.gradient.to} 100%)`
      };

  const primaryBtnStyle: React.CSSProperties = {
    backgroundColor: isMonochrome ? (isDark ? '#f4f4f5' : '#18181b') : activePillar.glowColor,
    color: isMonochrome ? (isDark ? '#09090b' : '#ffffff') : '#ffffff',
    boxShadow: `0 14px 34px -8px ${activePillar.glowColor}55`
  };

  // =========================================================================
  // RENDERIZAÇÃO DOS CARDS LATERAIS ADAPTADOS AO DESIGN SYSTEM DA PLATAFORMA
  // =========================================================================

  const renderLateralLeft = (index: number) => {
    switch (index) {
      case 0:
        // +200 MIL QUESTÕES: Miniatura autêntica do QuestionCard
        return (
          <div className="relative overflow-hidden w-[280px] xl:w-[295px] 2xl:w-[335px] p-4 rounded-2xl bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] text-left select-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
            {/* Friso luminoso sutil no topo (Laser Rim) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #6366f1, transparent)',
                opacity: 0.65
              }}
            />
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500/15 border border-indigo-500/30 text-indigo-600 dark:text-indigo-300">
                ENARE 2025
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300">
                Cirurgia Geral
              </span>
              <span className="ml-auto text-[10px] font-mono text-zinc-400 dark:text-zinc-500">
                #84.192
              </span>
            </div>

            <p className="mt-3 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal">
              Homem, 45a, dor súbita em fossa ilíaca direita há 18h, febre e sinal de Blumberg doloroso...
            </p>

            <div className="mt-3 space-y-1.5">
              <div className="p-2 rounded-lg bg-zinc-100/90 dark:bg-zinc-900/50 border border-zinc-200/80 dark:border-zinc-800/80 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                <span className="w-4 h-4 rounded-full bg-zinc-200 dark:bg-zinc-800 text-[10px] font-bold text-zinc-600 dark:text-zinc-400 flex items-center justify-center shrink-0">
                  A
                </span>
                <span className="truncate">Colonoscopia de urgência</span>
              </div>

              <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/40 text-[11px] text-emerald-700 dark:text-emerald-300 font-medium flex items-center justify-between">
                <div className="flex items-center gap-2 truncate">
                  <span className="w-4 h-4 rounded-full bg-emerald-500/20 text-[10px] font-bold text-emerald-700 dark:text-emerald-300 flex items-center justify-center shrink-0">
                    B
                  </span>
                  <span className="truncate font-semibold">Tomografia de abdome total</span>
                </div>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0 ml-1" />
              </div>
            </div>
          </div>
        );

      case 1:
        // FLASHCARDS FSRS: Card Cloze com Omissão e Lacuna Revelada
        return (
          <div className="relative overflow-hidden w-[280px] xl:w-[295px] 2xl:w-[335px] p-4 rounded-2xl bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] text-left select-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
            {/* Friso luminoso sutil no topo (Laser Rim) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                opacity: 0.65
              }}
            />
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-500/15 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 flex items-center gap-1">
                <Brain className="w-3 h-3" />
                FSRS • REPETIÇÃO
              </span>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">USP / ENARE</span>
            </div>

            <div className="mt-3 text-xs text-zinc-700 dark:text-zinc-200 leading-relaxed font-normal">
              Na Cetoacidose Diabética, se o potássio sérico inicial for{' '}
              <span className="px-1.5 py-0.5 rounded font-extrabold text-emerald-700 dark:text-emerald-300 bg-emerald-500/15 border border-emerald-500/35 inline-block">
                &lt; 3,3 mEq/L
              </span>
              , deve-se postergar a insulina e repor KCl intravenoso.
            </div>

            <div className="mt-3 pt-2.5 border-t border-zinc-200 dark:border-zinc-800/80 flex items-center justify-between text-[10px] text-zinc-500">
              <span>Omissão Cloze cirúrgica</span>
              <span className="font-mono text-emerald-600 dark:text-emerald-400 font-semibold">Retenção: 96%</span>
            </div>
          </div>
        );

      case 2:
        // RESUMOS: Ficha de Diretriz Clínica Oficial
        return (
          <div className="relative overflow-hidden w-[280px] xl:w-[295px] 2xl:w-[335px] p-4 rounded-2xl bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] text-left select-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
            {/* Friso luminoso sutil no topo (Laser Rim) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
                opacity: 0.65
              }}
            />
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300">
                DIRETRIZ OFICIAL
              </span>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">SBC / AHA</span>
            </div>

            <h4 className="mt-2 text-xs font-bold text-zinc-900 dark:text-white tracking-tight">
              IAM com Supra de ST
            </h4>

            <div className="mt-2.5 space-y-1.5 text-[11px] text-zinc-700 dark:text-zinc-300 leading-snug">
              <div className="flex items-start gap-1.5">
                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">•</span>
                <span>AAS 200mg mastigável + Ticagrelor 180mg</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">•</span>
                <span>Angioplastia 1ª: Tempo porta-balão &lt; 90 min</span>
              </div>
              <div className="flex items-start gap-1.5">
                <span className="text-amber-600 dark:text-amber-400 font-bold shrink-0">•</span>
                <span>Se transferência: tempo limite porta-balão &lt; 120 min</span>
              </div>
            </div>
          </div>
        );

      case 3:
      default:
        // AVALIAÇÃO DE DESEMPENHO: Escore TRI Real
        return (
          <div className="relative overflow-hidden w-[280px] xl:w-[295px] 2xl:w-[335px] p-4 rounded-2xl bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] text-left select-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
            {/* Friso luminoso sutil no topo (Laser Rim) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
                opacity: 0.65
              }}
            />
            <div className="flex items-center justify-between">
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-cyan-500/15 border border-cyan-500/30 text-cyan-700 dark:text-cyan-300">
                CALIBRAÇÃO TRI (IRT)
              </span>
              <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400">ENARE 2026</span>
            </div>

            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-zinc-900 dark:text-white tracking-tight">842.5</span>
              <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Score Psicométrico</span>
            </div>

            <div className="mt-2 flex items-center gap-2">
              <div className="flex-1 h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-cyan-500 to-indigo-500 rounded-full"
                  style={{ width: '88%' }}
                />
              </div>
              <span className="text-[10px] font-mono font-bold text-cyan-700 dark:text-cyan-300">Top 3%</span>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 text-[10.5px] text-zinc-500 dark:text-zinc-400">
              Imune a chutes casuais • Coerência pedagógica
            </div>
          </div>
        );
    }
  };

  const renderLateralRight = (index: number) => {
    switch (index) {
      case 0:
        // +200 MIL QUESTÕES: Gabarito & Análise TRI
        return (
          <div className="relative overflow-hidden w-[270px] xl:w-[285px] 2xl:w-[320px] p-4 rounded-2xl bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] text-left select-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
            {/* Friso luminoso sutil no topo (Laser Rim) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                opacity: 0.65
              }}
            />
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Gabarito Comentado</span>
              </div>
              <span className="text-[10px] font-semibold text-zinc-500 dark:text-zinc-400">Preceptor CBC</span>
            </div>

            <div className="p-2.5 rounded-xl bg-zinc-100/90 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800/70 mt-3 text-[11.5px] text-zinc-700 dark:text-zinc-300 leading-relaxed">
              <strong className="text-zinc-900 dark:text-white font-semibold">Justificativa: </strong>
              Escore de Alvarado ≥ 7 confere alta probabilidade. A TC contrastada é o método de escolha em adultos.
            </div>

            <div className="mt-3 flex items-center justify-between text-[10.5px] pt-1">
              <span className="font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block animate-pulse" />
                78% de acerto
              </span>
              <span className="font-mono text-zinc-500 dark:text-zinc-400">TRI: Alta Discriminação</span>
            </div>
          </div>
        );

      case 1:
        // FLASHCARDS FSRS: Grade dos 4 Botões FSRS Canônicos
        return (
          <div className="relative overflow-hidden w-[270px] xl:w-[285px] 2xl:w-[320px] p-4 rounded-2xl bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] text-left select-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
            {/* Friso luminoso sutil no topo (Laser Rim) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #10b981, transparent)',
                opacity: 0.65
              }}
            />
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span>Agendador FSRS</span>
              </div>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">Intervalo ótimo</span>
            </div>

            <div className="grid grid-cols-4 gap-1.5 mt-3">
              <div className="py-2 px-1 rounded-lg border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-center">
                <div className="text-[10px] font-bold text-rose-700 dark:text-rose-300">Errei</div>
                <div className="text-[9px] text-rose-600 dark:text-rose-400/80 font-mono">1d</div>
              </div>
              <div className="py-2 px-1 rounded-lg border border-amber-200 dark:border-amber-900/60 bg-amber-50 dark:bg-amber-950/30 text-center">
                <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300">Difícil</div>
                <div className="text-[9px] text-amber-600 dark:text-amber-400/80 font-mono">4d</div>
              </div>
              <div className="py-2 px-1 rounded-lg border border-sky-300 dark:border-sky-900/60 bg-sky-50 dark:bg-sky-950/30 text-center ring-1 ring-sky-400/50">
                <div className="text-[10px] font-bold text-sky-700 dark:text-sky-300">Bom</div>
                <div className="text-[9px] text-sky-600 dark:text-sky-400 font-mono font-bold">9d</div>
              </div>
              <div className="py-2 px-1 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50 dark:bg-emerald-950/30 text-center">
                <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">Fácil</div>
                <div className="text-[9px] text-emerald-600 dark:text-emerald-400/80 font-mono">21d</div>
              </div>
            </div>

            <div className="mt-3 text-[10.5px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Próxima revisão: <strong className="text-zinc-800 dark:text-zinc-200">28 Nov</strong></span>
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold">Curva Estável</span>
            </div>
          </div>
        );

      case 2:
        // RESUMOS: Pérola de Prova High-Yield
        return (
          <div className="relative overflow-hidden w-[270px] xl:w-[285px] 2xl:w-[320px] p-4 rounded-2xl bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] text-left select-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
            {/* Friso luminoso sutil no topo (Laser Rim) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #f59e0b, transparent)',
                opacity: 0.65
              }}
            />
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-1 text-xs font-black text-amber-600 dark:text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-500 dark:text-amber-400 shrink-0" />
                <span>Pérola de Prova</span>
              </div>
              <span className="text-[10px] text-amber-600 dark:text-amber-400/90 font-mono font-bold">94% Recorrência</span>
            </div>

            <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 mt-3 text-[11px] text-zinc-700 dark:text-zinc-200 leading-relaxed">
              <strong className="text-amber-700 dark:text-amber-300 font-semibold">Pegadinha Clássica: </strong>
              Se hospital sem hemodinâmica e atraso for &gt; 120 min, realizar FIBRINÓLISE imediata em até 30 min (porta-agulha).
            </div>

            <div className="mt-3 text-[10px] text-zinc-500 dark:text-zinc-400 flex items-center justify-between">
              <span>Bancas: ENARE • USP • UNICAMP</span>
              <span className="text-amber-600 dark:text-amber-300 font-semibold">Alta Incidência</span>
            </div>
          </div>
        );

      case 3:
      default:
        // AVALIAÇÃO DE DESEMPENHO: Radar por Especialidade & Mentor IA
        return (
          <div className="relative overflow-hidden w-[270px] xl:w-[285px] 2xl:w-[320px] p-4 rounded-2xl bg-white/94 dark:bg-zinc-950/92 backdrop-blur-xl border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.10)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] text-left select-none hover:border-zinc-400 dark:hover:border-zinc-700 transition-all duration-300">
            {/* Friso luminoso sutil no topo (Laser Rim) */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
              style={{
                background: 'linear-gradient(90deg, transparent, #06b6d4, transparent)',
                opacity: 0.65
              }}
            />
            <div className="flex items-center justify-between pb-2 border-b border-zinc-200 dark:border-zinc-800/80">
              <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-900 dark:text-zinc-100">
                <Activity className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400 shrink-0" />
                <span>Radar por Especialidade</span>
              </div>
              <span className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono font-bold">Média: 85.6%</span>
            </div>

            <div className="mt-3 space-y-2 text-[11px]">
              <div>
                <div className="flex justify-between text-zinc-700 dark:text-zinc-300 font-medium mb-0.5">
                  <span>Cirurgia Geral</span>
                  <span className="font-mono text-cyan-700 dark:text-cyan-300 font-bold">89%</span>
                </div>
                <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-cyan-500 rounded-full" style={{ width: '89%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-700 dark:text-zinc-300 font-medium mb-0.5">
                  <span>Clínica Médica</span>
                  <span className="font-mono text-indigo-700 dark:text-indigo-300 font-bold">82%</span>
                </div>
                <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 rounded-full" style={{ width: '82%' }} />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-zinc-700 dark:text-zinc-300 font-medium mb-0.5">
                  <span>Ginecologia &amp; Obstetrícia</span>
                  <span className="font-mono text-purple-700 dark:text-purple-300 font-bold">86%</span>
                </div>
                <div className="h-1 bg-zinc-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-purple-500 rounded-full" style={{ width: '86%' }} />
                </div>
              </div>
            </div>

            <div className="mt-3 pt-2 border-t border-zinc-200 dark:border-zinc-800/80 text-[10.5px] text-zinc-700 dark:text-zinc-300 font-medium truncate">
              <strong className="text-cyan-700 dark:text-cyan-300">Mentor: </strong>Revisar Abdome Obstrutivo
            </div>
          </div>
        );
    }
  };

  return (
    <section
      ref={sectionRef}
      aria-label="Introdução Hippocampus • Os 4 Pilares da Aprovação"
      className={`font-inter relative w-full ${
        embeddedMode
          ? 'h-full flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 py-6 sm:py-8 bg-transparent overflow-hidden select-none pointer-events-none'
          : 'min-h-[calc(100vh-4rem)] flex flex-col justify-between items-center px-4 sm:px-6 lg:px-8 py-10 sm:py-14 bg-zinc-50 dark:bg-[var(--bg-page)] overflow-hidden select-none transition-colors duration-300'
      }`}
      style={{ fontFamily: 'var(--font-inter), "Inter", sans-serif' }}
    >
      <style>{`
        @keyframes hippoCardDriftLeft {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(-2.5deg);
          }
          50% {
            transform: translate3d(0, -7px, 0) rotate(-1.8deg);
          }
        }
        @keyframes hippoCardDriftRight {
          0%, 100% {
            transform: translate3d(0, 0, 0) rotate(2.5deg);
          }
          50% {
            transform: translate3d(0, -7px, 0) rotate(3.2deg);
          }
        }
        @keyframes hippoCardDriftCenter {
          0%, 100% {
            transform: translate3d(0, 0, 0);
          }
          50% {
            transform: translate3d(0, -5px, 0);
          }
        }
        .animate-hippo-card-drift-left {
          animation: hippoCardDriftLeft 6s ease-in-out infinite;
        }
        .animate-hippo-card-drift-right {
          animation: hippoCardDriftRight 6s ease-in-out infinite;
          animation-delay: -3s;
        }
        .animate-hippo-card-drift-center {
          animation: hippoCardDriftCenter 5s ease-in-out infinite;
        }
        [data-animation-paused="true"] :is(
          .animate-hippo-card-drift-left,
          .animate-hippo-card-drift-right,
          .animate-hippo-card-drift-center,
          .animate-pulse
        ) {
          animation-play-state: paused;
        }
      `}</style>

      {/* Luz ambiente radial sutil com transição cromática contínua e suave */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[620px] sm:w-[940px] h-[480px] rounded-full blur-[170px] opacity-12 dark:opacity-18 transition-all duration-1200 ease-out"
        style={{ backgroundColor: activePillar.glowColor }}
      />

      {/* Topo 100% limpo com respiro generoso */}
      <div className="w-full h-4 sm:h-8" aria-hidden="true" />

      {/* PALCO PRINCIPAL DO HERO (CONTAINER COM CARDS LATERAIS FLUTUANTES NAS EXTREMIDADES) */}
      <div className="relative z-10 w-full max-w-[1440px] mx-auto flex items-center justify-center my-auto px-2 sm:px-4">
        {/* CARD LATERAL ESQUERDO (Apenas telas grandes xl/2xl, ancorado na extremidade externa sem sobrepor o texto) */}
        <div
          style={slideTransitionStyle}
          className="hidden xl:block absolute left-2 2xl:left-6 top-1/2 -translate-y-1/2 z-10 pointer-events-auto will-change-[opacity,transform,filter]"
        >
          <div className="animate-hippo-card-drift-left">
            {renderLateralLeft(displayedIndex)}
          </div>
        </div>

        {/* BLOCO CENTRAL: Título Monumental + Frase Oficial de Impacto + Botões Fixos */}
        <div
          style={{
            opacity: containerOpacity,
            transform: `translate3d(0, ${containerTranslateY}px, 0)`,
            willChange: 'opacity, transform'
          }}
          className="relative z-20 w-full max-w-3xl xl:max-w-4xl mx-auto flex flex-col items-center text-center py-6"
        >
          {/* Bloco Dinâmico com Transição Suave (Cross-Fade) */}
          <div
            style={slideTransitionStyle}
            className="flex flex-col items-center will-change-[opacity,transform,filter]"
          >
            {/* Título Monumental Ampliado com Headroom Generoso para não cortar acentos/til */}
            <h1 className="text-5xl sm:text-7xl md:text-8xl lg:text-[88px] xl:text-[96px] font-black tracking-[-0.035em] leading-[1.18] sm:leading-[1.15] text-zinc-950 dark:text-white overflow-visible">
              <span
                className="block pt-3 sm:pt-4 pb-2 px-2 bg-clip-text text-transparent overflow-visible"
                style={highlightTextStyle}
              >
                {activePillar.headline}
              </span>
            </h1>

            {/* Frase Oficial com Tamanho Refinado para Contraste Hierárquico Perfeito */}
            <p className="mt-2 sm:mt-3 text-base sm:text-xl md:text-2xl lg:text-[26px] font-medium tracking-[-0.02em] text-zinc-700 dark:text-zinc-300 max-w-2xl sm:max-w-3xl leading-relaxed text-center">
              {activePillar.subtitle}
            </p>
          </div>

          {/* Os 2 Botões de Conversão: Sempre Fixos e Estáveis no Centro */}
          <div className="mt-8 sm:mt-10 flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full sm:w-auto pointer-events-auto">
            <button
              type="button"
              data-landing-auth
              onClick={() => onOpenAuth('register')}
              style={primaryBtnStyle}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-xl text-sm sm:text-base font-bold transition-all duration-300 ease-out hover:-translate-y-0.5 hover:brightness-110 active:scale-[0.98] cursor-pointer shadow-lg"
            >
              <span>Testar Grátis Agora</span>
              <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-1" />
            </button>

            <button
              type="button"
              onClick={() => onScrollToSection('planos')}
              className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-xl text-sm sm:text-base font-semibold text-zinc-800 dark:text-zinc-200 bg-white/90 dark:bg-zinc-900/80 hover:bg-white dark:hover:bg-zinc-800 border border-zinc-200/90 dark:border-zinc-700/80 transition-all duration-300 cursor-pointer shadow-xs"
            >
              <span>Assinar Agora</span>
            </button>
          </div>

          {/* Em telas menores (mobile/tablet), card compacto de vidro abaixo dos botões para manter o dinamismo sem poluição */}
          <div
            style={slideTransitionStyle}
            className="xl:hidden mt-8 sm:mt-10 flex justify-center w-full px-4 will-change-[opacity,transform,filter]"
          >
            <div className="animate-hippo-card-drift-center flex items-center gap-3.5 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-white/40 dark:bg-zinc-950/35 backdrop-blur-md border border-white/30 dark:border-white/12 shadow-[0_12px_36px_rgba(0,0,0,0.35)] hover:scale-[1.02] transition-all duration-300 max-w-[440px] sm:max-w-[480px]">
              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 border transition-colors duration-500"
                style={{
                  backgroundColor: `${activePillar.glowColor}20`,
                  borderColor: `${activePillar.glowColor}50`,
                  color: activePillar.glowColor
                }}
              >
                <CardIcon className="w-4 h-4 sm:w-5 sm:h-5" />
              </div>
              <span className="text-xs sm:text-[13.5px] font-semibold text-zinc-900/95 dark:text-white/95 leading-snug text-left">
                {activePillar.cardText}
              </span>
            </div>
          </div>
        </div>

        {/* CARD LATERAL DIREITO (Apenas telas grandes xl/2xl, ancorado na extremidade externa sem sobrepor o texto) */}
        <div
          style={slideTransitionStyle}
          className="hidden xl:block absolute right-2 2xl:right-6 top-1/2 -translate-y-1/2 z-10 pointer-events-auto will-change-[opacity,transform,filter]"
        >
          <div className="animate-hippo-card-drift-right">
            {renderLateralRight(displayedIndex)}
          </div>
        </div>
      </div>

      {/* RODAPÉ: Indicador Discreto de Transição (Apenas as 2 setinhas para baixo, sem texto) */}
      <div
        style={{ opacity: containerOpacity }}
        className="relative z-10 flex flex-col items-center mt-auto pb-1 sm:pb-2 transition-opacity"
      >
        <button
          type="button"
          onClick={() => {
            if (embeddedMode) {
              const heroEl = document.getElementById('neuroanatomia');
              if (heroEl) {
                const targetScroll = heroEl.offsetTop + (window.innerHeight || 800) * 1.5;
                window.scrollTo({ top: targetScroll, behavior: 'smooth' });
                return;
              }
            }
            onScrollToSection('neuroanatomia');
          }}
          className="pointer-events-auto group flex flex-col items-center cursor-pointer p-2 focus-visible:outline-none transition-transform hover:scale-110"
          aria-label="Rolar para a animação neuroanatômica do cérebro"
        >
          <ChevronDown className="w-4 h-4 text-zinc-400 dark:text-zinc-500 animate-bounce" />
          <ChevronDown className="w-4 h-4 -mt-2.5 text-zinc-400/60 dark:text-zinc-500/60 animate-bounce [animation-delay:150ms]" />
        </button>
      </div>
    </section>
  );
};

export default LandingIntroSection;
