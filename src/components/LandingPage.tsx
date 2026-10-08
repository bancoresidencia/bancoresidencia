'use client';

import React, { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { ThemeSelector } from '@/components/ThemeSelector';
import {
  Stethoscope,
  Sparkles,
  ArrowRight,
  CheckCircle2,
  BookOpenCheck,
  BarChart3,
  HelpCircle,
  ShieldCheck,
  Check,
  Zap,
  Clock,
  X,
  CreditCard,
  UserCheck
} from 'lucide-react';

export interface PricingPlan {
  id: 'mensal' | 'semestral' | 'anual' | 'bienal';
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
    id: 'mensal',
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
    id: 'semestral',
    name: 'Plano Semestral',
    badge: 'RETA FINAL',
    pricePerMonth: '39,90',
    billingText: 'R$ 239,40 a cada 6 meses',
    periodLabel: 'por mês',
    savings: 'Economize 20%',
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
    id: 'anual',
    name: 'Plano Anual',
    badge: 'MAIS ESCOLHIDO',
    isPopular: true,
    pricePerMonth: '29,90',
    billingText: 'R$ 358,80 por ano (ou 12x de R$ 29,90)',
    periodLabel: 'por mês',
    savings: 'Economize 40%',
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
    id: 'bienal',
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

interface LandingPageProps {
  onOpenAuth: (mode?: 'login' | 'register', planTitle?: string) => void;
  onLoginDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onOpenAuth, onLoginDemo }) => {
  const { accentConfig } = useTheme();
  const [selectedPlanModal, setSelectedPlanModal] = useState<PricingPlan | null>(null);

  const handleSelectPlan = (plan: PricingPlan) => {
    setSelectedPlanModal(plan);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#070b14] text-slate-900 dark:text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white transition-colors duration-200">
      {/* =========================================================================
          BARRA DE NAVEGAÇÃO SUPERIOR
          ========================================================================= */}
      <header className="sticky top-0 z-40 w-full backdrop-blur-md bg-white/85 dark:bg-[#070b14]/85 border-b border-slate-200/80 dark:border-slate-800/80 transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-18 flex items-center justify-between gap-4">
          {/* Logo e Nome */}
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-md transition-transform hover:scale-105 duration-200"
              style={{
                backgroundColor: accentConfig.primaryHex,
                boxShadow: `0 8px 20px -4px ${accentConfig.bgRgba}`
              }}
            >
              <Stethoscope className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">
                  Banco Residência
                </span>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950/70 text-blue-700 dark:text-blue-400 border border-blue-200 dark:border-blue-800">
                  2026
                </span>
              </div>
              <p className="hidden sm:block text-[11px] text-slate-500 dark:text-slate-400 font-medium -mt-0.5">
                Alta Performance & Raciocínio Clínico
              </p>
            </div>
          </div>

          {/* Links Centrais de Navegação */}
          <nav className="hidden md:flex items-center gap-7 text-xs font-bold text-slate-600 dark:text-slate-300">
            <button
              type="button"
              onClick={() => scrollToSection('recursos')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Recursos
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('questoes')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              +130k Questões
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('provas')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Provas Oficiais
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('planos')}
              className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors cursor-pointer"
            >
              Planos
            </button>
          </nav>

          {/* Ações da Direita */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <ThemeSelector compact={true} />

            <button
              type="button"
              onClick={onLoginDemo}
              className="hidden lg:flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
              title="Acessar com perfil de teste do aluno"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Modo Demo</span>
            </button>

            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="px-4 py-2 sm:px-5 sm:py-2.5 rounded-xl text-xs font-extrabold text-white shadow-md transition-all hover:scale-102 cursor-pointer flex items-center gap-2"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <span>Entrar</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* =========================================================================
          HERO SECTION PRINCIPAL (FRASE DE IMPACTO + VISUAL DE ESTUDO)
          ========================================================================= */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-slate-200/80 dark:border-slate-800/80 bg-gradient-to-b from-white via-slate-50 to-slate-100 dark:from-[#090f1d] dark:via-[#070b14] dark:to-[#060911]">
        {/* Glow de fundo */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ backgroundColor: accentConfig.primaryHex }}
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 relative z-10 text-center">
          {/* Badge de Destaque */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-extrabold mb-6 shadow-xs animate-fadeIn">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-blue-400 animate-pulse" />
            <span>Plataforma Oficial de Residência Médica 2026</span>
          </div>

          {/* Frase Principal Exigida */}
          <h1 className="font-heading text-3xl sm:text-5xl md:text-6xl font-black tracking-tight text-slate-900 dark:text-white max-w-4xl mx-auto leading-[1.15]">
            <span className="text-blue-600 dark:text-blue-400">+130.000 questões</span> para estudo de residência médica.
            <span className="block mt-2 sm:mt-3 text-slate-800 dark:text-slate-200">
              Sem distrações, apenas estudo.
            </span>
          </h1>

          {/* Subtítulo Objetivo */}
          <p className="mt-5 sm:mt-6 text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto font-normal leading-relaxed">
            Filtros cirúrgicos, caderno com todas as provas oficiais na íntegra e acompanhamento detalhado de pontos fracos. Tudo o que você precisa para ser aprovado, sem ruídos.
          </p>

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
              onClick={onLoginDemo}
              className="px-6 py-3.5 sm:px-8 sm:py-4 rounded-2xl text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all hover:scale-102 cursor-pointer flex items-center gap-2.5 shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Experimentar Demonstração</span>
            </button>
          </div>

          {/* Faixa de Métricas Essenciais */}
          <div className="mt-12 sm:mt-16 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 max-w-4xl mx-auto">
            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0c1424]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                +130.000
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                Questões no Acervo
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0c1424]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                100%
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                Provas Oficiais na Íntegra
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0c1424]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white font-heading">
                5 Áreas
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                Especialidades & Subfocos
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-white/90 dark:bg-[#0c1424]/90 border border-slate-200/80 dark:border-slate-800/80 shadow-xs text-center">
              <div className="text-xl sm:text-2xl font-black text-emerald-600 dark:text-emerald-400 font-heading">
                0% Ruído
              </div>
              <div className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-0.5">
                Sem Distrações
              </div>
            </div>
          </div>

          {/* Demonstração Visual Simulado: A Interface Limpa de Resolução */}
          <div className="mt-12 sm:mt-14 max-w-3xl mx-auto rounded-3xl bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 p-5 sm:p-7 shadow-2xl text-left relative">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800/80 pb-3 mb-4">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
                <span className="text-[11px] font-bold text-slate-400 ml-2">Ambiente de Resolução Focada</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2.5 py-1 rounded-xl">
                <Clock className="w-3.5 h-3.5" />
                <span>Simulação Real</span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex flex-wrap items-center gap-2 text-[11px]">
                <span className="font-extrabold px-2.5 py-1 rounded-lg bg-blue-600 text-white">ENARE 2025</span>
                <span className="font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">Clínica Médica</span>
                <span className="font-bold px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-500">Cardiologia</span>
              </div>
              <p className="text-xs sm:text-sm font-semibold text-slate-800 dark:text-slate-200 leading-relaxed">
                Homem de 64 anos, com histórico de ICFER (FEVE 32%), comparece à consulta com queixa de dispneia aos moderados esforços. Em uso de Enalapril e Carvedilol em doses otimizadas. Qual a próxima conduta para redução de mortalidade?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-xs">
                <div className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 text-slate-700 dark:text-slate-300">
                  A) Iniciar Digoxina 0,25mg diária
                </div>
                <div className="p-2.5 rounded-xl border border-emerald-500/50 bg-emerald-500/10 text-emerald-800 dark:text-emerald-300 font-bold flex items-center justify-between">
                  <span>B) Associar Espironolactona e iSGLT2</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                </div>
              </div>
              <div className="pt-2 text-[11px] text-slate-500 dark:text-slate-400 flex items-center justify-between">
                <span>✓ Resolução comentada passo a passo disponível</span>
                <span className="font-bold text-slate-600 dark:text-slate-300">92% dos alunos acertaram</span>
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
          <div id="questoes" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
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
          <div id="provas" className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
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
          <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group">
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
      <section id="planos" className="py-16 sm:py-24 border-t border-slate-200/80 dark:border-slate-800/80 bg-white/60 dark:bg-[#080d19]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800/80 text-blue-700 dark:text-blue-300 text-xs font-extrabold mb-3">
              <Zap className="w-3.5 h-3.5" />
              <span>Acesso Imediato a Todas as Funções</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
              Escolha o plano ideal para a sua jornada
            </h2>
            <p className="mt-3 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Sem pegadinhas ou recursos bloqueados: todos os planos incluem 100% das funções da plataforma.
            </p>
          </div>

          {/* Grid com os 4 Planos */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {PRICING_PLANS.map((plan) => {
              const isAnual = plan.id === 'anual';
              const isBienal = plan.id === 'bienal';

              return (
                <div
                  key={plan.id}
                  className={`relative rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all duration-300 ${
                    isAnual
                      ? 'bg-white dark:bg-[#0d1629] border-2 border-blue-500 shadow-xl shadow-blue-500/10 lg:-translate-y-2'
                      : isBienal
                      ? 'bg-white dark:bg-[#0c1424] border-2 border-emerald-500/80 shadow-lg shadow-emerald-500/5'
                      : 'bg-white dark:bg-[#0c1424] border border-slate-200/90 dark:border-slate-800/80 shadow-md hover:shadow-lg'
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
                      onClick={() => handleSelectPlan(plan)}
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
              onClick={onLoginDemo}
              className="shrink-0 px-4 py-2.5 rounded-xl text-xs font-extrabold text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 cursor-pointer flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>Testar na Demonstração</span>
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
                onClick={onLoginDemo}
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
      <footer className="border-t border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#060911] py-8 text-xs text-slate-500 dark:text-slate-400 mt-auto transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-white text-xs font-bold"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Stethoscope className="w-4 h-4" />
            </div>
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200">Banco Residência Médica 2026</span>
              <span className="block text-[11px] text-slate-400">
                +130.000 Questões • Provas Oficiais • Sem Distrações
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold">
            <button
              type="button"
              onClick={() => onOpenAuth('login')}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Área do Aluno
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={() => scrollToSection('planos')}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Planos & Preços
            </button>
            <span>•</span>
            <button
              type="button"
              onClick={onLoginDemo}
              className="hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer"
            >
              Acesso Demo
            </button>
          </div>
        </div>
      </footer>

      {/* =========================================================================
          MODAL DE ASSINATURA / INTENÇÃO DE PLANO (ESTRUTURA PARA MERCADO PAGO)
          ========================================================================= */}
      {selectedPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="w-full max-w-md bg-white dark:bg-[#0c1424] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 sm:p-7 relative space-y-5 animate-in fade-in zoom-in-95 duration-150">
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
                  onOpenAuth('register', selectedPlanModal.name);
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
                  onOpenAuth('login', selectedPlanModal.name);
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
                    onLoginDemo();
                  }}
                  className="text-[11px] font-bold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 underline cursor-pointer"
                >
                  Ou experimentar agora no Modo Demo gratuito
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
