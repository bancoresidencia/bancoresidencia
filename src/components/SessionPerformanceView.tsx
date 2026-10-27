'use client';

import React, { useState, useMemo, useEffect } from 'react';
import {
  Trophy,
  SlidersHorizontal,
  RotateCcw,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Sparkles,
  X,
  ChevronRight,
  ArrowRight,
  BookOpen,
  Baby,
  HeartPulse,
  Stethoscope,
  Activity,
  ShieldAlert,
  Layers,
  HelpCircle,
  Check
} from 'lucide-react';
import { Question } from '@/types';
import { useTheme } from '@/context/ThemeContext';

export interface SessionPerformanceViewProps {
  questions: Question[];
  userAnswers: Record<string, { selectedOption: string; isCorrect: boolean }>;
  onReturnToFilters: () => void;
  onReviewAll: () => void;
  onNavigateToQuestion: (questionId: string) => void;
}

export interface TemaPerformance {
  tema: string;
  specialty: string;
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
  accuracyRate: number;
  focos: string[];
  questions: Question[];
  errorQuestions: Question[];
  recommendation: string;
}

export interface SpecialtyPerformance {
  specialty: string;
  total: number;
  answered: number;
  correct: number;
  incorrect: number;
  accuracyRate: number;
  temas: TemaPerformance[];
}

// Ícone semântico por grande área / especialidade médica
const getSpecialtyIcon = (specialty: string) => {
  const s = (specialty || '').toLowerCase();
  if (s.includes('pediatria')) return Baby;
  if (s.includes('cirurgia')) return HeartPulse;
  if (s.includes('ginecologia') || s.includes('obstetrícia')) return Activity;
  if (s.includes('preventiva') || s.includes('saúde pública') || s.includes('coletiva') || s.includes('epidemiologia')) {
    return ShieldAlert;
  }
  return Stethoscope;
};

// Gerador de recomendação clínica objetiva e padrão-ouro
const generateClinicalRecommendation = (specialty: string, tema: string): string => {
  const s = (specialty || '').toLowerCase();
  const t = (tema || '').toLowerCase();

  if (s.includes('ginecologia')) {
    if (t.includes('colo') || t.includes('hpv') || t.includes('neoplasia') || t.includes('fundamentos')) {
      return 'Revisar diretrizes do Ministério da Saúde para rastreio de câncer de colo de útero (condutas em LIEBG, LIEAG e ASC-US) e vacinação contra HPV.';
    }
    if (t.includes('mama')) {
      return 'Focar na classificação BI-RADS (conduta em 3 vs 4) e rastreamento mamográfico oficial (50 a 69 anos bienal).';
    }
    if (t.includes('sangramento') || t.includes('sua') || t.includes('mioma')) {
      return 'Dominar a classificação PALM-COEIN para sangramento uterino anormal e indicações de tratamento clínico vs cirúrgico.';
    }
    return 'Revisar critérios diagnósticos e condutas de primeira linha em ginecologia ambulatorial e de urgência.';
  }

  if (s.includes('obstetrícia')) {
    if (t.includes('hipertens') || t.includes('eclâmpsia') || t.includes('pré-eclâmpsia')) {
      return 'Focar no esquema de sulfatação de magnésio (Pritchard vs Zuspan) e metas de PA aguda com hidralazina ou labetalol.';
    }
    if (t.includes('hemorragia') || t.includes('descolamento') || t.includes('placenta')) {
      return 'Diferenciar DPP (dor súbita, hipertonia, sofrimento fetal) de Placenta Prévia (sangramento indolor, tônus normal).';
    }
    return 'Revisar condutas em vitalidade fetal (cardiotocografia, PBF) e assistência ao parto com base nos protocolos do MS.';
  }

  if (s.includes('cirurgia')) {
    if (t.includes('abdome') || t.includes('apendicite') || t.includes('colecistite')) {
      return 'Rever escores clínicos (Alvarado), anatomia do trígono de Calot e critérios de indicação cirúrgica imediata.';
    }
    if (t.includes('hérnia') || t.includes('parede')) {
      return 'Revisar a anatomia do trígono de Hesselbach (hérnia direta vs indireta) e técnicas de Lichtenstein vs laparoscopia.';
    }
    if (t.includes('trauma') || t.includes('atls')) {
      return 'Fixar a sequência do ATLS (ABCDE), indicação de toracocentese/drenagem em pneumotórax hipertensivo e e-FAST.';
    }
    return 'Revisar avaliação pré-operatória, profilaxia antimicrobiana e conduta em abdome agudo cirúrgico.';
  }

  if (s.includes('pediatria')) {
    if (t.includes('desidratação') || t.includes('diarreia')) {
      return 'Dominar os Planos A, B (TRO na UBS) e C (expansão venosa com SF 0,9% ou Ringer) e uso de Zinco oral.';
    }
    if (t.includes('imunização') || t.includes('vacina') || t.includes('pni')) {
      return 'Revisar o calendário vacinal do PNI (doses de 2, 4 e 6 meses: Penta, VIP e Rotavírus; reforços aos 15 meses).';
    }
    if (t.includes('respirat') || t.includes('pneumonia') || t.includes('bronquiolite')) {
      return 'Fixar critérios de taquipneia por faixa etária da OMS e antibioticoterapia ambulatorial (Amoxicilina 50mg/kg/dia).';
    }
    return 'Priorizar marcos do desenvolvimento infantil (Denver II), triagem neonatal e manejo de infecções prevalentes na infância.';
  }

  if (s.includes('preventiva') || s.includes('saúde pública') || s.includes('coletiva')) {
    if (t.includes('estudo') || t.includes('epidemiolog') || t.includes('bioestat')) {
      return 'Revisar medidas de associação (Risco Relativo em coorte vs Odds Ratio em caso-controle) e vieses de seleção e aferição.';
    }
    if (t.includes('sus') || t.includes('legislação')) {
      return 'Fixar princípios doutrinários (Universalidade, Equidade, Integralidade) e as Leis 8.080/90 e 8.142/90.';
    }
    return 'Dominar vigilância em saúde, notificação compulsória imediata e testes diagnósticos (sensibilidade, especificidade e VPP/VPN).';
  }

  if (s.includes('clínica')) {
    if (t.includes('cardio') || t.includes('hipertens') || t.includes('iam')) {
      return 'Revisar delta T do ECG no IAM com supra de ST, tempo porta-balão (<90 min) e estratificação de risco na IC.';
    }
    if (t.includes('endocrino') || t.includes('diabetes') || t.includes('cetoacidose')) {
      return 'Fixar critérios de CAD (glicemia >250, pH <7.3, HCO3 <15, cetonemia) e reposição de potássio antes da insulina se K <3.3.';
    }
    if (t.includes('nefro') || t.includes('ira') || t.includes('distúrbio')) {
      return 'Dominar indicações de diálise de urgência (mnemônico AEIOU) e conduta em hipercalemia com gluconato de cálcio.';
    }
    return 'Revisar critérios diagnósticos e fluxogramas terapêuticos de primeira escolha segundo as diretrizes de Clínica Médica.';
  }

  return `Aprofundar nos critérios diagnósticos e condutas de primeira linha em ${tema || specialty}, focando nas armadilhas de banca.`;
};

export const SessionPerformanceView: React.FC<SessionPerformanceViewProps> = ({
  questions,
  userAnswers,
  onReturnToFilters,
  onReviewAll,
  onNavigateToQuestion
}) => {
  const { accentConfig } = useTheme();

  // Estado do Drawer lateral
  const [selectedSpecialty, setSelectedSpecialty] = useState<SpecialtyPerformance | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState<boolean>(false);
  const [drawerThemeFilter, setDrawerThemeFilter] = useState<'all' | 'errors' | 'perfect'>('all');

  // Fechar drawer com tecla Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isDrawerOpen) {
        setIsDrawerOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDrawerOpen]);

  // Cálculos gerais da sessão
  const {
    totalQuestions,
    answeredCount,
    correctCount,
    incorrectCount,
    accuracyRate,
    specialtiesList
  } = useMemo(() => {
    const total = questions.length;
    const answered = questions.filter((q) => userAnswers[q.id]);
    const correct = answered.filter((q) => userAnswers[q.id]?.isCorrect);
    const incorrect = answered.filter(
      (q) => !userAnswers[q.id]?.isCorrect && !q.isAnulada && q.correctAnswer !== 'ANULADA'
    );

    const answeredTotal = answered.length;
    const correctTotal = correct.length;
    const incorrectTotal = incorrect.length;
    const accuracy = answeredTotal > 0 ? Math.round((correctTotal / answeredTotal) * 100) : 0;

    // Agrupamento por especialidade e por tema
    const specialtyMap = new Map<
      string,
      {
        specialty: string;
        total: number;
        answered: number;
        correct: number;
        incorrect: number;
        temasMap: Map<
          string,
          {
            tema: string;
            specialty: string;
            total: number;
            answered: number;
            correct: number;
            incorrect: number;
            focosSet: Set<string>;
            questions: Question[];
            errorQuestions: Question[];
          }
        >;
      }
    >();

    questions.forEach((q) => {
      const espName = q.especialidade || 'Geral';
      const temaName = q.tema || 'Tópicos Gerais';

      if (!specialtyMap.has(espName)) {
        specialtyMap.set(espName, {
          specialty: espName,
          total: 0,
          answered: 0,
          correct: 0,
          incorrect: 0,
          temasMap: new Map()
        });
      }

      const espData = specialtyMap.get(espName)!;
      espData.total++;

      if (!espData.temasMap.has(temaName)) {
        espData.temasMap.set(temaName, {
          tema: temaName,
          specialty: espName,
          total: 0,
          answered: 0,
          correct: 0,
          incorrect: 0,
          focosSet: new Set(),
          questions: [],
          errorQuestions: []
        });
      }

      const temaData = espData.temasMap.get(temaName)!;
      temaData.total++;
      temaData.questions.push(q);

      const ans = userAnswers[q.id];
      if (ans) {
        espData.answered++;
        temaData.answered++;
        if (ans.isCorrect) {
          espData.correct++;
          temaData.correct++;
        } else if (!q.isAnulada && q.correctAnswer !== 'ANULADA') {
          espData.incorrect++;
          temaData.incorrect++;
          temaData.errorQuestions.push(q);
          if (q.foco) temaData.focosSet.add(q.foco);
          if (q.subfoco) temaData.focosSet.add(q.subfoco);
        }
      }
    });

    const parsedSpecialties: SpecialtyPerformance[] = Array.from(specialtyMap.values())
      .filter((esp) => esp.answered > 0 || questions.length <= 10) // Prioriza especialidades com questões respondidas
      .map((esp) => {
        const temasArray: TemaPerformance[] = Array.from(esp.temasMap.values()).map((t) => ({
          tema: t.tema,
          specialty: t.specialty,
          total: t.total,
          answered: t.answered,
          correct: t.correct,
          incorrect: t.incorrect,
          accuracyRate: t.answered > 0 ? Math.round((t.correct / t.answered) * 100) : 0,
          focos: Array.from(t.focosSet),
          questions: t.questions,
          errorQuestions: t.errorQuestions,
          recommendation: generateClinicalRecommendation(t.specialty, t.tema)
        }));

        // Ordena temas: temas com mais erros primeiro
        temasArray.sort((a, b) => b.incorrect - a.incorrect || b.total - a.total);

        return {
          specialty: esp.specialty,
          total: esp.total,
          answered: esp.answered,
          correct: esp.correct,
          incorrect: esp.incorrect,
          accuracyRate: esp.answered > 0 ? Math.round((esp.correct / esp.answered) * 100) : 0,
          temas: temasArray
        };
      });

    // Ordena especialidades: as que têm maior número de erros primeiro
    parsedSpecialties.sort((a, b) => b.incorrect - a.incorrect || b.answered - a.answered);

    return {
      totalQuestions: total,
      answeredCount: answeredTotal,
      correctCount: correctTotal,
      incorrectCount: incorrectTotal,
      accuracyRate: accuracy,
      specialtiesList: parsedSpecialties
    };
  }, [questions, userAnswers]);

  const handleOpenDrawer = (esp: SpecialtyPerformance) => {
    setSelectedSpecialty(esp);
    setDrawerThemeFilter('all');
    setIsDrawerOpen(true);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. HEADER GERAL DA SESSÃO */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800/80 pb-5">
          <div className="flex items-center gap-3.5">
            <div
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
              style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
            >
              <Trophy className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider"
                  style={{
                    backgroundColor: accentConfig.bgRgba,
                    color: accentConfig.primaryHex
                  }}
                >
                  Resolução Finalizada
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-zinc-900 dark:text-white mt-0.5 tracking-tight">
                Desempenho da Sessão
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Métricas de precisão e diagnóstico clínico por área médica.
              </p>
            </div>
          </div>

          {/* Botão de Retorno Rápido aos Filtros */}
          <button
            type="button"
            onClick={onReturnToFilters}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white shadow-2xs transition-all hover:scale-102 cursor-pointer shrink-0"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>Retornar aos Filtros</span>
          </button>
        </div>

        {/* 2. GRID DE 4 MÉTRICAS COMPACTAS (MED-STUDENT-UX) */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block">Total</span>
            <span className="text-2xl sm:text-3xl font-black font-sans text-zinc-900 dark:text-white">
              {totalQuestions}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">no lote</span>
          </div>

          <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-1">
            <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400 block">Respondidas</span>
            <span className="text-2xl sm:text-3xl font-black font-sans text-zinc-900 dark:text-white">
              {answeredCount}
            </span>
            <span className="text-[10px] text-zinc-400 dark:text-zinc-500 block">
              {answeredCount === totalQuestions ? '100% resolvidas' : `${totalQuestions - answeredCount} pendentes`}
            </span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-500/5 dark:bg-emerald-950/20 border border-emerald-500/20 dark:border-emerald-900/40 space-y-1">
            <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 block flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" /> Acertos
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-sans text-emerald-600 dark:text-emerald-400">
                {correctCount}
              </span>
              <span className="text-xs font-bold text-emerald-600/80 dark:text-emerald-400/80 font-sans">
                ({accuracyRate}%)
              </span>
            </div>
            <span className="text-[10px] text-emerald-600/70 dark:text-emerald-400/70 block">aproveitamento</span>
          </div>

          <div className="p-4 rounded-xl bg-rose-500/5 dark:bg-rose-950/20 border border-rose-500/20 dark:border-rose-900/40 space-y-1">
            <span className="text-[11px] font-bold text-rose-700 dark:text-rose-400 block flex items-center gap-1">
              <XCircle className="w-3.5 h-3.5" /> Erros
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-black font-sans text-rose-600 dark:text-rose-400">
                {incorrectCount}
              </span>
              <span className="text-xs font-bold text-rose-600/80 dark:text-rose-400/80 font-sans">
                ({answeredCount > 0 ? 100 - accuracyRate : 0}%)
              </span>
            </div>
            <span className="text-[10px] text-rose-600/70 dark:text-rose-400/70 block">a revisar</span>
          </div>
        </div>
      </div>

      {/* 3. SEÇÃO DE CARDS DE DESEMPENHO POR ESPECIALIDADE */}
      <div className="p-5 sm:p-7 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-4">
          <div className="flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0"
              style={{ backgroundColor: accentConfig.bgRgba, color: accentConfig.primaryHex }}
            >
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-white">
                Diagnóstico por Especialidade
              </h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">
                Clique em um card para abrir o painel lateral com todos os temas, focos e questões.
              </p>
            </div>
          </div>
          <span className="text-xs text-zinc-400 font-medium self-start sm:self-auto">
            {specialtiesList.length} {specialtiesList.length === 1 ? 'área avaliada' : 'áreas avaliadas'}
          </span>
        </div>

        {specialtiesList.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3.5 pt-1">
            {specialtiesList.map((esp) => {
              const IconComp = getSpecialtyIcon(esp.specialty);
              const hasErrors = esp.incorrect > 0;
              const isHigh = esp.accuracyRate >= 80;
              const isMedium = esp.accuracyRate >= 60 && esp.accuracyRate < 80;

              return (
                <div
                  key={esp.specialty}
                  onClick={() => handleOpenDrawer(esp)}
                  className="group relative p-4 rounded-xl bg-zinc-50/70 hover:bg-zinc-100/90 dark:bg-zinc-900/50 dark:hover:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 cursor-pointer flex flex-col justify-between space-y-3.5 shadow-2xs hover:shadow-xs"
                >
                  {/* Topo do Card: Ícone + Título + Badge de Aproveitamento */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div
                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105"
                        style={{
                          backgroundColor: accentConfig.bgRgba,
                          color: accentConfig.primaryHex
                        }}
                      >
                        <IconComp className="w-4.5 h-4.5" />
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                          {esp.specialty}
                        </h4>
                        <span className="text-[11px] text-zinc-500 dark:text-zinc-400 block">
                          {esp.temas.length} {esp.temas.length === 1 ? 'tema' : 'temas'} • {esp.answered} resp.
                        </span>
                      </div>
                    </div>

                    {/* Badge de Precisão */}
                    <span
                      className={`px-2 py-0.5 rounded-lg text-xs font-black font-sans shrink-0 ${
                        isHigh
                          ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                          : isMedium
                          ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                      }`}
                    >
                      {esp.accuracyRate}%
                    </span>
                  </div>

                  {/* Barra de Progresso Fina */}
                  <div className="space-y-1.5">
                    <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          isHigh ? 'bg-emerald-500' : isMedium ? 'bg-amber-500' : 'bg-rose-500'
                        }`}
                        style={{ width: `${esp.accuracyRate}%` }}
                      />
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-zinc-500 dark:text-zinc-400 font-sans">
                      <span className="text-emerald-600 dark:text-emerald-400 font-semibold">
                        {esp.correct} acertos
                      </span>
                      <span className={hasErrors ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-zinc-400'}>
                        {esp.incorrect} {esp.incorrect === 1 ? 'erro' : 'erros'}
                      </span>
                    </div>
                  </div>

                  {/* Resumo de Temas / Destaque de Ponto Fraco */}
                  <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/60 flex items-center justify-between text-xs">
                    {hasErrors ? (
                      <span className="text-[11px] font-medium text-rose-600 dark:text-rose-400 flex items-center gap-1 truncate max-w-[75%]">
                        <AlertTriangle className="w-3 h-3 shrink-0" />
                        <span className="truncate">
                          {esp.temas.find((t) => t.incorrect > 0)?.tema || 'Revisão indicada'}
                        </span>
                      </span>
                    ) : (
                      <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 shrink-0" />
                        <span>100% dominado</span>
                      </span>
                    )}

                    <span
                      className="text-[11px] font-bold flex items-center gap-0.5 group-hover:translate-x-0.5 transition-transform shrink-0"
                      style={{ color: accentConfig.primaryHex }}
                    >
                      Temas <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-200 dark:border-zinc-800 text-center space-y-2">
            <Sparkles className="w-8 h-8 text-zinc-400 mx-auto" />
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white">
              Nenhuma questão respondida nesta sessão
            </h4>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Volte para a tela de resolução ou ajuste seus filtros para iniciar seu estudo.
            </p>
          </div>
        )}
      </div>

      {/* 4. BARRA DE AÇÕES INFERIOR */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-4 sm:p-5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800 shadow-2xs">
        <button
          type="button"
          onClick={onReviewAll}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-all cursor-pointer"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Revisar Resoluções da Sessão</span>
        </button>

        <button
          type="button"
          onClick={onReturnToFilters}
          className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-white shadow-2xs transition-all hover:scale-102 cursor-pointer"
          style={{ backgroundColor: accentConfig.primaryHex }}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>Concluir e Voltar aos Filtros</span>
        </button>
      </div>

      {/* =========================================================================
          5. DRAWER LATERAL: RAIO-X DOS TEMAS DA ESPECIALIDADE SELECIONADA
         ========================================================================= */}
      {isDrawerOpen && selectedSpecialty && (
        <div className="fixed inset-0 z-50 flex justify-end animate-in fade-in duration-200">
          {/* Backdrop Escuro Neutro */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity cursor-pointer"
            onClick={() => setIsDrawerOpen(false)}
          />

          {/* Painel do Drawer */}
          <div className="relative w-full sm:w-[500px] md:w-[540px] bg-white dark:bg-[#121215] border-l border-zinc-200 dark:border-zinc-800 shadow-2xl flex flex-col z-10 animate-in slide-in-from-right duration-300 h-full">
            {/* Header do Drawer */}
            <div className="p-4 sm:p-5 border-b border-zinc-200 dark:border-zinc-800 flex items-center justify-between shrink-0 bg-zinc-50/50 dark:bg-zinc-900/30">
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-2xs"
                  style={{
                    backgroundColor: accentConfig.bgRgba,
                    color: accentConfig.primaryHex
                  }}
                >
                  {React.createElement(getSpecialtyIcon(selectedSpecialty.specialty), {
                    className: 'w-5 h-5'
                  })}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-black text-zinc-900 dark:text-white truncate tracking-tight">
                    {selectedSpecialty.specialty}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {selectedSpecialty.temas.length} {selectedSpecialty.temas.length === 1 ? 'tema avaliado' : 'temas avaliados'} • {selectedSpecialty.answered} questões
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-lg text-xs font-black font-sans ${
                    selectedSpecialty.accuracyRate >= 80
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20'
                      : selectedSpecialty.accuracyRate >= 60
                      ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20'
                      : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20'
                  }`}
                >
                  {selectedSpecialty.accuracyRate}%
                </span>
                <button
                  type="button"
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                  title="Fechar painel (Esc)"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sub-header com Filtro Rápido de Temas */}
            <div className="px-4 py-2.5 border-b border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/20 flex items-center justify-between shrink-0 text-xs">
              <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                Filtrar Temas:
              </span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setDrawerThemeFilter('all')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    drawerThemeFilter === 'all'
                      ? 'bg-zinc-900 dark:bg-white text-white dark:text-zinc-900'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Todos ({selectedSpecialty.temas.length})
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerThemeFilter('errors')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    drawerThemeFilter === 'errors'
                      ? 'bg-rose-600 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  Com Erros ({selectedSpecialty.temas.filter((t) => t.incorrect > 0).length})
                </button>
                <button
                  type="button"
                  onClick={() => setDrawerThemeFilter('perfect')}
                  className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all cursor-pointer ${
                    drawerThemeFilter === 'perfect'
                      ? 'bg-emerald-600 text-white'
                      : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'
                  }`}
                >
                  100% Acerto ({selectedSpecialty.temas.filter((t) => t.incorrect === 0 && t.answered > 0).length})
                </button>
              </div>
            </div>

            {/* Lista com Rolagem dos Temas */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
              {(() => {
                const filteredTemas = selectedSpecialty.temas.filter((t) => {
                  if (drawerThemeFilter === 'errors') return t.incorrect > 0;
                  if (drawerThemeFilter === 'perfect') return t.incorrect === 0 && t.answered > 0;
                  return true;
                });

                if (filteredTemas.length === 0) {
                  return (
                    <div className="py-12 text-center text-xs text-zinc-400 space-y-1">
                      <Check className="w-7 h-7 text-emerald-500 mx-auto mb-1" />
                      <p className="font-bold text-zinc-700 dark:text-zinc-300">
                        Nenhum tema encontrado neste filtro
                      </p>
                      <p>Altere o filtro acima para ver os outros tópicos.</p>
                    </div>
                  );
                }

                return filteredTemas.map((item, idx) => {
                  const hasErrors = item.incorrect > 0;

                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 transition-colors hover:border-zinc-300 dark:hover:border-zinc-700"
                    >
                      {/* Topo do Tema */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-0.5">
                          <h4 className="text-sm font-extrabold text-zinc-900 dark:text-white leading-snug">
                            {item.tema}
                          </h4>
                          <span className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans block">
                            {item.correct} acertos de {item.answered} respondidas ({item.accuracyRate}%)
                          </span>
                        </div>

                        {hasErrors ? (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 shrink-0">
                            {item.incorrect} {item.incorrect === 1 ? 'erro' : 'erros'}
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 shrink-0 flex items-center gap-1">
                            <Check className="w-3 h-3" /> Dominado
                          </span>
                        )}
                      </div>

                      {/* Focos Prioritários se houver erros */}
                      {item.focos.length > 0 && (
                        <div className="space-y-1 text-xs">
                          <span className="text-[11px] font-semibold text-zinc-400 block">
                            Focos prioritários de estudo:
                          </span>
                          <div className="flex flex-wrap gap-1">
                            {item.focos.map((fc, fIdx) => (
                              <span
                                key={fIdx}
                                className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-500/20 text-[10px] font-medium"
                              >
                                {fc}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Recomendação de Fixação Médica */}
                      <div className="p-3 rounded-xl bg-white dark:bg-zinc-950/70 border border-zinc-200/80 dark:border-zinc-800/80 text-xs text-zinc-700 dark:text-zinc-300 space-y-1">
                        <span className="font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1 text-[11px]">
                          💡 Recomendação de Fixação:
                        </span>
                        <p className="leading-relaxed text-[11px] text-zinc-600 dark:text-zinc-300">
                          {item.recommendation}
                        </p>
                      </div>

                      {/* Questões Clicáveis do Tema */}
                      <div className="pt-1 space-y-1 text-xs">
                        <span className="text-[11px] text-zinc-400 block">
                          Ir para questão:
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {item.questions.map((q) => {
                            const ans = userAnswers[q.id];
                            const isCorrect = ans?.isCorrect;
                            const isUnanswered = !ans;

                            return (
                              <button
                                key={q.id}
                                type="button"
                                onClick={() => {
                                  setIsDrawerOpen(false);
                                  onNavigateToQuestion(q.id);
                                }}
                                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg border text-[11px] font-mono font-bold transition-all cursor-pointer ${
                                  isCorrect
                                    ? 'bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border-emerald-500/25 hover:bg-emerald-500/20'
                                    : isUnanswered
                                    ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-zinc-300 dark:border-zinc-700'
                                    : 'bg-rose-500/10 text-rose-700 dark:text-rose-400 border-rose-500/25 hover:bg-rose-500/20'
                                }`}
                                title={
                                  isCorrect
                                    ? 'Questão acertada • Clique para revisar'
                                    : isUnanswered
                                    ? 'Questão não respondida'
                                    : 'Questão com erro • Clique para revisar alternativa e comentário'
                                }
                              >
                                <span>{q.code || q.id.slice(0, 8)}</span>
                                <ArrowRight className="w-2.5 h-2.5 opacity-70" />
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  );
                });
              })()}
            </div>

            {/* Footer do Drawer */}
            <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 flex items-center justify-between gap-3 shrink-0">
              {selectedSpecialty.temas.some((t) => t.errorQuestions.length > 0) && (
                <button
                  type="button"
                  onClick={() => {
                    const firstError = selectedSpecialty.temas.find((t) => t.errorQuestions.length > 0)?.errorQuestions[0];
                    if (firstError) {
                      setIsDrawerOpen(false);
                      onNavigateToQuestion(firstError.id);
                    }
                  }}
                  className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white shadow-2xs transition-all cursor-pointer"
                  style={{ backgroundColor: accentConfig.primaryHex }}
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Revisar Erros Desta Área</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                className="ml-auto px-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
