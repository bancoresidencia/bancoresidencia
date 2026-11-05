'use client';

import React, { useEffect, useState, useMemo, useRef } from 'react';
import {
  Clock,
  Calendar,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  Play,
  ChevronLeft,
  ChevronRight,
  Stethoscope,
  HeartPulse,
  Highlighter,
  Check
} from 'lucide-react';
import { StudyMaterialItem } from '@/types/flashcards';
import { useTheme } from '@/context/ThemeContext';
import {
  HighlightColor,
  HighlightStyle,
  HIGHLIGHT_COLORS,
  StudyHighlight
} from '@/types/studyMaterialAnnotations';
import { studyAnnotationsService } from '@/services/studyAnnotationsService';
import { MEDICAL_GLOSSARY } from '@/data/medicalGlossary';
import { flashcardsService } from '@/services/flashcardsService';
import { TextHighlightToolbar } from './study-material/TextHighlightToolbar';
import { MedicalGlossaryTooltip } from './study-material/MedicalGlossaryTooltip';
import { ExamTrapBadge } from './study-material/ExamTrapBadge';
import { ClozeStudyToggle } from './study-material/ClozeStudyToggle';
import { StudyHighlightsDrawer } from './study-material/StudyHighlightsDrawer';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

const MermaidDiagram = dynamic(
  () => import('./study-material/MermaidDiagram').then((mod) => mod.MermaidDiagram),
  {
    ssr: false,
    loading: () => (
      <div className="p-6 my-4 rounded-xl border border-dashed border-slate-200 dark:border-zinc-800 bg-slate-50/50 dark:bg-zinc-900/50 flex items-center justify-center text-xs text-slate-400 animate-pulse">
        Carregando esquema decisório...
      </div>
    )
  }
);
import { FigoAnatomicalDiagram } from './study-material/FigoAnatomicalDiagram';
import { UniversalRecurrenceStatsCard } from './study-material/UniversalRecurrenceStatsCard';
import { ExamRecurrenceStatsCard } from './study-material/ExamRecurrenceStatsCard';
import { RiskFactorsComparisonCard } from './study-material/RiskFactorsComparisonCard';
import { TopographicSymptomsCard } from './study-material/TopographicSymptomsCard';
import { DiagnosticPipelineCard } from './study-material/DiagnosticPipelineCard';
import { DegenerationsCard } from './study-material/DegenerationsCard';
import { TreatmentAlgorithmCard } from './study-material/TreatmentAlgorithmCard';
import { LasmarStepwCard } from './study-material/LasmarStepwCard';
import { HppRecurrenceStatsCard } from './study-material/HppRecurrenceStatsCard';
import { HppFourTsCard } from './study-material/HppFourTsCard';
import { HppGoldenHourAlgorithmCard } from './study-material/HppGoldenHourAlgorithmCard';
import { GemelaridadeRecurrenceStatsCard } from './study-material/GemelaridadeRecurrenceStatsCard';
import { UniversalClinicalVisualScheme } from './study-material/UniversalClinicalVisualScheme';

interface StudyMaterialReaderProps {
  material: StudyMaterialItem;
  onBack: () => void;
  onPracticeFlashcards?: (material: StudyMaterialItem) => void;
}

export const StudyMaterialReader: React.FC<StudyMaterialReaderProps> = ({
  material,
  onBack,
  onPracticeFlashcards
}) => {
  const { accentConfig } = useTheme();
  const { user } = useAuth();
  const articleRef = useRef<HTMLElement | null>(null);

  // Estados de Grifos & Destaques de Texto
  const [highlights, setHighlights] = useState<StudyHighlight[]>([]);
  const [selectedToolbarState, setSelectedToolbarState] = useState<{
    position: { top: number; left: number };
    selectedText: string;
    existingHighlight?: StudyHighlight | null;
  } | null>(null);
  const [isHighlightsDrawerOpen, setIsHighlightsDrawerOpen] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados do Modo Oclusão Ativa (Cloze / Blur Mode)
  const [isClozeMode, setIsClozeMode] = useState<boolean>(false);
  const [revealAllCloze, setRevealAllCloze] = useState<boolean>(false);
  const [revealedClozeIds, setRevealedClozeIds] = useState<Set<string>>(new Set());

  // Carregamento inicial de grifos do material
  useEffect(() => {
    if (material?.id) {
      const loaded = studyAnnotationsService.loadMaterialHighlights(material.id, user?.id);
      setHighlights(loaded);
    }
  }, [material?.id, user?.id]);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Captura seleção de texto dentro do artigo
  const handleTextSelection = () => {
    setTimeout(() => {
      const selection = window.getSelection();
      if (!selection || selection.isCollapsed) return;
      const text = selection.toString().trim();
      if (text.length < 2) return;

      if (articleRef.current && articleRef.current.contains(selection.anchorNode)) {
        try {
          const range = selection.getRangeAt(0);
          const rect = range.getBoundingClientRect();
          const existing = highlights.find(
            (h) => h.textQuote.toLowerCase() === text.toLowerCase()
          );

          setSelectedToolbarState({
            position: {
              top: rect.top,
              left: rect.left + rect.width / 2
            },
            selectedText: text,
            existingHighlight: existing || null
          });
        } catch {
          // fallback silencioso
        }
      }
    }, 50);
  };

  const handleOpenHighlightToolbar = (hl: StudyHighlight, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    setSelectedToolbarState({
      position: {
        top: rect.top,
        left: rect.left + rect.width / 2
      },
      selectedText: hl.textQuote,
      existingHighlight: hl
    });
  };

  const handleApplyHighlight = (color: HighlightColor, style: HighlightStyle, note?: string) => {
    if (!selectedToolbarState) return;
    const text = selectedToolbarState.selectedText;
    const existing = selectedToolbarState.existingHighlight;

    if (existing) {
      const updated = studyAnnotationsService.updateHighlight(
        material.id,
        existing.id,
        { color, style, note },
        user?.id
      );
      setHighlights(updated);
    } else {
      const newHighlight: StudyHighlight = {
        id: `hl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        materialId: material.id,
        userId: user?.id,
        textQuote: text,
        color,
        style,
        note,
        createdAt: new Date().toISOString()
      };
      const updated = studyAnnotationsService.addHighlight(
        material.id,
        newHighlight,
        user?.id
      );
      setHighlights(updated);
    }

    window.getSelection()?.removeAllRanges();
    setSelectedToolbarState(null);
    showToast('Destaque salvo no resumo!');
  };

  const handleRemoveHighlight = (id: string) => {
    const updated = studyAnnotationsService.removeHighlight(material.id, id, user?.id);
    setHighlights(updated);
    setSelectedToolbarState(null);
    showToast('Marcação removida');
  };

  const handleUpdateHighlightNote = (id: string, note?: string) => {
    const updated = studyAnnotationsService.updateHighlight(
      material.id,
      id,
      { note },
      user?.id
    );
    setHighlights(updated);
    showToast(note ? 'Anotação atualizada!' : 'Anotação removida');
  };

  const handleCreateFlashcard = (textQuote: string) => {
    const newCard = {
      id: `card_cloze_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      front: `No contexto de ${material.title}: {{c1::${textQuote}}}`,
      back: textQuote,
      specialty: material.specialty,
      theme: material.theme,
      focus: material.focus,
      comment: `Extraído do resumo clínico oficial "${material.title}".`,
      priority: 'essential' as const
    };

    flashcardsService.saveNewFlashcard(newCard, user?.id);
    showToast('Flashcard Cloze criado e adicionado à sua fila de estudos!');
    setSelectedToolbarState(null);
  };

  const handleNavigateToHighlight = (textQuote: string) => {
    setIsHighlightsDrawerOpen(false);
    setTimeout(() => {
      if (!articleRef.current) return;
      const marks = articleRef.current.querySelectorAll('mark');
      for (const mark of Array.from(marks)) {
        if (
          mark.textContent?.toLowerCase().includes(textQuote.toLowerCase()) ||
          textQuote.toLowerCase().includes(mark.textContent?.toLowerCase() || '')
        ) {
          mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
          mark.classList.add('ring-4', 'ring-amber-400', 'ring-offset-2');
          setTimeout(() => {
            mark.classList.remove('ring-4', 'ring-amber-400', 'ring-offset-2');
          }, 2000);
          break;
        }
      }
    }, 150);
  };

  const toggleRevealCloze = (clozeId: string) => {
    setRevealedClozeIds((prev) => {
      const next = new Set(prev);
      if (next.has(clozeId)) {
        next.delete(clozeId);
      } else {
        next.add(clozeId);
      }
      return next;
    });
  };

  // Formatador de expressões matemáticas e clínicas (LaTeX -> Símbolos UTF-8 limpos)
  const formatMedicalMath = (raw: string): string => {
    if (!raw) return '';
    let text = raw;

    // Remove marcadores de bloco $$ ou inline $ se presentes
    text = text.replace(/^\$\$|\$\$$/g, '').replace(/^\$|\$$/g, '');

    // Desempacota recursivamente todas as tags \mathbf{...}, \textbf{...}, \mathrm{...}, \mathit{...}, \text{...}
    while (/\\(?:mathbf|textbf|mathrm|mathit|text)\{([^{}]*)\}/.test(text)) {
      text = text.replace(/\\(?:mathbf|textbf|mathrm|mathit|text)\{([^{}]*)\}/g, '$1');
    }

    // Desempacota recursivamente frações \frac{num}{den} com suporte a chaves aninhadas
    while (/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/.test(text)) {
      text = text.replace(/\\frac\s*\{([^{}]+)\}\s*\{([^{}]+)\}/g, '($1 / $2)');
    }

    // Limpeza de operadores e símbolos matemáticos (suporta barras simples ou duplas)
    text = text
      .replace(/\\{1,2}(?:le|leq)\b/g, '≤')
      .replace(/\\{1,2}(?:ge|geq)\b/g, '≥')
      .replace(/\\{1,2}approx\b/g, '≈')
      .replace(/\\{1,2}(?:to|rightarrow)\b/g, '→')
      .replace(/\\{1,2}(?:implies|Longrightarrow|Rightarrow)\b/g, ' ⟹ ')
      .replace(/\\{1,2}(?:iff|Longleftrightarrow|Leftrightarrow)\b/g, ' ⟺ ')
      .replace(/\\{1,2}(?:quad|qquad)\b/g, '   ')
      .replace(/\\{1,2}lor\b/g, ' ou ')
      .replace(/\\{1,2}land\b/g, ' e ')
      .replace(/\{,\}/g, ',')
      .replace(/\\{1,2}cdot\b/g, '·')
      .replace(/\\{1,2}neq\b/g, '≠')
      .replace(/\\{1,2}infty\b/g, '∞')
      .replace(/\\{1,2}Delta\b/g, 'Δ')
      .replace(/\\{1,2}left[([{|.]/g, '')
      .replace(/\\{1,2}right[)\]}|.]/g, '')
      .replace(/\\{1,2}downarrow\b/g, '↓')
      .replace(/\\{1,2}uparrow\b/g, '↑')
      .replace(/\\{1,2}pm\b/g, '±')
      .replace(/\\{1,2}times\b/g, '×')
      .replace(/\\{1,2}mu\b/g, 'µ')
      .replace(/\\{1,2}%/g, '%')
      .replace(/\^?\\{1,2}circ\s*C?\b/g, '°C')
      .replace(/\\{1,2}circ\b/g, '°')
      .replace(/\\{1,2}begin\{cases\}/g, '')
      .replace(/\\{1,2}end\{cases\}/g, '')
      .replace(/\\\\/g, '   •   ')
      .replace(/\\{1,2},/g, ' ')
      .replace(/_\{?(\d+)\}?/g, (_, d) => {
        const subs: Record<string, string> = {
          '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄',
          '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉'
        };
        return d.split('').map((c: string) => subs[c] || c).join('');
      })
      .replace(/\^\{?(\d+)\}?/g, (_, d) => {
        const sups: Record<string, string> = {
          '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴',
          '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹'
        };
        return d.split('').map((c: string) => sups[c] || c).join('');
      })
      .replace(/\$([^$]+)\$/g, '$1')
      .replace(/\$/g, '')
      .replace(/<br\s*\/?>/gi, ' ');

    return text.trim();
  };

  // Aplica marcações de grifos do estudante e tooltips do glossário médico
  const applyHighlightsAndGlossary = (
    textSegment: string,
    contextKey: string
  ): React.ReactNode => {
    if (!textSegment) return null;

    // 1. Prioridade: Destaques salvos pelo aluno (ordenados por maior extensão)
    const sortedHighlights = [...highlights].sort(
      (a, b) => b.textQuote.length - a.textQuote.length
    );

    for (const hl of sortedHighlights) {
      if (!hl.textQuote) continue;
      const quote = hl.textQuote;
      const lowerText = textSegment.toLowerCase();
      const idx = lowerText.indexOf(quote.toLowerCase());

      if (idx !== -1) {
        const before = textSegment.slice(0, idx);
        const matched = textSegment.slice(idx, idx + quote.length);
        const after = textSegment.slice(idx + quote.length);
        const config = HIGHLIGHT_COLORS[hl.color] || HIGHLIGHT_COLORS.yellow;

        return (
          <React.Fragment key={`${contextKey}-hl-${hl.id}`}>
            {applyHighlightsAndGlossary(before, `${contextKey}-b`)}
            <mark
              data-highlight-id={hl.id}
              onClick={(e) => handleOpenHighlightToolbar(hl, e)}
              className={`rounded px-1 py-0.5 mx-0.5 cursor-pointer transition-all duration-150 ${config.bgClass} ${hl.style === 'underline' ? 'underline decoration-2' : ''
                } ${hl.style === 'strikethrough' ? 'line-through' : ''}`}
              title={hl.note ? `Nota: ${hl.note}` : `${config.label} (Clique para editar/remover)`}
            >
              {matched}
              {hl.note && (
                <span
                  className="ml-1 inline-flex items-center text-[10px] text-amber-500 font-bold select-none"
                  title={`Nota: ${hl.note}`}
                >
                  📝
                </span>
              )}
            </mark>
            {applyHighlightsAndGlossary(after, `${contextKey}-a`)}
          </React.Fragment>
        );
      }
    }

    // 2. Dicas de Glossário Médico e Siglas de Prova (on-hover / toque)
    const glossaryKeys = Object.keys(MEDICAL_GLOSSARY);
    for (const gKey of glossaryKeys) {
      const regex = new RegExp(`\\b(${gKey.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&')})\\b`, 'i');
      const match = textSegment.match(regex);
      if (match && match.index !== undefined) {
        const start = match.index;
        const matched = textSegment.slice(start, start + match[0].length);
        const before = textSegment.slice(0, start);
        const after = textSegment.slice(start + match[0].length);
        const entry = MEDICAL_GLOSSARY[gKey];

        return (
          <React.Fragment key={`${contextKey}-gloss-${gKey}`}>
            {applyHighlightsAndGlossary(before, `${contextKey}-gb`)}
            <MedicalGlossaryTooltip term={matched} entry={entry}>
              {matched}
            </MedicalGlossaryTooltip>
            {applyHighlightsAndGlossary(after, `${contextKey}-ga`)}
          </React.Fragment>
        );
      }
    }

    return textSegment;
  };

  let clozeCounter = 0;
  const renderInlineFormatting = (rawText: string) => {
    const text = formatMedicalMath(rawText);

    // Divisão por negrito (**), itálico (*), ou código inline (`)
    const regex = /(\*\*.*?\*\*|\*.*?\*|`.*?`)/g;
    const parts = text.split(regex);

    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
        const innerText = part.slice(2, -2);
        clozeCounter++;
        const clozeId = `cloze_${clozeCounter}_${innerText.slice(0, 15)}`;

        if (isClozeMode) {
          const isRevealed = revealAllCloze || revealedClozeIds.has(clozeId);
          if (!isRevealed) {
            return (
              <button
                key={i}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleRevealCloze(clozeId);
                }}
                className="inline-block px-2 py-0.5 mx-0.5 rounded-md bg-zinc-200 dark:bg-zinc-800 border border-zinc-300 dark:border-zinc-700 blur-[3px] hover:blur-none active:blur-none transition-all duration-200 cursor-pointer text-zinc-800 dark:text-zinc-200 font-bold select-none text-xs"
                title="Modo Treino: Clique para revelar o termo"
              >
                {innerText}
              </button>
            );
          }

          return (
            <strong
              key={i}
              onClick={(e) => {
                e.stopPropagation();
                toggleRevealCloze(clozeId);
              }}
              className="font-bold text-amber-600 dark:text-amber-400 underline decoration-dotted underline-offset-2 cursor-pointer transition-colors"
              title="Clique para ocultar novamente"
            >
              {applyHighlightsAndGlossary(innerText, `cloze-${i}`)}
            </strong>
          );
        }

        return (
          <strong key={i} className="font-bold text-zinc-900 dark:text-zinc-100">
            {applyHighlightsAndGlossary(innerText, `strong-${i}`)}
          </strong>
        );
      }
      if (part.startsWith('*') && part.endsWith('*') && part.length >= 2) {
        return (
          <em key={i} className="italic text-zinc-800 dark:text-zinc-200">
            {applyHighlightsAndGlossary(part.slice(1, -1), `em-${i}`)}
          </em>
        );
      }
      if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
        return (
          <code
            key={i}
            className="px-1.5 py-0.5 rounded-md bg-zinc-100 dark:bg-zinc-800 font-mono text-[11px] text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700"
          >
            {part.slice(1, -1)}
          </code>
        );
      }
      return applyHighlightsAndGlossary(part, `part-${i}`);
    });
  };

  // Estado do carrossel interativo de Pontos-Chave das Provas
  const [activeKeyPointIndex, setActiveKeyPointIndex] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right'>('right');
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  const totalKeyPoints = material.keyPoints ? material.keyPoints.length : 0;

  const handlePrevKeyPoint = () => {
    if (totalKeyPoints <= 1) return;
    setSlideDirection('left');
    setActiveKeyPointIndex((prev) => (prev - 1 + totalKeyPoints) % totalKeyPoints);
  };

  const handleNextKeyPoint = () => {
    if (totalKeyPoints <= 1) return;
    setSlideDirection('right');
    setActiveKeyPointIndex((prev) => (prev + 1) % totalKeyPoints);
  };

  // Navegação por teclado (Seta Esquerda / Seta Direita) em loop infinito
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (totalKeyPoints <= 1) return;
      if (e.key === 'ArrowLeft') {
        handlePrevKeyPoint();
      } else if (e.key === 'ArrowRight') {
        handleNextKeyPoint();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [totalKeyPoints]);

  // Renderizador do Carrossel de Pontos-Chave das Provas (Card central em foco com animação suave, loop infinito)
  const renderKeyPointsCarousel = () => {
    if (!material.keyPoints || material.keyPoints.length === 0) return null;

    const prevIdx = (activeKeyPointIndex - 1 + totalKeyPoints) % totalKeyPoints;
    const currIdx = activeKeyPointIndex;
    const nextIdx = (activeKeyPointIndex + 1) % totalKeyPoints;

    return (
      <div className="my-10 p-5 sm:p-6 rounded-3xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800 space-y-4">
        {/* Cabeçalho do Carrossel de Pontos-Chave */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
              Pérolas de Alto Rendimento em Prova
            </h3>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
              Regras de ouro e armadilhas cruciais das bancas examinadoras (use as setas ← / → do teclado)
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-zinc-500 dark:text-zinc-400 mr-1">
              {activeKeyPointIndex + 1} de {totalKeyPoints}
            </span>
            <button
              type="button"
              onClick={handlePrevKeyPoint}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Ponto-chave anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleNextKeyPoint}
              className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700 transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="Próximo ponto-chave"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carrossel em Loop Infinito: Card central em foco com transição suave, anterior e próximo nas laterais */}
        <div
          onTouchStart={(e) => setTouchStartX(e.touches[0].clientX)}
          onTouchEnd={(e) => {
            if (touchStartX === null) return;
            const delta = e.changedTouches[0].clientX - touchStartX;
            if (delta > 40) handlePrevKeyPoint();
            else if (delta < -40) handleNextKeyPoint();
            setTouchStartX(null);
          }}
          className="flex items-stretch justify-center gap-3 sm:gap-4 md:gap-5 py-4 overflow-hidden relative select-none snap-x snap-mandatory"
        >
          {/* Card Anterior (ex.: Último Card antes do Card 1 em loop) */}
          <div
            key={`prev-${prevIdx}`}
            onClick={handlePrevKeyPoint}
            className="hidden sm:flex flex-col justify-start shrink-0 w-[240px] md:w-[280px] lg:w-[320px] p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-[#121215]/50 border border-zinc-200/60 dark:border-zinc-800/60 scale-95 opacity-35 blur-[0.5px] hover:opacity-70 cursor-pointer transition-all duration-500 ease-out space-y-3 min-h-[170px]"
            title="Clique para ir ao card anterior"
          >
            <div
              className="w-6 h-6 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs opacity-80 shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {prevIdx + 1}
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal line-clamp-4">
              {renderInlineFormatting(material.keyPoints[prevIdx])}
            </p>
          </div>

          {/* Card Central em Foco com Transição Suave e Cor do Tema */}
          <div
            key={`curr-${currIdx}`}
            className={`flex flex-col justify-start shrink-0 w-full max-w-[340px] sm:max-w-[420px] md:max-w-[480px] p-5 sm:p-6 rounded-2xl bg-white dark:bg-[#121215] border-2 shadow-md scale-100 opacity-100 space-y-3 min-h-[180px] transition-all duration-500 ease-out animate-in fade-in ${slideDirection === 'right' ? 'slide-in-from-right-4' : 'slide-in-from-left-4'
              }`}
            style={{
              borderColor: accentConfig.primaryHex,
              boxShadow: `0 4px 14px -2px ${accentConfig.bgRgba}, 0 0 0 3px ${accentConfig.bgRgba}`
            }}
          >
            <div
              className="w-7 h-7 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {currIdx + 1}
            </div>

            <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
              {renderInlineFormatting(material.keyPoints[currIdx])}
            </p>
          </div>

          {/* Próximo Card (ex.: Card 2 depois do Card 1 em loop) */}
          <div
            key={`next-${nextIdx}`}
            onClick={handleNextKeyPoint}
            className="hidden sm:flex flex-col justify-start shrink-0 w-[240px] md:w-[280px] lg:w-[320px] p-4 sm:p-5 rounded-2xl bg-white/50 dark:bg-[#121215]/50 border border-zinc-200/60 dark:border-zinc-800/60 scale-95 opacity-35 blur-[0.5px] hover:opacity-70 cursor-pointer transition-all duration-500 ease-out space-y-3 min-h-[170px]"
            title="Clique para ir ao próximo card"
          >
            <div
              className="w-6 h-6 rounded-full text-white font-black text-xs flex items-center justify-center shadow-xs opacity-80 shrink-0"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              {nextIdx + 1}
            </div>
            <p className="text-xs text-zinc-700 dark:text-zinc-300 leading-relaxed font-normal line-clamp-4">
              {renderInlineFormatting(material.keyPoints[nextIdx])}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Renderizador principal de Markdown com substituição por componentes nativos
  const renderMarkdownContent = (content: string) => {
    const lines = content.split(/\r?\n/);
    const elements: React.ReactNode[] = [];

    let inCodeBlock = false;
    let codeBlockLang = '';
    let codeBlockLines: string[] = [];

    let inTable = false;
    let tableRows: string[][] = [];
    let tableHeaders: string[] = [];
    let hasRenderedKeyPoints = false;

    let inMathBlock = false;
    let mathBlockLines: string[] = [];

    const flushTable = (key: string) => {
      if (inTable && tableHeaders.length > 0) {
        elements.push(
          <div
            key={`table-${key}`}
            className="my-6 overflow-x-auto rounded-2xl border border-zinc-200/90 dark:border-zinc-800 shadow-xs"
          >
            <table className="w-full text-left text-xs sm:text-sm border-collapse table-auto">
              <thead>
                <tr className="bg-zinc-100/90 dark:bg-zinc-900/90 border-b border-zinc-200 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">
                  {tableHeaders.map((th, idx) => (
                    <th key={idx} className="p-3.5 font-bold tracking-tight">
                      {renderInlineFormatting(th.trim())}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/80 bg-white dark:bg-[#121215]">
                {tableRows.map((tr, rIdx) => (
                  <tr
                    key={rIdx}
                    className="hover:bg-zinc-50/80 dark:hover:bg-zinc-900/40 transition-colors"
                  >
                    {tr.map((td, cIdx) => (
                      <td key={cIdx} className="p-3.5 text-zinc-700 dark:text-zinc-300 align-top leading-relaxed">
                        {renderInlineFormatting(td.trim())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
        inTable = false;
        tableRows = [];
        tableHeaders = [];
      }
    };

    const flushCodeBlock = (key: string) => {
      const fullCode = codeBlockLines.join('\n').trim();
      const lang = codeBlockLang.toLowerCase();

      // Interceptação por componentes nativos ricos integrados ao tema do site
      if (
        lang === 'clinical-scheme' ||
        lang === 'visual-scheme'
      ) {
        try {
          const schemeData = JSON.parse(fullCode);
          elements.push(
            <UniversalClinicalVisualScheme
              key={`clinical-scheme-${key}`}
              type={schemeData.type || 'bipolar'}
              title={schemeData.title || ''}
              subtitle={schemeData.subtitle}
              badge={schemeData.badge}
              data={schemeData}
            />
          );
        } catch (err) {
          console.error('[StudyMaterialReader] Erro ao decodificar clinical-scheme:', err);
        }
      } else if (
        lang === 'hpp-exam-stats' ||
        fullCode.includes('Recorrência Temática de Hemorragia Pós-Parto') ||
        fullCode.includes('Recorrência Temática de HPP')
      ) {
        elements.push(<HppRecurrenceStatsCard key={`hpp-stats-${key}`} />);
      } else if (
        lang === 'hpp-four-ts' ||
        fullCode.includes('REGRA_DOS_4_TS') ||
        fullCode.includes('DIAGNOSTICO_4_TS')
      ) {
        elements.push(<HppFourTsCard key={`hpp-four-ts-${key}`} />);
      } else if (
        lang === 'hpp-golden-hour' ||
        fullCode.includes('FLUXO_GOLDEN_HOUR') ||
        fullCode.includes('ALGORITMO_GOLDEN_HOUR')
      ) {
        elements.push(<HppGoldenHourAlgorithmCard key={`hpp-golden-${key}`} />);
      } else if (
        lang === 'gem-stats-corionicidade' ||
        fullCode.includes('Recorrência Temática de Classificação e Diagnóstico de Gemelares')
      ) {
        let parsedData: any = null;
        try {
          const trimmed = fullCode.trim();
          if (trimmed.startsWith('{')) parsedData = JSON.parse(trimmed);
        } catch (e) {
          console.warn('[StudyMaterialReader] Erro ao decodificar JSON de gem-stats-corionicidade:', e);
        }

        if (material?.recurrenceStats) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={material.recurrenceStats}
              focusTitle={material.focus}
            />
          );
        } else if (parsedData && Array.isArray(parsedData.donutSlices || parsedData.items)) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={parsedData}
              slices={parsedData.donutSlices || parsedData.items}
              totalQuestions={parsedData.totalQuestions}
              focusTitle={material?.focus || parsedData.focus || parsedData.title}
            />
          );
        } else {
          elements.push(<GemelaridadeRecurrenceStatsCard key={`gem-cor-${key}`} topic="corionicidade" />);
        }
      } else if (
        lang === 'gem-stats-complicacoes' ||
        fullCode.includes('Recorrência Temática de Complicações da Gemelaridade')
      ) {
        let parsedData: any = null;
        try {
          const trimmed = fullCode.trim();
          if (trimmed.startsWith('{')) parsedData = JSON.parse(trimmed);
        } catch (e) {
          console.warn('[StudyMaterialReader] Erro ao decodificar JSON de gem-stats-complicacoes:', e);
        }

        if (material?.recurrenceStats) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={material.recurrenceStats}
              focusTitle={material.focus}
            />
          );
        } else if (parsedData && Array.isArray(parsedData.donutSlices || parsedData.items)) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={parsedData}
              slices={parsedData.donutSlices || parsedData.items}
              totalQuestions={parsedData.totalQuestions}
              focusTitle={material?.focus || parsedData.focus || parsedData.title}
            />
          );
        } else {
          elements.push(<GemelaridadeRecurrenceStatsCard key={`gem-comp-${key}`} topic="complicacoes" />);
        }
      } else if (
        lang === 'gem-stats-stff' ||
        fullCode.includes('Recorrência Temática de Síndrome da Transfusão Feto-Fetal')
      ) {
        let parsedData: any = null;
        try {
          const trimmed = fullCode.trim();
          if (trimmed.startsWith('{')) parsedData = JSON.parse(trimmed);
        } catch (e) {
          console.warn('[StudyMaterialReader] Erro ao decodificar JSON de gem-stats-stff:', e);
        }

        if (material?.recurrenceStats) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={material.recurrenceStats}
              focusTitle={material.focus}
            />
          );
        } else if (parsedData && Array.isArray(parsedData.donutSlices || parsedData.items)) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={parsedData}
              slices={parsedData.donutSlices || parsedData.items}
              totalQuestions={parsedData.totalQuestions}
              focusTitle={material?.focus || parsedData.focus || parsedData.title}
            />
          );
        } else {
          elements.push(<GemelaridadeRecurrenceStatsCard key={`gem-stff-${key}`} topic="stff" />);
        }
      } else if (
        lang === 'gem-stats-parto' ||
        fullCode.includes('Recorrência Temática de Parto em Gestação Múltipla')
      ) {
        let parsedData: any = null;
        try {
          const trimmed = fullCode.trim();
          if (trimmed.startsWith('{')) parsedData = JSON.parse(trimmed);
        } catch (e) {
          console.warn('[StudyMaterialReader] Erro ao decodificar JSON de gem-stats-parto:', e);
        }

        if (material?.recurrenceStats) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={material.recurrenceStats}
              focusTitle={material.focus}
            />
          );
        } else if (parsedData && Array.isArray(parsedData.donutSlices || parsedData.items)) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={parsedData}
              slices={parsedData.donutSlices || parsedData.items}
              totalQuestions={parsedData.totalQuestions}
              focusTitle={material?.focus || parsedData.focus || parsedData.title}
            />
          );
        } else {
          elements.push(<GemelaridadeRecurrenceStatsCard key={`gem-parto-${key}`} topic="parto" />);
        }
      } else if (
        lang === 'exam-stats' ||
        fullCode.includes('Recorrência Estatística em Provas') ||
        fullCode.includes('Frequência Relativa de Cobrança')
      ) {
        let parsedData: { totalQuestions?: number; items?: any[]; title?: string } | null = null;
        try {
          const trimmed = fullCode.trim();
          if (trimmed.startsWith('{')) {
            parsedData = JSON.parse(trimmed);
          }
        } catch (e) {
          console.warn('[StudyMaterialReader] Erro ao decodificar JSON de exam-stats:', e);
        }

        const rawSlices = (parsedData as any)?.donutSlices || (parsedData as any)?.items;

        if (material?.recurrenceStats) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={material.recurrenceStats}
              focusTitle={material.focus}
            />
          );
        } else if (parsedData && Array.isArray(rawSlices) && rawSlices.length > 0) {
          elements.push(
            <UniversalRecurrenceStatsCard
              key={`universal-stats-${key}`}
              analytics={parsedData as any}
              slices={rawSlices}
              totalQuestions={parsedData.totalQuestions}
              focusTitle={material?.focus || (parsedData as any)?.focus || parsedData.title}
            />
          );
        } else if (parsedData && Array.isArray(parsedData.items) && parsedData.items.length > 0) {
          elements.push(
            <ExamRecurrenceStatsCard
              key={`exam-stats-${key}`}
              data={parsedData.items}
              totalQuestions={parsedData.totalQuestions}
              title={parsedData.title}
            />
          );
        } else {
          // Se não há dados válidos do censo, aponta como erro no resumo (tolerância zero no plano canônico)
          elements.push(
            <ExamRecurrenceStatsCard key={`exam-stats-${key}`} data={[]} />
          );
        }
      } else if (
        lang === 'risk-factors' ||
        fullCode.includes('FATORES_RISCO') ||
        fullCode.includes('FATORES_PROTECAO')
      ) {
        elements.push(<RiskFactorsComparisonCard key={`risk-factors-${key}`} />);
      } else if (
        lang === 'topography-symptoms' ||
        fullCode.includes('Localização do Mioma') ||
        fullCode.includes('Submucosos (FIGO 0, 1, 2)')
      ) {
        elements.push(<TopographicSymptomsCard key={`topography-${key}`} />);
      } else if (
        lang === 'diagnostic-pipeline' ||
        fullCode.includes('Suspeita Clínica de Mioma') ||
        fullCode.includes('EXAME INICIAL DE ESCOLHA')
      ) {
        elements.push(<DiagnosticPipelineCard key={`pipeline-${key}`} />);
      } else if (
        lang === 'degenerations' ||
        fullCode.includes('DegeneracaoHialina') ||
        fullCode.includes('DegeneracaoRubra')
      ) {
        elements.push(<DegenerationsCard key={`degenerations-${key}`} />);
      } else if (
        lang === 'treatment-algorithm' ||
        fullCode.includes('Inicio["Paciente com Diagnóstico de Miomatose Uterina"]') ||
        fullCode.includes('CONTROLE_SANGRAMENTO')
      ) {
        elements.push(<TreatmentAlgorithmCard key={`treatment-${key}`} />);
      } else if (
        lang === 'lasmar-score' ||
        lang === 'stepw' ||
        fullCode.includes('STEPW') ||
        fullCode.includes('Lasmar')
      ) {
        elements.push(<LasmarStepwCard key={`stepw-${key}`} />);
      } else if (
        lang === 'figo' ||
        fullCode.includes('SEROSA UTERINA') ||
        fullCode.includes('CAVIDADE ENDOMETRIAL') ||
        fullCode.includes('Classificação FIGO')
      ) {
        elements.push(<FigoAnatomicalDiagram key={`figo-${key}`} />);
      } else if (lang === 'mermaid') {
        let diagramTitle = '';
        const titleMatch = fullCode.match(/title\s+["']?([^"'\n]+)["']?/i);
        if (titleMatch) {
          diagramTitle = titleMatch[1].trim();
        }
        elements.push(
          <MermaidDiagram
            key={`mermaid-${key}`}
            code={fullCode}
            title={diagramTitle || 'Esquema Visual de Decisão Clínica'}
          />
        );
      } else if (lang === 'diff-diagnosis') {
        let diffData: any = null;
        try {
          diffData = JSON.parse(fullCode.trim());
        } catch (e) {
          console.warn('[StudyMaterialReader] Erro ao decodificar JSON de diff-diagnosis:', e);
        }

        if (diffData && Array.isArray(diffData.entities)) {
          elements.push(
            <div
              key={`diff-${key}`}
              className="my-8 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121215] overflow-hidden shadow-xs"
            >
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <Stethoscope className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                      {diffData.title || 'Diagnóstico Diferencial Comparativo'}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Critérios discriminativos de prova e condutas homologadas
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-blue-500/15 text-blue-700 dark:text-blue-400 border border-blue-500/30">
                  Diferencial Canônico
                </span>
              </div>

              <div className="p-5 sm:p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {diffData.entities.map((ent: any, idx: number) => (
                  <div
                    key={idx}
                    className="p-4 sm:p-5 rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40 flex flex-col justify-between space-y-3"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 border-b border-zinc-200/60 dark:border-zinc-800/80 pb-2">
                        <span className="font-heading font-black text-sm text-zinc-900 dark:text-zinc-100">
                          {ent.name}
                        </span>
                        {ent.period && (
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-zinc-200/60 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
                            {ent.period}
                          </span>
                        )}
                      </div>

                      <div className="mt-3 space-y-1.5 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed">
                        {ent.feverDuration && (
                          <div>
                            <strong className="text-zinc-800 dark:text-zinc-200">Curva Térmica:</strong> {ent.feverDuration}
                          </div>
                        )}
                        {ent.uterineSigns && (
                          <div>
                            <strong className="text-zinc-800 dark:text-zinc-200">Sinais Uterinos:</strong> {ent.uterineSigns}
                          </div>
                        )}
                        {ent.lochia && (
                          <div>
                            <strong className="text-zinc-800 dark:text-zinc-200">Lóquios:</strong> {ent.lochia}
                          </div>
                        )}
                        {ent.hallmark && (
                          <div className="pt-1 text-zinc-800 dark:text-zinc-200 font-medium">
                            <span className="text-amber-600 dark:text-amber-400 font-bold">Achado Cardinal: </span>
                            {ent.hallmark}
                          </div>
                        )}
                      </div>
                    </div>

                    {ent.keyConduct && (
                      <div className="pt-2 border-t border-zinc-200/60 dark:border-zinc-800/80 text-xs">
                        <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400 block mb-0.5">
                          Conduta Padrão-Ouro
                        </span>
                        <span className="font-semibold text-zinc-800 dark:text-zinc-200 leading-snug">
                          {ent.keyConduct}
                        </span>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        }
      } else if (lang === 'clinical-score') {
        let scoreData: any = null;
        try {
          scoreData = JSON.parse(fullCode.trim());
        } catch (e) {
          console.warn('[StudyMaterialReader] Erro ao decodificar JSON de clinical-score:', e);
        }

        if (scoreData && Array.isArray(scoreData.parameters)) {
          elements.push(
            <div
              key={`score-${key}`}
              className="my-8 rounded-3xl border border-zinc-200/90 dark:border-zinc-800 bg-white dark:bg-[#121215] overflow-hidden shadow-xs"
            >
              <div className="px-5 py-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-3 bg-zinc-50/60 dark:bg-zinc-900/50">
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-8 h-8 rounded-xl flex items-center justify-center text-white shadow-xs shrink-0"
                    style={{ backgroundColor: accentConfig.primaryHex }}
                  >
                    <HeartPulse className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                      {scoreData.title || 'Escore Clínico & Protocolo'}
                    </h3>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                      Critérios de estratificação e conduta imediata
                    </p>
                  </div>
                </div>
                <span className="px-2.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-500/15 text-rose-700 dark:text-rose-400 border border-rose-500/30">
                  Gatilho de Sepse
                </span>
              </div>

              <div className="p-5 sm:p-6 space-y-5">
                <div className="overflow-x-auto rounded-2xl border border-zinc-200/80 dark:border-zinc-800/80">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-zinc-100/80 dark:bg-zinc-900/80 border-b border-zinc-200/80 dark:border-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold">
                        <th className="p-3">Parâmetro</th>
                        <th className="p-3">Normalidade</th>
                        <th className="p-3">Gatilho de Alerta</th>
                        <th className="p-3">Significado Clínico</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800 bg-white dark:bg-[#121215]">
                      {scoreData.parameters.map((param: any, pIdx: number) => (
                        <tr key={pIdx} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors">
                          <td className="p-3 font-bold text-zinc-900 dark:text-zinc-100">{param.parameter}</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-300">{param.normalRange}</td>
                          <td className="p-3 font-semibold text-rose-600 dark:text-rose-400">{param.alertTrigger}</td>
                          <td className="p-3 text-zinc-600 dark:text-zinc-400">{param.clinicalMeaning}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {scoreData.actionThreshold && (
                  <div className="p-4 sm:p-5 rounded-2xl border border-rose-500/30 bg-rose-500/5 space-y-3">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                      <span className="font-heading font-black text-xs sm:text-sm text-rose-700 dark:text-rose-400">
                        {scoreData.actionThreshold.bundleProtocol || 'PROTOCOLO DE CONDUTA IMEDIATA'}
                      </span>
                    </div>
                    {scoreData.actionThreshold.triggerCondition && (
                      <p className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                        {scoreData.actionThreshold.triggerCondition}
                      </p>
                    )}
                    {Array.isArray(scoreData.actionThreshold.mandatorySteps) && (
                      <ul className="text-xs space-y-1.5 text-zinc-700 dark:text-zinc-300 font-medium">
                        {scoreData.actionThreshold.mandatorySteps.map((step: string, sIdx: number) => (
                          <li key={sIdx} className="flex items-start gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                            <span>{step}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
            </div>
          );
        }
      } else {
        elements.push(
          <div
            key={`code-${key}`}
            className="my-5 rounded-xl overflow-hidden border border-zinc-200 dark:border-zinc-800"
          >
            {lang && (
              <div className="bg-zinc-100 dark:bg-zinc-900 px-4 py-1.5 text-[11px] font-mono text-zinc-500 border-b border-zinc-200 dark:border-zinc-800">
                {lang}
              </div>
            )}
            <pre className="p-4 bg-zinc-950 text-zinc-200 font-mono text-xs overflow-x-auto whitespace-pre leading-relaxed">
              <code>{fullCode}</code>
            </pre>
          </div>
        );
      }

      inCodeBlock = false;
      codeBlockLang = '';
      codeBlockLines = [];
    };

    const renderMathFormula = (rawMath: string, key: string) => {
      if (!rawMath) return;
      const mathContent = rawMath.startsWith('$$') && rawMath.endsWith('$$')
        ? rawMath.slice(2, -2).trim()
        : rawMath.replace(/^\$+/, '').replace(/\$+$/, '').trim();

      // Extrai lado esquerdo e fração com suporte a chaves aninhadas (\text{...})
      const eqIdx = mathContent.indexOf('=');
      if (eqIdx !== -1 && mathContent.includes('\\frac')) {
        const leftRaw = mathContent.slice(0, eqIdx).trim();
        const rightRaw = mathContent.slice(eqIdx + 1).trim();

        // Regex que suporta chaves aninhadas no numerador e denominador
        const fracRegex = /\\frac\s*\{((?:[^{}]|\{[^{}]*\})*)\}\s*\{((?:[^{}]|\{[^{}]*\})*)\}/;
        const match = rightRaw.match(fracRegex);
        if (match) {
          const leftSide = formatMedicalMath(leftRaw);
          const num = formatMedicalMath(match[1]);
          const den = formatMedicalMath(match[2]);

          elements.push(
            <div
              key={`math-${key}`}
              className="my-5 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex flex-col items-center justify-center text-center space-y-3 not-prose"
            >
              <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
                <span className="text-zinc-800 dark:text-zinc-200">{leftSide}</span>
                <span className="text-zinc-400 font-normal text-base">=</span>
                <div className="inline-flex flex-col items-center">
                  <span className="px-4 pb-1.5 border-b-2 border-zinc-500 dark:border-zinc-400 text-zinc-900 dark:text-zinc-100 font-bold text-center">
                    {num}
                  </span>
                  <span className="px-4 pt-1.5 text-zinc-600 dark:text-zinc-400 font-semibold text-center text-xs">
                    {den}
                  </span>
                </div>
              </div>
            </div>
          );
          return;
        }
      }

      // Suporte avançado e flexível a ambiente cases: \begin{cases} ... \end{cases}
      // Suporta \implies, \iff, \Longleftrightarrow, etc. com barras simples ou duplas
      const casesMatch = mathContent.match(/^(.*?)(?:\\{1,2}(?:implies|iff|Longrightarrow|Longleftrightarrow|Rightarrow|Leftrightarrow)|⟹|⟺)\s*\\{1,2}begin\{cases\}([\s\S]*?)\\{1,2}end\{cases\}\s*$/);
      if (casesMatch) {
        const entity = formatMedicalMath(casesMatch[1]);
        const operatorSymbol = mathContent.includes('iff') || mathContent.includes('⟺') ? '⟺' : '⟹';
        const rawItems = casesMatch[2].split(/\\{2,4}/);
        const items = rawItems
          .map(it => formatMedicalMath(it).trim())
          .filter(it => it.length > 0);

        elements.push(
          <div
            key={`math-cases-${key}`}
            className="my-6 p-5 sm:p-6 rounded-3xl bg-zinc-50/80 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-5 not-prose"
          >
            <div className="flex items-center gap-3 shrink-0">
              <div
                className="w-10 h-10 rounded-2xl flex items-center justify-center text-white shadow-xs font-heading font-black text-sm shrink-0"
                style={{ backgroundColor: accentConfig.primaryHex }}
              >
                Tx
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 block">
                  Definição / Algoritmo Canônico
                </span>
                <span className="font-heading font-black text-sm sm:text-base text-zinc-900 dark:text-zinc-100">
                  {entity}
                </span>
              </div>
            </div>

            <div className="hidden md:flex items-center justify-center text-zinc-400 dark:text-zinc-500 text-xl font-bold px-2">
              {operatorSymbol}
            </div>

            <div className="flex-1 space-y-2.5 w-full">
              {items.map((itemText, i) => {
                const cleanText = itemText.replace(/^\d+[\.\)]\s*/, '');
                return (
                  <div
                    key={i}
                    className="flex items-start gap-3 p-3.5 rounded-2xl bg-white dark:bg-[#121215] border border-zinc-200/80 dark:border-zinc-800/80 shadow-2xs"
                  >
                    <div
                      className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-xs shrink-0 mt-0.5"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    >
                      {i + 1}
                    </div>
                    <span className="font-heading font-bold text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-snug">
                      {cleanText}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        );
        return;
      }

      // Bloco padrão de fórmula caso não seja fração nem cases
      const formatted = formatMedicalMath(mathContent);
      elements.push(
        <div
          key={`math-block-${key}`}
          className="my-4 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200/90 dark:border-zinc-800 shadow-xs flex items-center justify-center text-center not-prose"
        >
          <span className="font-heading font-black text-xs sm:text-sm text-zinc-900 dark:text-zinc-100">
            {formatted}
          </span>
        </div>
      );
    };

    let inUnorderedList = false;
    let unorderedListItems: Array<{ text: string; level: number }> = [];

    let inOrderedList = false;
    let orderedListItems: string[] = [];

    const flushUnorderedList = (key: string) => {
      if (inUnorderedList && unorderedListItems.length > 0) {
        const items = [...unorderedListItems];
        elements.push(
          <div key={`ul-${key}`} className="my-3 space-y-2 not-prose">
            {items.map((item, idx) => {
              if (item.level === 0) {
                return (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 font-medium leading-relaxed pt-1"
                  >
                    <span
                      className="w-2 h-2 rounded-full shrink-0 mt-1.5 shadow-2xs"
                      style={{ backgroundColor: accentConfig.primaryHex }}
                    />
                    <div className="flex-1">{renderInlineFormatting(item.text)}</div>
                  </div>
                );
              }

              if (item.level === 1) {
                return (
                  <div
                    key={idx}
                    className="ml-5 sm:ml-6 pl-3 sm:pl-4 border-l-2 border-zinc-200 dark:border-zinc-700/60 my-1 flex items-start gap-2 text-xs sm:text-sm text-zinc-600 dark:text-zinc-300 leading-relaxed"
                  >
                    <span className="text-zinc-400 dark:text-zinc-500 font-mono text-xs shrink-0 select-none mt-0.5">
                      ↳
                    </span>
                    <div className="flex-1">{renderInlineFormatting(item.text)}</div>
                  </div>
                );
              }

              // level >= 2
              return (
                <div
                  key={idx}
                  className="ml-9 sm:ml-11 pl-3 border-l-2 border-zinc-200/60 dark:border-zinc-800 my-0.5 flex items-start gap-2 text-[11px] sm:text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed"
                >
                  <span className="w-1.5 h-0.5 bg-zinc-400 dark:bg-zinc-500 shrink-0 mt-2" />
                  <div className="flex-1">{renderInlineFormatting(item.text)}</div>
                </div>
              );
            })}
          </div>
        );
        inUnorderedList = false;
        unorderedListItems = [];
      }
    };

    const flushOrderedList = (key: string) => {
      if (inOrderedList && orderedListItems.length > 0) {
        const items = [...orderedListItems];
        elements.push(
          <ol
            key={`ol-${key}`}
            className="my-3 space-y-2 list-decimal pl-5 text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
          >
            {items.map((item, idx) => (
              <li key={idx} className="pl-1">
                {renderInlineFormatting(item)}
              </li>
            ))}
          </ol>
        );
        inOrderedList = false;
        orderedListItems = [];
      }
    };

    const flushAllLists = (key: string) => {
      flushUnorderedList(key);
      flushOrderedList(key);
    };

    lines.forEach((line, index) => {
      const trimmed = line.trim();

      // Detecção de blocos de código (```)
      if (trimmed.startsWith('```')) {
        flushAllLists(`pre-cb-${index}`);
        if (inCodeBlock) {
          flushCodeBlock(`cb-${index}`);
        } else {
          if (inTable) flushTable(`pre-cb-${index}`);
          inCodeBlock = true;
          codeBlockLang = trimmed.slice(3).trim();
          codeBlockLines = [];
        }
        return;
      }

      if (inCodeBlock) {
        codeBlockLines.push(line);
        return;
      }

      // Detecção de blocos matemáticos multilinha ($$)
      if (trimmed === '$$') {
        flushAllLists(`pre-mb-${index}`);
        if (inMathBlock) {
          const fullMath = mathBlockLines.join(' ').trim();
          renderMathFormula(fullMath, `mb-${index}`);
          inMathBlock = false;
          mathBlockLines = [];
        } else {
          if (inTable) flushTable(`pre-mb-${index}`);
          inMathBlock = true;
          mathBlockLines = [];
        }
        return;
      }

      if (inMathBlock) {
        mathBlockLines.push(line);
        return;
      }

      // Detecção de Imagens em Markdown: ![Alt](url)
      const imgMatch = trimmed.match(/^!\[(.*?)\]\((.*?)\)$/);
      if (imgMatch) {
        flushAllLists(`pre-img-${index}`);
        if (inTable) flushTable(`pre-img-${index}`);
        const alt = imgMatch[1];
        const src = imgMatch[2];
        elements.push(
          <figure key={`img-${index}`} className="my-6 text-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={src}
              alt={alt}
              className="mx-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-md max-h-[500px] object-contain"
            />
            {alt && (
              <figcaption className="mt-2 text-xs text-zinc-500 dark:text-zinc-400 italic">
                {alt}
              </figcaption>
            )}
          </figure>
        );
        return;
      }

      // Detecção de Tabelas Markdown
      if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
        flushAllLists(`pre-table-${index}`);
        const cols = trimmed.slice(1, -1).split('|');
        if (!inTable) {
          inTable = true;
          tableHeaders = cols;
        } else if (cols.some((c) => c.includes('---'))) {
          // Linha divisória da tabela
        } else {
          tableRows.push(cols);
        }
        return;
      } else if (inTable) {
        flushTable(`flush-${index}`);
      }

      // Detecção de Bloco Matemático de Fórmula em linha única: $$...$$ ou fórmulas de fração isoladas
      if (
        (trimmed.startsWith('$$') && trimmed.endsWith('$$') && trimmed.length > 4) ||
        (trimmed.includes('\\frac') && trimmed.includes('='))
      ) {
        flushAllLists(`pre-math-${index}`);
        if (inTable) flushTable(`pre-math-${index}`);
        renderMathFormula(trimmed, `math-${index}`);
        return;
      }

      // Títulos Markdown: Elimina repetição do título principal já presente no cabeçalho do leitor
      if (trimmed.startsWith('# ')) {
        // Todo H1 no topo do markdown é ignorado pois o cabeçalho do componente já renderiza o H1 oficial
        return;
      } else if (trimmed.startsWith('## ')) {
        const rawTitle = trimmed.replace('## ', '').trim();
        const isReferencesSection =
          rawTitle.toLowerCase().includes('diretrizes') ||
          rawTitle.toLowerCase().includes('referencias') ||
          rawTitle.toLowerCase().includes('referências');

        // Se for a seção de referências e ainda não renderizou os pontos-chave, insere o carrossel ANTES das referências!
        if (isReferencesSection && !hasRenderedKeyPoints) {
          flushAllLists(`pre-keypoints-${index}`);
          elements.push(
            <React.Fragment key={`keypoints-carousel-inline-${index}`}>
              {renderKeyPointsCarousel()}
            </React.Fragment>
          );
          hasRenderedKeyPoints = true;
        }

        flushAllLists(`pre-h2-${index}`);
        const sectionSlug = rawTitle
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)/g, '');

        elements.push(
          <h2
            key={index}
            id={sectionSlug}
            className="text-lg sm:text-xl font-heading font-bold text-zinc-900 dark:text-zinc-100 mt-8 mb-3 flex items-center gap-2 border-b border-zinc-100 dark:border-zinc-800/80 pb-2 scroll-mt-24"
          >
            <span
              className="w-1.5 h-4.5 rounded-full inline-block"
              style={{ backgroundColor: accentConfig.primaryHex }}
            />
            {renderInlineFormatting(rawTitle)}
          </h2>
        );
      } else if (trimmed.startsWith('### ')) {
        flushAllLists(`pre-h3-${index}`);
        elements.push(
          <h3
            key={index}
            className="text-base sm:text-lg font-heading font-semibold text-zinc-800 dark:text-zinc-200 mt-5 mb-2"
          >
            {renderInlineFormatting(trimmed.replace('### ', ''))}
          </h3>
        );
      } else if (trimmed.startsWith('> [!IMPORTANT]')) {
        flushAllLists(`pre-callout-${index}`);
        elements.push(
          <div
            key={index}
            className="my-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 dark:bg-emerald-500/10 text-emerald-900 dark:text-emerald-300 text-xs sm:text-sm flex gap-3 items-start"
          >
            <Sparkles className="w-5 h-5 shrink-0 text-emerald-600 dark:text-emerald-400 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold">Atualização de Diretriz Oficial</strong>
              <div>{renderInlineFormatting(trimmed.replace('> [!IMPORTANT]', '').trim())}</div>
            </div>
          </div>
        );
      } else if (trimmed.startsWith('> [!WARNING]') || trimmed.startsWith('> [!CAUTION]')) {
        flushAllLists(`pre-callout-${index}`);
        elements.push(
          <div
            key={index}
            className="my-4 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 dark:bg-rose-500/10 text-rose-900 dark:text-rose-300 text-xs sm:text-sm flex gap-3 items-start"
          >
            <AlertTriangle className="w-4 h-5 shrink-0 text-rose-600 dark:text-rose-400 mt-0.5" />
            <div className="space-y-1">
              <strong className="block font-bold">Ponto Crítico / Armadilha da Banca</strong>
              <div>{renderInlineFormatting(trimmed.replace(/> \[(?:!WARNING|!CAUTION)\]/, '').trim())}</div>
            </div>
          </div>
        );
      } else if (trimmed.startsWith('> ')) {
        flushAllLists(`pre-quote-${index}`);
        elements.push(
          <blockquote
            key={index}
            className="my-3 pl-4 border-l-3 border-zinc-400 dark:border-zinc-600 text-zinc-600 dark:text-zinc-400 italic text-xs sm:text-sm"
          >
            {renderInlineFormatting(trimmed.replace('> ', ''))}
          </blockquote>
        );
      } else {
        // Listas com marcadores hierárquicos (Indentação)
        const ulMatch = line.match(/^(\s*)([\*\-])\s+(.+)$/);
        if (ulMatch) {
          flushOrderedList(`pre-ul-${index}`);
          inUnorderedList = true;
          const indentSpaces = ulMatch[1].replace(/\t/g, '  ').length;
          const level = indentSpaces >= 4 ? 2 : indentSpaces >= 2 ? 1 : 0;
          unorderedListItems.push({ text: ulMatch[3], level });
        } else if (/^\d+\.\s/.test(trimmed)) {
          flushUnorderedList(`pre-ol-${index}`);
          inOrderedList = true;
          orderedListItems.push(trimmed.replace(/^\d+\.\s/, ''));
        } else if (trimmed === '---') {
          flushAllLists(`pre-hr-${index}`);
          elements.push(<hr key={index} className="my-6 border-zinc-200 dark:border-zinc-800" />);
        } else if (trimmed.length > 0) {
          flushAllLists(`pre-p-${index}`);
          elements.push(
            <p
              key={index}
              className="text-xs sm:text-sm text-zinc-700 dark:text-zinc-300 my-2.5 leading-relaxed"
            >
              {renderInlineFormatting(trimmed)}
            </p>
          );
        }
      }
    });

    flushAllLists('final');
    if (inCodeBlock) flushCodeBlock('final');
    if (inMathBlock && mathBlockLines.length > 0) {
      renderMathFormula(mathBlockLines.join(' ').trim(), 'math-final');
      inMathBlock = false;
      mathBlockLines = [];
    }
    if (inTable) flushTable('final');

    // Se o resumo não possuía seção formal de referências, renderiza os pontos-chave aqui
    if (!hasRenderedKeyPoints) {
      elements.push(
        <React.Fragment key="keypoints-carousel-fallback">
          {renderKeyPointsCarousel()}
        </React.Fragment>
      );
    }

    return elements;
  };

  const sectionPills = useMemo(() => {
    if (!material.markdownContent) return [];
    const h2Lines = material.markdownContent
      .split(/\r?\n/)
      .filter((l) => l.trim().startsWith('## '));

    return h2Lines.map((l) => {
      const rawTitle = l.trim().replace('## ', '').trim();
      const slug = rawTitle
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)/g, '');
      const shortTitle = rawTitle.replace(/^[0-9.]+\s*/, '').replace(/^[^\w\s]+\s*/, '');
      return { rawTitle, slug, shortTitle };
    });
  }, [material.markdownContent]);

  // Scroll Spy com Observer ajustado para não conflitar com a barra superior
  const [activeSectionSlug, setActiveSectionSlug] = useState<string>('');
  const pillRefs = useRef<Record<string, HTMLAnchorElement | null>>({});

  useEffect(() => {
    if (sectionPills.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSectionSlug(entry.target.id);
          }
        });
      },
      { rootMargin: '-100px 0px -55% 0px' }
    );

    sectionPills.forEach((p) => {
      const el = document.getElementById(p.slug);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [sectionPills]);

  // Animação suave e automática para centralizar o botão ativo na barra de tópicos sem precisar rolar manualmente
  useEffect(() => {
    if (activeSectionSlug && pillRefs.current[activeSectionSlug]) {
      pillRefs.current[activeSectionSlug]?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'center'
      });
    }
  }, [activeSectionSlug]);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto">
      {/* Barra Superior de Ações */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-bold text-zinc-700 dark:text-zinc-300 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar para lista</span>
        </button>

        <div className="flex flex-wrap items-center gap-2">
          {/* Modo Treino / Oclusão Ativa */}
          <ClozeStudyToggle
            isClozeMode={isClozeMode}
            onToggleClozeMode={() => setIsClozeMode((prev) => !prev)}
            revealAll={revealAllCloze}
            onToggleRevealAll={() => setRevealAllCloze((prev) => !prev)}
          />

          {/* Botão Caderno de Destaques & Anotações */}
          <button
            type="button"
            onClick={() => setIsHighlightsDrawerOpen(true)}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${highlights.length > 0
                ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-800'
              }`}
            title="Abrir Caderno de Destaques e Anotações"
          >
            <Highlighter className="w-3.5 h-3.5" />
            <span>Destaques</span>
            {highlights.length > 0 && (
              <span className="w-5 h-5 rounded-full bg-amber-500 text-zinc-950 font-black text-[10px] flex items-center justify-center ml-0.5">
                {highlights.length}
              </span>
            )}
          </button>

          {material.flashcardCount && material.flashcardCount > 0 ? (
            <button
              type="button"
              onClick={() => onPracticeFlashcards && onPracticeFlashcards(material)}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
              style={{ backgroundColor: accentConfig.primaryHex }}
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Praticar {material.flashcardCount} Flashcards</span>
            </button>
          ) : null}
        </div>
      </div>

      {/* Cabeçalho do Material Limpo (Largura total harmonizada com o restante do site) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 shadow-xs space-y-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="px-2.5 py-0.5 rounded-md font-semibold bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
            {material.specialty}
          </span>
          <span className="text-zinc-400">•</span>
          <span className="text-zinc-500 dark:text-zinc-400 font-medium">{material.theme}</span>
          {material.guidelineBadge && (
            <>
              <span className="text-zinc-400">•</span>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md font-bold text-[11px] bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-3 h-3" />
                {material.guidelineBadge}
              </span>
            </>
          )}
        </div>

        <h1 className="text-xl sm:text-2xl lg:text-3xl font-heading font-black tracking-tight text-zinc-900 dark:text-zinc-100">
          {material.title}
        </h1>

        <div className="flex items-center gap-4 text-[11px] text-zinc-500 dark:text-zinc-400 pt-2 border-t border-zinc-100 dark:border-zinc-800/80">
          <span className="flex items-center gap-1.5 font-medium">
            <Clock className="w-3.5 h-3.5" />
            {material.readTimeMinutes} min de leitura
          </span>
          <span className="flex items-center gap-1.5 font-medium">
            <Calendar className="w-3.5 h-3.5" />
            Atualizado {material.lastUpdatedYear}
          </span>
        </div>
      </div>

      {/* Barra de Navegação Rápida Sticky com Scroll Spy (Fixa abaixo da barra superior top-[4.5rem] com bordas retangulares) */}
      {sectionPills.length > 0 && (
        <div className="sticky top-[4.5rem] z-20 p-2 sm:p-2.5 rounded-none bg-white/95 dark:bg-[#121215]/95 backdrop-blur-md border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs transition-all">
          <div className="flex items-center gap-2 overflow-x-auto pb-0.5 scrollbar-none [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
            {sectionPills.map((pill) => {
              const isActive = activeSectionSlug === pill.slug;
              return (
                <a
                  key={pill.slug}
                  ref={(el) => {
                    pillRefs.current[pill.slug] = el;
                  }}
                  href={`#${pill.slug}`}
                  onClick={() => setActiveSectionSlug(pill.slug)}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-all duration-200 border shrink-0 ${isActive
                      ? 'text-white shadow-xs'
                      : 'bg-zinc-100/80 dark:bg-zinc-900/80 text-zinc-700 dark:text-zinc-300 border-zinc-200/80 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-600'
                    }`}
                  style={
                    isActive
                      ? {
                        backgroundColor: accentConfig.primaryHex,
                        borderColor: accentConfig.primaryHex
                      }
                      : {}
                  }
                >
                  {pill.shortTitle}
                </a>
              );
            })}
          </div>
        </div>
      )}

      {/* Corpo Formatado do Material (Largura total expandida) */}
      <article
        ref={articleRef}
        onMouseUp={handleTextSelection}
        onTouchEnd={handleTextSelection}
        className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 shadow-xs prose prose-zinc dark:prose-invert max-w-none relative"
      >
        {renderMarkdownContent(material.markdownContent)}
      </article>

      {/* Rodapé de Ação */}
      <div className="p-6 rounded-3xl bg-white dark:bg-[#121215] border border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h4 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Fixar este conteúdo na memória
          </h4>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Pratique os cartões de repetição espaçada derivados deste resumo clínico.
          </p>
        </div>

        {material.flashcardCount && material.flashcardCount > 0 ? (
          <button
            type="button"
            onClick={() => onPracticeFlashcards && onPracticeFlashcards(material)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white shadow-xs cursor-pointer hover:opacity-95 transition-all"
            style={{ backgroundColor: accentConfig.primaryHex }}
          >
            <Play className="w-4 h-4 fill-current" />
            <span>Iniciar Prática de Flashcards</span>
          </button>
        ) : null}
      </div>

      {/* Barra Flutuante de Marcação de Texto */}
      {selectedToolbarState && (
        <TextHighlightToolbar
          position={selectedToolbarState.position}
          selectedText={selectedToolbarState.selectedText}
          existingHighlight={selectedToolbarState.existingHighlight}
          onApplyHighlight={handleApplyHighlight}
          onRemoveHighlight={handleRemoveHighlight}
          onCreateFlashcard={handleCreateFlashcard}
          onClose={() => setSelectedToolbarState(null)}
        />
      )}

      {/* Caderno Lateral de Destaques & Anotações */}
      <StudyHighlightsDrawer
        isOpen={isHighlightsDrawerOpen}
        onClose={() => setIsHighlightsDrawerOpen(false)}
        highlights={highlights}
        materialTitle={material.title}
        onRemoveHighlight={handleRemoveHighlight}
        onUpdateNote={handleUpdateHighlightNote}
        onNavigateToHighlight={handleNavigateToHighlight}
        onCreateFlashcardFromHighlight={handleCreateFlashcard}
      />

      {/* Toast Flutuante */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-zinc-950 text-white dark:bg-zinc-100 dark:text-zinc-950 shadow-2xl text-xs font-bold animate-in fade-in slide-in-from-bottom-2">
          <Check className="w-4 h-4 text-emerald-400 dark:text-emerald-600" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};
