'use client';

import React, { useState, useEffect } from 'react';
import {
  FileText,
  Brain,
  BookOpen,
  BarChart3,
  CheckCircle2,
  XCircle,
  Highlighter,
  Strikethrough,
  Bookmark,
  FolderPlus,
  Clock,
  Eye,
  EyeOff,
  AlertTriangle,
  Lightbulb,
  ShieldCheck,
  TrendingUp,
  GraduationCap,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  Timer,
  Pause,
  Play,
  Type,
  Flag,
  Keyboard,
  Maximize2,
  Minimize2,
  Check,
  ChevronRight,
  ChevronLeft,
  Sparkles
} from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import questionsData from '@/data/landingDemoQuestions.json';

type PlatformTabKey = 'questoes' | 'flashcards' | 'resumos' | 'desempenho';

interface QuestionOption {
  letter: string;
  text: string;
  explanation?: string;
}

interface DemoQuestion {
  id: string;
  banca: string;
  year: number;
  especialidade: string;
  tema: string;
  subfoco?: string;
  triDifficulty?: string;
  status?: string;
  likes: number;
  dislikes: number;
  statement: string;
  options: QuestionOption[];
  correct_answer: string;
  commentary: string;
  mainErrorReason?: string;
  takeHomeMessage?: string;
  references?: string;
}

interface ClozeFlashcard {
  id: string;
  especialidade: string;
  banca: string;
  areaColor: string;
  promptBefore: string;
  cloze1: string;
  promptMid: string;
  cloze2: string;
  promptAfter: string;
  pearl: string;
  reference: string;
}

const PLATFORM_FLASHCARDS: ClozeFlashcard[] = [
  {
    id: 'infeccao_puerperal',
    especialidade: 'Ginecologia & Obstetrícia • Puerpério',
    banca: 'ENARE / USP-SP',
    areaColor: '#EC4899',
    promptBefore: 'A Morbidade Febril Puerperal é definida pela temperatura axilar ',
    cloze1: '≥ 38,0 °C em 2 dias quaisquer',
    promptMid: ' dos primeiros 10 dias de puerpério (excluindo as primeiras 24 horas). O esquema antimicrobiano venoso padrão-ouro de 1ª linha na endometrite pós-parto é ',
    cloze2: 'Clindamicina 900mg + Gentamicina 5mg/kg',
    promptAfter: ' administrado por via venosa até a paciente permanecer afebril e assintomática por 48 horas seguidas.',
    pearl: 'Pérola de Prova: Após 48h afebril e melhora clínica evidente, suspende-se o esquema venoso e a paciente recebe alta hospitalar SEM necessidade de antibiótico oral ambulatorial.',
    reference: 'FEBRASGO & Manual de Gestação de Alto Risco do Ministério da Saúde'
  },
  {
    id: 'cad',
    especialidade: 'Clínica Médica • Endocrinologia',
    banca: 'ENARE / USP-SP',
    areaColor: '#3B82F6',
    promptBefore: 'Na Cetoacidose Diabética (CAD), se o potássio sérico inicial for ',
    cloze1: '< 3,3 mEq/L',
    promptMid: ', deve-se suspender temporariamente a insulina regular e ',
    cloze2: 'repor KCl endovenoso',
    promptAfter: ' primeiro para prevenir arritmias ventriculares fatais por hipocalemia aguda.',
    pearl: 'Pérola de Prova: Se K⁺ estiver entre 3,3 e 5,2 mEq/L, inicia-se insulina regular 0,1 UI/kg junto com 20-30 mEq de KCl por litro de solução de hidratação.',
    reference: 'Diretriz Oficial da Sociedade Brasileira de Diabetes (SBD / ADA)'
  },
  {
    id: 'leriche',
    especialidade: 'Cirurgia Geral • Cirurgia Vascular',
    banca: 'USP-SP / SUS-SP',
    areaColor: '#10B981',
    promptBefore: 'A Síndrome de Leriche decorre da oclusão aterosclerótica crônica da ',
    cloze1: 'bifurcação aortoilíaca',
    promptMid: ' e cursa com a tríade clássica: claudicação de nádegas/coxas, ',
    cloze2: 'pulsos femorais ausentes/diminuídos',
    promptAfter: ' e disfunção erétil em homens jovens/meia-idade.',
    pearl: 'Pérola de Prova: Em lesões extensas TASC D, o tratamento cirúrgico padrão-ouro de revascularização é o bypass (derivação) aortobifemoral.',
    reference: 'Sabiston Tratado de Cirurgia & Consenso TASC II'
  },
  {
    id: 'hpp',
    especialidade: 'Ginecologia & Obstetrícia • Emergências',
    banca: 'SURCE / ENARE',
    areaColor: '#EC4899',
    promptBefore: 'A Hemorragia Pós-Parto (HPP) tem como principal etiologia a ',
    cloze1: 'atonia uterina (70%)',
    promptMid: ', dentro do mnemônico dos 4Ts (Tônus, Trauma, Tecido, Trombina). A droga uterotônica de 1ª linha obrigatória é a ',
    cloze2: 'Ocitocina 10-20 UI',
    promptAfter: ' em infusão venosa rápida ou intramuscular.',
    pearl: 'Pérola de Prova: Se a atonia for refratária, associam-se Metilergometrina (salvo em hipertensas!), Misoprostol retal e Ácido Tranexâmico antes do Balão de Bakri.',
    reference: 'Manual de Emergências Obstétricas da FEBRASGO / OMS'
  },
  {
    id: 'dengue',
    especialidade: 'Pediatria & Infectologia',
    banca: 'UNICAMP / ENARE',
    areaColor: '#F59E0B',
    promptBefore: 'Na Dengue em crianças, a presença de dor abdominal intensa e contínua, vômitos persistentes ou lipotimia define ',
    cloze1: 'Sinais de Alarme (Grupo C)',
    promptMid: ' e exige expansão volêmica imediata com ',
    cloze2: 'soro fisiológico 10 mL/kg/hora',
    promptAfter: ' nas primeiras duas horas em ambiente hospitalar.',
    pearl: 'Pérola de Prova: Os sinais de alarme surgem tipicamente na fase de defervescência da febre (entre o 3º e 7º dia), marcando o início do extravasamento plasmático.',
    reference: 'Protocolo de Manejo Clínico da Dengue do Ministério da Saúde'
  }
];

interface ClinicalSummary {
  id: string;
  titulo: string;
  especialidade: string;
  areaColor: string;
  badge: string;
  referencia: string;
  incidencia: { banca: string; subfocos: { nome: string; pct: number }[] }[];
  pontosChave: { titulo: string; desc: string; alerta?: boolean }[];
  algoritmoTitulo: string;
  algoritmoPassos: string[];
}

const CLINICAL_SUMMARY_INFECCAO_PUERPERAL: ClinicalSummary = {
  id: 'infeccao-puerperal',
  titulo: 'Infecção Puerperal e Endometrite Pós-Parto',
  especialidade: 'Ginecologia e Obstetrícia • Puerpério e Hemorragia Pós-Parto',
  areaColor: '#EC4899',
  badge: 'Recorrência Máxima • ENARE, USP-SP & SURCE',
  referencia: 'FEBRASGO / Manual de Gestação de Alto Risco do Ministério da Saúde',
  incidencia: [
    {
      banca: 'ENARE',
      subfocos: [
        { nome: 'Fisiopatologia, Critérios Diagnósticos e Fatores de Risco', pct: 46 },
        { nome: 'Esquemas Antimicrobianos Venosos (Clindamicina + Gentamicina)', pct: 34 },
        { nome: 'Diagnóstico Diferencial e Conduta pós-Cesárea', pct: 20 }
      ]
    },
    {
      banca: 'USP-SP',
      subfocos: [
        { nome: 'Esquema Clindamicina + Gentamicina e Critérios de Cura', pct: 48 },
        { nome: 'Conduta na Febre Persistente: Abscesso e Tromboflebite Pélvica', pct: 32 },
        { nome: 'Flora Polimicrobiana Mista (Aeróbios e Anaeróbios)', pct: 20 }
      ]
    },
    {
      banca: 'SURCE',
      subfocos: [
        { nome: 'Critérios Clínicos de Morbidade Febril Puerperal', pct: 44 },
        { nome: 'Duração da Terapia Venosa até 48h Afebril', pct: 36 },
        { nome: 'Manejo de Abscessos Pélvicos e Complicações', pct: 20 }
      ]
    }
  ],
  pontosChave: [
    {
      titulo: 'Critérios Clínicos de Morbidade Febril Puerperal',
      desc: 'Temperatura axilar ≥ 38,0 °C aferida em pelo menos 2 ocasiões distintas nos primeiros 10 dias de puerpério, EXCLUINDO as primeiras 24 horas pós-parto (febre nas primeiras 24h costuma ser desidratação ou reação ao estresse do parto).'
    },
    {
      titulo: 'Tríade Clássica da Endometrite Pós-Parto',
      desc: 'Febre puerperal persistente + Útero amolecido, subinvoluído e doloroso à palpação + Lóquios turvos e fétidos. O principal fator de risco isolado é o parto por cesariana (risco 10 a 20 vezes superior ao parto vaginal).'
    },
    {
      titulo: 'Esquema Antimicrobiano de 1ª Linha (Padrão-Ouro)',
      desc: 'Clindamicina 900 mg IV de 8/8h + Gentamicina 5 mg/kg IV em dose única diária (ou 1,5 mg/kg 8/8h). Manter até a paciente completar 48 horas inteiramente afebril e assintomática. NÃO HÁ INDICAÇÃO de complementação com antibiótico via oral após alta!',
      alerta: true
    },
    {
      titulo: 'Conduta na Falha Terapêutica após 48-72 Horas',
      desc: 'Se a febre persistir após 48 a 72h de cobertura adequada, deve-se realizar ultrassonografia pélvica/tomografia para investigar abscesso de parede, hematoma infectado ou tromboflebite pélvica séptica (onde se inicia prova terapêutica com Heparina venosa).'
    }
  ],
  algoritmoTitulo: 'Algoritmo Decisório na Suspeita de Infecção Puerperal (FEBRASGO / MS)',
  algoritmoPassos: [
    '1. Identificação de Morbidade Febril (> 24h pós-parto com temp ≥ 38°C em 2 dias distintos) e exame pélvico minucioso',
    '2. Coleta de hemoculturas e início imediato de Clindamicina 900 mg IV 8/8h + Gentamicina 5 mg/kg IV 1x/dia',
    '3. Avaliação clínica em 48-72h: melhora acentuada mantém esquema venoso até completar 48h completas afebril',
    '4. Febre persistente após 72h: USG pélvica/TC para descartar coleção/abscesso e anticoagulação plena se suspeita de tromboflebite',
    '5. Alta hospitalar segura após 48h afebril, sem necessidade de antibiótico oral ambulatorial'
  ]
};

const HIGHLIGHTER_COLORS = [
  { name: 'Amarelo', hex: '#fcd34d' },
  { name: 'Verde', hex: '#6ee7b7' },
  { name: 'Rosa', hex: '#f9a8d4' },
  { name: 'Azul', hex: '#7dd3fc' },
  { name: 'Laranja', hex: '#fdba74' },
  { name: 'Roxo', hex: '#c084fc' }
];

export interface LandingInsidePlatformSectionProps {
  onOpenAuth: (mode?: 'login' | 'register') => void;
}

export const LandingInsidePlatformSection: React.FC<LandingInsidePlatformSectionProps> = ({
  onOpenAuth
}) => {
  const { accent, mode, accentConfig } = useTheme();
  const isDark = mode === 'dark';
  const isMonochrome = accent === 'neutral';

  const highlightTextStyle: React.CSSProperties = isMonochrome
    ? {
        backgroundImage:
          mode === 'dark'
            ? 'linear-gradient(110deg, rgba(255,255,255,0.92) 0%, rgba(161,161,170,0.72) 28%, rgba(255,255,255,1) 50%, rgba(113,113,122,0.76) 76%, rgba(255,255,255,0.92) 100%)'
            : 'linear-gradient(110deg, rgba(9,9,11,0.92) 0%, rgba(82,82,91,0.74) 28%, rgba(9,9,11,1) 50%, rgba(113,113,122,0.78) 76%, rgba(9,9,11,0.92) 100%)'
      }
    : {
        backgroundImage: `linear-gradient(110deg, ${accentConfig.primaryHex} 0%, ${
          accentConfig.chartPalette[1] ?? accentConfig.hoverHex
        } 26%, ${
          mode === 'dark' ? 'rgba(224,242,254,0.92)' : 'rgba(255,255,255,0.85)'
        } 48%, ${accentConfig.chartPalette[2] ?? accentConfig.accuracyAccent.hex} 68%, ${
          accentConfig.primaryHex
        } 100%)`
      };

  const [activeTab, setActiveTab] = useState<PlatformTabKey>('questoes');

  // Estado da aba Questões
  const [questionIdx, setQuestionIdx] = useState<number>(0);
  const [userAnswers, setUserAnswers] = useState<Record<number, string>>({});
  const [strikedOptions, setStrikedOptions] = useState<Record<string, boolean>>({});
  const [isBookmarked, setIsBookmarked] = useState<boolean>(false);
  const [areAlternativesHidden, setAreAlternativesHidden] = useState<boolean>(false);
  const [isZenMode, setIsZenMode] = useState<boolean>(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Ferramentas de Estudo
  const [activeHighlighterColor, setActiveHighlighterColor] = useState<number>(0);
  const [isHighlighterOpen, setIsHighlighterOpen] = useState<boolean>(false);
  const [isHighlighterActive, setIsHighlighterActive] = useState<boolean>(false);
  const [isStrikethroughActive, setIsStrikethroughActive] = useState<boolean>(false);
  const [fontSize, setFontSize] = useState<'sm' | 'base' | 'lg'>('base');

  // Cronômetros (Questão e Total)
  const [questionSeconds, setQuestionSeconds] = useState<number>(6);
  const [totalSeconds, setTotalSeconds] = useState<number>(13);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(true);

  // Tópicos abertos na resolução
  const [openTopics, setOpenTopics] = useState<Record<string, boolean>>({
    justificativa: true,
    error: true,
    takeHome: true
  });

  // Estado da aba Flashcards
  const [flashcardIdx, setFlashcardIdx] = useState<number>(0);
  const [isCardFlipped, setIsCardFlipped] = useState<boolean>(false);
  const [fsrsToast, setFsrsToast] = useState<string | null>(null);

  // Estado da aba Resumos
  const [selectedBancaIdx, setSelectedBancaIdx] = useState<number>(0);

  // Cronômetros ativos (apenas quando a aba de questões estiver ativa, evitando re-renders nas outras abas)
  useEffect(() => {
    if (!isTimerRunning || activeTab !== 'questoes') return;
    const interval = setInterval(() => {
      setQuestionSeconds((prev) => prev + 1);
      setTotalSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerRunning, activeTab]);

  // Reset do cronômetro da questão ao mudar de índice
  const handleSelectQuestion = (idx: number) => {
    setQuestionIdx(idx);
    setQuestionSeconds(0);
    setIsBookmarked(false);
  };

  // Dados das 5 questões reais
  const demoQuestions = (questionsData.residencia || []) as DemoQuestion[];
  const currentQuestion = demoQuestions[questionIdx] || demoQuestions[0];
  const selectedAnswer = userAnswers[questionIdx];
  const isAnswered = Boolean(selectedAnswer);

  const answeredCount = Object.keys(userAnswers).length;
  const progressPercent = Math.round((answeredCount / demoQuestions.length) * 100);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSelectOption = (letter: string) => {
    if (isAnswered) return;
    setUserAnswers((prev) => ({
      ...prev,
      [questionIdx]: letter
    }));
  };

  const toggleStrikeOption = (key: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setStrikedOptions((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const toggleTopic = (key: string) => {
    setOpenTopics((prev) => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleRateFlashcard = (label: string) => {
    setFsrsToast(`FSRS: Próxima repetição agendada para ${label}`);
    setTimeout(() => setFsrsToast(null), 3200);
    setTimeout(() => {
      setIsCardFlipped(false);
      setFlashcardIdx((prev) => (prev + 1) % PLATFORM_FLASHCARDS.length);
    }, 900);
  };

  const currentFlashcard = PLATFORM_FLASHCARDS[flashcardIdx];
  const currentSummary = CLINICAL_SUMMARY_INFECCAO_PUERPERAL;
  const currentBancaData = currentSummary.incidencia[selectedBancaIdx] || currentSummary.incidencia[0];

  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <section
      id="dentro-da-plataforma"
      className="scroll-mt-16 py-18 sm:py-24 bg-zinc-50 dark:bg-[var(--bg-page)] text-zinc-900 dark:text-zinc-100 transition-colors duration-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-8 sm:space-y-10">
        {/* =========================================================================
            CABEÇALHO PADRONIZADO (ALINHADO À ESQUERDA)
            ========================================================================= */}
        <div className="max-w-3xl space-y-3 text-left">
          {/* Badge Fiel à Imagem 3: DENTRO DA PLATAFORMA */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-100 dark:bg-[#121217] border border-zinc-200/90 dark:border-zinc-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
            <Sparkles className="w-3.5 h-3.5" style={{ color: accentConfig.primaryHex }} />
            <span style={{ color: accentConfig.primaryHex }}>DENTRO DA PLATAFORMA</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-[42px] font-black tracking-[-0.03em] text-zinc-950 dark:text-white leading-[1.15]">
            Experimente o{' '}
            <span
              className="bg-clip-text text-transparent animate-hippo-text-sweep opacity-95"
              style={highlightTextStyle}
            >
              Banco Residência
            </span>
          </h2>
        </div>

        {/* =========================================================================
            BARRA DE NAVEGAÇÃO ENTRE AS 4 DOBRAS / ABAS
            ========================================================================= */}
        <div className="flex items-center justify-start">
          <div className="inline-flex p-1.5 rounded-2xl bg-white dark:bg-[#121217] border border-zinc-200/90 dark:border-zinc-800 shadow-xs overflow-x-auto max-w-full no-scrollbar gap-1 sm:gap-2">
            {/* Aba 1: Questões */}
            <button
              type="button"
              onClick={() => setActiveTab('questoes')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'questoes'
                  ? 'shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
              style={
                activeTab === 'questoes'
                  ? {
                      backgroundColor: accentConfig.primaryHex,
                      color: accentConfig.primaryContrastHex
                    }
                  : undefined
              }
            >
              <FileText className="w-4 h-4 shrink-0" />
              <span>Questões na Prática</span>
            </button>

            {/* Aba 2: Flashcards */}
            <button
              type="button"
              onClick={() => setActiveTab('flashcards')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'flashcards'
                  ? 'shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
              style={
                activeTab === 'flashcards'
                  ? {
                      backgroundColor: accentConfig.primaryHex,
                      color: accentConfig.primaryContrastHex
                    }
                  : undefined
              }
            >
              <Brain className="w-4 h-4 shrink-0" />
              <span>Flashcards FSRS</span>
            </button>

            {/* Aba 3: Resumos */}
            <button
              type="button"
              onClick={() => setActiveTab('resumos')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'resumos'
                  ? 'shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
              style={
                activeTab === 'resumos'
                  ? {
                      backgroundColor: accentConfig.primaryHex,
                      color: accentConfig.primaryContrastHex
                    }
                  : undefined
              }
            >
              <BookOpen className="w-4 h-4 shrink-0" />
              <span>Resumos com Raio-X</span>
            </button>

            {/* Aba 4: Desempenho */}
            <button
              type="button"
              onClick={() => setActiveTab('desempenho')}
              className={`flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all duration-200 cursor-pointer whitespace-nowrap ${
                activeTab === 'desempenho'
                  ? 'shadow-xs'
                  : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
              }`}
              style={
                activeTab === 'desempenho'
                  ? {
                      backgroundColor: accentConfig.primaryHex,
                      color: accentConfig.primaryContrastHex
                    }
                  : undefined
              }
            >
              <BarChart3 className="w-4 h-4 shrink-0" />
              <span>Painel de Desempenho & TRI</span>
            </button>
          </div>
        </div>

        {/* Toast Notificação de Ação */}
        {toastMessage && (
          <div className="fixed bottom-6 right-6 z-50 px-4 py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 text-white text-xs font-bold shadow-2xl flex items-center gap-2 animate-in fade-in slide-in-from-bottom duration-200">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Modal de Atalhos de Teclado */}
        {isShortcutsOpen && (
          <div
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-150"
            onClick={() => setIsShortcutsOpen(false)}
          >
            <div
              className="w-full max-w-md p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xl space-y-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-2 text-sm font-black text-zinc-950 dark:text-white">
                  <Keyboard className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                  <span>Atalhos Rápidos de Estudo</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsShortcutsOpen(false)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 dark:hover:text-white"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-2.5 text-xs text-zinc-700 dark:text-zinc-300">
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                  <span>Selecionar alternativas</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono font-bold">1 - 5 / A - E</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                  <span>Riscar / Cortar distrator</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono font-bold">S</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                  <span>Ativar marca-texto</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono font-bold">M</kbd>
                </div>
                <div className="flex items-center justify-between p-2 rounded-xl bg-zinc-50 dark:bg-zinc-800/60">
                  <span>Favoritar questão</span>
                  <kbd className="px-2 py-0.5 rounded bg-zinc-200 dark:bg-zinc-700 font-mono font-bold">B</kbd>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CONTEÚDO DA ABA 1: QUESTÕES NA PRÁTICA (DESIGN IDÊNTICO À IMAGEM 2)
            ========================================================================= */}
        {activeTab === 'questoes' && (
          <div className="space-y-4">
            {/* 1. BARRA SUPERIOR IDÊNTICA À IMAGEM 2 */}
            <div className="relative z-20 bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 rounded-2xl px-3 sm:px-4 py-2.5 shadow-xs flex flex-wrap items-center justify-between gap-3">
              {/* Lado Esquerdo: Botão Voltar + Círculo de Progresso + Dropdown 0/5 */}
              <div className="flex items-center gap-2 sm:gap-3">
                {/* Botão de Retorno */}
                <button
                  type="button"
                  onClick={() => handleSelectQuestion(Math.max(0, questionIdx - 1))}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-zinc-100 hover:bg-zinc-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700/80 border border-zinc-200/80 dark:border-zinc-700/60 text-zinc-700 dark:text-zinc-200 transition-all cursor-pointer shadow-2xs shrink-0 active:scale-95"
                  title="Questão anterior"
                  aria-label="Voltar"
                >
                  <ArrowLeft className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                </button>

                {/* Círculo de Progresso com Porcentagem e Dropdown */}
                <div className="flex items-center gap-2.5 px-2 py-1 rounded-2xl hover:bg-zinc-50 dark:hover:bg-zinc-900 border border-transparent transition-all">
                  <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <path
                        className="text-zinc-200 dark:text-zinc-800"
                        strokeWidth="3.2"
                        stroke="currentColor"
                        fill="none"
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                      <path
                        strokeDasharray={`${progressPercent}, 100`}
                        strokeWidth="3.2"
                        strokeLinecap="round"
                        stroke="currentColor"
                        fill="none"
                        style={{ color: accentConfig.primaryHex }}
                        d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      />
                    </svg>
                    <span className="absolute text-[10px] font-black font-sans tabular-nums text-zinc-800 dark:text-zinc-100">
                      {progressPercent}%
                    </span>
                  </div>

                  {/* Dropdown de Questões */}
                  <div className="flex flex-col text-left">
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm font-black font-sans tabular-nums text-zinc-900 dark:text-white leading-tight">
                        {answeredCount}/{demoQuestions.length}
                      </span>
                      <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
                    </div>
                    <span className="text-[10px] font-semibold text-zinc-400 dark:text-zinc-500">
                      Progresso
                    </span>
                  </div>
                </div>
              </div>

              {/* Lado Direito / Centro: Ferramentas de Estudo Idênticas à Imagem 2 */}
              <div className="flex items-center flex-wrap gap-1.5 sm:gap-2">
                {/* Cronômetros (Questão e Total com Pause/Play) */}
                <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-2xs">
                  <div
                    className="flex items-center gap-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-200"
                    title="Tempo na questão"
                  >
                    <Clock className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="font-mono tabular-nums">{formatTimer(questionSeconds)}</span>
                  </div>

                  <span className="text-zinc-300 dark:text-zinc-700">|</span>

                  <div
                    className="flex items-center gap-1 text-[11px] font-bold text-zinc-700 dark:text-zinc-200"
                    title="Tempo total acumulado"
                  >
                    <Timer className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                    <span className="font-mono tabular-nums">{formatTimer(totalSeconds)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setIsTimerRunning(!isTimerRunning)}
                    title={isTimerRunning ? 'Pausar contagem' : 'Retomar contagem'}
                    className="p-0.5 rounded hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors cursor-pointer"
                  >
                    {isTimerRunning ? (
                      <Pause className="w-3 h-3 text-zinc-600 dark:text-zinc-300" />
                    ) : (
                      <Play className="w-3 h-3 text-emerald-500 fill-current" />
                    )}
                  </button>
                </div>

                {/* Marca-texto com Seletor Flutuante de Cores */}
                <div className="relative inline-flex items-center">
                  <button
                    type="button"
                    onClick={() => {
                      setIsHighlighterOpen(!isHighlighterOpen);
                      setIsHighlighterActive(true);
                    }}
                    title="Alternar cor do marca-texto"
                    className="flex items-center gap-1.5 px-2.5 py-1.5 min-h-[34px] bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer shadow-2xs group"
                  >
                    <Highlighter className="w-3.5 h-3.5 text-zinc-700 dark:text-zinc-300" />
                    <span
                      className="w-3 h-3 rounded-full border border-black/15 shadow-2xs"
                      style={{ backgroundColor: HIGHLIGHTER_COLORS[activeHighlighterColor].hex }}
                    />
                    <ChevronDown className={`w-3 h-3 text-zinc-400 transition-transform ${isHighlighterOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {/* Popover das 6 cores */}
                  {isHighlighterOpen && (
                    <div className="absolute top-full right-0 mt-2 z-50 flex items-center gap-2 px-3 py-2 bg-white dark:bg-[#18181b] border border-zinc-200 dark:border-zinc-800 rounded-full shadow-2xl animate-in fade-in zoom-in-95 duration-150">
                      {HIGHLIGHTER_COLORS.map((c, idx) => (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => {
                            setActiveHighlighterColor(idx);
                            setIsHighlighterOpen(false);
                            setIsHighlighterActive(true);
                            showToast(`Marca-texto ${c.name} ativado`);
                          }}
                          title={`Marca-texto ${c.name}`}
                          className={`w-5 h-5 rounded-full transition-transform cursor-pointer border border-black/10 ${
                            activeHighlighterColor === idx ? 'scale-125 ring-2 ring-zinc-400' : 'hover:scale-110'
                          }`}
                          style={{ backgroundColor: c.hex }}
                        />
                      ))}
                    </div>
                  )}
                </div>

                {/* Botão S Riscar */}
                <button
                  type="button"
                  onClick={() => {
                    setIsStrikethroughActive(!isStrikethroughActive);
                    showToast(isStrikethroughActive ? 'Modo Riscar desativado' : 'Modo Riscar ativado: clique no S para tachar');
                  }}
                  title="Modo Riscar alternativa [S]"
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 min-h-[34px] border rounded-xl transition-all cursor-pointer shadow-2xs ${
                    isStrikethroughActive
                      ? 'bg-rose-50 dark:bg-rose-950/40 border-rose-300 dark:border-rose-700/60 text-rose-600 dark:text-rose-400 font-bold ring-2 ring-rose-400/40'
                      : 'bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <Strikethrough className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-bold hidden sm:inline">Riscar</span>
                </button>

                {/* Botão de Tamanho da Fonte T A v */}
                <button
                  type="button"
                  onClick={() => {
                    setFontSize((prev) => (prev === 'sm' ? 'base' : prev === 'base' ? 'lg' : 'sm'));
                  }}
                  title="Alternar tamanho da fonte"
                  className="flex items-center gap-1 px-2.5 py-1.5 min-h-[34px] bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 rounded-xl transition-all cursor-pointer shadow-2xs text-zinc-700 dark:text-zinc-300"
                >
                  <Type className="w-3.5 h-3.5" />
                  <span className="text-[11px] font-black text-blue-600 dark:text-blue-400">
                    {fontSize === 'sm' ? 'A-' : fontSize === 'base' ? 'A' : 'A+'}
                  </span>
                  <ChevronDown className="w-3 h-3 text-zinc-400" />
                </button>

                {/* Botão Favoritar Bookmark */}
                <button
                  type="button"
                  onClick={() => {
                    setIsBookmarked(!isBookmarked);
                    showToast(isBookmarked ? 'Removida dos favoritos' : 'Questão salva nos Favoritos');
                  }}
                  title="Favoritar questão"
                  className={`p-2 rounded-xl border border-transparent hover:border-zinc-200 dark:hover:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer ${
                    isBookmarked ? 'text-amber-500' : 'text-zinc-400'
                  }`}
                >
                  <Bookmark className={`w-4 h-4 ${isBookmarked ? 'fill-amber-500 text-amber-500' : ''}`} />
                </button>

                {/* Botão Reportar Flag */}
                <button
                  type="button"
                  onClick={() => showToast('Canal de Curadoria Médica aberto para reporte de prova')}
                  title="Reportar questão"
                  className="p-2 rounded-xl text-zinc-400 hover:text-amber-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  <Flag className="w-4 h-4" />
                </button>

                {/* Botão Atalhos */}
                <button
                  type="button"
                  onClick={() => setIsShortcutsOpen(true)}
                  className="hidden md:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all cursor-pointer shadow-2xs"
                  title="Atalhos do teclado"
                >
                  <Keyboard className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-xs font-bold">Atalhos</span>
                </button>

                {/* Botão Modo Zen */}
                <button
                  type="button"
                  onClick={() => setIsZenMode(!isZenMode)}
                  title="Modo Foco / Zen"
                  className="p-2 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
                >
                  {isZenMode ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Botão Finalizar */}
                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-black bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 shadow-xs cursor-pointer active:scale-95 transition-transform"
                  title="Finalizar treino e ver resultado"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Finalizar</span>
                </button>
              </div>
            </div>

            {/* 2. CARD DA QUESTÃO IDÊNTICO À IMAGEM 2 */}
            <div className="relative overflow-hidden rounded-3xl bg-white/94 dark:bg-zinc-950/94 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] p-5 sm:p-8 space-y-6">
              {/* Friso luminoso sutil no topo (Laser Rim) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-0 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`,
                  opacity: 0.55
                }}
              />
              {/* Header Interno: Badge da Prova, Resolvida Anteriormente, Eye, Salvar na Pasta, 1/5 */}
              <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-200/80 dark:border-zinc-800">
                {/* Lado Esquerdo: Tag da Banca + Status */}
                <div className="flex flex-wrap items-center gap-2">
                  <span className="px-3 py-1 rounded-xl text-xs font-black bg-zinc-100 dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 flex items-center gap-1.5 shadow-2xs">
                    <BookOpen className="w-3.5 h-3.5 text-zinc-600 dark:text-zinc-300" />
                    <span>{currentQuestion.banca}</span>
                    <span className="text-zinc-400">•</span>
                    <span>{currentQuestion.year}</span>
                  </span>

                  <span className="px-2.5 py-1 rounded-xl text-xs font-semibold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900/60 flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5 text-rose-500" />
                    <span>{currentQuestion.status || 'Resolvida anteriormente'}</span>
                  </span>

                  <span className="px-2 py-0.5 rounded-lg text-[11px] font-bold bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800/60">
                    Dificuldade TRI: Média
                  </span>
                </div>

                {/* Lado Direito: Olho, Salvar na Pasta, 1/5 */}
                <div className="flex items-center gap-2 sm:gap-3 text-zinc-500 dark:text-zinc-400">
                  <button
                    type="button"
                    onClick={() => setAreAlternativesHidden(!areAlternativesHidden)}
                    title={areAlternativesHidden ? 'Exibir alternativas' : 'Ocultar alternativas para forçar raciocínio'}
                    className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white transition-colors cursor-pointer"
                  >
                    {areAlternativesHidden ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => showToast('Adicionada à sua pasta de revisão')}
                    title="Salvar na Pasta"
                    className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 border border-zinc-200 dark:border-zinc-800 text-xs font-bold text-zinc-700 dark:text-zinc-300 transition-colors cursor-pointer"
                  >
                    <FolderPlus className="w-3.5 h-3.5" />
                    <span>Salvar na Pasta</span>
                  </button>

                  <span className="text-xs sm:text-sm font-black font-sans tabular-nums text-zinc-900 dark:text-white bg-zinc-100 dark:bg-zinc-900 px-2 py-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800">
                    {questionIdx + 1}/{demoQuestions.length}
                  </span>
                </div>
              </div>

              {/* Enunciado do Caso Clínico Oficial */}
              <div
                className={`text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed ${
                  fontSize === 'sm' ? 'text-sm' : fontSize === 'lg' ? 'text-lg' : 'text-base'
                }`}
              >
                {isHighlighterActive ? (
                  <span>
                    {currentQuestion.statement.split('.')[0]}.
                    <mark
                      className="text-black font-bold px-1 rounded-sm mx-1"
                      style={{ backgroundColor: HIGHLIGHTER_COLORS[activeHighlighterColor].hex }}
                    >
                      {currentQuestion.statement.split('.')[1] || ''}.
                    </mark>
                    {currentQuestion.statement.split('.').slice(2).join('.')}
                  </span>
                ) : (
                  currentQuestion.statement
                )}
              </div>

              {/* Alternativas A a E com Botão de Riscar Individual S */}
              {!areAlternativesHidden && (
                <div className="space-y-3 pt-2">
                  {currentQuestion.options.map((option) => {
                    const isSelected = selectedAnswer === option.letter;
                    const isCorrect = option.letter === currentQuestion.correct_answer;
                    const strikeKey = `${currentQuestion.id}-${option.letter}`;
                    const isStriked = Boolean(strikedOptions[strikeKey]);

                    let borderClass = 'border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-[#16161b] hover:border-zinc-400 dark:hover:border-zinc-600 text-zinc-800 dark:text-zinc-200';
                    let letterBadgeClass = 'bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 border-zinc-200 dark:border-zinc-700';

                    if (isAnswered) {
                      if (isCorrect) {
                        borderClass = 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/30 text-emerald-950 dark:text-white shadow-xs';
                        letterBadgeClass = 'bg-emerald-600 text-white border-emerald-500 font-black';
                      } else if (isSelected) {
                        borderClass = 'border-rose-500 bg-rose-50/80 dark:bg-rose-950/30 text-rose-950 dark:text-white shadow-xs';
                        letterBadgeClass = 'bg-rose-600 text-white border-rose-500 font-black';
                      } else {
                        borderClass = 'border-zinc-200/60 dark:border-zinc-800/60 bg-zinc-100/50 dark:bg-[#141418]/60 text-zinc-400 dark:text-zinc-500 opacity-60';
                        letterBadgeClass = 'bg-zinc-100 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800';
                      }
                    }

                    return (
                      <div
                        key={option.letter}
                        onClick={() => handleSelectOption(option.letter)}
                        className={`group relative p-4 rounded-2xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-4 ${borderClass} ${
                          isStriked ? 'opacity-40 line-through' : ''
                        }`}
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          {/* Letra da Alternativa */}
                          <span
                            className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shrink-0 border shadow-2xs ${letterBadgeClass}`}
                          >
                            {option.letter}
                          </span>

                          {/* Texto da Alternativa */}
                          <span className="text-xs sm:text-sm font-semibold leading-relaxed">
                            {option.text}
                          </span>
                        </div>

                        {/* Ações da Alternativa: Feedback Pós-Resposta ou Botão S de Riscar */}
                        <div className="flex items-center gap-2 shrink-0">
                          {isAnswered && isCorrect && (
                            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-xs font-bold">
                              <CheckCircle2 className="w-4 h-4 shrink-0" />
                              <span className="hidden sm:inline">Gabarito</span>
                            </div>
                          )}
                          {isAnswered && isSelected && !isCorrect && (
                            <div className="flex items-center gap-1.5 text-rose-600 dark:text-rose-400 text-xs font-bold">
                              <XCircle className="w-4 h-4 shrink-0" />
                              <span className="hidden sm:inline">Incorreta</span>
                            </div>
                          )}

                          {/* Botão S Individual para riscar/descartar distrator */}
                          {!isAnswered && (
                            <button
                              type="button"
                              onClick={(e) => toggleStrikeOption(strikeKey, e)}
                              title={isStriked ? 'Restaurar alternativa' : 'Riscar alternativa (descartar distrator)'}
                              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                                isStriked
                                  ? 'bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 font-bold'
                                  : 'text-zinc-400 dark:text-zinc-600 hover:text-zinc-700 dark:hover:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800'
                              }`}
                            >
                              <Strikethrough className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* RESOLUÇÃO E COMENTÁRIOS COMPLETOS PÓS-RESPOSTA */}
              {isAnswered && (
                <div className="space-y-4 pt-4 border-t border-zinc-200 dark:border-zinc-800 animate-in fade-in duration-200">
                  {/* 1. Gabarito Oficial e Síntese Clínica */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-emerald-50/90 dark:bg-[#0c1814] border border-emerald-300 dark:border-emerald-800/60 text-zinc-900 dark:text-zinc-100 space-y-2.5 shadow-xs">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-black text-xs sm:text-sm">
                      <CheckCircle2 className="w-4 h-4 shrink-0" />
                      <span>Gabarito Oficial: Alternativa {currentQuestion.correct_answer}</span>
                    </div>
                    <p className="text-xs sm:text-sm leading-relaxed whitespace-pre-line font-normal opacity-95">
                      {currentQuestion.commentary}
                    </p>
                  </div>

                  {/* 2. Justificativa Alternativa por Alternativa */}
                  <div className="p-4 sm:p-5 rounded-2xl bg-zinc-50 dark:bg-[#15151c] border border-zinc-200 dark:border-zinc-800 space-y-3">
                    <button
                      type="button"
                      onClick={() => toggleTopic('justificativa')}
                      className="w-full flex items-center justify-between text-left cursor-pointer"
                    >
                      <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-zinc-950 dark:text-white">
                        <FileText className="w-4 h-4 text-zinc-600 dark:text-zinc-300" />
                        <span>Justificativa Cirúrgica Alternativa por Alternativa</span>
                      </div>
                      {openTopics['justificativa'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>

                    {openTopics['justificativa'] && (
                      <div className="space-y-2.5 pt-2 border-t border-zinc-200 dark:border-zinc-800">
                        {currentQuestion.options.map((opt) => (
                          <div
                            key={opt.letter}
                            className={`p-3 rounded-xl border text-xs leading-relaxed ${
                              opt.letter === currentQuestion.correct_answer
                                ? 'bg-emerald-50/60 dark:bg-emerald-950/20 border-emerald-300 dark:border-emerald-900/60 text-emerald-950 dark:text-emerald-200'
                                : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-300'
                            }`}
                          >
                            <span className="font-black mr-1.5">Alternativa {opt.letter}:</span>
                            <span>{opt.explanation || opt.text}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* 3. Principal Motivo de Erro (Armadilha da Questão) */}
                  {currentQuestion.mainErrorReason && (
                    <div className="p-4 rounded-2xl bg-amber-50/80 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleTopic('error')}
                        className="w-full flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-amber-800 dark:text-amber-400 font-bold text-xs sm:text-sm">
                          <AlertTriangle className="w-4 h-4 shrink-0" />
                          <span>Principal Motivo de Erro (Armadilha da Questão)</span>
                        </div>
                        {openTopics['error'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {openTopics['error'] && (
                        <p className="text-xs sm:text-[13px] leading-relaxed text-amber-950 dark:text-amber-200/90 pt-1 border-t border-amber-200/60 dark:border-amber-800/40">
                          {currentQuestion.mainErrorReason}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 4. Take-Home Message (Pérola de Prova) */}
                  {currentQuestion.takeHomeMessage && (
                    <div className="p-4 rounded-2xl bg-blue-50/80 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800/60 space-y-2">
                      <button
                        type="button"
                        onClick={() => toggleTopic('takeHome')}
                        className="w-full flex items-center justify-between text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-2 text-blue-800 dark:text-blue-400 font-bold text-xs sm:text-sm">
                          <Lightbulb className="w-4 h-4 shrink-0" />
                          <span>Take-Home Message (Pérola de Prova)</span>
                        </div>
                        {openTopics['takeHome'] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>

                      {openTopics['takeHome'] && (
                        <p className="text-xs sm:text-[13px] leading-relaxed text-blue-950 dark:text-blue-200/90 font-medium pt-1 border-t border-blue-200/60 dark:border-blue-800/40">
                          {currentQuestion.takeHomeMessage}
                        </p>
                      )}
                    </div>
                  )}

                  {/* 5. Referência Oficial / Diretrizes Médicas */}
                  {currentQuestion.references && (
                    <div className="p-3.5 rounded-xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400 flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span><strong>Referência Oficial:</strong> {currentQuestion.references}</span>
                    </div>
                  )}

                  {/* Barra de Navegação Entre as 5 Questões */}
                  <div className="pt-3 flex items-center justify-between gap-3">
                    <button
                      type="button"
                      disabled={questionIdx === 0}
                      onClick={() => handleSelectQuestion(questionIdx - 1)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        questionIdx === 0
                          ? 'opacity-40 cursor-not-allowed text-zinc-400'
                          : 'bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-800 dark:text-zinc-200 cursor-pointer'
                      }`}
                    >
                      <ChevronLeft className="w-4 h-4" />
                      <span>Questão Anterior</span>
                    </button>

                    <button
                      type="button"
                      disabled={questionIdx === demoQuestions.length - 1}
                      onClick={() => handleSelectQuestion(questionIdx + 1)}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                        questionIdx === demoQuestions.length - 1
                          ? 'opacity-40 cursor-not-allowed text-zinc-400'
                          : 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 cursor-pointer shadow-xs'
                      }`}
                    >
                      <span>Próxima Questão</span>
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            CONTEÚDO DA ABA 2: FLASHCARDS FSRS (5 FLASHCARDS REAIS)
            ========================================================================= */}
        {activeTab === 'flashcards' && (
          <div className="space-y-6">
            {/* Header de Sessão de Flashcards */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl bg-white dark:bg-[#121217] border border-zinc-200 dark:border-zinc-800 shadow-xs">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-white font-black text-xs shrink-0 shadow-2xs"
                  style={{ backgroundColor: currentFlashcard.areaColor }}
                >
                  <Brain className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs sm:text-sm font-black text-zinc-950 dark:text-white">
                    {currentFlashcard.especialidade}
                  </div>
                  <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Banca de Referência: {currentFlashcard.banca}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-zinc-500 dark:text-zinc-400">Cartão:</span>
                <span className="font-mono font-black text-zinc-950 dark:text-white bg-zinc-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700">
                  {flashcardIdx + 1}/{PLATFORM_FLASHCARDS.length}
                </span>
              </div>
            </div>

            {/* Toast FSRS */}
            {fsrsToast && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-200 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-150">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{fsrsToast}</span>
              </div>
            )}

            {/* Flashcard Central (Cloze FSRS com Frente e Verso) */}
            <div
              onClick={() => setIsCardFlipped(!isCardFlipped)}
              className="relative overflow-hidden min-h-[260px] sm:min-h-[300px] p-6 sm:p-10 rounded-3xl bg-white/94 dark:bg-zinc-950/94 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] flex flex-col justify-between cursor-pointer transition-all duration-200 hover:border-zinc-400 dark:hover:border-zinc-700"
            >
              {/* Friso luminoso sutil no topo (Laser Rim) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-0 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${currentFlashcard.areaColor || accentConfig.primaryHex}, transparent)`,
                  opacity: 0.65
                }}
              />
              <div className="space-y-4">
                <div className="flex items-center justify-between text-xs text-zinc-400 dark:text-zinc-500 font-bold uppercase tracking-wider">
                  <span>{isCardFlipped ? 'Resposta & Resolução' : 'Pergunta / Omissão de Conceito'}</span>
                  <span className="text-[11px] text-blue-600 dark:text-blue-400 font-extrabold">
                    {isCardFlipped ? 'Verso Revelado' : 'Clique para Virar (Espaço)'}
                  </span>
                </div>

                {/* Texto do Card com Cloze */}
                <div className="text-base sm:text-xl font-medium text-zinc-900 dark:text-zinc-100 leading-relaxed">
                  <span>{currentFlashcard.promptBefore}</span>
                  {isCardFlipped ? (
                    <mark className="bg-emerald-200 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 px-2 py-0.5 rounded-lg font-black border-b-2 border-emerald-500">
                      {currentFlashcard.cloze1}
                    </mark>
                  ) : (
                    <span className="px-3 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 font-mono font-bold text-zinc-600 dark:text-zinc-300 mx-1">
                      [ ... ]
                    </span>
                  )}
                  <span>{currentFlashcard.promptMid}</span>
                  {isCardFlipped ? (
                    <mark className="bg-emerald-200 dark:bg-emerald-900/60 text-emerald-950 dark:text-emerald-200 px-2 py-0.5 rounded-lg font-black border-b-2 border-emerald-500">
                      {currentFlashcard.cloze2}
                    </mark>
                  ) : (
                    <span className="px-3 py-0.5 rounded-lg bg-zinc-200 dark:bg-zinc-800 font-mono font-bold text-zinc-600 dark:text-zinc-300 mx-1">
                      [ ... ]
                    </span>
                  )}
                  <span>{currentFlashcard.promptAfter}</span>
                </div>

                {/* Verso: Pérola de Prova e Referência */}
                {isCardFlipped && (
                  <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800 space-y-2 animate-in fade-in duration-150">
                    <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs sm:text-sm text-blue-950 dark:text-blue-200 leading-relaxed font-semibold">
                      {currentFlashcard.pearl}
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      <strong>Referência Oficial:</strong> {currentFlashcard.reference}
                    </div>
                  </div>
                )}
              </div>

              {/* Botões FSRS no rodapé do card após virar */}
              {isCardFlipped && (
                <div
                  className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-6 border-t border-zinc-200 dark:border-zinc-800 mt-6"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    type="button"
                    onClick={() => handleRateFlashcard('< 1 dia')}
                    className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-900 text-rose-700 dark:text-rose-300 font-black text-xs hover:scale-102 transition-transform cursor-pointer text-center"
                  >
                    <div>Errei</div>
                    <div className="text-[10px] opacity-70">&lt; 1 dia</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateFlashcard('2 dias')}
                    className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-900 text-amber-700 dark:text-amber-300 font-black text-xs hover:scale-102 transition-transform cursor-pointer text-center"
                  >
                    <div>Difícil</div>
                    <div className="text-[10px] opacity-70">2 dias</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateFlashcard('4 dias')}
                    className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-900 text-blue-700 dark:text-blue-300 font-black text-xs hover:scale-102 transition-transform cursor-pointer text-center"
                  >
                    <div>Bom</div>
                    <div className="text-[10px] opacity-70">4 dias</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleRateFlashcard('7 dias')}
                    className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-300 dark:border-emerald-900 text-emerald-700 dark:text-emerald-300 font-black text-xs hover:scale-102 transition-transform cursor-pointer text-center"
                  >
                    <div>Fácil</div>
                    <div className="text-[10px] opacity-70">7 dias</div>
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            CONTEÚDO DA ABA 3: RESUMO DE INFECÇÃO PUERPERAL (1 RESUMO OFICIAL)
            ========================================================================= */}
        {activeTab === 'resumos' && (
          <div className="space-y-6">
            {/* Header do Resumo Oficial */}
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white/94 dark:bg-zinc-950/94 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] space-y-6">
              {/* Friso luminoso sutil no topo (Laser Rim) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-0 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${currentSummary.areaColor || accentConfig.primaryHex}, transparent)`,
                  opacity: 0.65
                }}
              />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-2xs"
                    style={{ backgroundColor: currentSummary.areaColor }}
                  >
                    <BookOpen className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="text-lg sm:text-xl font-black text-zinc-950 dark:text-white">
                      {currentSummary.titulo}
                    </h3>
                    <div className="text-xs text-zinc-500 dark:text-zinc-400">
                      {currentSummary.especialidade}
                    </div>
                  </div>
                </div>

                <span className="px-3 py-1 rounded-xl text-xs font-black bg-pink-50 dark:bg-pink-950/40 text-pink-700 dark:text-pink-300 border border-pink-200 dark:border-pink-900 self-start sm:self-auto">
                  {currentSummary.badge}
                </span>
              </div>

              {/* Raio-X de Recorrência por Bancas */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-zinc-700 dark:text-zinc-300">
                  <div className="flex items-center gap-2">
                    <GraduationCap className="w-4 h-4 text-blue-500" />
                    <span>Raio-X de Bancas: Como o tema é cobrado</span>
                  </div>

                  {/* Seletor de Bancas */}
                  <div className="flex items-center gap-1">
                    {currentSummary.incidencia.map((bancaItem, bIdx) => (
                      <button
                        key={bancaItem.banca}
                        type="button"
                        onClick={() => setSelectedBancaIdx(bIdx)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                          selectedBancaIdx === bIdx
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 shadow-2xs'
                            : 'bg-zinc-200/80 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400'
                        }`}
                      >
                        {bancaItem.banca}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Subfocos e Percentuais da Banca Selecionada */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                  {currentBancaData.subfocos.map((sf) => (
                    <div
                      key={sf.nome}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex flex-col justify-between"
                    >
                      <span className="text-xs font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                        {sf.nome}
                      </span>
                      <span className="text-sm font-black text-pink-600 dark:text-pink-400 mt-2 font-mono">
                        {sf.pct}% das questões
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pontos-Chave & Pérolas de Prova */}
              <div className="space-y-3 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Pontos Críticos & Pérolas de Prova
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {currentSummary.pontosChave.map((pt) => (
                    <div
                      key={pt.titulo}
                      className={`p-4 rounded-2xl border text-xs sm:text-sm leading-relaxed ${
                        pt.alerta
                          ? 'bg-amber-50/70 dark:bg-amber-950/20 border-amber-300 dark:border-amber-800/60 text-amber-950 dark:text-amber-200'
                          : 'bg-zinc-50/70 dark:bg-zinc-900/40 border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200'
                      }`}
                    >
                      <div className="font-bold flex items-center gap-1.5 mb-1.5">
                        {pt.alerta ? (
                          <AlertTriangle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
                        ) : (
                          <Lightbulb className="w-4 h-4 text-blue-500 shrink-0" />
                        )}
                        <span>{pt.titulo}</span>
                      </div>
                      <p className="opacity-90 leading-normal">{pt.desc}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Algoritmo Decisório Passo a Passo */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3">
                <div className="text-xs sm:text-sm font-bold text-zinc-950 dark:text-white flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" />
                  <span>{currentSummary.algoritmoTitulo}</span>
                </div>
                <div className="space-y-2">
                  {currentSummary.algoritmoPassos.map((passo, pIdx) => (
                    <div
                      key={passo}
                      className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-800 dark:text-zinc-200 font-medium flex items-start gap-2.5"
                    >
                      <span className="w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center font-mono font-bold text-[10px] shrink-0 text-zinc-600 dark:text-zinc-300">
                        {pIdx + 1}
                      </span>
                      <span className="leading-relaxed">{passo}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* =========================================================================
            CONTEÚDO DA ABA 4: DESEMPENHO & TRI (APENAS O PAINEL INICIAL)
            ========================================================================= */}
        {activeTab === 'desempenho' && (
          <div className="space-y-6">
            <div className="relative overflow-hidden p-6 sm:p-8 rounded-3xl bg-white/94 dark:bg-zinc-950/94 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/90 shadow-[0_20px_50px_rgba(15,23,42,0.12)] dark:shadow-[0_24px_55px_rgba(0,0,0,0.75)] space-y-6">
              {/* Friso luminoso sutil no topo (Laser Rim) */}
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-x-8 top-0 h-0.5 rounded-full"
                style={{
                  background: `linear-gradient(90deg, transparent, ${accentConfig.primaryHex}, transparent)`,
                  opacity: 0.55
                }}
              />
              {/* Header de Desempenho com 3 Métricas Psicofísicas da TRI */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {/* 1. Nota TRI Estimada */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#16161c] border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Nota TRI Estimada (ENARE)
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white font-mono">
                      784,6
                    </span>
                    <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                      +18,2 pts este mês
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Nível de corte para Especialidades de Acesso Direto Concorridas
                  </p>
                </div>

                {/* 2. Percentil Nacional P86 */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#16161c] border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Percentil Nacional
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white font-mono">
                      P86
                    </span>
                    <span className="text-xs font-bold text-amber-600 dark:text-amber-400">
                      Faixa Ouro
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Acima de 86% dos candidatos na mesma banca
                  </p>
                </div>

                {/* 3. Coerência Pedagógica TRI */}
                <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#16161c] border border-zinc-200 dark:border-zinc-800 space-y-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Coerência Pedagógica
                  </span>
                  <div className="flex items-baseline gap-1.5">
                    <span className="text-3xl sm:text-4xl font-black text-zinc-950 dark:text-white font-mono">
                      96%
                    </span>
                    <span className="text-xs font-bold text-blue-600 dark:text-blue-400">
                      Curva Consistente
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Acertos consistentes em questões fáceis e médias (sem chute cego)
                  </p>
                </div>
              </div>

              {/* Proficiência por Grande Área Médica */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-[#16161c] border border-zinc-200 dark:border-zinc-800 space-y-4">
                <div className="text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Proficiência por Grande Área Médica
                </div>

                <div className="space-y-3.5">
                  {/* Clínica Médica */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-white">Clínica Médica</span>
                      <span className="font-mono font-bold text-blue-600 dark:text-blue-400">82% (410 questões)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-blue-500" style={{ width: '82%' }} />
                    </div>
                  </div>

                  {/* Cirurgia Geral */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-white">Cirurgia Geral</span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">78% (320 questões)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: '78%' }} />
                    </div>
                  </div>

                  {/* Pediatria */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-white">Pediatria</span>
                      <span className="font-mono font-bold text-amber-600 dark:text-amber-400">85% (280 questões)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-amber-500" style={{ width: '85%' }} />
                    </div>
                  </div>

                  {/* Ginecologia e Obstetrícia */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-white">Ginecologia e Obstetrícia</span>
                      <span className="font-mono font-bold text-pink-600 dark:text-pink-400">74% (295 questões)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-pink-500" style={{ width: '74%' }} />
                    </div>
                  </div>

                  {/* Medicina Preventiva */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-zinc-900 dark:text-white">Medicina Preventiva e Social</span>
                      <span className="font-mono font-bold text-cyan-600 dark:text-cyan-400">88% (210 questões)</span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-cyan-500" style={{ width: '88%' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* Botão de Chamada para Ação */}
              <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center shrink-0">
                    <TrendingUp className="w-5 h-5" style={{ color: accentConfig.primaryHex }} />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-zinc-950 dark:text-white">
                      Diagnóstico Personalizado de Pontos Fracos
                    </div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Geração de cadernos de revisão automáticos calibrados pela TRI.
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onOpenAuth('register')}
                  className="px-4 py-2 rounded-xl text-xs font-bold shrink-0 cursor-pointer shadow-xs transition-all hover:opacity-95"
                  style={{
                    backgroundColor: accentConfig.primaryHex,
                    color: accentConfig.primaryContrastHex
                  }}
                >
                  Ver Meu Diagnóstico Completo
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default LandingInsidePlatformSection;
