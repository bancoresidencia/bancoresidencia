'use client';

import React, { useState } from 'react';
import {
  FileSpreadsheet,
  BarChart3,
  Layers,
  CalendarClock,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useScrollReveal } from './useScrollReveal';
import { getLandingHighlightTextStyle } from './landingThemeHelpers';

type AdditionalFeatureId = 'provas' | 'tri' | 'caderno_erros' | 'google_agenda';

interface FeaturePillar {
  id: AdditionalFeatureId;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  previewTitle: string;
  metric1: { label: string; value: string; sub: string; highlight?: boolean };
  metric2: { label: string; value: string; sub: string };
  metric3: { label: string; value: string; sub: string };
  description: string;
  checkmarks: string[];
}

const FEATURE_PILLARS: FeaturePillar[] = [
  {
    id: 'provas',
    badge: 'CADERNOS OFICIAIS',
    title: 'Provas na Íntegra com Cronômetro Real',
    subtitle: 'Treine com os cadernos originais completos do ENARE, USP, UNICAMP e +120 bancas no tempo oficial.',
    icon: FileSpreadsheet,
    previewTitle: 'Provas Oficiais na Íntegra & Simulação de Prova',
    metric1: {
      label: 'Bancas Auditadas',
      value: '+120',
      sub: 'Cadernos de 2018 a 2026',
      highlight: true
    },
    metric2: {
      label: 'Cronômetro Oficial',
      value: '100%',
      sub: 'Ritmo real por questão'
    },
    metric3: {
      label: 'Gabarito e Recursos',
      value: 'Oficial',
      sub: 'Anuladas e gabarito final'
    },
    description:
      'Simule a pressão real do dia da prova: cadernos diagramados na ordem exata da banca examinadora, com cronômetro regressivo oficial e bloqueio de consulta para calibrar sua velocidade média por questão.',
    checkmarks: [
      'Provas completas de R1 (Acesso Direto), Revalida e R+ (Especialidades)',
      'Cronômetro oficial sincronizado com alerta de tempo para cartão-resposta',
      'Correção automática com pontuação bruta e calibração instantânea na TRI'
    ]
  },
  {
    id: 'tri',
    badge: 'PSICOMETRIA CALIBRADA',
    title: 'Nota TRI & Percentil em Tempo Real',
    subtitle: 'Não conte apenas acertos brutos: saiba sua posição calibrada pela dificuldade de cada item.',
    icon: BarChart3,
    previewTitle: 'Nota TRI & Percentil em Tempo Real',
    metric1: {
      label: 'Nota TRI Estimada',
      value: '784,6',
      sub: '+42 pts em 30 dias',
      highlight: true
    },
    metric2: {
      label: 'Percentil Nacional',
      value: 'P86 • Ouro',
      sub: 'Top 14% da especialidade'
    },
    metric3: {
      label: 'Coerência Pedagógica',
      value: '96%',
      sub: 'Zero perda em questões fáceis'
    },
    description:
      'O motor psicométrico do Hippocampus pondera discriminação, dificuldade e acerto ao acaso: errar uma questão fácil cobrada por 85% dos candidatos impacta mais sua nota TRI do que um item raro de subespecialidade.',
    checkmarks: [
      'Modelo psicométrico TRI alinhado ao ENARE e Revalida INEP',
      'Comparação direta com notas de corte por especialidade',
      'Diagnóstico automático de temas com maior retorno de pontos'
    ]
  },
  {
    id: 'caderno_erros',
    badge: 'REMEDIAÇÃO SEMÂNTICA',
    title: 'Caderno de Erros Automático',
    subtitle: 'Cada questão errada vira diagnóstico clínico e destrava flashcards cirúrgicos do conceito vulnerável.',
    icon: Layers,
    previewTitle: 'Remediação Semântica do Caderno de Erros',
    metric1: {
      label: 'Erros Mapeados',
      value: '142',
      sub: 'Especialidade → Tema → Foco',
      highlight: true
    },
    metric2: {
      label: 'Conceitos Curados',
      value: '89%',
      sub: 'Flashcards FSRS vinculados'
    },
    metric3: {
      label: 'Reteste Automático',
      value: '3x',
      sub: 'Sessões espaçadas de fixação'
    },
    description:
      'Ao errar uma questão, nosso sistema classifica a causa raiz (lacuna conceitual, desatenção ou interpretação de enunciado) e injeta automaticamente um flashcard do conceito na sua fila de repetição espaçada.',
    checkmarks: [
      'Agrupamento automático por Especialidade, Tema e Subfoco clínico',
      'Filtro exclusivo para retestar apenas questões que você errou anteriormente',
      'Histórico de tentativas para acompanhar a consolidação do domínio'
    ]
  },
  {
    id: 'google_agenda',
    badge: 'ROTINA DE INTERNATO',
    title: 'Sincronização com Google Agenda',
    subtitle: 'Encaixe blocos inteligentes de revisão e metas diárias nos intervalos reais dos seus plantões.',
    icon: CalendarClock,
    previewTitle: 'Google Agenda & Planejamento Adaptativo',
    metric1: {
      label: 'Blocos Diários',
      value: '45 min',
      sub: 'Intervalos entre plantões',
      highlight: true
    },
    metric2: {
      label: 'Metas Inteligentes',
      value: 'Dinâmicas',
      sub: 'Ajuste conforme sua escala'
    },
    metric3: {
      label: 'Sincronização',
      value: '2 Vias',
      sub: 'Google Calendar & Celular'
    },
    description:
      'O estudante de medicina e interno não tem rotina fixa. O Hippocampus se conecta ao seu Google Agenda, detecta seus horários livres e gera blocos cirúrgicos de questões e flashcards sem sobrecarregar sua rotina hospitalar.',
    checkmarks: [
      'Integração nativa com Google Calendar para desktop e celular',
      'Notificações de lembrete com links diretos para a sessão do dia',
      'Reagendamento automático de metas quando ocorrer um imprevisto de plantão'
    ]
  }
];

export interface LandingEcosystemShowcaseProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingEcosystemShowcase: React.FC<LandingEcosystemShowcaseProps> = ({ onOpenAuth }) => {
  const { accent, mode, accentConfig } = useTheme();
  const isMonochrome = accent === 'neutral';

  const highlightTextStyle = getLandingHighlightTextStyle(accentConfig, mode, isMonochrome);

  const { ref, isVisible, isExiting } = useScrollReveal<HTMLDivElement>(0.1);
  // Default no TRI como na Imagem 2
  const [activeTab, setActiveTab] = useState<AdditionalFeatureId>('tri');

  const activePillar = FEATURE_PILLARS.find((p) => p.id === activeTab) || FEATURE_PILLARS[1];

  return (
    <section
      id="recursos-adicionais"
      className="relative scroll-mt-20 pt-12 sm:pt-16 pb-8 sm:pb-12 bg-transparent text-[var(--foreground,#09090b)] dark:text-[var(--foreground,#f4f4f5)] transition-colors duration-200"
    >
      {/* Iluminação Ambiente Atrás da Dobra (Zero Linhas / Divisórias) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] sm:w-[950px] h-72 opacity-25 dark:opacity-15 blur-3xl rounded-full"
        style={{
          background: `radial-gradient(ellipse at center, ${accentConfig.primaryHex} 0%, transparent 70%)`
        }}
      />
      <div ref={ref} className={`max-w-7xl mx-auto px-4 sm:px-6 space-y-10 fold-reveal ${isVisible ? 'is-visible' : ''} ${isExiting ? 'is-exiting' : ''}`}>
        {/* Cabeçalho da Seção Padronizado */}
        <div className="max-w-3xl">
          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-tight text-zinc-950 dark:text-white leading-[1.1]">
            Engenharia avançada para maximizar{' '}
            <span
              className="bg-clip-text text-transparent animate-hippo-text-sweep opacity-95"
              style={highlightTextStyle}
            >
              cada minuto do seu estudo.
            </span>
          </h2>
        </div>

        {/* =========================================================================
            GRID SINCRONIZADO EXATAMENTE COMO NA IMAGEM 2:
            - Menu à Esquerda com os 4 Pilares
            - Palco Interativo à Direita com as 3 Métricas, Descrição e Checkmarks
            ========================================================================= */}
        <div className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch fold-reveal fold-delay-1 ${isVisible ? 'is-visible' : ''}`}>
          {/* Coluna Esquerda: 4 Pilares Selecionáveis (Fiel à Imagem 2) */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {FEATURE_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const isSelected = pillar.id === activeTab;

              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActiveTab(pillar.id)}
                  className={`relative overflow-hidden w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-4 ${
                    isSelected
                      ? 'bg-white dark:bg-[#121217] shadow-xl scale-[1.01]'
                      : 'bg-zinc-50/70 dark:bg-[#0d0d12] border-zinc-200/90 dark:border-zinc-800/80 hover:border-zinc-400 dark:hover:border-zinc-700 opacity-85 hover:opacity-100'
                  }`}
                  style={isSelected ? { borderColor: accentConfig.primaryHex } : undefined}
                >
                  {isSelected && (
                    <div
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-6 top-0 h-0.5 rounded-full"
                      style={{
                        background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`,
                        opacity: 0.65
                      }}
                    />
                  )}
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors"
                    style={
                      isSelected
                        ? {
                            backgroundColor: accentConfig.primaryHex,
                            color: accentConfig.primaryContrastHex
                          }
                        : undefined
                    }
                  >
                    <Icon className={`w-5 h-5 ${!isSelected ? 'text-zinc-500 dark:text-zinc-400' : ''}`} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {pillar.badge}
                      </span>
                    </div>

                    <h3 className="text-sm sm:text-base font-black text-zinc-950 dark:text-white mt-1 leading-snug">
                      {pillar.title}
                    </h3>

                    <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 leading-relaxed line-clamp-2">
                      {pillar.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Coluna Direita: O Palco Interativo da Imagem 2 */}
          <div className="lg:col-span-7 flex flex-col">
            <div className="relative overflow-hidden flex-1 rounded-3xl bg-white/94 dark:bg-zinc-950/94 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 p-6 sm:p-8 flex flex-col justify-between space-y-6 shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)]">
              {/* Friso luminoso sutil no topo (Laser Rim) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-0 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`,
                  opacity: 0.55
                }}
              />
              <div>
                {/* Header Superior da Prévia */}
                <div className="space-y-1 pb-4 border-b border-zinc-200/80 dark:border-zinc-800/80">
                  <div className="text-[10px] font-black uppercase tracking-wider text-zinc-500">
                    PRÉVIA INTERATIVA DO MÓDULO
                  </div>
                  <h3 className="text-xl sm:text-2xl font-black text-zinc-950 dark:text-white">
                    {activePillar.previewTitle}
                  </h3>
                </div>

                {/* 3 Métricas em Cards (Identificadas como na Imagem 2) */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 my-6">
                  {/* Métrica 1 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#14141a] border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs">
                    <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                      {activePillar.metric1.label}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-zinc-950 dark:text-white mt-1.5 tabular-nums">
                      {activePillar.metric1.value}
                    </div>
                    <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                      {activePillar.metric1.sub}
                    </div>
                  </div>

                  {/* Métrica 2 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#14141a] border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs">
                    <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                      {activePillar.metric2.label}
                    </div>
                    <div className="text-2xl sm:text-3xl font-black text-amber-600 dark:text-amber-400 mt-1.5 tabular-nums">
                      {activePillar.metric2.value}
                    </div>
                    <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                      {activePillar.metric2.sub}
                    </div>
                  </div>

                  {/* Métrica 3 */}
                  <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-[#14141a] border border-zinc-200/90 dark:border-zinc-800/90 shadow-2xs">
                    <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                      {activePillar.metric3.label}
                    </div>
                    <div
                      className="text-2xl sm:text-3xl font-black mt-1.5 tabular-nums"
                      style={{ color: accentConfig.primaryHex }}
                    >
                      {activePillar.metric3.value}
                    </div>
                    <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 mt-1">
                      {activePillar.metric3.sub}
                    </div>
                  </div>
                </div>

                {/* Texto Explicativo em Caixa Confortável */}
                <p className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed p-4 rounded-2xl bg-zinc-50/80 dark:bg-[#121218] border border-zinc-200/80 dark:border-zinc-800/80">
                  {activePillar.description}
                </p>

                {/* 3 Checkmarks Verdes */}
                <div className="space-y-2.5 mt-5">
                  {activePillar.checkmarks.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                      <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Botão de Ação CTA (Fiel à Imagem 2 adaptado ao tema) */}
              <div className="pt-4 flex justify-end">
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-6 py-3 rounded-xl font-extrabold text-xs sm:text-sm flex items-center gap-2 cursor-pointer shadow-lg transition-all hover:scale-[1.02] hover:opacity-95"
                  style={{
                    backgroundColor: accentConfig.primaryHex,
                    color: accentConfig.primaryContrastHex
                  }}
                >
                  <span>Experimentar na Prática</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default LandingEcosystemShowcase;
