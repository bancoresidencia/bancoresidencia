'use client';

import React, { useState } from 'react';
import {
  FileCheck2,
  BarChart3,
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Layers,
  Clock
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useScrollReveal } from './useScrollReveal';

type EcosystemTabId = 'resumos' | 'tri' | 'caderno_erros' | 'simulados_agenda';

interface EcosystemPillar {
  id: EcosystemTabId;
  badge: string;
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  highlights: string[];
}

const ECOSYSTEM_PILLARS: EcosystemPillar[] = [
  {
    id: 'resumos',
    badge: 'Engenharia Reversa',
    title: 'Resumos com Raio-X de Bancas',
    subtitle: 'Veja exatamente o peso de cada subfoco na sua prova alvo antes de estudar a diretriz.',
    icon: FileCheck2,
    highlights: [
      'Incidência percentual real por banca (ENARE, USP-SP, SUS-SP, AMRIGS)',
      'Algoritmos visuais de conduta de 1ª linha e armadilhas clássicas',
      'Grifos sincronizados e tabelas de diagnóstico diferencial'
    ]
  },
  {
    id: 'tri',
    badge: 'Psicometria Calibrada',
    title: 'Nota TRI & Percentil em Tempo Real',
    subtitle: 'Não conte apenas acertos brutos: saiba sua posição calibrada pela dificuldade de cada item.',
    icon: BarChart3,
    highlights: [
      'Modelo psicométrico TRI alinhado ao ENARE e Revalida INEP',
      'Comparação direta com notas de corte por especialidade',
      'Diagnóstico automático de temas com maior retorno de pontos'
    ]
  },
  {
    id: 'caderno_erros',
    badge: 'Remediação Semântica',
    title: 'Caderno de Erros Automático',
    subtitle: 'Cada questão errada vira diagnóstico clínico e destrava flashcards cirúrgicos do conceito vulnerável.',
    icon: Layers,
    highlights: [
      'Captura automática por Especialidade → Tema → Foco → Subfoco',
      'Classificação da causa do erro (lacuna teórica, atenção ou interpretação)',
      'Sessões de reteste espaçado até consolidar o domínio'
    ]
  },
  {
    id: 'simulados_agenda',
    badge: 'Rotina de Internato',
    title: 'Provas na Íntegra & Google Agenda',
    subtitle: 'Treine com cronômetro oficial e encaixe blocos de revisão nos intervalos reais dos seus plantões.',
    icon: CalendarClock,
    highlights: [
      'Cadernos originais completos das bancas (2018 a 2026)',
      'Integração com Google Calendar respeitando horários de hospital',
      'Metas diárias dinâmicas de questões e tempo líquido'
    ]
  }
];

const BANCA_RAIOX_SAMPLES: Record<string, { top1: string; pct1: number; top2: string; pct2: number; top3: string; pct3: number }> = {
  ENARE: { top1: ' Manejo de SCA sem Supra (IAMSSST)', pct1: 42, top2: 'Terapia Trombolítica vs ICP Primária', pct2: 35, top3: 'Complicações Mecânicas Pós-IAM', pct3: 23 },
  'USP-SP': { top1: 'Choque Cardiogênico e Infarto de VD', pct1: 46, top2: 'Estratificação GRACE / TIMI', pct2: 31, top3: 'Antiagregação Dupla e Anticoagulação', pct3: 23 },
  'SUS-SP': { top1: 'ECG no Supra de ST (Parede/Artéria)', pct1: 48, top2: 'Contraindicações à Fibrinólise', pct2: 32, top3: 'Profilaxia Secundária Pós-Alta', pct3: 20 }
};

interface LandingEcosystemShowcaseProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingEcosystemShowcase: React.FC<LandingEcosystemShowcaseProps> = ({ onOpenAuth }) => {
  const { accentConfig } = useTheme();
  const { ref, isVisible } = useScrollReveal<HTMLDivElement>(0.1);
  const [activeTab, setActiveTab] = useState<EcosystemTabId>('resumos');
  const [selectedBancaRaioX, setSelectedBancaRaioX] = useState<'ENARE' | 'USP-SP' | 'SUS-SP'>('ENARE');

  const activePillar = ECOSYSTEM_PILLARS.find((p) => p.id === activeTab) || ECOSYSTEM_PILLARS[0];
  const raioXData = BANCA_RAIOX_SAMPLES[selectedBancaRaioX];

  return (
    <section
      id="material-estudo"
      className="scroll-mt-20 py-18 sm:py-24 border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-100/60 dark:bg-[#09090b]"
    >
      <div ref={ref} className={`max-w-7xl mx-auto px-4 sm:px-6 reveal-up ${isVisible ? 'is-visible' : ''}`}>
        {/* Cabeçalho da Seção */}
        <div className="max-w-3xl mb-10 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-500 shrink-0" />
            <span>Ecossistema Clínico Integrado</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-[42px] font-black tracking-[-0.035em] text-zinc-950 dark:text-white leading-[1.08]">
            Muito além de um banco de questões: engenharia completa de estudo ativo.
          </h2>
          <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 leading-relaxed">
            Alterne entre os módulos abaixo e veja como cada questão resolvida alimenta seus resumos, métricas TRI e revisões automáticas.
          </p>
        </div>

        {/* Grid Sincronizado (Inspiração SquadEasy: Seletor Interativo à Esquerda + Palco Vivo à Direita) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch">
          {/* Coluna Esquerda: 4 Pilares Selecionáveis */}
          <div className="lg:col-span-5 flex flex-col gap-3">
            {ECOSYSTEM_PILLARS.map((pillar) => {
              const Icon = pillar.icon;
              const isSelected = pillar.id === activeTab;

              return (
                <button
                  key={pillar.id}
                  type="button"
                  onClick={() => setActiveTab(pillar.id)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all duration-200 cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'bg-white dark:bg-[#141418] border-zinc-900/20 dark:border-zinc-600 shadow-lg scale-[1.01]'
                      : 'bg-white/60 dark:bg-[#121215]/60 border-zinc-200/80 dark:border-zinc-800/80 hover:bg-white dark:hover:bg-[#121215] opacity-85 hover:opacity-100'
                  }`}
                >
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
                    <Icon
                      className={`w-5 h-5 ${
                        isSelected ? '' : 'text-zinc-600 dark:text-zinc-400'
                      }`}
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                        {pillar.badge}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400">
                          Visualizando →
                        </span>
                      )}
                    </div>
                    <h3 className="text-sm sm:text-base font-extrabold text-zinc-950 dark:text-white mt-0.5 leading-snug">
                      {pillar.title}
                    </h3>
                    <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed mt-1">
                      {pillar.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Coluna Direita: Palco Interativo da Interface Real */}
          <div className="lg:col-span-7 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/90 dark:border-zinc-800 shadow-xl p-5 sm:p-7 flex flex-col justify-between">
            <div>
              {/* Topo do Palco */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Prévia Interativa do Módulo
                  </span>
                  <h4 className="text-base sm:text-lg font-extrabold text-zinc-950 dark:text-white">
                    {activePillar.title}
                  </h4>
                </div>

                {activeTab === 'resumos' && (
                  <div className="flex items-center gap-1 p-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
                    {(['ENARE', 'USP-SP', 'SUS-SP'] as const).map((b) => (
                      <button
                        key={b}
                        type="button"
                        onClick={() => setSelectedBancaRaioX(b)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                          selectedBancaRaioX === b
                            ? 'shadow-xs'
                            : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                        style={
                          selectedBancaRaioX === b
                            ? {
                                backgroundColor: accentConfig.primaryHex,
                                color: accentConfig.primaryContrastHex
                              }
                            : undefined
                        }
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Conteúdo Específico de Cada Aba */}
              <div className="py-5">
                {activeTab === 'resumos' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200/80 dark:border-zinc-800 space-y-3">
                      <div className="flex items-center justify-between text-xs font-bold text-zinc-900 dark:text-white">
                        <span>Raio-X de Recorrência: Síndrome Coronariana Aguda</span>
                        <span className="text-emerald-600 dark:text-emerald-400 tabular-nums">
                          Filtro: {selectedBancaRaioX}
                        </span>
                      </div>
                      {[
                        { label: raioXData.top1, pct: raioXData.pct1 },
                        { label: raioXData.top2, pct: raioXData.pct2 },
                        { label: raioXData.top3, pct: raioXData.pct3 }
                      ].map((row) => (
                        <div key={row.label} className="space-y-1">
                          <div className="flex justify-between text-xs">
                            <span className="font-semibold text-zinc-700 dark:text-zinc-300">{row.label}</span>
                            <span className="font-extrabold text-zinc-950 dark:text-white tabular-nums">{row.pct}%</span>
                          </div>
                          <div className="h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                            <div
                              className="h-full rounded-full transition-all duration-300"
                              style={{ width: `${row.pct}%`, backgroundColor: accentConfig.primaryHex }}
                            />
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/25 flex items-start gap-2.5 text-xs text-zinc-800 dark:text-zinc-200">
                      <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <strong className="font-bold">Armadilha de Prova ({selectedBancaRaioX}):</strong> No IAM de ventrículo direito (supra em V3R/V4R), nitratos e morfina são formalmente contraindicados pelo risco de colapso da pré-carga.
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'tri' && (
                  <div className="space-y-4 animate-in fade-in duration-200">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Nota TRI Estimada</div>
                        <div className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums mt-1">784,6</div>
                        <div className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                          <TrendingUp className="w-3.5 h-3.5" />
                          <span>+42 pts em 30 dias</span>
                        </div>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Percentil Nacional</div>
                        <div className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums mt-1">P86 • Ouro</div>
                        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">Top 14% da especialidade</div>
                      </div>
                      <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400">Coerência Pedagógica</div>
                        <div className="text-2xl font-black text-zinc-950 dark:text-white tabular-nums mt-1">96%</div>
                        <div className="text-[11px] text-zinc-600 dark:text-zinc-400 mt-1">Zero perda em questões fáceis</div>
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed">
                      O motor psicométrico do Hippocampus pondera <strong>discriminação, dificuldade e acerto ao acaso</strong>: errar uma questão fácil cobrada por 85% dos candidatos impacta mais sua nota TRI do que um item raro de subespecialidade.
                    </div>
                  </div>
                )}

                {activeTab === 'caderno_erros' && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25 space-y-1.5">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-rose-700 dark:text-rose-300">
                        1. Vulnerabilidade Detectada no Simulado
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white">
                        Obstetrícia → Síndromes Hipertensivas → Intoxicação por Sulfato de Magnésio
                      </div>
                    </div>

                    <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25 space-y-2">
                      <div className="text-[11px] font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-300">
                        2. Prescrição Automática de Remediação
                      </div>
                      <div className="text-xs text-zinc-800 dark:text-zinc-200 leading-relaxed">
                        3 flashcards Cloze desbloqueados para hoje (<em>Abolição do reflexo patelar → suspender MgSO₄ e administrar Gluconato de Cálcio 1g IV</em>) + reteste agendado em 72h.
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'simulados_agenda' && (
                  <div className="space-y-3.5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-zinc-700 dark:text-zinc-300 shrink-0" />
                        <div>
                          <div className="text-xs font-bold text-zinc-950 dark:text-white">
                            Prova Oficial USP-SP 2026 • Acesso Direto (120 questões)
                          </div>
                          <div className="text-[11px] text-zinc-600 dark:text-zinc-400">
                            Modo Simulado Real • Cronômetro regressivo e folha de gabarito
                          </div>
                        </div>
                      </div>
                      <span className="text-xs font-mono font-bold px-2.5 py-1 rounded-lg bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-900 dark:text-zinc-100 tabular-nums">
                        04:12:38
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/70 border border-zinc-200 dark:border-zinc-800">
                        <div className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">07:00 – 13:00 (Google Agenda)</div>
                        <div className="font-bold text-zinc-900 dark:text-white mt-0.5">Rodízio Internato • Clínica Cirúrgica</div>
                      </div>
                      <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                        <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300">19:30 – 21:00 (Bloco Sugerido)</div>
                        <div className="font-bold text-zinc-950 dark:text-white mt-0.5">35 Questões + 20 Flashcards FSRS</div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Rodapé do Palco: Bullets + CTA */}
            <div className="pt-4 border-t border-zinc-200/80 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1.5">
                {activePillar.highlights.map((item) => (
                  <div key={item} className="flex items-center gap-2 text-xs text-zinc-700 dark:text-zinc-300 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>{item}</span>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => onOpenAuth('register')}
                className="shrink-0 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all hover:opacity-95 cursor-pointer"
                style={{
                  backgroundColor: accentConfig.primaryHex,
                  color: accentConfig.primaryContrastHex
                }}
              >
                <span>Experimentar na Prática</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
